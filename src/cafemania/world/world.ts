import { v4 as uuidv4 } from 'uuid';

import { BaseObject } from '../baseObject/baseObject';
import { Game } from "../game/game";
import { IPlayerSerializedData, Player } from '../player/player';
import { PlayerCheff } from '../player/playerCheff';
import { PlayerClient } from '../player/playerClient';
import { PlayerType } from '../player/playerType';
import { PlayerWaiter } from '../player/playerWaiter';
import { MoveTileItem } from '../shop/moveTileItem';
import { Shop } from '../shop/shop';
import { ITileSerializedData, Tile } from '../tile/tile';
import { TileItemChair } from '../tileItem/items/tileItemChair';
import { TileItemCounter } from '../tileItem/items/tileItemCounter';
import { TileItemDoor } from '../tileItem/items/tileItemDoor';
import { TileItemStove } from '../tileItem/items/tileItemStove';
import { TileItemTable } from '../tileItem/items/tileItemTable';
import { TileItem } from '../tileItem/tileItem';
import { TileItemRotationType, TileItemType } from '../tileItem/tileItemInfo';
import { Direction } from '../utils/direction';
import { TileMap } from './tileMap';
import { WorldEvent } from './worldEvents';



export interface IWorldSerializedData {
    tiles: ITileSerializedData[]
    sidewalkSize?: number
    players: IPlayerSerializedData[]
}

export enum SyncType {
    DONT_SYNC,
    SYNC,
    HOST
}

export class World extends BaseObject {
    public events = new Phaser.Events.EventEmitter();
    public id: string = uuidv4();
    public get tileMap() { return this._tileMap; }
    public get game() { return this._game; }
    public get players() { return this._players.values(); }

    public sync: SyncType = SyncType.DONT_SYNC;

    private _game: Game;
    private _tileMap: TileMap;
    private _shop: Shop;
    private _players = new Phaser.Structs.Map<string, Player>([]);
    private _playerCheff: PlayerCheff;
    private _sidewalkSize: number = 0;

    public canSpawnPlayer: boolean = true;
    public maxSpawnPlayers: number = 12;
    public spawnPlayerInterval: number = 500;
    private _lastSpawnedPlayer: number = 0;
    private _spawnedPlayersAmount: number = 0;

    constructor(game: Game) {
        super();
        this._game = game;
        this._tileMap = new TileMap(this);
        this._shop = new Shop(this);

        this.init();
    }

    public init() {
        this.log("init");

        this.events.on(WorldEvent.PLAYER_CLIENT_DESTROYED, () => {
            if(this.canSpawnPlayer) this._spawnedPlayersAmount--;
        })

        //PAREI AQUI?

        this.events.on(WorldEvent.TILE_ITEM_POINTER_DOWN, (tileItem: TileItem) => {
           
        })

        this.events.on(WorldEvent.TILE_ITEM_POINTER_UP, (tileItem: TileItem) => {
        })

        this.events.on(WorldEvent.TILE_ITEM_POINTER_OVER, (tileItem: TileItem) => {

        })

        
        this.events.on(WorldEvent.TILE_ITEM_POINTER_OUT, (tileItem: TileItem) => {

        })


        window['world'] = this;
    }

    private generateTest1() {
        const size = new Phaser.Math.Vector2(14, 14);
        const tileMap = this.tileMap;

        this.generateFloors('floor1', 0, 0, size.x, size.y);
        this.generateSideWalks(20);

        const counter1 = this.addTileItemToTile('counter1', 0, 0);
    }

    public generateBaseWorld() {
        //this.generateTest1();

        const size = new Phaser.Math.Vector2(14, 14);
        const tileMap = this.tileMap;

        this.generateFloors('floor1', 0, 0, size.x, size.y);
        this.generateSideWalks(20);
        this.generateFloors('test_floor1', 0, size.x, 6, 6);
        this.generateWalls(10);

 
        const counter1 = this.addTileItemToTile('counter1', 0, 0);
        const counter2 = this.addTileItemToTile('counter1', 1, 0);
        const tileItem2 = this.addTileItemToTile('floorDecoration2', 3, 1);

        const window1 = this.addTileItemToTile('window1', 0, 0);
       
        const stove1 = this.addTileItemToTile('stove1', 0, 3);
        const stove2 = this.addTileItemToTile('stove1', 0, 4) as TileItemStove;
        stove2.tmpCookDish = "dish2";

        const stove3 = this.addTileItemToTile('stove1', 0, 5);
        const stove4 = this.addTileItemToTile('stove1', 0, 6) as TileItemStove;
        stove4.tmpCookDish = "dish2";

        //this.addTileItemToTile("stove1", 0, 2)

        for (let y = 4; y < 7; y++) {
            for (let x = 4; x < 7; x++)  {
                
                if(y % 3 == 1) {
                    const chair = this.addTileItemToTile('chair1', x, y);
                    chair.setDirection(Direction.SOUTH);
                }

                if(y % 3 == 2) {
                    const chair = this.addTileItemToTile('table1', x, y);
                }
            }
        }
        window['window1'] = window1;


        /*
        window1.startRandomlyRotate(500);
        tileItem2.startRandomlyRotate(500);
        chair1.startRandomlyRotate(500);
        */
       
        


        
        const cheff = this.setPlayerCheff(this.spawnPlayerCheff());
        
        cheff.setAtTileCoord(0, 7);

    
        /*
        player.taskWalkToTile(this.tileMap.getTile(4, 4));
        player.taskPlayAnimation('Eat', 2000);
        player.taskWalkToTile(this.tileMap.getTile(7, 4));
        player.taskPlayAnimation('Eat', 500);
        player.taskWalkToTile(this.tileMap.getTile(12, 4));
        */

        window['cheff'] = cheff;
        
        /*
        for (const task of player.taskManager.tasks) {
            task.forceComplete();
        }
        */


        

        this.spawnPlayerWaiter(2, 7);
        this.spawnPlayerWaiter(2, 8);
        //this.spawnPlayerWaiter(2, 9);
        

        //player.pathFindToCoord(5, 2);



        //causes lag
        
        this.addDoor(0, 2)
        this.addDoor(2, 0)
        
        //this.toggleFloorCollision(true)
      
        //this.spawnPlayerClient();
    }

    public toggleFloorCollision(enabled: boolean) {
        
        let tileItems = this.getAllTileItemsOfType(TileItemType.FLOOR);

        tileItems.map(tileItem => {
            tileItem.setCollisionEnabled(enabled);
        })
    }

    public toggleWallCollision(enabled: boolean) {
        
        let tileItems = this.getAllTileItemsOfType(TileItemType.WALL);

        tileItems.map(tileItem => {
            tileItem.setCollisionEnabled(enabled);
        })
    }

    public toggleAllItemsCollision(enabled: boolean) {
        let tileItems = this.getAllTileItems();

        for (const tileItem of tileItems) {
            tileItem.setCollisionEnabled(enabled);
        }
    }

    public restoreAllItemsCollision() {
        let tileItems = this.getAllTileItems();

        for (const tileItem of tileItems) {
            tileItem.setCollisionEnabled(tileItem.defaultCollisionValue);
        }
    }

    public toggleShopTileItemsCollision(enabled: boolean) {
        let tileItems = this.getAllTileItems();

        for (const tileItem of tileItems) {
            if(tileItem.tileItemInfo.type == TileItemType.FLOOR) continue;
            if(tileItem.tileItemInfo.type == TileItemType.WALL) continue;

            tileItem.setCollisionEnabled(enabled);
        }
    }

    public addDoor(x: number, y: number) {
        const doorTile = this.tileMap.getTile(x, y);
        const door = this.addTileItemToTile('door1', doorTile.x, doorTile.y);

        if(x == 0) door.setDirection(Direction.EAST);
        else door.setDirection(Direction.SOUTH);

        window['door'] = door;
    }

    public update(dt: number) {
        this.tileMap.tiles.map(tile => tile.update(dt));
        this.players.map(player => player.update(dt));

        if(this.canSpawnPlayer) this.updateSpawnPlayerClient();
    }

    private updateSpawnPlayerClient() {
        const now = new Date().getTime();

        if(now - this._lastSpawnedPlayer >= this.spawnPlayerInterval && this._spawnedPlayersAmount < this.maxSpawnPlayers) {
            this._lastSpawnedPlayer = now;

            this.spawnPlayerClient();
        }
    }

    public render(dt: number) {
        this.tileMap.tiles.map(tile => tile.render(dt));
        this.players.map(player => player.render(dt))
    }

    public getSerializedData() {
        const data: IWorldSerializedData = {
            tiles: this.tileMap.tiles.filter(tile => !tile.isSidewalk).map(tile => tile.serialize()),
            sidewalkSize: this._sidewalkSize,
            players: this.players.map(player => player.serialize())
        }
        return data;
    }

    public spawnPlayer() {
        const player = new Player(this);
        return this.addPlayer(player);
    }

    public spawnPlayerCheff() {
        const player = new PlayerCheff(this);
        return this.addPlayer(player) as PlayerCheff;
    }

    public setPlayerCheff(player: PlayerCheff) {
        this._playerCheff = player
        return player;
    }

    public removePlayer(player: Player) {
        this._players.delete(player.id);
        player.destroy();
    }

    public removeTileItem(tileItem: TileItem) {
        if(this.game.tileItemFactory.hasTileItemCreated(tileItem.id)) {
            this.game.tileItemFactory.removeTileItem(tileItem.id);
            tileItem.destroy();
        }
    }

    public destroy() {
        this.destroyRender();
        this.removeAllTileItems();
    }

    public removeAllTileItems() {
        this.getAllTileItems().map(tileItem => this.removeTileItem(tileItem))
    }
    

    public destroyRender() {
        this.tileMap.tiles.map(tile => tile.destroy());
        this.players.map(player => player.destroy());
    }

    public spawnPlayerClient() {
        this._spawnedPlayersAmount++;

        const player = new PlayerClient(this);
        this.addPlayer(player);

        const left = this.getLeftSideWalkSpawn();
        const right = this.getRightSideWalkSpawn();
        const spawnAtLeft = Math.random() > 0.5;
        const spawnTile = spawnAtLeft ? left : right;
        const exitTile = spawnAtLeft ? right: left;

        player.setAtTileCoord(spawnTile.x, spawnTile.y);
        player.setExitTile(exitTile);
        //player.startClientBehaviour();
        return player;
    }

    public spawnPlayerWaiter(x: number, y: number) {
        const player = new PlayerWaiter(this);
        this.addPlayer(player);
        player.setAtTileCoord(x, y);
        return player;
    }

    public addPlayer(player: Player) {
        this._players.set(player.id, player);
        player.setAtTileCoord(0, 0);
        return player;
    }

    public hasPlayer(id: string) {
        return this._players.has(id);
    }

    public getPlayer(id: string) {
        return this._players.get(id)!;
    }

    public getPlayers() {
        return this._players.values()
    }

    public getPlayerClients() {
        return this.getPlayers().filter(player => player.type == PlayerType.CLIENT) as PlayerClient[]
    }

    public getPlayerWaiters() {
        return this.getPlayers().filter(player => player.type == PlayerType.WAITER) as PlayerWaiter[]
    }

    public getPlayerCheff() {
        return this._playerCheff;
    }

    public generateFloors(floorId: string, x: number, y: number, sizeX: number, sizeY: number) {
        for (let iy = 0; iy < sizeY; iy++) {
            for (let ix = 0; ix < sizeX; ix++) {

                const pos = {x: x + ix, y: y + iy}

                if(!this.tileMap.tileExists(pos.x, pos.y)) {
                    this.tileMap.addTile(pos.x, pos.y);
                }

                const tile = this.tileMap.getTile(pos.x, pos.y);

                if(tile.tileItems.length == 0) {
                    this.addTileItemToTile(floorId, pos.x, pos.y);
                }

                
            }
        }
    }

    public generateWalls(amount: number) {
        const generate = (x: number, y: number, flip?: boolean) => {
            if(!this.tileMap.tileExists(x, y)) {
                this.tileMap.addTile(x, y);
            }

            //if(x == -1 && y == 1) return;

            const tile = this.tileMap.getTile(x, y);


            if(tile.tileItems.length == 0) {
                
                const wall = this.addTileItemToTile('wall1', x, y);

                if(flip) wall.setDirection(Direction.EAST);
            }
        }

        for (let i = 0; i < amount; i++) {
            generate(-1, i, true);
            generate(i, -1);
        }
    }

    public generateSideWalks(size: number) {
        this._sidewalkSize = size;

        for (let y = -2; y < size; y++)
        {
            for (let x = -2; x < size; x++)
            {
                if((x == -2 || y == -2))
                {
                    if(this.tileMap.tileExists(x, y)) continue

                    const tile = this.tileMap.addTile(x, y);
                    tile.isSidewalk = true;

                    if(tile.tileItems.length == 0) {
                        this.addTileItemToTile('test_floor1', x, y);
                    }
                }
            }
        }
    }



    //works
    public tryMoveTileItem(tileItem: TileItem, toTile: Tile) {
        const canBePlaced = this.tileMap.canTileItemBePlacedAtTile(tileItem, toTile);

        if(canBePlaced) this.forceMoveTileItem(tileItem, toTile);

        return canBePlaced;
    }


    //works
    public forceMoveTileItem(tileItem: TileItem, toTile: Tile) {

        if(tileItem.isAtAnyTile) {
            tileItem.tile.removeTileItem(tileItem);
            tileItem.destroyVisuals();
        }

        toTile.addTileItem(tileItem);

        this.tileMap.grid.removeItem(tileItem.id);
        this.putGridItem(tileItem, toTile);
    }

    //works, same as try
    public addTileItemToTile(tileItemId: string, tileX: number, tileY: number) {
        const tile = this.tileMap.getTile(tileX, tileY);
        const tileItem = this.game.tileItemFactory.createTileItem(tileItemId);

        const canBePlaced = this.tileMap.canTileItemBePlacedAtTile(tileItem, tile);

        if(canBePlaced) this.forceAddTileItemToTile(tileItem, tile);
        
        return tileItem;
    }

    public forceAddTileItemToTile(tileItem: TileItem, tile: Tile) {
       
        tile.addTileItem(tileItem);

        this.putGridItem(tileItem, tile);
        
        return tileItem;
    }

    public putGridItem(tileItem: TileItem, tile: Tile) {
        const tileItemInfo = tileItem.tileItemInfo;

        const gridItem = this.tileMap.grid.addItem(tileItem.id, tile.x, tile.y, tileItemInfo.size)
        gridItem.name = tileItemInfo.name;

        const type = tileItemInfo.type
        if(type == TileItemType.FLOOR) gridItem.color = 0
        if(type == TileItemType.WALL) gridItem.color = 0xcccccc
    }

    public getLeftSideWalkSpawn() { return this.tileMap.getTile(-2, this._sidewalkSize - 1) }

    public getRightSideWalkSpawn() { return this.tileMap.getTile(this._sidewalkSize - 1, -2) }

    public getAllTileItemsOfType(type: TileItemType) {
        const tileItems: TileItem[] = []
        this.tileMap.tiles.map(tile =>
        {
            tile.getTileItemsOfType(type).map(tileItem => tileItems.push(tileItem) )
        })
        return tileItems
    }

    public getAllTileItems() {
        const tileItems: TileItem[] = []

        this.tileMap.tiles.map(tile =>
        {
            tile.tileItems.map(tileItem => tileItems.push(tileItem));
        })
        return tileItems
    }

    public getDoors(): TileItemDoor[]
    {
        return this.getAllTileItemsOfType(TileItemType.DOOR) as TileItemDoor[]
    }

    public getStoves(): TileItemStove[]
    {
        return this.getAllTileItemsOfType(TileItemType.STOVE) as TileItemStove[]
    }

    public getCounters(empty?: boolean): TileItemCounter[]
    {
        let counters = this.getAllTileItemsOfType(TileItemType.COUNTER) as TileItemCounter[]

        if(empty) counters = counters.filter(counter => counter.isEmpty)

        return counters
    }

    public getTables() {
        let tables = this.getAllTileItemsOfType(TileItemType.TABLE) as TileItemTable[]
        return tables
    }

    
    public getChairs(empty?: boolean) {
        let chairs = this.getAllTileItemsOfType(TileItemType.CHAIR) as TileItemChair[]

        if(empty)
        {
            chairs = chairs.filter(chair =>
            {
                if(!chair.isEmpty) return false
                if(chair.isReserved) return false
                return true
            })
        }

        return chairs
        
    }

}