import { TileItemInfo } from "../tileItem/tileItemInfo";
import { TileItemDrag } from "../tileItemDrag/tileItemDrag";
import { Button } from "./button";
import { TileItemShop } from "./tileItemShop";

export class TileItemShopItem {
    public get container() { return this._container; }
    public get button() { return this._button; }

    private _container: Phaser.GameObjects.Container;
    private _button: Button;

    constructor(scene: Phaser.Scene, tileItemInfo: TileItemInfo) {
        this._container = scene.add.container();

        const width = 70;
        const height = 70;
        
        const graphics = scene.add.graphics();
        graphics.fillStyle(0x000000, 1);
        graphics.fillRect(0, 0, width, height);
        graphics.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);
        this._container.add(graphics);

        const button = this._button = new Button(scene, `${tileItemInfo.name}`, width/2, height/2,  width, height, "button/signout");
        button.onClick = () => {
            console.log("click")
        };

        


        button.onPointerOver = () => {
        }

        button.onPointerOut = () => {
            //TileItemShop.Instance.selectedTileItemInfo = undefined;
        }

        this._container.add(button.container);

    }

    public destroy() {
        this.container.destroy();
        this.button.destroy();
    }
}