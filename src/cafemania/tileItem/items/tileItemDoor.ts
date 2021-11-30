import { GameScene } from "../../scenes/gameScene";
import { Tile } from "../../tile/tile"
import { TileItem } from "../tileItem"

export class TileItemDoor extends TileItem {
    public onCreateTileItemRender() {
        super.onCreateTileItemRender();
        this.setCollisionEnabled(true);
    }
}