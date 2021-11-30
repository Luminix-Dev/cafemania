interface IDebugMessage {
    time: number
    text: string
}

export class Debug {

    public static enabled: boolean = true;
    public static messages: IDebugMessage[] = [];
    public static startedAt: number = Date.now();
    public static maxMessages: number = 20;

    public static log(text: string) {
        if(!this.enabled) return;

        const message: IDebugMessage = {
            time: Date.now(),
            text: text
        }
        this.messages.push(message);

        if(this.messages.length >= this.maxMessages) {
            this.messages.shift();
        }
    }

    public static clear() {
        this.messages = [];
    }
}