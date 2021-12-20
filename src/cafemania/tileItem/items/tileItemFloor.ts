import { GameScene } from "../../scenes/gameScene";
import { TileItem } from "../tileItem"

export class TileItemFloor extends TileItem {

    constructor(til) {
        super(til);
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

        this.tile.tileMap.world.getPlayerCheff()?.taskWalkToTile(this.tile);
    }
}