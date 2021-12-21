import { Dish } from "../../dish/dish";
import { DishPlate } from "../../dish/dishPlate";
import { Player } from "../../player/player";
import { Tile } from "../../tile/tile"
import { TileItem } from "../tileItem"
import { TileItemInfo, TileItemType } from "../tileItemInfo";
import { TileItemTable } from "./tileItemTable";

export class TileItemChair extends TileItem {
    public get isEmpty() { return this._playerSitting == undefined; }
    public get isReserved() { return this._isReserved; }

    private _playerSitting?: Player
    private _isReserved: boolean = false

    constructor(tileItemInfo: TileItemInfo) {
        super(tileItemInfo);
        this.defaultCollisionValue = true;
    }

    public render(dt: number) {
        super.render(dt);

        this.debugText.setTextLine('chair', `${this.isEmpty ? "empty" : "ocuppied"} | ${this.isReserved ? 'reserved' : 'not reserverd'}`);
    }
    
    public setPlayerSitting(player?: Player) {
        this._playerSitting = player
        this.setIsReserved(false)
    }

    public setIsReserved(value: boolean) {
        this._isReserved = value
    }

    public getPlayerSitting() {
        return this._playerSitting
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