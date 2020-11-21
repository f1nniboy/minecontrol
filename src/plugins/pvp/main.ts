import { IPlugin } from "../../plugin/plugin";
import App from "../../app";
import { plugin } from "mineflayer-pvp";
import {Player} from "mineflayer";

const modes = [
    "closest",
    "name"
];

export const PVPPlugin: IPlugin = {
    name: "PVP",
    description: "Fight against other players.",
    version: "1.0",
    author: "f1nniboy",
    loaded: false,

    // Gets called when the plugin gets enabled
    onEnable(app: App) {
        app.client.loadPlugin(plugin);

        // @ts-ignore
        app.client.on("stoppedAttacking", () => {
            app.message.system(`Finished attacking.`);
        });

        app.commands.set("attack", {
            description: "Attack someone using a mode.",
            onExecution(args: string[]): void {
                if(!args[0] || !modes.includes(args[0].toLowerCase())) {
                    app.message.system(`Please specify any of these modes:${modes.map(value => ` {bold}${value}{/bold}`)}`);
                    return;
                }

                switch (args[0].toLowerCase()) {
                    case "closest":
                        let closestPlayer: Player;

                        for(let playerName in app.client.players) {
                            const player: Player = app.client.players[playerName];

                            if(player.entity && player.entity.isValid && playerName !== app.client.username &&
                                player.entity.position.distanceTo(app.client.entity.position)
                                > closestPlayer.entity.position.distanceTo(app.client.entity.position)) {

                                closestPlayer = player;
                            }
                        }

                        if(!closestPlayer) {
                            app.message.system("There is no player close to the bot.");
                            return;
                        }

                        app.client["pvp"].attack(closestPlayer.entity);
                        app.message.system(`Started attacking {bold}${closestPlayer.username}{/bold}.`);

                        break;

                    case "name":
                        if(!args[1]) {
                            app.message.system("Please specify a player to attack.");
                            return;
                        }

                        let playerToAttack = args[1];
                        let player = app.client.players[playerToAttack];

                        if(!player) {
                            app.message.system("The specified player is not online.");
                            return;
                        }

                        let playerEntity = player.entity;

                        if(!playerEntity) {
                            app.message.system("The specified player is not in the player's view distance.");
                            return;
                        }

                        if(player.entity && player.entity.isValid && playerToAttack !== app.client.username) {
                            app.client["pvp"].attack(player.entity);
                            app.message.system(`Started attacking {bold}${playerToAttack}{/bold}.`);
                        }

                        break;

                    case "stop":
                        if(app.client["pvp"].target) app.client["pvp"].stop();
                        else app.message.system("The player isn't currently attacking someone.");

                        break;
                }
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
