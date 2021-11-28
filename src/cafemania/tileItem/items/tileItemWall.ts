import { Tile } from "../../tile/tile"
import { TileItem } from "../tileItem"
import { TileItemDoor } from "./tileItemDoor"

export class TileItemWall extends TileItem {
    public getDoorInFront(): TileItemDoor | undefined {
        const offset = Tile.getOffsetFromDirection(this.direction)

        const tile = this.tile.getTileInOffset(offset.x, offset.y)

        if(!tile) return
        if(!tile.hasDoor) return

        return tile.getDoor()
    }
}