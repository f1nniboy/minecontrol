"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PathPlugin = void 0;
const minecraft_data_1 = __importDefault(require("minecraft-data"));
const mineflayer_pathfinder_1 = require("mineflayer-pathfinder");
exports.PathPlugin = {
    name: "Path",
    description: "Go around the world.",
    version: "1.0",
    author: "f1nniboy",
    loaded: false,
    // Gets called when the plugin gets enabled
    onEnable(app) {
        app.loadMineflayerPlugin(mineflayer_pathfinder_1.pathfinder);
        app.commands.set("goto", {
            description: "Go to a specific location using pathfinding.",
            onExecution(args) {
                const mcData = minecraft_data_1.default(app.client.version);
                const x = parseInt(args[0]);
                const z = parseInt(args[1]);
                if (!x || !z) {
                    app.message.system("You need to specify the {bold}X{/bold} and {bold}Z{/bold} coordinates.");
                    return;
                }
                app.client["pathfinder"].setMovements(new mineflayer_pathfinder_1.Movements(app.client, mcData));
                app.client["pathfinder"].setGoal(new mineflayer_pathfinder_1.goals.GoalXZ(x, z));
                app.message.system(`Started going to X {bold}${x}{/bold} and Z {bold}${z}{/bold}.`);
            }
        });
        app.commands.set("follow", {
            description: "Follow a specific player.",
            onExecution(args) {
                const mcData = minecraft_data_1.default(app.client.version);
                const followRange = parseInt(args[1]) || 5;
                if (!args[0]) {
                    app.message.system("Please specify a player to follow.");
                    return;
                }
                let playerToFollow = args[0];
                let player = app.client.players[playerToFollow];
                if (!player) {
                    app.message.system("The specified player is not online.");
                    return;
                }
                let playerEntity = player.entity;
                if (!playerEntity) {
                    app.message.system("The specified player is not in the player's view distance.");
                    return;
                }
                app.client["pathfinder"].setMovements(new mineflayer_pathfinder_1.Movements(app.client, mcData));
                app.client["pathfinder"].setGoal(new mineflayer_pathfinder_1.goals.GoalFollow(playerEntity, followRange));
                app.message.system(`Started following '{bold}${playerToFollow}{/bold}' with a range of {bold}${followRange}{/bold}.`);
            }
        });
        // @ts-ignore
        app.client.once("goal_reached", (goal) => {
            app.message.system(`Arrived at X {bold}${goal.x}{/bold} and Z {bold}${goal.z}{/bold}.`);
        });
    },
    // Gets called when the plugin gets disabled
    onDisable(app) {
    },
};
