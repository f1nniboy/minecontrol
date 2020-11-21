import { Bot, createBot } from "mineflayer";
import blessed, {Widgets} from "blessed";
import fs from "fs";
import path from "path";
import { defaultAppOptions } from "./constant";
import setupEvents from "./events";
import setupInternalCommands from "./command/internal";
import { EventEmitter } from "events";
import State, { IState, IStateOptions } from "./state/state";
import { defaultState } from "./state/stateConstants";
import MessageFactory from "./core/messageFactory";
import PluginManager from "./plugin/pluginManager";
import { ICommand } from "./command/command";
import { setInterval } from "timers";

export type IAppNodes = {
    readonly messages: Widgets.BoxElement;
    readonly players: Widgets.BoxElement;
    readonly input: Widgets.TextboxElement;
    readonly header: Widgets.BoxElement;
}

export interface IAppOptions extends IStateOptions {
    readonly screen: Widgets.Screen
    readonly nodes: IAppNodes;
    readonly commandPrefix: string;
    readonly headerAutoHideTimeoutPerCharacter: number;
    readonly initialState: Partial<IState>;
}

export enum SpecialSenders {
    System = "System",
    Chat = "Chat"
}

export default class App extends EventEmitter {
    public readonly options: IAppOptions;
    public client: Bot;
    public readonly commands: Map<string, ICommand>;
    public readonly state: State;
    public readonly message: MessageFactory;
    public readonly plugin: PluginManager;
    public tickInterval: NodeJS.Timeout;

    public constructor(options?: Partial<IAppOptions>, commands: Map<string, ICommand> = new Map()) {
        super();

        this.options = {
            ...defaultAppOptions,
            ...options
        };

        this.state = new State(this, this.options, this.options.initialState);
        this.commands = commands;
        this.message = new MessageFactory(this);
        this.plugin = new PluginManager(this);
    }

    // Set up the bot functions.
    public async setup(init: boolean = true): Promise<this> {

        // Append the nodes.
        this.options.screen.append(this.options.nodes.input);
        this.options.screen.append(this.options.nodes.messages);
        this.options.screen.append(this.options.nodes.players);
        this.options.screen.append(this.options.nodes.header);

        // Sync the state.
        await this.state.sync();

        // Load & apply the saved theme.
        this.loadTheme(this.state.get().theme);

        if (init) {
            console.log("Initializing ...");
            this.init();
        }

        return this;
    }

    private handlePlayer(/*player: string*/): void {
        this.updateTitle();
        this.updatePlayers(true);
    }

    public async disconnect(reconnect: boolean = false): Promise<void> {
        clearInterval(this.tickInterval);

        // Hacky way to get the server's IP and port.
        if(reconnect) this.connect(this.client._client.socket.remoteAddress, this.client._client.socket.remotePort);

        await this.plugin.unloadAll();
        this.client.end();
        this.hideSidebar();
    }

    public showSidebar(): this {
        if (this.options.nodes.players.hidden) {
            // Messages
            this.options.nodes.messages.width = "87.5%+2";
            this.options.nodes.messages.left = "12.5%";

            // Input
            this.options.nodes.input.width = "87.5%+2";
            this.options.nodes.input.left = "12.5%";

            // Header
            this.options.nodes.header.width = "87.5%+2";
            this.options.nodes.header.left = "12.5%";

            this.options.nodes.players.show();
            this.render();
        }

        return this;
    }

    public hideSidebar(): this {
        if (!this.options.nodes.players.hidden) {
            // Messages
            this.options.nodes.messages.width = "100%";
            this.options.nodes.messages.left = "0%";

            // Input
            this.options.nodes.input.width = "100%";
            this.options.nodes.input.left = "0%";

            // Header
            this.options.nodes.header.width = "100%";
            this.options.nodes.header.left = "0%";

            this.options.nodes.players.hide();
            this.render();
        }

        return this;
    }

    public toggleSidebar(): this {
        this.options.nodes.players.visible ? this.hideSidebar() : this.showSidebar();
        return this;
    }

    private setupEvents(): this {
        setupEvents(this);
        return this;
    }

    public getInput(clear: boolean = false): string {
        const value: string = this.options.nodes.input.getValue();

        if (clear) {
            this.clearInput();
        }

        return value.trim();
    }

    public clearInput(newValue: string = ""): this {
        this.options.nodes.input.setValue(newValue);

        if (this.options.screen.focused !== this.options.nodes.input) {
            this.options.nodes.input.focus();
        }

        this.render();
        return this;
    }

    public async shutdown(exitCode: number = 0): Promise<void> {
        if(this.client && this.client.quit) await this.client.quit("Quitting");

        clearInterval(this.tickInterval);
        await this.plugin.unloadAll();
        this.state.saveSync();

        process.exit(exitCode);
    }

    public updatePlayers(render: boolean = false): this {
        if (!this.client) {
            return this;
        }

        // Fixes "ghost" children bug.
        while (true) {
            try {
                this.options.nodes.players.remove(this.options.nodes.players.children[0]);
            } catch (error) {
                break;
            }
        }

        const players: any = Object.keys(this.client.players);

        for (let i: number = 0; i < players.length; i++) {
            let playerName: string = players[i];

            const playerNode: Widgets.BoxElement = blessed.box({
                style: {
                    bg: this.state.get().themeData.sidebar.backgroundColor,
                    fg: this.state.get().themeData.sidebar.foregroundColor,

                    bold: this.state.get().selectedPlayer == playerName,

                    hover: {
                        bg: this.state.get().themeData.sidebar.backgroundColorHover,
                        fg: this.state.get().themeData.sidebar.foregroundColorHover
                    }
                },

                content: playerName,
                width: "100%-2",
                height: "shrink",
                top: i,
                left: "0%",
                clickable: true
            });

            playerNode.on("click", () => {
                this.setSelectedPlayer(playerName);
            });

            this.options.nodes.players.append(playerNode);
        }

        if (render) {
            this.render(false, false);
        }

        return this;
    }

    public setSelectedPlayer(player: string, notify: boolean = false): this {
        this.state.update({
            selectedPlayer: player
        });

        this.updateTitle();
        this.updatePlayers(true);

        if(notify) this.message.system(`Selected the player '{bold}${player}{/bold}'.`);

        return this;
    }

    private setupInternalCommands(): this {
        setupInternalCommands(this);
        return this;
    }

    public loadTheme(name: string): this {
        if (!name) {
            return this;
        }

        const themePath: string = path.join(__dirname, this.state.get().themesPath, `${name}.json`);

        if (name === defaultState.theme) {
            this.setTheme(defaultState.theme, defaultState.themeData);
        } else if (fs.existsSync(themePath)) {
            this.message.system(`Loading theme '{bold}${name}{/bold}'...`);

            const theme: any = fs.readFileSync(themePath).toString();
            try {
                const parsedTheme: any = JSON.parse(theme);

                if(!parsedTheme || !parsedTheme.messages || !parsedTheme.sidebar || !parsedTheme.input || !parsedTheme.header) {
                    this.message.system(`The theme '{bold}${name}{/bold}' is not valid.`);
                    return this;
                }

                this.setTheme(name, parsedTheme);
            } catch(error) {
                this.message.system(`The theme '{bold}${name}{/bold}' is not valid.`);
                return this;
            }
        } else {
            this.message.system(`The theme '{bold}${name}{/bold}' could not be found. Make sure it is in the '{bold}${this.state.get().themesPath}{/bold}' folder.`);
        }

        return this;
    }

    public setTheme(name: string, data: any): this {
        if (!data) {
            this.message.system("Error while setting theme: No data was provided for the theme.");
            return this;
        }

        this.state.update({
            theme: name,
            themeData: data
        });

        // Messages
        this.options.nodes.messages.style.fg = this.state.get().themeData.messages.foregroundColor;
        this.options.nodes.messages.style.bg = this.state.get().themeData.messages.backgroundColor;

        // Input
        this.options.nodes.input.style.fg = this.state.get().themeData.input.foregroundColor;
        this.options.nodes.input.style.bg = this.state.get().themeData.input.backgroundColor;

        // Players
        this.options.nodes.players.style.fg = this.state.get().themeData.sidebar.foregroundColor;
        this.options.nodes.players.style.bg = this.state.get().themeData.sidebar.backgroundColor;

        // Header
        this.options.nodes.header.style.fg = this.state.get().themeData.header.foregroundColor;
        this.options.nodes.header.style.bg = this.state.get().themeData.header.backgroundColor;

        this.updatePlayers();
        this.message.system(`Applied theme '{bold}${name}{/bold}'.`);

        return this;
    }

    private updateTitle(): this {
        this.options.screen.title = "Minecontrol";
        return this;
    }

    public login(username: string, password: string): this {
        this.state.update({
            username: username,
            password: password
        });

        this.message.system(`You can now connect using '{bold}${this.options.commandPrefix}connect <Server-IP> <Port>{/bold}'.`);
        return this;
    }

    public connect(host: string, port: number): this {
        this.client = createBot({
            host: host,
            port: port,

            username: this.state.get().username,
            password: this.state.get().password,

            version: "1.8.8"
        });

        // Register all needed Minecraft events.
        this.client.on("login", () => {
            this.hideHeader();

            this.message.system(`Successfully logged in as '{bold}${this.client.username}{/bold}'.`);

            this.showSidebar();
            this.updatePlayers();
            this.updateTitle();

            this.state.saveSync();
        });

        this.client.on("spawn", async () => {
            await this.plugin.loadAll();
        });

        this.client.on("error", (error) => {
            this.message.system(`An error occurred: {bold}${error.message}{/bold}`);
        });

        this.client.on("playerJoined", this.handlePlayer.bind(this));
        this.client.on("playerLeft", this.handlePlayer.bind(this));
        this.client.on("kicked", this.disconnect.bind(this));

        this.tickInterval = setInterval(() => {
            this.plugin.plugins.forEach((plugin) => {
                if(plugin.onUpdate && plugin.loaded) plugin.onUpdate(this);
            })
        }, 1000 / this.state.get().ticksPerSecond);

        return this;
    }

    public init(): this {
        if (this.state.get().username) {
            this.message.system(`Seems like you have logged in before; Use {bold}${this.options.commandPrefix}forget{/bold} to forget the saved credentials.`);
            this.login(this.state.get().username, this.state.get().password);
        } else {
            this.options.nodes.input.setValue(`${this.options.commandPrefix}login `);
            this.showHeader("{bold}Remember{/bold}: This tool is in an early beta stage, it may contain bugs.");
            this.message.system(`Welcome! Please login using {bold}${this.options.commandPrefix}login <Username/E-Mail> [<Password>]{/bold}. Type {bold}${this.options.commandPrefix}help{/bold} to view all available commands.`);
        }

        // Hacky way of disabling Mineflayer forced console output.
        console.log = () => {};
        console.warn = () => {};
        console.error = () => {};

        this.setupEvents()
            .setupInternalCommands();

        return this;
    }

    public showHeader(text: string, autoHide: boolean = false): boolean {
        if (!text) return false;

        this.options.nodes.header.content = `[!] ${text}`;

        if (!this.options.nodes.header.visible) {
            // Messages
            this.options.nodes.messages.top = "0%+3";
            this.options.nodes.messages.height = "100%-6";

            // Header
            this.options.nodes.header.hidden = false;
        }

        if (autoHide) {
            if (this.state.get().autoHideHeaderTimeout) {
                clearTimeout(this.state.get().autoHideHeaderTimeout);
            }

            this.state.update({
                autoHideHeaderTimeout: setTimeout(this.hideHeader.bind(this), text.length * this.options.headerAutoHideTimeoutPerCharacter)
            });
        }

        this.render();
        return true;
    }

    public hideHeader(): boolean {
        if (!this.options.nodes.header.visible) {
            return false;
        }

        // Messages
        this.options.nodes.messages.top = "0%";
        this.options.nodes.messages.height = "100%-3";

        // Header
        this.options.nodes.header.hidden = true;

        this.render();
        return true;
    }

    public render(hard: boolean = false, updateSidebar: boolean = false): this {
        if (updateSidebar) {
            this.updatePlayers(false);
        }

        if (!hard) {
            this.options.screen.render();
        } else {
            this.options.screen.realloc();
        }

        return this;
    }
}
