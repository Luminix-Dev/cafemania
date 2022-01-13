
import { Game } from "../game/game";
import { PlayerType } from "../player/playerType";
import { Tile } from "../tile/tile";
import { World } from "../world/world";

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

    public enterShopMode() {

    }

    public exitShopMode() {
    }
}


