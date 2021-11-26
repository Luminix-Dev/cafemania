interface IDebugMessage {
    time: number
    text: string
}

export class Debug {

    public static messages: IDebugMessage[] = [];
    public static readonly startedAt: number = Date.now();

    public static log(text: string) {
        const message: IDebugMessage = {
            time: Date.now(),
            text: text
        }
        this.messages.push(message);
        
        console.log("added to debug: " + message.text);
    }

    public static clear() {
        this.messages = [];
    }
}