#!/usr/bin/env node

console.log("Initializing interface ...");

import App from "./app";
const app: App = new App();

try {
    app.setup().then((app: App) => {
        app.message.system("Initialized.");
    });
} catch (error) {
    app.message.system(error);
}
