interface IDebugMessage {
    time: number
    text: string
}

export class Debug {

    public static messages: IDebugMessage[] = [];
    public static startedAt: number = Date.now();

    public static log(text: string) {
        const message: IDebugMessage = {
            time: Date.now(),
            text: text
        }
        this.messages.push(message);
    }

    public static clear() {
        this.messages = [];
    }
}