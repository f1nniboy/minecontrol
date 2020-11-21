"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const constant_1 = require("../constant");
const utils_1 = __importDefault(require("../utils"));
function setupInternalCommands(app) {
    app.commands.set("login", {
        description: "Log in with minecraft credentials.",
        onExecution(args) {
            if (args[0])
                app.login(args[0], args[1]);
            else
                app.message.system("Please specify a username and a password optionally to login.");
        }
    });
    app.commands.set("connect", {
        description: "Connect to a server.",
        onExecution(args) {
            if (args[0])
                app.connect(args[0], args[1] ? parseInt(args[1]) : 25565, args[1]);
            else
                app.message.system("Please specify a valid address and optionally a port and version to connect.");
        }
    });
    app.commands.set("disconnect", {
        description: "Disconnect from a server.",
        async onExecution() {
            if (!app.client._client.socket.destroyed) {
                await app.disconnect();
            }
            else
                app.message.system("The bot is not connected to a server.");
        }
    });
    app.commands.set("exit", {
        description: "Shut down the application.",
        async onExecution() {
            await app.shutdown();
        }
    });
    app.commands.set("save", {
        description: "Save the state.",
        onExecution() {
            app.state.saveSync(true);
        }
    });
    app.commands.set("forget", {
        description: "Forget the saved credentials.",
        onExecution() {
            if (app.state.get().username) {
                app.state.update({
                    username: undefined,
                    password: undefined
                });
                app.message.system("Forgot the saved credentials.");
            }
            else {
                app.message.system("There are no saved credentials.");
            }
        }
    });
    app.commands.set("theme", {
        description: "Find out the current theme or set it.",
        onExecution(args) {
            if (!args[0]) {
                app.message.system(`The current theme is '{bold}${app.state.get().theme}{/bold}'.`);
            }
            else {
                app.loadTheme(args[0]);
            }
        }
    });
    app.commands.set("themes", {
        description: "Find out what themes exist.",
        onExecution() {
            const themesPath = path_1.default.join(__dirname, "../", app.state.get().themesPath);
            if (fs_1.default.existsSync(themesPath)) {
                let files = fs_1.default.readdirSync(themesPath);
                for (let i = 0; i < files.length; i++) {
                    files[i] = files[i].replace(".json", "");
                }
                const themesString = files.join("\n");
                app.message.system("\n=== Themes ===\n" + themesString + "\n=== Themes ===");
            }
            else {
                app.message.system(`The '{bold}${themesPath}{/bold}' folder doesn't exist.`);
            }
        }
    });
    app.commands.set("plugins", {
        description: "Find out what plugins exist.",
        onExecution() {
            app.message.system("=== Plugins ===");
            app.plugin.plugins.forEach((plugin) => {
                app.message.system(`\t${plugin.name} - ${plugin.description}`);
            });
            app.message.system("=== Plugins ===");
        }
    });
    app.commands.set("tip", {
        description: "Tips can be useful if you don't know what to do.",
        onExecution() {
            const tip = constant_1.tips[utils_1.default.getRandomInt(0, constant_1.tips.length - 1)]
                .replace("{prefix}", app.options.commandPrefix);
            app.showHeader(tip, true);
        }
    });
    app.commands.set("fullscreen", {
        description: "Toggle the visibility of the player list.",
        onExecution() {
            app.toggleSidebar();
        }
    });
    app.commands.set("sync", {
        description: "Sync the current settings with the saved settings.",
        async onExecution() {
            await app.state.sync();
        }
    });
    app.commands.set("help", {
        description: "Get a list of available command.",
        onExecution() {
            app.message.system(`=== Command List ===`);
            app.commands.forEach((command, commandName) => {
                app.message.system(`\t${commandName} - ${command.description}`);
            });
            app.message.system(`=== Command List ===`);
        }
    });
    app.commands.set("clear", {
        description: "Clear the screen.",
        onExecution() {
            app.options.nodes.messages.setContent("");
            app.render(true);
        }
    });
    app.commands.set("reset", {
        description: "Re-render the screen.",
        onExecution() {
            app.render(true);
        }
    });
    app.commands.set("load", {
        description: "Load a plugin.",
        onExecution(args) {
            app.plugin.loadPlugin(args[0]);
        }
    });
    app.commands.set("unload", {
        description: "Unload a plugin.",
        onExecution(args) {
            app.plugin.unloadPlugin(args[0]);
        }
    });
    app.commands.set("unload", {
        description: "Unload a plugin.",
        onExecution(args) {
            app.plugin.unloadPlugin(args[0]);
        }
    });
    app.commands.set("reload", {
        description: "Reload all command.",
        async onExecution() {
            await app.plugin.reloadAll();
            app.message.system("Reloaded plugins.");
        }
    });
}
exports.default = setupInternalCommands;
