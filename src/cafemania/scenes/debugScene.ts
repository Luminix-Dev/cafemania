import { Debug } from "../debug/debug";

export class DebugScene extends Phaser.Scene {
    public static Instance: DebugScene;
    
    public showDebugText: boolean = false;
    
    private _text: Phaser.GameObjects.BitmapText;
    private _updateTextInterval: number = 100;
    private _updateTextTime: number = -1;

    constructor() {
        super({});
        DebugScene.Instance = this;
    }

    public create() {
        this._text = this.add.bitmapText(0, 0, 'gem', 'PHASER 3', 12);
    }
    
    public updateText() {
        let str = '';

        if(this.showDebugText) {
            str += `${this.game.loop.actualFps.toFixed(1)} fps\n`;

            Debug.messages.map(message => {
                str += `${((message.time - Debug.startedAt)/1000).toFixed(2)} | ${message.text}\n`;
            })
        }


        this._text.setText(str);
    }

    public update(time: number, delta: number) {
        //if(!this.showDebugText) return;
        //if(!this._text) return;

        
        if(this._updateTextTime >= this._updateTextInterval || this._updateTextTime == -1) {
            this._updateTextTime = 0;
            this.updateText();
        }
        this._updateTextTime += delta;


        //if(this._updateTextTime < this._updateTextInterval && this._updateTextTime != -1) return;
    }
}