"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpammerPlugin = void 0;
const crypto_1 = __importDefault(require("crypto"));
let spammerActivated = false;
let spammerText = "Testing";
exports.SpammerPlugin = {
    name: "Spammer",
    description: "Annoy the players using this.",
    version: "1.0",
    author: "f1nniboy",
    loaded: false,
    // Gets called when the plugin gets enabled
    onEnable(app) {
        app.commands.set("spammer", {
            description: "Toggle the spammer with the specified text.",
            onExecution(args) {
                if (args[0])
                    spammerText = args.join(" ");
                spammerActivated = !spammerActivated;
                app.message.system(`${(spammerActivated ? "Enabled" : "Disabled")} the spammer with the text '{bold}${spammerText}{/bold}'.`);
            }
        });
    },
    // Gets called when a tick happens
    onUpdate(app) {
        if (spammerActivated) {
            app.client.chat(spammerText.replace("{random}", crypto_1.default.randomBytes(2).toString("hex")));
        }
    },
    // Gets called when the plugin gets disabled
    onDisable(app) {
        spammerActivated = false;
    },
};
