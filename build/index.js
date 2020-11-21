#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
console.log("Initializing interface ...");
const app_1 = __importDefault(require("./app"));
const app = new app_1.default();
try {
    app.setup().then((app) => {
        app.message.system("Initialized.");
    });
}
catch (error) {
    app.message.system(error);
}
