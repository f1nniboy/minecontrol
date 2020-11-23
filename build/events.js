"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const clipboardy_1 = __importDefault(require("clipboardy"));
function setupEvents(app) {
    // Screen
    app.options.screen.key("C-c", async () => {
        await app.shutdown();
    });
    app.options.screen.key("C-x", () => {
        process.exit(0);
    });
    app.options.screen.key("space", () => {
        app.options.nodes.input.focus();
    });
    app.options.nodes.input.key("tab", () => {
        const rawInput = app.getInput();
        const input = rawInput.substr(app.options.commandPrefix.length);
        if (rawInput.startsWith(app.options.commandPrefix) && input.length >= 2 && input.indexOf(" ") === -1) {
            for (let [name] of app.commands) {
                if (name.startsWith(input)) {
                    app.clearInput(`${app.options.commandPrefix}${name} `);
                    break;
                }
            }
        }
    });
    app.options.nodes.input.key("enter", () => {
        let input = app.getInput(true);
        const splitInput = input.split(" ");
        input = splitInput.join(" ").trim();
        if (input === "") {
            return;
        }
        else if (input.startsWith(app.options.commandPrefix)) {
            const args = input.substr(app.options.commandPrefix.length).split(" ");
            const base = args[0];
            if (app.commands.has(base.toLowerCase())) {
                args.splice(0, 1);
                try {
                    app.commands.get(base).onExecution(args);
                }
                catch (error) {
                    app.message.system(`An error occurred while executing the command '{bold}${base}{/bold}': {bold}${error.message}{/bold}`);
                }
            }
            else {
                app.message.system(`The command '{bold}${base}{/bold}' doesn't exist.`);
            }
        }
        else {
            if (!app.client) {
                app.message.system(`The bot isn't connected to a server.`);
            }
            else {
                app.client.chat(input);
            }
        }
        app.clearInput();
    });
    app.options.nodes.input.key("escape", () => {
        if (app.getInput().startsWith(app.options.commandPrefix)) {
            app.clearInput(app.options.commandPrefix);
        }
        else {
            app.clearInput();
        }
    });
    app.options.nodes.input.key("C-v", () => {
        const clipboard = clipboardy_1.default.readSync();
        const previousValue = app.options.nodes.input.getValue();
        if (!clipboard)
            return;
        app.options.nodes.input.setValue(previousValue + clipboard);
        app.render();
    });
    app.options.nodes.input.key("C-c", async () => {
        await app.shutdown();
    });
    app.options.nodes.input.key("C-x", () => {
        process.exit(0);
    });
}
exports.default = setupEvents;
