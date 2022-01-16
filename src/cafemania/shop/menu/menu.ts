import { Dish } from "../../dish/dish";
import { HudScene } from "../../scenes/hudScene";
import { TileItemStove } from "../../tileItem/items/tileItemStove";
import { GridLayout } from "../../ui/gridLayout";
import { GridList } from "../../ui/gridList";
import { MenuItem } from "./menuItem";

export class Menu {
    public static get isOpen() { return this._isOpen; }

    private static _isOpen: boolean = false;
    private static _gridList?: GridList;

    public static show(stove: TileItemStove) {
        if(this._isOpen) return;
        this._isOpen = true;

        const scene = HudScene.Instance;
        const world = stove.world;
        const dishFactory = world.game.dishFactory;
        
        const dishList: Dish[] = [];
        const menuItemList = new Map<number, MenuItem>();

        for (let i = 0; i < 3; i++) {
            for (const dishId in dishFactory.getDishList()) {
                dishList.push(dishFactory.getDish(dishId));
            }
            
        }
        
        //const gridLayout = new GridLayout(scene, 700, 500, 280, 180, 20 );
        const gridList = this._gridList = new GridList(scene, 700, 500, 280, 180, 20);
        gridList.setItemsAmount(dishList.length);
        gridList.onShowItem = (index: number, position: Phaser.Math.Vector2) => {

            const menuItem = new MenuItem(scene);
            menuItem.button.onClick = () => {
                
                const dish = dishList[index];
                
                console.log("dish", dish)

                stove.startCook(dish);
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

        /*
        const world = stove.world;
        const dishFactory = world.game.dishFactory;

        let i = 0;

        const dishList =  dishFactory.getDishList();

        for (const dishId in dishFactory.getDishList()) {
            const scene = HudScene.Instance;
            const menuItem = new MenuItem(scene);
            const dish = dishList[dishId];
            
            menuItem.container.setPosition(i*300, 0)

            menuItem.button.onClick = () => {

                stove.startCook(dish);
                Menu.hide();
            }

            this._menuItems.push(menuItem)

            i++;
        }
        */
    }

    public static hide() {
        this.destroy();
    }

    public static destroy() {
        this._isOpen = false;
        this._gridList?.hide();
    }
}