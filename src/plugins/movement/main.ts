import { IPlugin } from "../../plugin/plugin";
import App from "../../app";

const controlStates = [
    "forward",
    "back",
    "left",
    "right",
    "jump",
    "sprint",
    "sneak"
]

export const MovementPlugin: IPlugin = {
    name: "Movement",
    description: "Make your player m-o-v-e.",
    version: "1.0",
    author: "f1nniboy",
    loaded: false,

    // Gets called when the plugin gets enabled
    onEnable(app: App) {

        for(const controlState of controlStates) {
            app.commands.set(controlState, {
                description: `Make the player go {bold}${controlState}{/bold} for X milliseconds.`,
                onExecution(args: string[]): void {
                    let timeOut = 1000;

                    if(args[0]) {
                        try {
                            timeOut = parseInt(args[0]);
                        } catch (error) {
                            app.message.system("Please specify a valid time in milliseconds.");
                            return;
                        }
                    }

                    app.client.controlState[controlState] = true;
                    app.message.system(`Started doing '{bold}${controlState}{/bold}' for {bold}${timeOut}{/bold}ms.`);

                    setTimeout(() => {
                        app.message.system(`Finished '{bold}${controlState}{/bold}'.`);
                        app.client.controlState[controlState] = false;
                    }, timeOut);
                }
            });
        }

    },

    // Gets called when a tick happens
    onUpdate(app: App) {

    },

    // Gets called when the plugin gets disabled
    onDisable(app: App) {},

}
