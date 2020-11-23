"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const app_1 = require("../app");
const moment_1 = __importDefault(require("moment"));
class MessageFactory {
    constructor(app) {
        this.app = app;
    }
    create(sender, message, senderColor = "white", messageColor = this.app.state.get().themeData.messages.foregroundColor) {
        let messageString = message.toString();
        let timeString = moment_1.default().format('h:mm A');
        // If the color starts with a '#', indicating that it is a hex color we can simply convert the hex to a similar-looking color, but if it isn't a hex color, refuse to append the message.
        if (messageColor.startsWith("#")) {
            messageString = chalk_1.default.hex(messageColor)(messageString);
        }
        else if (chalk_1.default[messageColor] === undefined || typeof chalk_1.default[messageColor] !== "function") {
            this.system("A invalid message color was provided.");
            return this;
        }
        else {
            messageString = ((chalk_1.default)[messageColor])(message);
        }
        // If the color starts with a '#', indicating that it is a hex color we can simply convert the hex to a similar-looking color, but if it isn't a hex color, refuse to append the message.
        if (senderColor.startsWith("#")) {
            sender = chalk_1.default.hex(senderColor)(sender);
        }
        else if (chalk_1.default[senderColor] === undefined || typeof chalk_1.default[senderColor] !== "function") {
            this.system("A invalid sender color was provided.");
            return this;
        }
        else {
            sender = ((chalk_1.default)[senderColor])(sender);
        }
        let line = this.app.state.get().messageFormat
            .replace("{time}", timeString)
            .replace("{sender}", sender)
            .replace("{message}", messageString);
        this.app.options.nodes.messages.pushLine(line);
        this.app.options.nodes.messages.setScrollPerc(100);
        this.app.render();
        return this;
    }
    chat(message) {
        this.create(app_1.SpecialSenders.Chat, message, "yellow");
        return this;
    }
    ascii(message) {
        const lineArray = message.split("\n");
        lineArray.forEach((line) => {
            this.create(app_1.SpecialSenders.ASCII, line, "blue");
        });
        return this;
    }
    system(message) {
        this.create(`{bold}${app_1.SpecialSenders.System}{/bold}`, message, "green");
        return this;
    }
}
exports.default = MessageFactory;
