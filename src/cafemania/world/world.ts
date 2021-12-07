import { v4 as uuidv4 } from 'uuid';

import { BaseObject } from '../baseObject/baseObject';
import { Game } from "../game/game";
import { IPlayerSerializedData, Player, PlayerType } from '../player/player';
import { PlayerClient } from '../player/playerClient';
import { PlayerWaiter } from '../player/playerWaiter';
import { ITileSerializedData } from '../tile/tile';
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
    private _players = new Phaser.Structs.Map<string, Player>([]);
    private _playerCheff: Player;
    private _sidewalkSize: number = 0;

    public canSpawnPlayer: boolean = true;
    public maxSpawnPlayers: number = 1;
    public spawnPlayerInterval: number = 500;
    private _lastSpawnedPlayer: number = 0;
    private _spawnedPlayersAmount: number = 0;

    constructor(game: Game) {
        super();
        this._game = game;
        this._tileMap = new TileMap(this);

        this.init();
    }

    public init() {
        this.log("init");

        this.events.on(WorldEvent.PLAYER_CLIENT_DESTROYED, () => {
            if(this.canSpawnPlayer) this._spawnedPlayersAmount--;
        })

        window['world'] = this;
    }

    public initBaseWorld() {
        const size = new Phaser.Math.Vector2(14, 14);
        const tileMap = this.tileMap;

        this.generateFloors('floor1', 0, 0, size.x, size.y);
        this.generateFloors('test_floor1', 0, size.x, 6, 6);
        this.generateWalls(10);
        this.generateSideWalks(20);

        


        const counter1 = this.addTileItemToTile('counter1', 0, 0);
        const counter2 = this.addTileItemToTile('counter1', 1, 0);
        const tileItem2 = this.addTileItemToTile('floorDecoration2', 3, 1);

        const window1 = this.addTileItemToTile('window1', 0, 0);
       
        const stove1 = this.addTileItemToTile('stove1', 0, 3);
        const stove2 = this.addTileItemToTile('stove1', 0, 4) as TileItemStove;
        stove2.tmpCookDish = "dish2";
        //this.addTileItemToTile("stove1", 0, 2)

        for (let y = 4; y < 14; y++) {
            for (let x = 4; x < 14; x++)  {
                
                if(y % 3 == 1) {
                    const chair = this.addTileItemToTile('chair1', x, y);
                    chair.setDirection(Direction.SOUTH);
                }

                if(y % 3 == 2) {
                    const chair = this.addTileItemToTile('table1', x, y);
                }
            }
        }

        /*
        window1.startRandomlyRotate(500);
        tileItem2.startRandomlyRotate(500);
        chair1.startRandomlyRotate(500);
        */
       
        window['window1'] = window1;


        
        const player = this._playerCheff = this.spawnPlayer();
        player.setAtTileCoord(0, 7);

        
        /*

        player.taskWalkToTile(this.tileMap.getTile(4, 4));
        player.taskPlayAnimation('test', 2000);
        player.taskWalkToTile(this.tileMap.getTile(7, 4));
        player.taskPlayAnimation('test', 500);
        player.taskWalkToTile(this.tileMap.getTile(12, 4));
        */

        window['player']= player;
        
        /*
        for (const task of player.taskManager.tasks) {
            task.forceComplete();
        }
        */


        

        this.spawnPlayerWaiter(2, 5);
        this.spawnPlayerWaiter(2, 6);
        

        //player.pathFindToCoord(5, 2);



        //causes lag
        
        this.addDoor(0, 2)
        this.addDoor(2, 0)
        
        this.setFloorAndWallsCollision(true)
      
        //this.spawnPlayerClient();
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

    public removePlayer(player: Player) {
        this._players.delete(player.id);
        player.destroy();
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

    public addTileItemToTile(tileItemId: string, tileX: number, tileY: number) {
        const tile = this.tileMap.getTile(tileX, tileY);
        const tileItem = this.game.tileItemFactory.createTileItem(tileItemId);
        const result = this.tileMap.tryPlaceItemAtTile(tileItem, tile);
        return tileItem;
    }

    public moveTileItemToTile(tileItem: TileItem, tileX: number, tileY: number) {
        const tile = this.tileMap.getTile(tileX, tileY);
        return this.tileMap.tryPlaceItemAtTile(tileItem, tile);
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

    public setFloorAndWallsCollision(enabled: boolean) {

        let tileItems = this.getAllTileItemsOfType(TileItemType.WALL);
        tileItems = tileItems.concat(this.getAllTileItemsOfType(TileItemType.FLOOR));

        tileItems.map(tileItem => {
            tileItem.setCollisionEnabled(enabled);
            
        })
    }
}