import fs from "fs";
import path from "path";
import App from "../app";
import { IPlugin } from "./plugin";

export default class PluginManager {
    protected readonly app: App;
    public plugins: Map<string, IPlugin>;

    public constructor(app: App) {
        this.app = app;
        this.plugins = new Map();
    }

    public async loadAll(): Promise<number> {
        let loaded: number = 0;

        if (this.app.state.get().pluginsPath) {
            const pluginPath: string = path.join(__dirname, "..", this.app.state.get().pluginsPath);
            const pluginFolders: Set<string> = new Set();

            // Wait until all the plugins have been loaded.
            await new Promise((resolve) => {
                fs.readdir(pluginPath, (error: Error, folders: string[]) => {
                    for (const file of folders) {
                        if(!file.endsWith(".js")) pluginFolders.add(file);
                    }

                    resolve(undefined);
                });
            });

            // Loop through all plugins.
            for (const pluginFolder of pluginFolders) {
                this.loadPlugin(pluginFolder);
                loaded++;
            }
        }

        return loaded;
    }

    public unloadAll(): this {
        this.plugins.forEach((plugin) => {
            this.unloadPlugin(plugin.name);
        });

        return this;
    }

    public async reloadAll(): Promise<this> {
        this.unloadAll();
        await this.loadAll();

        return this;
    }

    public loadPlugin(pluginName: string): this {
        if(!pluginName) {
            this.app.message.system("Please specify a plugin to load.");
            return this;
        }

        const pluginPath: string = path.join(__dirname, "..", this.app.state.get().pluginsPath);
        const entryPath: string = path.join(path.join(pluginPath, pluginName), "main.js");

        // Check if the plugin exists.
        if(!fs.existsSync(entryPath)) {
            this.app.message.system(`The plugin '{bold}${pluginName}{/bold}' doesn't exist.`);
            return this;
        }

        // Check if the plugin is already loaded.
        if (this.plugins.get(pluginName)) {
            this.app.message.system(`The plugin '{bold}${pluginName}{/bold}' is already loaded.`);
            return this;
        }

        let plugin: IPlugin;

        try {
            plugin = require(entryPath);
            plugin = plugin[Object.keys(plugin)[0]];

            plugin.loaded = true;
            plugin.onEnable(this.app);

            this.plugins.set(plugin.name.toLowerCase(), plugin);
        } catch (error) {
            this.app.message.system(`An error occurred while trying to enable the plugin '{bold}${pluginName}{/bold}': {bold}${error.message}{/bold}`);
            return;
        }

        this.app.message.system(`Loaded the plugin '{bold}${plugin.name}{/bold}' version '{bold}${plugin.version}{/bold}' made by '{bold}${plugin.author}{/bold}'.`);
    }

    public unloadPlugin(pluginName: string): this {
        if(!pluginName) {
            this.app.message.system("Please specify a plugin to unload.");
            return this;
        }

        // Check if the plugin is already loaded.
        if (!this.plugins.get(pluginName.toLowerCase())) {
            this.app.message.system(`The plugin '{bold}${pluginName}{/bold}' is not loaded.`);
            return this;
        }

        let plugin = this.plugins.get(pluginName.toLowerCase());

        try {
            plugin.loaded = false;
            plugin.onDisable(this.app);
            this.plugins.delete(pluginName.toLowerCase());
        } catch (error) {
            this.app.message.system(`An error occurred while trying to disable the plugin '{bold}${pluginName}{/bold}': {bold}${error.message}{/bold}`);
            return;
        }

        this.app.message.system(`Unloaded the plugin '{bold}${pluginName}{/bold}'.`);
    }
}
