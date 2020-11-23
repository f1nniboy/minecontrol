import chalk from "chalk";
import App, { SpecialSenders } from "../app";
import moment from "moment";

export default class MessageFactory {
    protected readonly app: App;

    public constructor(app: App) {
        this.app = app;
    }

    public create(sender: string, message: string, senderColor: string = "white", messageColor: string = this.app.state.get().themeData.messages.foregroundColor): this {
        let messageString: string = message.toString();
        let timeString: string = moment().format('h:mm A');

        // If the color starts with a '#', indicating that it is a hex color we can simply convert the hex to a similar-looking color, but if it isn't a hex color, refuse to append the message.
        if (messageColor.startsWith("#")) {
            messageString = chalk.hex(messageColor)(messageString);
        }
        else if (chalk[messageColor] === undefined || typeof chalk[messageColor] !== "function") {
            this.system("A invalid message color was provided.");
            return this;
        }
        else {
            messageString = ((chalk)[messageColor])(message);
        }

        // If the color starts with a '#', indicating that it is a hex color we can simply convert the hex to a similar-looking color, but if it isn't a hex color, refuse to append the message.
        if (senderColor.startsWith("#")) {
            sender = chalk.hex(senderColor)(sender);
        } else if (chalk[senderColor] === undefined || typeof chalk[senderColor] !== "function") {
            this.system("A invalid sender color was provided.");
            return this;
        } else {
            sender = ((chalk)[senderColor])(sender);
        }

        let line: string = this.app.state.get().messageFormat
            .replace("{time}", timeString)
            .replace("{sender}", sender)
            .replace("{message}", messageString);

        this.app.options.nodes.messages.pushLine(line);
        this.app.options.nodes.messages.setScrollPerc(100);
        this.app.render();

        return this;
    }

    public chat(message: string): this {
        this.create(SpecialSenders.Chat, message, "yellow");
        return this;
    }

    public ascii(message: string): this {
        const lineArray: string[] = message.split("\n");

        lineArray.forEach((line) => {
            this.create(SpecialSenders.ASCII, line, "blue");
        });

        return this;
    }

    public system(message: string): this {
        this.create(`{bold}${SpecialSenders.System}{/bold}`, message, "green");
        return this;
    }
}
