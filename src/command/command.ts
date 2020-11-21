export type ICommand = {
    readonly description: string;

    onExecution(args: string[]): void;
}
