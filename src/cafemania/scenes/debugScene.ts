import { Debug } from "../debug/debug";

export class DebugScene extends Phaser.Scene {
    public static Instance: DebugScene;
    public maxMessages: number = 30;

    private _text: Phaser.GameObjects.Text;
    
    constructor() {
        super({});
        DebugScene.Instance = this;
    }

    public create() {
        this._text = this.add.text(0, 0, "");
        this._text.setColor("#FFFF00");
        this._text.setFontSize(16);
    }

    public update(time: number, delta: number) {
        let str = ``;

        str += `${this.game.loop.actualFps} FPS\n`;

        let i = 0;
        Debug.messages.map(message => {
            if(i > Debug.messages.length - this.maxMessages) {
                str += `${((message.time - Debug.startedAt)/1000).toFixed(2)} | ${message.text}\n`;
            }
            i++;
        })

        this._text.setText(str);
    }
}