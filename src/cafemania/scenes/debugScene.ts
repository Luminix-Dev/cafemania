import { Debug } from "../debug/debug";

export class DebugScene extends Phaser.Scene {
    public static Instance: DebugScene;

    private _text: Phaser.GameObjects.Text;
    
    private _updateTextTime: number = -1;
    private _i = 0;

    constructor() {
        super({});
        DebugScene.Instance = this;
    }

    public create() {
        this._text = this.add.text(0, 0, "");
        this._text.setColor("#FFFF00");
        this._text.setFontSize(16);
    }
    
    public updateText() {
        if(!this._text) return;

        this._updateTextTime = 0;

        let str = ``;

        str += `${this.game.loop.actualFps.toFixed(2)} FPS [${this._i++}]\n`;

        Debug.messages.map(message => {
            str += `${((message.time - Debug.startedAt)/1000).toFixed(2)} | ${message.text}\n`;
        })

        this._text.setText(str);
    }

    public update(time: number, delta: number) {
        this._updateTextTime += delta;
        if(this._updateTextTime < 300 && this._updateTextTime != -1) return;
        this.updateText();
    }
}