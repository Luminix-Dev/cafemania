import { Debug } from "../debug/debug";
import { Button } from "./button";
import { GridLayout } from "./gridLayout";

export class GridList {
    public get container() { return this._container; }
    public onShowItem: (index: number, position: Phaser.Math.Vector2) => void;
    public onHideItem: (index: number) => void;
    public onChangePage?: () => void;

    private _scene: Phaser.Scene;
    private _size: Phaser.Math.Vector2;

    private _gridLayout: GridLayout;

    private _container?: Phaser.GameObjects.Container;

    private _showingItems: number[] = [];
    private _numberOfItems: number = 6;
    private _page: number = 0;

    constructor(scene: Phaser.Scene, width: number, height: number, itemWidth: number, itemHeight: number, paddingX: number, paddingY: number) {
        this._scene = scene;
        this._size = new Phaser.Math.Vector2(width, height);


        const gridLayout = this._gridLayout = new GridLayout(scene, width, height, itemWidth, itemHeight, paddingX, paddingY);
        
        const container = this._container = scene.add.container();
        
        container.add(gridLayout.container);
        
        window['gridList'] = this;
    }

    public setItemsAmount(amount: number) {
        this._numberOfItems = amount;
    }

    public hide() {
        this.destroy();
    }

    public destroy() {
        this.hideAllItems();
        this._gridLayout.destroy();
        this.container?.destroy();
    }

    public show() {
        this.createButtons();
        this.updateShowingItems();
    }

    public changePageBy(by: number) {
        this._page += by;
        this.updateShowingItems();

        this.onChangePage?.();
    }

    private hideAllItems() {
        for (const index of this._showingItems) {
            this.onHideItem(index);
        }
        this._showingItems = [];
    }

    private updateShowingItems() {

        this.hideAllItems();

        const gridLayout = this._gridLayout;
        const itemsPerPage = gridLayout.getItemsPerPage();

        const totalItemsPerPage = (itemsPerPage.x*itemsPerPage.y);

        const startItem = this._page * totalItemsPerPage;

        for (let i = 0; i < totalItemsPerPage; i++) {
            let y = Math.floor(i / itemsPerPage.x);
            let x = i - (y*itemsPerPage.x);
            
            const index = startItem + i;
            if(index >= 0 && index < this._numberOfItems) {
                if (Debug.consoleLog) console.log(`showing ${index} (${x},${y})`)


                if(!this._showingItems.includes(index)) {
                    this._showingItems.push(index);
                    this.onShowItem(index, gridLayout.getItemPosition(x, y))
                }

            }
        }
    }

    private createButtons() {
        const scene = this._scene;
        const container = this._container!;

        
        const leftButton = new Button(scene, "<", 0, 0, 40, 40, "button/button1");
        leftButton.container.setPosition(0, this._size.y/2);
        leftButton.onClick = () => {
            this.changePageBy(-1);
        }
        container.add(leftButton.container);
        
        const rightButton = new Button(scene, ">", 0, 0, 40, 40, "button/button1");
        rightButton.container.setPosition(this._size.x, this._size.y/2);
        rightButton.onClick = () => {
            this.changePageBy(1);
        }
        container.add(rightButton.container);

    }
}