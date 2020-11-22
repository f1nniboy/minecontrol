import { IState } from "./state";
import chalk from "chalk";

export const defaultState: IState = {
    messageFormat: "{time} " + chalk.black("|") + " {sender} " + chalk.black("~") + " {message}",
    theme: "default",
    themesPath: "themes/",
    pluginsPath: "plugins/",
    commandsPath: "commands/",
    ticksPerSecond: 1,

    themeData: {
        messages: {
            foregroundColor: "white",
            backgroundColor: "gray",
            "scrollbar": {
                foregroundColor: "gray",
                backgroundColor: "white"
            }
        },

        sidebar: {
            foregroundColor: "white",
            backgroundColor: "black",
            foregroundColorHover: "white",
            backgroundColorHover: "gray"
        },

        input: {
            foregroundColor: "gray",
            backgroundColor: "lightgray"
        },

        header: {
            foregroundColor: "black",
            backgroundColor: "white"
        }
    }
};
