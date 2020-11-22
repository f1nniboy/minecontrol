import { IPlugin } from "../../plugin/plugin";
import App from "../../app";
import minecraftData from "minecraft-data";
import { pathfinder, Movements, goals } from "mineflayer-pathfinder";

export const PathPlugin: IPlugin = {
    name: "Path",
    description: "Go around the world.",
    version: "1.0",
    author: "f1nniboy",
    loaded: false,

    // Gets called when the plugin gets enabled
    onEnable(app: App) {
        app.client.loadPlugin(pathfinder);

        // @ts-ignore
        app.client.on("goal_reached", (goal) => {
            app.message.system(`Arrived at X {bold}${goal.x}{/bold} and Z {bold}${goal.z}{/bold}.`);
        });

        app.commands.set("goto", {
            description: "Go to a specific location using pathfinding.",
            onExecution(args: string[]): void {
                const mcData = minecraftData(app.client.version);

                const x = parseInt(args[0]);
                const z = parseInt(args[1]);

                if(!x || !z) {
                    app.message.system("You need to specify the {bold}X{/bold} and {bold}Z{/bold} coordinates.");
                    return;
                }

                app.client["pathfinder"].setMovements(new Movements(app.client, mcData));
                app.client["pathfinder"].setGoal(new goals.GoalXZ(x, z));

                app.message.system(`Started going to X {bold}${x}{/bold} and Z {bold}${z}{/bold}.`);
            }
        });

        app.commands.set("follow", {
            description: "Follow a specific player.",
            onExecution(args: string[]): void {
                const mcData = minecraftData(app.client.version);

                const followRange = parseInt(args[1]) || 5;

                if(!args[0]) {
                    app.message.system("Please specify a player to follow.");
                    return;
                }

                let playerToFollow = args[0];
                let player = app.client.players[playerToFollow];

                if(!player) {
                    app.message.system("The specified player is not online.");
                    return;
                }

                let playerEntity = player.entity;

                if(!playerEntity) {
                    app.message.system("The specified player is not in the player's view distance.");
                    return;
                }

                app.client["pathfinder"].setMovements(new Movements(app.client, mcData));
                app.client["pathfinder"].setGoal(new goals.GoalFollow(playerEntity, followRange));

                app.message.system(`Started following '{bold}${playerToFollow}{/bold}' with a range of {bold}${followRange}{/bold}.`);
            }
        })
    },

    // Gets called when the plugin gets disabled
    onDisable(app: App) {

    },

}
