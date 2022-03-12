import { Gameface } from "../gameface/gameface";
import { Button } from "./button";
import { TileItemCategory, TileItemInfo } from "../tileItem/tileItemInfo";
import { GridList } from "./gridList";
import { TileItemShopItem } from "./tileItemShopItem";

export class Item {

}

export class TileItemShop {
    //public static Instance: TileItemShop;

    //public selectedTileItemInfo?: TileItemInfo;
    public get container() { return this._container; }
    public get closeButton() { return this._closeButton; }

    private _container: Phaser.GameObjects.Container;
    private _closeButton: Button;
    private _scene: Phaser.Scene;
    
    private _size = new Phaser.Math.Vector2(700, 170);
    private _itemSize = new Phaser.Math.Vector2(70, 70);

    private _categoryTextures = new Map<TileItemCategory, string>();
    private _categoryItems = new Map<TileItemCategory, TileItemInfo[]>();
    
    private _currentCategory: TileItemCategory = TileItemCategory.FLOOR;

    private _gridList?: GridList;

    private _shopItems = new Map<number, TileItemShopItem>();

    private _categoryButtonSize: number = 50;

    constructor(scene: Phaser.Scene) {
        this._scene = scene;
        this._container = scene.add.container();
        
        //TileItemShop.Instance = this;

        const categoryTextures = this._categoryTextures;
        categoryTextures.set(TileItemCategory.STOVE, "button/panel/stove");
        categoryTextures.set(TileItemCategory.COUNTER, "button/panel/counter");
        categoryTextures.set(TileItemCategory.TABLE, "button/panel/table");

        this.getCategoryItems();
        
        this.createCategoryButtons();
        this.createGridList();

        const closeButton = this._closeButton = this.addButton("button/signout", this._size.x, 0, "X")
        
    }

    private addButton(texture: string, x: number, y: number, text: string = "") {
        const scene = this._scene;
        const container = this._container;
        
        const button = new Button(scene, text, 0, 0, this._categoryButtonSize, this._categoryButtonSize, texture);
        container.add(button.container);

        button.container.setPosition(x, y);

        return button;
    }

    private createCategoryButtons() {
        const categoryItems = this._categoryItems;
        const categoryTextures = this._categoryTextures;

        let btnx = 0;

        for (const category of categoryItems.keys()) {
            const texture = categoryTextures.get(category) || "button/panel/none";

            const button = this.addButton(texture, btnx += (this._categoryButtonSize+5), 0);


            button.onClick = () => {
                
                this._currentCategory = category;
                console.log(category)

                this._gridList?.destroy();
                this.createGridList();

            }
        }
    }

    private getCategoryItems() {
        const categoryItems = this._categoryItems;
        categoryItems.clear();
        
        const tileItemFactory = Gameface.Instance.game.tileItemFactory;

        for (const tileItemInfoId in tileItemFactory.tileItemInfoList) {
            const tileItemInfo = tileItemFactory.getTileItemInfo(tileItemInfoId);
            const category = tileItemInfo.category;

            if(!categoryItems.has(category)) categoryItems.set(category, []);
            categoryItems.get(category)!.push(tileItemInfo);
        }

        return categoryItems;
    }

    private createGridList() {
        const scene = this._scene;
        const width = this._size.x;
        const height = this._size.y;
        const itemSize = this._itemSize;

        const category = this._currentCategory;
        const items = this._categoryItems.get(category)!;

        const gridList = this._gridList = new GridList(scene, width, height,    itemSize.x, itemSize.y, 10, 30);
        gridList.setItemsAmount(items.length);
        gridList.container!.setPosition(30, 60);
        this.container.add(gridList.container!);

        gridList.onShowItem = (index: number, position: Phaser.Math.Vector2) => {
            console.warn("showitem", index);

            const item = items[index];

            const shopItem = new TileItemShopItem(scene, item);
            shopItem.container.setPosition(position.x, position.y);
            gridList.container?.add(shopItem.container);

            this._shopItems.set(index, shopItem);
            
        }
        gridList.onHideItem = (index: number) => {
            const shopItem = this._shopItems.get(index)!;
            shopItem.destroy();
            this._shopItems.delete(index);
        }
        gridList.show();
    }
}