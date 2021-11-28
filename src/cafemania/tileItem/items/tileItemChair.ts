import { Tile } from "../../tile/tile"
import { TileItem } from "../tileItem"
import { TileItemType } from "../tileItemInfo";
import { TileItemTable } from "./tileItemTable";

export class TileItemChair extends TileItem {
    public onCreateTileItemRender() {
        super.onCreateTileItemRender();
        this.setCollisionEnabled(true);
    }
    
    public render() {
        super.render();
    }

    public getTableInFront() {
        const offset = Tile.getOffsetFromDirection(this.direction);
        const tile = this.tile.getTileInOffset(offset.x, offset.y)

        if(!tile) return
        
        const tables = tile.getTileItemsOfType(TileItemType.TABLE)

        if(tables.length == 0) return

        return tables[0] as TileItemTable
    }
}