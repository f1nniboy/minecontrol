import { IPlugin } from "../../plugin/plugin";
import App from "../../app";
import minecraftData from "minecraft-data";

export const MinerPlugin: IPlugin = {
    name: "Miner",
    description: "Be a professional miner.",
    version: "1.0",
    author: "f1nniboy",
    loaded: false,

    // Gets called when the plugin gets enabled
    onEnable(app: App) {
        app.commands.set("find", {
            description: "Find the specified block.",
            onExecution(args: string[]): void {
                if(!args[0]) {
                    app.message.system("You need to specify a block to find.");
                    return;
                }

                const mcData = minecraftData(app.client.version);

                const blockToFind = args[0];
                const block = mcData.blocksByName[blockToFind];

                if(!block) {
                    app.message.system(`The block '{bold}${blockToFind}{/bold}' doesn't exist."`);
                    return;
                }

                const foundBlock = app.client.findBlock({ matching: [ block.id ], maxDistance: 256, useExtraInfo: true });

                app.message.system(`=== Found Block ===`);

                // Loop through all keys and print them to give the user info about the block that got found.
                Object.keys(foundBlock).forEach((key: string) => {
                    app.message.system(`\t{bold}${key.toString()}{/bold}: {bold}${foundBlock[key]}{/bold}`);
                });

                app.message.system(`=== Found Block ===`);
            }
        });
    },

    // Gets called when a tick happens
    onUpdate(app: App) {

    },

    // Gets called when the plugin gets enabled
    onDisable(app: App) {

    },

}

