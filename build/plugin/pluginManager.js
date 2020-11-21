"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class PluginManager {
    constructor(app) {
        this.app = app;
        this.plugins = new Map();
    }
    async loadAll() {
        let loaded = 0;
        if (this.app.state.get().pluginsPath) {
            const pluginPath = path_1.default.join(__dirname, "..", this.app.state.get().pluginsPath);
            const pluginFolders = new Set();
            // Wait until all the plugins have been loaded.
            await new Promise((resolve) => {
                fs_1.default.readdir(pluginPath, (error, folders) => {
                    for (const file of folders) {
                        if (!file.endsWith(".js"))
                            pluginFolders.add(file);
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
    unloadAll() {
        this.plugins.forEach((plugin) => {
            this.unloadPlugin(plugin.name);
        });
        return this;
    }
    async reloadAll() {
        this.unloadAll();
        await this.loadAll();
        return this;
    }
    loadPlugin(pluginName) {
        if (!pluginName) {
            this.app.message.system("Please specify a plugin to load.");
            return this;
        }
        const pluginPath = path_1.default.join(__dirname, "..", this.app.state.get().pluginsPath);
        const entryPath = path_1.default.join(path_1.default.join(pluginPath, pluginName), "main.js");
        // Check if the plugin exists.
        if (!fs_1.default.existsSync(entryPath)) {
            this.app.message.system(`The plugin '{bold}${pluginName}{/bold}' doesn't exist.`);
            return this;
        }
        // Check if the plugin is already loaded.
        if (this.plugins.get(pluginName)) {
            this.app.message.system(`The plugin '{bold}${pluginName}{/bold}' is already loaded.`);
            return this;
        }
        let plugin = require(entryPath);
        plugin = plugin[Object.keys(plugin)[0]];
        plugin.loaded = true;
        plugin.onEnable(this.app);
        this.plugins.set(plugin.name.toLowerCase(), plugin);
        this.app.message.system(`Loaded the plugin '{bold}${plugin.name}{/bold}' version '{bold}${plugin.version}{/bold}' made by '{bold}${plugin.author}{/bold}'.`);
    }
    unloadPlugin(pluginName) {
        if (!pluginName) {
            this.app.message.system("Please specify a plugin to unload.");
            return this;
        }
        // Check if the plugin is already loaded.
        if (!this.plugins.get(pluginName.toLowerCase())) {
            this.app.message.system(`The plugin '{bold}${pluginName}{/bold}' is not loaded.`);
            return this;
        }
        let plugin = this.plugins.get(pluginName.toLowerCase());
        plugin.loaded = false;
        plugin.onDisable(this.app);
        this.plugins.delete(pluginName.toLowerCase());
        this.app.message.system(`Unloaded the plugin '{bold}${pluginName}{/bold}'.`);
    }
}
exports.default = PluginManager;
