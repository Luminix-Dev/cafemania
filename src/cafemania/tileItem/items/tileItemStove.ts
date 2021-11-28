import { Camera } from "../../camera/camera";
import { Tile } from "../../tile/tile"
import { TileItem } from "../tileItem"
import { TileItemRender } from "../tileItemRender";

export class TileItemStove extends TileItem {
    
    public onCreateTileItemRender() {
        super.onCreateTileItemRender();
        this.setCollisionEnabled(true);
    }

    public render() {
        super.render();
    }

    public onLeftClick() {
        super.onLeftClick();
    }
}