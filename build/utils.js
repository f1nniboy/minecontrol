"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
class Utils {
    // Generate a random integer between the given range.
    static getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
    // Get the package info of the project.
    static getPackageInfo() {
        const packageJSON = require(path_1.default.join(__dirname, "..", "package.json"));
        return packageJSON ? packageJSON : {};
    }
}
exports.default = Utils;
