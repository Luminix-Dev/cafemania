import { Debug } from "../../debug/debug";
import { DishPlate } from "../../dish/dishPlate";
import { Button } from "../../ui/button";

export class MenuItem {
    public get container() { return this._container; }
    public get button() { return this._button; }

    private _container: Phaser.GameObjects.Container;
    private _button: Button;


    constructor(scene: Phaser.Scene) {
        this._container = scene.add.container();

        
        const graphics = scene.add.graphics();
        graphics.fillStyle(0xffffff, 1);
        graphics.fillRect(0, 0, 280, 180);
        graphics.setInteractive(new Phaser.Geom.Rectangle(0, 0, 280, 180), Phaser.Geom.Rectangle.Contains);
        this._container.add(graphics);

        const button = this._button = new Button(scene, '', 190, 150,  140, 25, "button/button_cook");
        button.onClick = () => {
            if (Debug.consoleLog) console.log("click")
        };
        this._container.add(button.container);

    }

    public destroy() {
        this.container.destroy();
        this.button.destroy();
    }
}