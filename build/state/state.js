"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const fs_1 = __importDefault(require("fs"));
const stateConstants_1 = require("./stateConstants");
const path = __importStar(require("path"));
class State extends events_1.EventEmitter {
    constructor(app, options, initialState) {
        super();
        this.app = app;
        this.options = options;
        // Initialize the state.
        this.state = {
            ...stateConstants_1.defaultState,
            ...initialState
        };
    }
    get() {
        return Object.assign({}, this.state);
    }
    /*
     * Change the application's state, triggering
     * a state change event.
     */
    update(changes) {
        this.emit("stateWillChange");
        // Store current state as previous state.
        const previousState = this.state;
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
    async sync() {
        if (fs_1.default.existsSync(this.options.stateFilePath)) {
            return new Promise((resolve) => {
                fs_1.default.readFile(path.join(__dirname, "..", this.options.stateFilePath), (error, data) => {
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
    save(notify = false) {
        if (notify)
            this.app.message.system("Saving application state...");
        const data = JSON.stringify({
            ...this.state,
            selectedPlayer: undefined,
            themeData: undefined
        });
        fs_1.default.writeFileSync(path.join(__dirname, "..", this.options.stateFilePath), data);
        if (notify)
            this.app.message.system(`Application state saved.`);
    }
    saveSync(notify = false) {
        if (notify)
            this.app.message.system("Saving application state...");
        const data = JSON.stringify({
            ...this.state,
            selectedPlayer: undefined,
            themeData: undefined
        });
        fs_1.default.writeFileSync(path.join(__dirname, "..", this.options.stateFilePath), data);
        if (notify)
            this.app.message.system(`Application state saved.`);
        return this;
    }
}
exports.default = State;
