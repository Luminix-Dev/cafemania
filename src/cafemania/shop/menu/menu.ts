import { HudScene } from "../../scenes/hudScene";
import { TileItemStove } from "../../tileItem/items/tileItemStove";
import { MenuItem } from "./menuItem";

export class Menu {
    public static get isOpen() { return this._isOpen; }

    private static _isOpen: boolean = false;

    private static _stove?: TileItemStove;

    private static _menuItems: MenuItem[] = [];

    public static show(stove: TileItemStove) {
        if(this._isOpen) return;
        this._isOpen = true;

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
    }

    public static hide() {
        for (const menuItem of this._menuItems) {
            menuItem.destroy();
        }

        this._menuItems = [];
        this._stove = undefined;
        this._isOpen = false;
    }
}