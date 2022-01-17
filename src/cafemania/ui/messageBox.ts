export class MessageBox {

    private _container: Phaser.GameObjects.Container;
    private _backgroundContainer: Phaser.GameObjects.Container;

    private _background: Phaser.GameObjects.RenderTexture;
    private _bottom: Phaser.GameObjects.Image;

    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, texture: string, offset: number) {
        const container = this._container = scene.add.container();
        container.setPosition(x, y);

        const fliped = false;

        const backgroundContainer = this._backgroundContainer = scene.add.container(-(width * (fliped ? 0.8 : 0.2)), -height - offset);
        container.add(backgroundContainer);

        const background = this._background = scene.add.nineslice(0, 0, width, height, "messagebox/" + texture, 16).setOrigin(0, 0);
        backgroundContainer.add(background);

        const bottom = this._bottom = scene.add.image(0, 0, "messagebox/" + texture + "_bottom").setOrigin(0.5, 1);
        container.add(bottom);

        container.setDepth(1000000);

        //

        
        const text1 = scene.add.text(width/2, height/2, "TEXT GOES HERE").setOrigin(0.5)
        backgroundContainer.add(text1);
    }

    public destroy() {
        this._background.destroy();
        this._bottom.destroy();
        this._backgroundContainer.destroy();
        this._container.destroy();
    }
}