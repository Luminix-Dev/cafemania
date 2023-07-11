import { Gameface } from "../gameface/gameface";
import { GameScene } from "../scenes/gameScene";
import { TileItemCategory, TileItemInfo } from "../tileItem/tileItemInfo";
import { GridList } from "../ui/gridList";
import { Panel } from "../ui/panel";
import { TileItemShopItem } from "../ui/tileItemShopItem";
import { Button } from "../ui/button";
import { Hud } from "./hud";
import { HudLockZone } from "./hudLockZone";
import { TileItemDrag } from "../tileItemDrag/tileItemDrag";

export class HudShopPanel {
    public static get container() { return this._container!; }
    public static get closeButton() { return this._closeButton; }

    private static _container?: Phaser.GameObjects.Container;
    private static _closeButton?: Button;
    private static _panel?: Panel;
    private static _gridList?: GridList;

    private static _size = new Phaser.Math.Vector2(700, 170);
    private static _itemSize = new Phaser.Math.Vector2(70, 70);
    private static _categoryButtonSize: number = 50;

    private static _shopItems = new Map<number, TileItemShopItem>();
    private static _currentCategory: TileItemCategory = TileItemCategory.FLOOR;

    public static create() {
        if(this._container) return

        this._container = GameScene.Instance.add.container();

        const width = 760;
        const height = 250;
        const gameSize = GameScene.Instance.scale;
        const positionX = gameSize.width/2 - width/2;
        const positionY = gameSize.height - height - 5;
        
        const panel = this._panel = new Panel(GameScene.Instance, width, height);
        panel.setPosition(positionX, positionY);
        GameScene.Instance.hudContainer.add(panel.container);

        HudLockZone.addLockZone('tileItemShopPanel', positionX, positionY, width, height);  

        this.createCategoryButtons();
        //this.createGridList();

        panel.container.add(this.container);

        //close button
        const closeButton = new Button(GameScene.Instance, 'X', width - 100, 0, this._categoryButtonSize, this._categoryButtonSize, "button/button1");
        this.container.add(closeButton.container);
        closeButton.onClick = () => {
            HudShopPanel.destroy()
        }

        window['HudShopPanel'] = HudShopPanel;
    }

    private static addButton(texture: string, x: number, y: number, text: string = "") {
        const scene = GameScene.Instance;
        
        const button = new Button(scene, text, 0, 0, this._categoryButtonSize, this._categoryButtonSize, texture);
        this.container.add(button.container);

        button.container.setPosition(x, y);

        return button;
    }

    private static createCategoryButtons() {
        const categoryItems = this.getCategoryItems();
        const categoryTextures = this.getCategoryButtonTextures();

        let btnx = 0;

        for (const category of categoryItems.keys()) {
            const texture = categoryTextures.get(category) || "button/panel/none";

            console.log(texture)

            const button = this.addButton(texture, btnx += (this._categoryButtonSize + 5), 0);

            button.onClick = () => {
                this._currentCategory = category;

                this._gridList?.destroy();
                this.createGridList(category);
            }
        }
    }

    private static createGridList(category: TileItemCategory) {
        const scene = GameScene.Instance;
        const width = this._size.x;
        const height = this._size.y;
        const itemSize = this._itemSize;

        const items = this.getCategoryItems().get(category)!;

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

            shopItem.button.onBeginDrag = () => {
                console.log("onBeginDrag")
    
                const game = Gameface.Instance.game;
                const world = Gameface.Instance.currentWorld!;

                const tileItem = Gameface.Instance.game.tileItemFactory.createTileItem(item.id);
    
                TileItemDrag.onStopMoving = () => {
    
                    const tile = tileItem.tile;

                    if(tile) {
                        console.log("ok fine", tileItem)

                        world.removeTileItem(tileItem);

                        game.shop.buyTileItem(tileItem.tileItemInfo, tile)
                    } else {
                        console.log("didnt move")
                    }

                    
    
                }
                TileItemDrag.startMove(tileItem);
            };

            this._shopItems.set(index, shopItem);
            
        }
        gridList.onHideItem = (index: number) => {
            const shopItem = this._shopItems.get(index)!;
            shopItem.destroy();
            this._shopItems.delete(index);
        }
        gridList.show();
    }

    private static getCategoryButtonTextures() {
        const categoryTextures = new Map<TileItemCategory, string>();
        categoryTextures.set(TileItemCategory.STOVE, "button/panel/stove");
        categoryTextures.set(TileItemCategory.COUNTER, "button/panel/counter");
        categoryTextures.set(TileItemCategory.TABLE, "button/panel/table");
        return categoryTextures;
    }

    private static getCategoryItems() {
        const categoryItems = new Map<TileItemCategory, TileItemInfo[]>();
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
    
    public static destroy() {
        this._panel?.container.destroy();
        this._container?.destroy();
        this._container = undefined
        HudLockZone.removeLockZone('tileItemShopPanel');
    }
}