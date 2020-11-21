import App from "../app";

export type IPlugin = {
    readonly name: string;
    readonly description?: string;
    readonly version: string;
    readonly author?: string;
    loaded: boolean;

    onEnable(app: App): void;
    onUpdate?(app: App): void;
    onDisable(app: App): void;
}
