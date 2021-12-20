
import { PlayerType } from "../player/playerType";
import { Tile } from "../tile/tile";
import { World } from "../world/world";

interface IShopPlayerStoredData {
    id: string
    type: PlayerType
    tile: Tile
    waitingForWaiter: boolean
}


export class Shop {
    private _world: World;
    private _storedPlayers: IShopPlayerStoredData[] = [];

    constructor(world: World) {
        this._world = world;
    }

    public enterShopMode() {

    }

    public exitShopMode() {
    }
}


