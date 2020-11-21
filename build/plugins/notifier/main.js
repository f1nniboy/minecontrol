"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotifierPlugin = void 0;
exports.NotifierPlugin = {
    name: "Notifier",
    description: "Know everything about the world surrounding you.",
    version: "1.0",
    author: "f1nniboy",
    loaded: false,
    // Gets called when the plugin gets enabled
    onEnable(app) {
        app.client.on("message", (jsonMessage) => {
            app.message.chat(jsonMessage.toAnsi({}));
        });
        app.client.on("kicked", (reason, loggedIn) => {
            this.message.system(`You were kicked from the server: "{bold}${reason}{/bold}"`);
        });
    },
    // Gets called when a tick happens
    onUpdate(app) {
    },
    // Gets called when the plugin gets enabled
    onDisable(app) {
    },
};
