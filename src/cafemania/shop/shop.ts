
import { Debug } from "../debug/debug";
import { Game } from "../game/game";
import { Gameface } from "../gameface/gameface";
import { Tile } from "../tile/tile";
import { TileItem } from "../tileItem/tileItem";
import { TileItemInfo } from "../tileItem/tileItemInfo";
import { TileItemDrag } from "../tileItemDrag/tileItemDrag";
import { WorldSyncType } from "../world/worldSyncType";

/*
interface IShopPlayerStoredData {
    id: string
    type: PlayerType
    tile: Tile
    waitingForWaiter: boolean
}
*/


export class Shop {
    private _game: Game;

    //private _storedPlayers: IShopPlayerStoredData[] = [];
    
    constructor(game: Game) {
        this._game = game;
    }

    public startMoveTileItem(tileItem: TileItem) {
        const startTile = tileItem.tile;
        const world = tileItem.world;

        TileItemDrag.startMove(tileItem);

        TileItemDrag.onStopMoving = () => {
            const targetTile = tileItem.tile;

            world.forceMoveTileItem(tileItem, startTile);

            Gameface.Instance.network.sendMoveTileItem(tileItem, targetTile);

            
        }
    }

    public buyTileItem(tileItemInfo: TileItemInfo, tile: Tile) {
        const world = tile.tileMap.world;

        if(world.sync == WorldSyncType.SYNC) {

            if (Debug.consoleLog) console.log("send to server")

            Gameface.Instance.network.sendBuyTileItem(tileItemInfo, tile);

            return;
        }

        const tileItem = world.game.tileItemFactory.createTileItem(tileItemInfo.id);

        const result = world.tryAddTileItemToTile(tileItem, tile);

        if(result) {

            this._game.gold -= 300;

            return tileItem;
        } else {
            return undefined;
        }
    }

    public sellTileItem(tileItem: TileItem) {
        //const tile = tileItem.tile;
        const world = tileItem.world;

        world.removeTileItem(tileItem);

       // tile.removeTileItem(tileItem);
        //world.removeTileItem(tileItem);

        if (Debug.consoleLog) console.log("sold")

        this._game.gold += 300;
    }

    public moveTileItem(tileItem: TileItem, toTile: Tile) {
        const world = tileItem.world;

        world.tryMoveTileItem(tileItem, toTile);

    }

    public enterShopMode() {

    }

    public exitShopMode() {
    }
}


