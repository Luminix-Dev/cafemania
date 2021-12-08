import { Tile } from "../cafemania/tile/tile";
import { TileItem } from "../cafemania/tileItem/tileItem";
import { TileItemType } from "../cafemania/tileItem/tileItemInfo";

export class MoveTileItem {
    public static get isMovingAnyTileItem() { return this._movingTileItem != undefined; }

    private static _hoveringTileItem?: TileItem;
    private static _movingTileItem?: TileItem;
    
    private static _dropAtTile?: Tile;

    public static setHoveringTileItem(tileItem: TileItem) {
        this._hoveringTileItem = tileItem;

        const movingTileItem = this._movingTileItem;
        if(!movingTileItem) return;

        if(tileItem.tileItemInfo.type == TileItemType.FLOOR) {
            const world = movingTileItem.world;

            const result = world.moveTileItemToTile(movingTileItem, this._hoveringTileItem.tile.x, this._hoveringTileItem.tile.y);

            if(result) {
                this._dropAtTile = this._hoveringTileItem.tile;
            }
        }
    }

    public static startMove(tileItem: TileItem) {
        if(tileItem.tileItemInfo.type == TileItemType.FLOOR || tileItem.tileItemInfo.type == TileItemType.WALL) return;

        this._movingTileItem = tileItem;
    }

    public static stopMoving() {
        this._movingTileItem = undefined;
    }
}