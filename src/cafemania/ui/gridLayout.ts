export class GridLayout {
    public get container() { return this._container; }

    private _scene: Phaser.Scene;
    private _size: Phaser.Math.Vector2;
    private _itemSize: Phaser.Math.Vector2;
    private _padding: number;

    private _container?: Phaser.GameObjects.Container;


    constructor(scene: Phaser.Scene, width: number, height: number, itemWidth: number, itemHeight: number, padding: number = 0) {
        this._scene = scene;
        this._size = new Phaser.Math.Vector2(width, height);
        this._itemSize = new Phaser.Math.Vector2(itemWidth, itemHeight);
        this._padding = padding;

        const container = this._container = scene.add.container();

        const graphics = scene.add.graphics();
        graphics.fillStyle(0xff0000);
        graphics.fillRect(0, 0, width, height);

        container.add(graphics);

        this.createVisuals();
    }

    private createVisuals() {
        const scene = this._scene;
        const container = this._container!;
        const itemsPerPage = this.getItemsPerPage();
        
        for (let y = 0; y < itemsPerPage.y; y++) {
            for (let x = 0; x < itemsPerPage.x; x++) {
                const item = scene.add.graphics();
                container.add(item);

                item.fillStyle(0xffff00 + Math.random() * 1000);
                item.fillRect(0, 0, this._itemSize.x, this._itemSize.y);
                
                const position = this.getItemPosition(x, y);
                item.setPosition(position.x, position.y);

            }
        }
    }
    
    public getItemPosition(x: number, y: number) {
        const position = new Phaser.Math.Vector2();
        const extraOffset = this.getExtraOffset();
        const itemsPerPage = this.getItemsPerPage();
        const padding = this._padding;

        position.x = x * this._itemSize.x + extraOffset.x/2;
        position.y = y * this._itemSize.y + extraOffset.y/2;

        position.x += (x)*padding;
        position.y += (y)*padding;
        
        position.x -= (itemsPerPage.x-1)*padding/2;
        position.y -= (itemsPerPage.x-1)*padding/2;
        
        
        return position;
    }

    public getItemCenterPosition(x: number, y: number) {
        const position = this.getItemPosition(x, y);
       
        position.x += this._itemSize.x/2;
        position.y += this._itemSize.y/2;

        return position;
    }
    
    public getItemsPerPage() {
        return new Phaser.Math.Vector2(
            Math.floor(this._size.x/this._itemSize.x),
            Math.floor(this._size.y/this._itemSize.y)
        )
    }

    public getExtraOffset() {
        const itemsPerPage = this.getItemsPerPage();
        const offset = new Phaser.Math.Vector2();

        offset.x = this._size.x - (itemsPerPage.x * this._itemSize.x);
        offset.y = this._size.y - (itemsPerPage.y * this._itemSize.y);

        return offset;
    }

    public destroy() {
        //need to destroy things
    }
}