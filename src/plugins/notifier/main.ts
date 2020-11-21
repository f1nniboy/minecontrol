import { IPlugin } from "../../plugin/plugin";
import App from "../../app";

export const NotifierPlugin: IPlugin = {
    name: "Notifier",
    description: "Know everything about the world surrounding you.",
    version: "1.0",
    author: "f1nniboy",
    loaded: false,

    // Gets called when the plugin gets enabled
    onEnable(app: App) {
        app.client.on("message", (jsonMessage: any) => {
            app.message.chat(jsonMessage.toAnsi({}));
        });

        app.client.on("kicked", (reason: string, loggedIn: boolean) => {
            this.message.system(`You were kicked from the server: "{bold}${reason}{/bold}"`);
        });
    },

    // Gets called when a tick happens
    onUpdate(app: App) {

    },

    // Gets called when the plugin gets enabled
    onDisable(app: App) {

    },

}

