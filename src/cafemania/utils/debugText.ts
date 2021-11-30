import { GameScene } from "../scenes/gameScene";

export class DebugText {
    public get enabled() { return this._enabled; }

    private _enabled: boolean = false;
    private _text: Phaser.GameObjects.Text;
    private _textLines: {[key: string]: string} = {};
    private _position = new Phaser.Math.Vector2();

    private create(scene: Phaser.Scene) {
        const text = this._text = scene.add.text(0, 0, 'NO_TEXT', {align: 'center'});
        text.setColor("#000000")
        text.setDepth(10000);
        text.setOrigin(0.5, 0.5)
    }

    public setTextLine(key: string, text: string) {
        this._textLines[key] = text;
    }

    public setPosition(x: number, y: number) {
        this._position.set(x, y);
    }

    public destroy() {
        this._enabled = false;
        this._text.destroy();
    }

    public update() {
    
        if(!this.enabled) return;

        let str = '';
        for (const key in this._textLines) {
            str += this._textLines[key] + '\n';
        }

        this._text.setText(str);
        this._text.setPosition(this._position.x, this._position.y);
    }

    public setEnabled(enabled: boolean) {
        if(this.enabled == enabled) return;

        if(enabled) {
            this.create(GameScene.Instance);
        } else {
            this.destroy();
        }

        this._enabled = enabled;
    }
}