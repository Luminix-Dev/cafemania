export class GridLayout {
    public get container() { return this._container; }

    private _scene: Phaser.Scene;
    private _size: Phaser.Math.Vector2;
    private _itemSize: Phaser.Math.Vector2;
    private _padding: Phaser.Math.Vector2;

    private _container: Phaser.GameObjects.Container;

    private _customAmountOfItemsPerPage = new Phaser.Math.Vector2(1, 1);
    private _useCustomAmountOfItemsPerPage: boolean = false;

    private _visualsGraphics: Phaser.GameObjects.Graphics[] = [];

    constructor(scene: Phaser.Scene, width: number, height: number, itemWidth: number, itemHeight: number, paddingX: number, paddingY: number) {
        this._scene = scene;
        this._size = new Phaser.Math.Vector2(width, height);
        this._itemSize = new Phaser.Math.Vector2(itemWidth, itemHeight);
        this._padding = new Phaser.Math.Vector2(paddingX, paddingY);

        this._container = scene.add.container();

        this.createVisuals();

        this.getItemsPerPage();
    }

    public setItemsPerPage(itemsX: number, itemsY: number) {
        this._customAmountOfItemsPerPage.set(itemsX, itemsY);
        this._useCustomAmountOfItemsPerPage = true;

        this.destroyVisuals();
        this.createVisuals();
    }

    public getItemsPerPage() {
        if(this._useCustomAmountOfItemsPerPage) return this._customAmountOfItemsPerPage;

        const size = this._size;
        const itemSize = this._itemSize;
        const padding = this._padding;

        const itemsPerPage = new Phaser.Math.Vector2(0, 0);

        for (let y = 0; y < size.y; y += itemSize.y) {
            //if (Debug.consoleLog) console.log("test y", y, 'to', y + itemSize.y)

            if((y + itemSize.y) <= size.y) itemsPerPage.y++;
            y += padding.y;
        }

        for (let x = 0; x < size.x; x += itemSize.x) {
            //if (Debug.consoleLog) console.log("test x", x, 'to', x + itemSize.x)

            if((x + itemSize.x) <= size.x) itemsPerPage.x++;
            x += padding.x;
        }

        return itemsPerPage;
    }

    private createVisuals() {
        const scene = this._scene;
        const container = this.container;
        const size = this._size;

        const background = scene.add.graphics();
        background.fillStyle(0xE5F7FF);
        background.fillRect(0, 0, size.x, size.y);
        container.add(background);

        //
        const itemsPerPage = this.getItemsPerPage();

        const area = this.getAreaItemsInPageOcuppes(itemsPerPage.x, itemsPerPage.y);
        const backgroundArea = scene.add.graphics();
        backgroundArea.fillStyle(0xA0ADB2);
        backgroundArea.fillRect((size.x - area.x) / 2, (size.y - area.y) / 2, area.x, area.y);
        container.add(backgroundArea);

        //
        
        for (let y = 0; y < itemsPerPage.y; y++) {
            for (let x = 0; x < itemsPerPage.x; x++) {
                const item = scene.add.graphics();
                container.add(item);

                const color = (x+y)%2 == 0 ? 0x6D6D6D : 0x000000;

                item.fillStyle(color, 0.5);
                item.fillRect(0, 0, this._itemSize.x, this._itemSize.y);
                
                const position = this.getItemPosition(x, y);
                item.setPosition(position.x, position.y);

                this._visualsGraphics.push(item)
            }
        }

        this._visualsGraphics.push(background)
        this._visualsGraphics.push(backgroundArea)
    }

    private destroyVisuals() {
        for (const graphics of this._visualsGraphics) {
            graphics.destroy();
        }

        this._visualsGraphics = [];
    }

    public getItemPosition(x: number, y: number) {
        const position = new Phaser.Math.Vector2();
        const padding = this._padding;

        const itemsPerPage = this.getItemsPerPage();
        const size = this._size;
        const itemSize = this._itemSize;
        const area = this.getAreaItemsInPageOcuppes(itemsPerPage.x, itemsPerPage.y);

        position.x = x * itemSize.x //+ extraOffset.x/2;
        position.y = y * itemSize.y //+ extraOffset.y/2;

        position.x += x * padding.x;
        position.y += y * padding.y;
     
        position.x += (size.x - area.x) / 2;
        position.y += (size.y - area.y) / 2;
        
        return position;
    }

    public getItemCenterPosition(x: number, y: number) {
        const position = this.getItemPosition(x, y);
        const itemSize = this._itemSize;

        position.x += itemSize.x / 2;
        position.y += itemSize.y / 2;

        return position;
    }

    private getAreaItemsInPageOcuppes(itemsX: number, itemsY: number) {
        const itemsPerPage = new Phaser.Math.Vector2(itemsX, itemsY);
        const itemSize = this._itemSize;
        const padding = this._padding;

        const area = new Phaser.Math.Vector2(0, 0);

        area.x += itemsPerPage.x * itemSize.x;
        area.y += itemsPerPage.y * itemSize.y;
        
        area.x += (itemsPerPage.x-1) * padding.x;
        area.y += (itemsPerPage.y-1) * padding.y;

        return area;
    }

    public destroy() {
        
    }
}