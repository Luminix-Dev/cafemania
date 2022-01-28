import { Button } from "./button";

export class Panel {
    public get container() { return this._container; }

    private _container: Phaser.GameObjects.Container;
    private _scene: Phaser.Scene;

    private _buttons: Button[] = [];
    private _tabButtons: Button[] = [];

    private _buttonsOffset = new Phaser.Math.Vector2(0, 0);
    private _tabsOffset = new Phaser.Math.Vector2(40, -25);

    constructor(scene: Phaser.Scene, width: number, height: number) {
        this._scene = scene;

        const container = this._container = scene.add.container();

        

        const background = scene.add.graphics();
        background.fillStyle(0xffffff);
        background.fillRect(0, 0, width, height);
        background.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);
        container.add(background);
        

        /*
        const background = scene.add.image(0, 0, "panel").setOrigin(0);
        background.setSize(width, height)
        background.setInteractive();
        container.add(background);
        */
    }

    public setPosition(x: number, y: number) {
        this.container.setPosition(x, y);
    }

    public setButtonsOffset(x: number, y: number) {
        this._buttonsOffset.set(x, y);
    }

    public addTab(texure: string) {
        const scene = this._scene;
        const container = this._container;
        
        const button = new Button(scene, 0, 0, 50, 50, texure, 16, "A");
        container.add(button.container);

        this._tabButtons.push(button);

        const offset = this._tabsOffset;
        const x = this._tabButtons.indexOf(button) * 60;
        button.container.setPosition(offset.x + x, offset.y)

        return button;
    }

    public addButton(texure: string) {
        const scene = this._scene;
        const container = this._container;
        
        const button = new Button(scene, 0, 0, 64, 64, texure, 16, "");
        container.add(button.container);

        this._buttons.push(button);

        const offset = this._buttonsOffset;
        const x = this._buttons.indexOf(button) * 70;
        button.container.setPosition(offset.x + x, offset.y)

        return button;
    }
}