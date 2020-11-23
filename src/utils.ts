import path from "path";

export default abstract class Utils {
    // Generate a random integer between the given range.
    public static getRandomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    // Get the package info of the project.
    public static getPackageInfo(): any {
        const packageJSON = require(path.join(__dirname, "..", "package.json"));
        return packageJSON ? packageJSON : {};
    }
}
