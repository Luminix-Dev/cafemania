import { GameScene } from "../../scenes/gameScene";
import { Tile } from "../../tile/tile"
import { TileItem } from "../tileItem"
import { TileItemInfo } from "../tileItemInfo";
import { TileItemDoor } from "./tileItemDoor"

export class TileItemWall extends TileItem {
    public hasHole: boolean = false;
    private _hasCreatedHole: boolean = false;

    constructor(tileItemInfo: TileItemInfo) {
        super(tileItemInfo);
        this.rotateOnLeftClick = false;
    }

    public getDoorInFront(): TileItemDoor | undefined {
        const tile = this.getTileInFront();
        if(!tile) return
        if(!tile.hasDoor) return
        return tile.getDoor();
    }
    
    public render(dt: number) {
        super.render(dt);


        this.hasHole = this.getDoorInFront() != undefined;
        this.renderHole();
    }

    private renderHole() {
        const scene = GameScene.Instance;

        if(this.hasHole) {
            if(!this._hasCreatedHole) {
                this._hasCreatedHole = true;

   
                this.generateHoleTexture();

                const sprite = this.getSpriteWithImage();
                const image = sprite.image!;

                console.log(image.texture.key)


                image.destroy()
                sprite.image = scene.add.image(0, 0, this.getWallHoleKey())

                this.updateSpritesLayer()
                this.updateSprites();


                //this.updateSprites()
            }
        } else {
            if(this._hasCreatedHole) {
                this._hasCreatedHole = false;

                const sprite = this.getSpriteWithImage();
                const image = sprite.image!;

                image.destroy();

                sprite.image = scene.add.image(0, 0, `${this.tileItemInfo.id}_sheet`);

                this.updateSpritesLayer()
                this.updateSprites();
            }
        }
    }

    private generateHoleTexture() {
        const scene = GameScene.Instance;

        if(scene.textures.exists(this.getWallHoleKey())) return;

        const sprite = this.getSpriteWithImage()
        const image = sprite.image!

        
        const canvas = image.texture.getSourceImage() as HTMLCanvasElement 
        const wallHoleCanvas = scene.textures.createCanvas(this.getWallHoleKey(), canvas.width, canvas.height)

        const imageData = canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height)
        const wallMask = scene.textures.get('wallMask').getSourceImage() as HTMLImageElement 

        wallHoleCanvas.putData(imageData, 0, 0)
        wallHoleCanvas.context.globalCompositeOperation="destination-out";
        wallHoleCanvas.context.drawImage(wallMask, 0, wallHoleCanvas.height - wallMask.height)
        wallHoleCanvas.refresh()
    }

    private getWallHoleKey() {
        return `${this.tileItemInfo.id}_hole`;
    }

    private getSpriteWithImage() {
        const sprites = this.tileItemRender.getSprites().filter(sprite => sprite.image != undefined);
        return sprites[0];
    }
}