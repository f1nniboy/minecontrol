"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpecialSenders = void 0;
const mineflayer_1 = require("mineflayer");
const blessed_1 = __importDefault(require("blessed"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const constant_1 = require("./constant");
const events_1 = __importDefault(require("./events"));
const internal_1 = __importDefault(require("./command/internal"));
const events_2 = require("events");
const state_1 = __importDefault(require("./state/state"));
const stateConstants_1 = require("./state/stateConstants");
const messageFactory_1 = __importDefault(require("./core/messageFactory"));
const pluginManager_1 = __importDefault(require("./plugin/pluginManager"));
const timers_1 = require("timers");
var SpecialSenders;
(function (SpecialSenders) {
    SpecialSenders["System"] = "System";
    SpecialSenders["Chat"] = "Chat";
})(SpecialSenders = exports.SpecialSenders || (exports.SpecialSenders = {}));
class App extends events_2.EventEmitter {
    constructor(options, commands = new Map()) {
        super();
        this.options = {
            ...constant_1.defaultAppOptions,
            ...options
        };
        this.state = new state_1.default(this, this.options, this.options.initialState);
        this.commands = commands;
        this.message = new messageFactory_1.default(this);
        this.plugin = new pluginManager_1.default(this);
    }
    // Set up the bot functions.
    async setup(init = true) {
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
    handlePlayer( /*player: string*/) {
        this.updateTitle();
        this.updatePlayers(true);
    }
    async disconnect(reconnect = false) {
        if (this.client._client.socket.destroyed)
            return;
        clearInterval(this.tickInterval);
        // Hacky way to get the server's IP and port.
        if (reconnect)
            this.connect(this.client._client.socket.remoteAddress, this.client._client.socket.remotePort);
        await this.plugin.unloadAll();
        this.client.end();
        this.hideSidebar();
    }
    showSidebar() {
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
    hideSidebar() {
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
    toggleSidebar() {
        this.options.nodes.players.visible ? this.hideSidebar() : this.showSidebar();
        return this;
    }
    setupEvents() {
        events_1.default(this);
        return this;
    }
    getInput(clear = false) {
        const value = this.options.nodes.input.getValue();
        if (clear) {
            this.clearInput();
        }
        return value.trim();
    }
    clearInput(newValue = "") {
        this.options.nodes.input.setValue(newValue);
        if (this.options.screen.focused !== this.options.nodes.input) {
            this.options.nodes.input.focus();
        }
        this.render();
        return this;
    }
    async shutdown(exitCode = 0) {
        if (this.client && this.client.quit)
            await this.client.quit("Quitting");
        clearInterval(this.tickInterval);
        await this.plugin.unloadAll();
        this.state.saveSync();
        process.exit(exitCode);
    }
    updatePlayers(render = false) {
        if (!this.client) {
            return this;
        }
        // Fixes "ghost" children bug.
        while (true) {
            try {
                this.options.nodes.players.remove(this.options.nodes.players.children[0]);
            }
            catch (error) {
                break;
            }
        }
        const players = Object.keys(this.client.players);
        for (let i = 0; i < players.length; i++) {
            let playerName = players[i];
            const playerNode = blessed_1.default.box({
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
                width: "100%-4",
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
    setSelectedPlayer(player, notify = false) {
        this.state.update({
            selectedPlayer: player
        });
        this.updateTitle();
        this.updatePlayers(true);
        if (notify)
            this.message.system(`Selected the player '{bold}${player}{/bold}'.`);
        return this;
    }
    setupInternalCommands() {
        internal_1.default(this);
        return this;
    }
    loadTheme(name) {
        if (!name) {
            return this;
        }
        const themePath = path_1.default.join(__dirname, this.state.get().themesPath, `${name}.json`);
        if (name === stateConstants_1.defaultState.theme) {
            this.setTheme(stateConstants_1.defaultState.theme, stateConstants_1.defaultState.themeData);
        }
        else if (fs_1.default.existsSync(themePath)) {
            this.message.system(`Loading theme '{bold}${name}{/bold}' ...`);
            const theme = fs_1.default.readFileSync(themePath).toString();
            try {
                const parsedTheme = JSON.parse(theme);
                if (!parsedTheme || !parsedTheme.messages || !parsedTheme.messages.scrollbar || !parsedTheme.sidebar || !parsedTheme.input || !parsedTheme.header) {
                    this.message.system(`The theme '{bold}${name}{/bold}' is not valid.`);
                    return this;
                }
                this.setTheme(name, parsedTheme);
            }
            catch (error) {
                this.message.system(`The theme '{bold}${name}{/bold}' is not valid: {bold}${error.message}{/bold}`);
                return this;
            }
        }
        else {
            this.message.system(`The theme '{bold}${name}{/bold}' could not be found. Make sure it is in the '{bold}${this.state.get().themesPath}{/bold}' folder.`);
        }
        return this;
    }
    setTheme(name, data) {
        if (!data) {
            this.message.system("Error while setting theme: No data was provided for the theme.");
            return this;
        }
        this.state.update({
            theme: name,
            themeData: data
        });
        try {
            // Messages
            this.options.nodes.messages.style.fg = this.state.get().themeData.messages.foregroundColor;
            this.options.nodes.messages.style.bg = this.state.get().themeData.messages.backgroundColor;
            // Scrollbar
            this.options.nodes.messages.options.scrollbar.track.bg = this.state.get().themeData.messages.scrollbar.bg;
            this.options.nodes.messages.options.scrollbar.track.fg = this.state.get().themeData.messages.scrollbar.fg;
            // Input
            this.options.nodes.input.style.fg = this.state.get().themeData.input.foregroundColor;
            this.options.nodes.input.style.bg = this.state.get().themeData.input.backgroundColor;
            // Players
            this.options.nodes.players.style.fg = this.state.get().themeData.sidebar.foregroundColor;
            this.options.nodes.players.style.bg = this.state.get().themeData.sidebar.backgroundColor;
            // Header
            this.options.nodes.header.style.fg = this.state.get().themeData.header.foregroundColor;
            this.options.nodes.header.style.bg = this.state.get().themeData.header.backgroundColor;
            this.render(true, true);
            this.message.system(`Applied theme '{bold}${name}{/bold}'.`);
        }
        catch (error) {
            this.message.system(`Something went wrong while trying to apply the theme: {bold}${error.message}{/bold}`);
        }
        return this;
    }
    updateTitle() {
        this.options.screen.title = "Minecontrol";
        return this;
    }
    login(username, password) {
        this.state.update({
            username: username,
            password: password
        });
        this.message.system(`You can now connect using '{bold}${this.options.commandPrefix}connect <Server-IP>:[<Port>] [<Version>]{/bold}'.`);
        return this;
    }
    connect(host, port, version) {
        this.client = mineflayer_1.createBot({
            host: host,
            port: port,
            username: this.state.get().username,
            password: this.state.get().password,
            version: version ? version : undefined
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
        this.tickInterval = timers_1.setInterval(() => {
            this.plugin.plugins.forEach((plugin) => {
                if (plugin.onUpdate && plugin.loaded) {
                    try {
                        plugin.onUpdate(this);
                    }
                    catch (error) {
                        this.message.system(`An error occurred while trying to perform a tick for the plugin '{bold}${plugin.name}{/bold}': {bold}${error.message}{/bold}`);
                        return;
                    }
                }
            });
        }, 1000 / this.state.get().ticksPerSecond);
        return this;
    }
    init() {
        if (this.state.get().username) {
            this.message.system(`Seems like you have logged in before; Use {bold}${this.options.commandPrefix}forget{/bold} to forget the saved credentials.`);
            this.login(this.state.get().username, this.state.get().password);
        }
        else {
            this.options.nodes.input.setValue(`${this.options.commandPrefix}login `);
            this.showHeader("{bold}Remember{/bold}: This tool is in an early beta stage, it may contain bugs.");
            this.message.system(`Welcome! Please login using {bold}${this.options.commandPrefix}login <Username/E-Mail> [<Password>]{/bold}. Type {bold}${this.options.commandPrefix}help{/bold} to view all available commands.`);
        }
        // Hacky way of disabling Mineflayer forced console output.
        console.log = () => { };
        console.warn = () => { };
        console.error = () => { };
        this.setupEvents()
            .setupInternalCommands();
        return this;
    }
    showHeader(text, autoHide = false) {
        if (!text)
            return false;
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
    hideHeader() {
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
    render(hard = false, updateSidebar = false) {
        if (updateSidebar) {
            this.updatePlayers(false);
        }
        if (!hard) {
            this.options.screen.render();
        }
        else {
            this.options.screen.realloc();
        }
        return this;
    }
}
exports.default = App;
