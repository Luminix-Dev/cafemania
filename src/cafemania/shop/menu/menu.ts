import { Dish } from "../../dish/dish";
import { GameScene } from "../../scenes/gameScene";
import { HudScene } from "../../scenes/hudScene";
import { TileItemStove } from "../../tileItem/items/tileItemStove";
import { GridList } from "../../ui/gridList";
import { WorldTextManager } from "../../worldText/worldTextManager";
import { MenuItem } from "./menuItem";

export class Menu {
    public static get isOpen() { return this._isOpen; }

    private static _isOpen: boolean = false;
    private static _gridList?: GridList;

    public static show(stove: TileItemStove) {
        if(this._isOpen) return;
        this._isOpen = true;

        const scene = GameScene.Instance;
        const world = stove.world;
        const dishFactory = world.game.dishFactory;
        
        const dishList: Dish[] = [];
        const menuItemList = new Map<number, MenuItem>();

        for (let i = 0; i < 3; i++) {
            for (const dishId in dishFactory.getDishList()) {
                dishList.push(dishFactory.getDish(dishId));
            }
        }

        const gridList = this._gridList = new GridList(scene, 700, 500, 280, 180, 20);
        gridList.setItemsAmount(dishList.length);
        gridList.onShowItem = (index: number, position: Phaser.Math.Vector2) => {

            const menuItem = new MenuItem(scene);
            menuItem.button.onClick = () => {

                const dish = dishList[index];
                stove.startCook(dish);

                WorldTextManager.drawWorldText(dish.name, stove.position.x, stove.position.y - 30, 1500, 0.3);

                gridList.hide();
                Menu.hide();
            }
            gridList.container?.add(menuItem.container);
            
            menuItem.container.setPosition(position.x, position.y);

            menuItemList.set(index, menuItem);

        }
        gridList.onHideItem = (index: number) => {
            menuItemList.get(index)!.destroy();
        }
        gridList.show();

        gridList.container?.setPosition(60, 60);
        GameScene.Instance.hudContainer.add(gridList.container!);
    }

    public static hide() {
        this.destroy();
    }

    public static destroy() {
        this._isOpen = false;
        this._gridList?.hide();
    }
}