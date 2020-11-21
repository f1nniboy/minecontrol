import { IAppOptions } from "./app";
import blessed from "blessed";
import { defaultState } from "./state/stateConstants";

export const tips: string[] = [
    "You can use the {bold}{prefix}sync{/bold} command to discard unsaved changes and reload the saved state.",
    "Toggle full-screen chat using the {bold}{prefix}fullscreen{/bold} command.",
    "Command autocompletion is supported.",
    "Press {bold}ESC{/bold} anytime to clear the current input.",
    "Exiting with {bold}CTRL + C{/bold} is recommended since it will automatically save the state.",
    "Press {bold}CTRL + X{/bold} to force exit without saving the state.",
    "Making plugins is very easy, try it yourself.",
];

export const defaultAppOptions: IAppOptions = {
    initialState: {},
    commandPrefix: ";",
    stateFilePath: "state.json",
    headerAutoHideTimeoutPerCharacter: 100,

    screen: blessed.screen({
        smartCSR: true,
        fullUnicode: true
    }),

    nodes: {
        messages: blessed.box({
            top: "0%",
            left: "0%",
            width: "100%",
            height: "100%-3",

            style: {
                fg: defaultState.themeData.messages.foregroundColor,
                bg: defaultState.themeData.messages.backgroundColor
            },

            scrollable: true,
            tags: true,
            padding: 1
        }),

        players: blessed.box({
            top: "0%",
            left: "0%",
            height: "100%",
            width: "12.5%",
            scrollable: true,
            padding: 1,
            hidden: true,

            style: {
                fg: defaultState.themeData.sidebar.foregroundColor,
                bg: defaultState.themeData.sidebar.backgroundColor
            },
            draggable: true,
            border: "line"
        }),

        input: blessed.textbox({
            style: {
                fg: defaultState.themeData.input.foregroundColor,
                bg: defaultState.themeData.input.backgroundColor
            },

            left: "0%",
            bottom: "0",
            width: "100%",
            inputOnFocus: true,
            height: "shrink",
            padding: 1
        }),

        header: blessed.box({
            style: {
                fg: defaultState.themeData.header.foregroundColor,
                bg: defaultState.themeData.header.backgroundColor
            },

            top: "0%",
            left: "0%",
            height: "0%+3",
            padding: 1,
            width: "100%",
            hidden: true,
            tags: true
        })
    }
};
