import fs from "fs";
import path from "path";
import App from "../app";
import { tips } from "../constant";
import Utils from "../utils";

export default function setupInternalCommands(app: App): void {
    app.commands.set("login", {
        description: "Log in with minecraft credentials.",
        onExecution(args: string[]): void {
            if(args[0]) app.login(args[0], args[1]);
            else app.message.system("Please specify a username and optionally a password to login.");
        }
    });

    app.commands.set("connect", {
        description: "Connect to a server.",
        onExecution(args: string[]): void {
            if(args[0]) app.connect(args[0]
                .split(":")[0],
                parseInt(args[0]
                .split(":")[1] ?
                args[0].split(":")[1] :
                "25565"), args[1]);

            else app.message.system("Please specify a valid address and optionally a port or version to connect.");
        }
    });

    app.commands.set("disconnect", {
        description: "Disconnect from a server.",
        async onExecution(): Promise<void> {
            if(!app.client._client.socket.destroyed) await app.disconnect();
            else app.message.system("The bot is not connected to a server.");
        }
    });

    app.commands.set("exit", {
        description: "Shut down the application.",
        async onExecution(): Promise<void> {
            await app.shutdown();
        }
    });

    app.commands.set("save", {
        description: "Save the state.",
        onExecution(): void {
            app.state.saveSync(true);
        }
    });

    app.commands.set("forget", {
        description: "Forget the saved credentials.",
        onExecution(): void {
            if (app.state.get().username) {
                app.state.update({
                    username: undefined,
                    password: undefined
                });

                app.message.system("Forgot the saved credentials.");
            } else {
                app.message.system("There are no saved credentials.");
            }
        }
    });

    app.commands.set("theme", {
        description: "Find out the current theme or set it.",
        onExecution(args: string[]): void {
            if (!args[0]) app.message.system(`The current theme is '{bold}${app.state.get().theme}{/bold}'.`)
            else app.loadTheme(args[0]);
        }
    });

    app.commands.set("themes", {
        description: "Find out what themes exist.",
        onExecution(): void {
            const themesPath: string = path.join(__dirname, "../", app.state.get().themesPath);

            if (fs.existsSync(themesPath)) {
                let files: string[] = fs.readdirSync(themesPath);

                for (let i: number = 0; i < files.length; i++) {
                    files[i] = files[i].replace(".json", "");
                }

                const themesString: string = files.join("\n");
                app.message.system("\n=== Themes ===\n" + themesString + "\n=== Themes ===");
            } else {
                app.message.system(`The '{bold}${themesPath}{/bold}' folder doesn't exist.`);
            }
        }
    });

    app.commands.set("plugins", {
        description: "Find out what plugins exist.",
        onExecution(): void {
            app.message.system("=== Plugins ===");

            app.plugin.plugins.forEach((plugin) => {
                app.message.system(`\t${plugin.name} - ${plugin.description}`);
            });

            app.message.system("=== Plugins ===");
        }
    });

    app.commands.set("tip", {
        description: "Tips can be useful if you don't know what to do.",
        onExecution(): void {
            const tip: string = tips[Utils.getRandomInt(0, tips.length - 1)]
                .replace("{prefix}", app.options.commandPrefix);

            app.showHeader(tip, true);
        }
    });

    app.commands.set("fullscreen", {
        description: "Toggle the visibility of the player list.",
        onExecution(): void {
            app.toggleSidebar();
        }
    });

    app.commands.set("sync", {
        description: "Sync the current settings with the saved settings.",
        async onExecution(): Promise<void> {
            await app.state.sync();
        }
    });

    app.commands.set("help", {
        description: "Get a list of available command.",
        onExecution(): void {
            app.message.system(`=== Command List ===`);

            app.commands.forEach((command, commandName) => {
                app.message.system(`\t${commandName} - ${command.description}`);
            });

            app.message.system(`=== Command List ===`);
        }
    });

    app.commands.set("clear", {
        description: "Clear the screen.",
        onExecution(): void {
            app.options.nodes.messages.setContent("");
            app.render(true);
        }
    });

    app.commands.set("reset", {
        description: "Re-render the screen.",
        onExecution(): void {
            app.render(true);
        }
    });

    app.commands.set("load", {
        description: "Load a plugin.",
        onExecution(args: string[]): void {
            app.plugin.loadPlugin(args[0]);
        }
    });

    app.commands.set("unload", {
        description: "Unload a plugin.",
        onExecution(args: string[]): void {
            app.plugin.unloadPlugin(args[0]);
        }
    });

    app.commands.set("unload", {
        description: "Unload a plugin.",
        onExecution(args: string[]): void {
            app.plugin.unloadPlugin(args[0]);
        }
    });

    app.commands.set("reload", {
        description: "Reload all command.",
        async onExecution(): Promise<void> {
            await app.plugin.reloadAll();
            app.message.system("Reloaded plugins.");
        }
    });

    app.commands.set("packages", {
        description: "View the installed packages. Who doesn't want to know what packages are installed?",
        onExecution(): void {
            const packageJSON = require("../../package.json");

            for(let packageName in packageJSON.dependencies) {
                app.message.system(`{bold}${packageName}{/bold} - {bold}${packageJSON.dependencies[packageName]}{/bold}`);
            }
        }
    });

    app.commands.set("locate", {
        description: "Find out where the plugins, themes and settings are located.",
        onExecution(): void {
            app.message.system(`The plugins, themes and settings are located in '{bold}${path.join(__dirname, "..")}{/bold}'.`);
        }
    })
}
