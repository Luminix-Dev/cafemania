import { Tile } from "../../tile/tile"
import { TileItem } from "../tileItem"
import { TileItemInfo } from "../tileItemInfo";

export class tileItemFloorDecoration extends TileItem {
    constructor(tileItemInfo: TileItemInfo) {
        super(tileItemInfo);
        this.defaultCollisionValue = true;
    }
}