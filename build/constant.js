"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultAppOptions = exports.tips = void 0;
const blessed_1 = __importDefault(require("blessed"));
const stateConstants_1 = require("./state/stateConstants");
exports.tips = [
    "You can use the {bold}{prefix}sync{/bold} command to discard unsaved changes and reload the saved state.",
    "Toggle full-screen chat using the {bold}{prefix}fullscreen{/bold} command.",
    "Command autocompletion is supported.",
    "Press {bold}ESC{/bold} anytime to clear the current input.",
    "Exiting with {bold}CTRL + C{/bold} is recommended since it will automatically save the state.",
    "Press {bold}CTRL + X{/bold} to force exit without saving the state.",
    "Making plugins is very easy, try it yourself.",
];
exports.defaultAppOptions = {
    initialState: {},
    commandPrefix: ";",
    stateFilePath: "state.json",
    headerAutoHideTimeoutPerCharacter: 100,
    screen: blessed_1.default.screen({
        smartCSR: true,
        fullUnicode: true
    }),
    nodes: {
        messages: blessed_1.default.box({
            top: "0%",
            left: "0%",
            width: "100%",
            height: "100%-3",
            style: {
                fg: stateConstants_1.defaultState.themeData.messages.foregroundColor,
                bg: stateConstants_1.defaultState.themeData.messages.backgroundColor
            },
            scrollable: true,
            tags: true,
            padding: 1
        }),
        players: blessed_1.default.box({
            top: "0%",
            left: "0%",
            height: "100%",
            width: "12.5%",
            scrollable: true,
            padding: 1,
            hidden: true,
            style: {
                fg: stateConstants_1.defaultState.themeData.sidebar.foregroundColor,
                bg: stateConstants_1.defaultState.themeData.sidebar.backgroundColor
            }
        }),
        input: blessed_1.default.textbox({
            style: {
                fg: stateConstants_1.defaultState.themeData.input.foregroundColor,
                bg: stateConstants_1.defaultState.themeData.input.backgroundColor
            },
            left: "0%",
            bottom: "0",
            width: "100%",
            inputOnFocus: true,
            height: "shrink",
            padding: 1
        }),
        header: blessed_1.default.box({
            style: {
                fg: stateConstants_1.defaultState.themeData.header.foregroundColor,
                bg: stateConstants_1.defaultState.themeData.header.backgroundColor
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
