import { Tile } from "../../tile/tile"
import { TileItem } from "../tileItem"

export class TileItemWallDecoration extends TileItem {
    public onCreateTileItemRender() {
        super.onCreateTileItemRender();
        this.setCollisionEnabled(true);
    }
}