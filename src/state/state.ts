import { EventEmitter } from "events";
import fs from "fs";
import { defaultState } from "./stateConstants";
import App from "../app";
import * as path from "path";

export interface IStateOptions {
    readonly stateFilePath: string;
}

export interface IState {
    readonly messageFormat: string;
    readonly autoHideHeaderTimeout?: NodeJS.Timer;
    readonly theme: string;
    readonly themeData: any;
    readonly themesPath: string;
    readonly pluginsPath: string;
    readonly ticksPerSecond: number;
    readonly username?: string;
    readonly password?: string;

    selectedPlayer?: string
}

export default class State extends EventEmitter {
    public readonly options: IStateOptions;
    protected state: IState;
    protected readonly app: App;

    public constructor(app: App, options: IStateOptions, initialState?: Partial<IState>) {
        super();

        this.app = app;
        this.options = options;

        // Initialize the state.
        this.state = {
            ...defaultState,
            ...initialState
        };
    }

    public get(): IState {
        return Object.assign({}, this.state);
    }

    /*
     * Change the application's state, triggering
     * a state change event.
     */
    public update(changes: Partial<IState>): this {
        this.emit("stateWillChange");

        // Store current state as previous state.
        const previousState: IState = this.state;

        // Update the state.
        this.state = {
            ...this.state,
            ...changes
        };

        // Fire the state change event. Provide the old and new state.
        this.emit("stateChanged", this.state, previousState);
        return this;
    }

    /*
     * Load and apply previously saved state from the
     * file system.
     */
    public async sync(): Promise<boolean> {
        if (fs.existsSync(this.options.stateFilePath)) {
            return new Promise<boolean>((resolve) => {
                fs.readFile(path.join(__dirname, "..", this.options.stateFilePath), (error: Error, data: Buffer) => {
                    if (error) {
                        this.app.message.system(`There was an error while reading the application state: {bold}${error.message}{/bold}`);

                        resolve(false);
                        return;
                    }

                    this.state = {
                        ...JSON.parse(data.toString()),
                        themeData: this.state.themeData
                    };

                    this.app.message.system(`Synced application state.`);
                    resolve(true);
                });
            });
        }

        return false;
    }

    public save(notify: boolean = false): void {
        if(notify) this.app.message.system("Saving application state...");

        const data: string = JSON.stringify({
            ...this.state,
            selectedPlayer: undefined,
            themeData: undefined
        });

        fs.writeFileSync(path.join(__dirname, "..", this.options.stateFilePath), data);
        if(notify) this.app.message.system(`Application state saved.`);
    }

    public saveSync(notify: boolean = false): this {
        if(notify) this.app.message.system("Saving application state...");

        const data: string = JSON.stringify({
            ...this.state,
            selectedPlayer: undefined,
            themeData: undefined
        });

        fs.writeFileSync(path.join(__dirname, "..", this.options.stateFilePath), data);
        if(notify) this.app.message.system(`Application state saved.`);

        return this;
    }
}
