import { v4 as uuidv4 } from 'uuid';

import { BaseObject } from '../baseObject/baseObject';
import { Game } from "../game/game";
import { Player } from '../player/player';
import { TileItem } from '../tileItem/tileItem';
import { TileItemRotationType, TileItemType } from '../tileItem/tileItemInfo';
import { Direction } from '../utils/direction';
import { TileMap } from './tileMap';

export class World extends BaseObject {
    public id: string = uuidv4();
    public get tileMap() { return this._tileMap; }
    public get game() { return this._game; }
    public get players() { return this._players.values(); }

    private _game: Game;
    private _tileMap: TileMap;
    private _players = new Phaser.Structs.Map<string, Player>([]);
    private _playerCheff: Player;

    constructor(game: Game) {
        super();
        this._game = game;
        this._tileMap = new TileMap(this);

        this.init();
    }

    public init() {
        this.log("init");

        const size = new Phaser.Math.Vector2(25, 25);
        const tileMap = this.tileMap;

        this.generateFloors('floor1', 0, 0, size.x, size.y);
        //this.generateFloors('test_floor1', 0, size.x, 6, 6);

        const tileItem1 = this.addTileItemToTile('floorDecoration2', 0, 0);
        const tileItem2 = this.addTileItemToTile('floorDecoration2', 3, 1);

        const window1 = this.addTileItemToTile('window1', 0, 0);
        const chair1 = this.addTileItemToTile('chair1', 3, 2);

        this.addTileItemToTile('stove1', 0, 3);

        window['window1'] = window1;
        window['chair1'] = chair1;

        window1.startRandomlyRotate(500);
        tileItem2.startRandomlyRotate(500);
        chair1.startRandomlyRotate(500);

        this.generateWalls(10);

        //const tileItemInfo = this.game.tileItemFactory.getTileItemInfo('floorDecoration2');
        //const tileItem = new TileItem(tileItemInfo);

        //tileMap.forcePlaceTileItem(tileItem, tileMap.tiles[20]);
        

        //tileMap.removeTileItemFromItsTile(tileItem);

        const player = this._playerCheff = this.spawnPlayer();

        player.setAtTileCoord(1, 1);
        
        window['player'] = player;

        player.walkToTile(3, 4);

        this.setFloorAndWallsCollision(true)
    }

    public update(dt: number) {
        const tileMap = this.tileMap;

        for (const tile of tileMap.tiles) {
            //tile.update();
        }

        this.players.map(player => player.update(dt))
    }

    public render(dt: number) {
        const tileMap = this.tileMap;

        for (const tile of tileMap.tiles) {
            tile.render();
        }

        this.players.map(player => player.render(dt))
    }

    public spawnPlayer() {
        const player = new Player(this);
        return this.addPlayer(player);
    }

    public addPlayer(player: Player) {
        this._players.set(player.id, player);
        return player;
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
        for (let y = -2; y < size; y++)
        {
            for (let x = -2; x < size; x++)
            {
                if((x == -2 || y == -2))
                {
                    if(this.tileMap.tileExists(x, y)) continue

                    const tile = this.tileMap.addTile(x, y);

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

    public getAllTileItemsOfType(type: TileItemType) {
        const tileItems: TileItem[] = []
        this.tileMap.tiles.map(tile =>
        {
            tile.getTileItemsOfType(type).map(tileItem => tileItems.push(tileItem) )
        })
        return tileItems
    }

    public setFloorAndWallsCollision(enabled: boolean) {

        let tileItems = this.getAllTileItemsOfType(TileItemType.WALL);
        tileItems = tileItems.concat(this.getAllTileItemsOfType(TileItemType.FLOOR));

        tileItems.map(tileItem => {
            tileItem.setCollisionEnabled(enabled);
            
        })
    }
 
}