import { IPlugin } from "../../plugin/plugin";
import App from "../../app";
import crypto from "crypto";

let spammerActivated = false;
let spammerText = "Testing";

export const SpammerPlugin: IPlugin = {
    name: "Spammer",
    description: "Annoy the players using this.",
    version: "1.0",
    author: "f1nniboy",
    loaded: false,

    // Gets called when the plugin gets enabled
    onEnable(app: App) {
        app.commands.set("spammer", {
            description: "Toggle the spammer with the specified text.",
            onExecution(args: string[]): void {
                if(args[0]) spammerText = args.join(" ");

                spammerActivated = !spammerActivated;
                app.message.system(`${(spammerActivated ? "Enabled" : "Disabled")} the spammer with the text '{bold}${spammerText}{/bold}'.`);
            }
        });
    },

    // Gets called when a tick happens
    onUpdate(app: App) {
        if(spammerActivated) {
            app.client.chat(spammerText.replace("{random}", crypto.randomBytes(2).toString("hex")));
        }
    },

    // Gets called when the plugin gets enabled
    onDisable(app: App) {
        spammerActivated = false;
    },

}
