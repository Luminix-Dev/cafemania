
/*
interface IShopPlayerStoredData {
    id: string
    type: PlayerType
    tile: Tile
    waitingForWaiter: boolean
}

interface IShopStoredData {
    players: IShopPlayerStoredData[]
}

export class ShopSync {
    private static _storedData = new Map<World, IShopStoredData>();

    //private _playersStoredData: IShopPlayerStoredData[] = [];

    public static storeData(world: World) {
        const data: IShopStoredData = {
            players: []
        }

        world.players.forEach(player => {

            
            let playerData: IShopPlayerStoredData = {
                id: player.id,
                type: player.type,
                tile: player.atTile,
                waitingForWaiter: false
            }

            if(player instanceof PlayerClient) {

                if(!player.getChairPlayerIsSitting()) return;

                playerData.waitingForWaiter = (player as PlayerClient).waitingForWaiter
            }

            data.players.push(playerData);
        })

        this._storedData.set(world, data);
    }

    public static restoreData(world: World) {
        
    }
}

/*
this._playersStoredData = [];

     
        
    

        world.players.forEach(player => {

            world.removePlayer(player);
        })

        if (Debug.consoleLog) console.log(this._playersStoredData)
*/
