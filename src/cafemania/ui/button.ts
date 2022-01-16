import { Input } from "../input/input";

export class Button {
    public onClick?: () => void;
    public get container() { return this._container!; }
    
    private _container?: Phaser.GameObjects.Container;
    private _backgrond?: Phaser.GameObjects.RenderTexture;
    private _text?: Phaser.GameObjects.Text;

    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, texture: string, offset: number, text: string) {
        
        const container = this._container = scene.add.container();

        const background = this._backgrond = scene.add.nineslice(0, 0, width, height, texture, offset).setOrigin(0.5);
        background.setInteractive();
        container.add(background);


        const textgo = this._text = scene.add.text(0, 0, text, {fontFamily: 'AlfaSlabOne-Regular', color: "#FFFFFF"});
        //text3.setFontSize(12);
        //text3.setStroke("#55330D", 10)
        textgo.setOrigin(0.5);
        container.add(textgo);

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
            Input.simulatePointerUp(pointer);
        })
        
        container.setPosition(x, y);
    }

    public destroy() {
        this._backgrond?.destroy();
        this._text?.destroy();
        this._container?.destroy();

        this._backgrond = undefined;
        this._text = undefined;
        this._container = undefined;
    }
}