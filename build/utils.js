"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Utils {
    static getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
}
exports.default = Utils;
