"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MinerPlugin = void 0;
const minecraft_data_1 = __importDefault(require("minecraft-data"));
exports.MinerPlugin = {
    name: "Miner",
    description: "Be a professional miner.",
    version: "1.0",
    author: "f1nniboy",
    loaded: false,
    // Gets called when the plugin gets enabled
    onEnable(app) {
        app.commands.set("find", {
            description: "Find the specified block.",
            onExecution(args) {
                if (!args[0]) {
                    app.message.system("You need to specify a block to find.");
                    return;
                }
                const mcData = minecraft_data_1.default(app.client.version);
                const blockToFind = args[0];
                const block = mcData.blocksByName[blockToFind];
                if (!block) {
                    app.message.system(`The block '{bold}${blockToFind}{/bold}' doesn't exist."`);
                    return;
                }
                const foundBlock = app.client.findBlock({ matching: [block.id], maxDistance: 256, useExtraInfo: true });
                app.message.system(`=== Found Block ===`);
                // Loop through all keys and print them to give the user info about the block that got found.
                Object.keys(foundBlock).forEach((key) => {
                    app.message.system(`\t{bold}${key.toString()}{/bold}: {bold}${foundBlock[key]}{/bold}`);
                });
                app.message.system(`=== Found Block ===`);
            }
        });
    },
    // Gets called when a tick happens
    onUpdate(app) {
    },
    // Gets called when the plugin gets enabled
    onDisable(app) {
    },
};
