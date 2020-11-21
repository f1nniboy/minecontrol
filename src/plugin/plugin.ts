import App from "../app";

export type IPlugin = {
    readonly name: string;
    readonly description?: string;
    readonly version: string;
    readonly author?: string;
    loaded: boolean;

    onEarlyEnable?(app: App): void // Gets called when the bot gets created using "createBot" - not working yet.
    onEnable(app: App): void; // Gets called when the world loads.
    onUpdate?(app: App): void; // Gets called every time a tick happens, which can be changed in the config.
    onDisable(app: App): void; // Gets called when the bot gets disconnected, the plugins unload or the program exists.
}
