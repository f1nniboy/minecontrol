import App from "../app";

export type IPlugin = {
    readonly name: string; // The name of the plugin
    readonly description?: string; // The description of the plugin
    readonly version: string; // The version of the plugin
    readonly author?: string; // The author of the plugin
    loaded: boolean;

    onEarlyEnable?(app: App): void // Gets called when the bot gets created using "createBot" - not working yet.
    onEnable(app: App): void; // Gets called when the world loads.
    onUpdate?(app: App): void; // Gets called every time a tick happens, which can be changed in the config.
    onDisable(app: App): void; // Gets called when the bot gets disconnected, the plugins unload or the program exists.
}
