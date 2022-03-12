import { Gameface } from "../../gameface/gameface";
import { GameScene } from "../../scenes/gameScene";
import { TileItem } from "../tileItem"
import { TileItemInfo } from "../tileItemInfo";

export class TileItemFloor extends TileItem {

    constructor(tileItemInfo: TileItemInfo) {
        super(tileItemInfo);
        this.defaultCollisionValue = true;
    }

    public render(dt: number) {
        super.render(dt);

        const scene = GameScene.Instance;



        /*
        const mouseWorldPos = Input.getMouseWorldPosition();

        const distance = Phaser.Math.Distance.BetweenPoints({
            x: this.tile.position.x,
            y: this.tile.position.y
        }, {
            x: mouseWorldPos.x,
            y: mouseWorldPos.y
        });

        let collisionEnabled = distance < 100;
        if(this.tileItemRender.hasCreatedCollision != collisionEnabled) {
            this.tileItemRender.setCollisionEnabled(collisionEnabled);
        }
        */
    }

    public onPointerUp() {
        super.onPointerUp();
        //this.tile.tileMap.world.getPlayerCheff()?.taskWalkToTile(this.tile);

        const tileItemInfo = this.world.game.tileItemFactory.getTileItemInfo("floorDecoration2");

        const shop = this.world.game.shop;

        /*
        const tileItem = shop.buyTileItem(tileItemInfo, this.tile)!;

        setTimeout(() => {
            
            shop.moveTileItem(tileItem, this.world.tileMap.getTile(1, 1));

            setTimeout(() => {
            
                shop.sellTileItem(tileItem);
    
            }, 1000);
            

        }, 1000);

        */
        //Gameface.Instance.network.sendBuyTileItem(tileItemInfo, this.tile);
    }
}