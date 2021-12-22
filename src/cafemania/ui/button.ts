export class Button {
    public onClick?: () => void;

    private _backgrond?: Phaser.GameObjects.RenderTexture;
    private _text?: Phaser.GameObjects.Text;

    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, texture: string, text: string) {
        
        const background = this._backgrond = scene.add.nineslice(x, y, width, height, texture, 16).setOrigin(0.5);
        background.setInteractive();

        const textgo = this._text = scene.add.text(x, y, text, {color: "white"});
        textgo.setOrigin(0.5);

        const s = 1.05;

        background.on('pointerover',function(pointer){
            background.setScale(s);
            textgo.setScale(s);
        })

        background.on('pointerout',function(pointer){
            background.setScale(1);
            textgo.setScale(1);
        })

        const self = this;

        background.on('pointerup',function(pointer){
            self.onClick?.();
        })
        

    }

    public destroy() {
        this._backgrond?.destroy();
        this._text?.destroy();

        this._backgrond = undefined;
        this._text = undefined;
    }
}