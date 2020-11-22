"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultState = void 0;
const chalk_1 = __importDefault(require("chalk"));
exports.defaultState = {
    messageFormat: "{time} " + chalk_1.default.black("|") + " {sender} " + chalk_1.default.black("~") + " {message}",
    theme: "default",
    themesPath: "themes/",
    pluginsPath: "plugins/",
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
