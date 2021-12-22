import { BaseObject } from "../baseObject/baseObject";
import { GameScene } from "../scenes/gameScene";
import { TileItemDoor } from "../tileItem/items/tileItemDoor";
import { TileItemWall } from "../tileItem/items/tileItemWall";
import { ITileItemSerializedData, TileItem } from "../tileItem/tileItem";
import { TileItemPlaceType, TileItemType } from "../tileItem/tileItemInfo";
import { Direction } from "../utils/direction";
import { TileMap } from "../world/tileMap";

export interface ITileSerializedData {
    x: number
    y: number
    tileItems: ITileItemSerializedData[]
}

export class Tile extends BaseObject {
    public static SIZE = new Phaser.Math.Vector2(170, 85);
    
    public get id() { return `${this.x}:${this.y}`; }
    public get position() { return this._position; }
    public get tileItems() { return this._tileItems; }
    public get tileMap() { return this._tileMap; }
    public get hasDoor() { return this.getDoor() != undefined; }

    public readonly x: number;
    public readonly y: number;
    public isSidewalk: boolean = false;

    private _tileMap: TileMap;
    private _position = new Phaser.Math.Vector2();
    private _container: Phaser.GameObjects.Container;
    private _tileItems: TileItem[] = [];

    constructor(tileMap: TileMap, x: number, y: number) {
        super();
        this.x = x;
        this.y = y;
        this._tileMap = tileMap;
    }

    public setPosition(x: number, y: number) {
        this._position.set(x, y);
    }

    public addTileItem(tileItem: TileItem) {
        this._tileItems.push(tileItem);
        tileItem.setTile(this);
    }

    public removeTileItem(tileItem: TileItem) {
        this._tileItems.splice(this._tileItems.indexOf(tileItem), 1);
        tileItem.destroy();
        tileItem.setTile(undefined);
    }

    public update(dt: number) {
        this._tileItems.map(tileItem => {
            tileItem.update(dt);
        })
    }

    public destroy() {
        this._tileItems.map(tileItem => tileItem.destroy());
    }

    public render(dt: number) {
        this.renderSprite();

        this._tileItems.map(tileItem => {
            tileItem.setPosition(this.position.x, this.position.y);
            tileItem.render(dt);
        })
    }

    private renderSprite() {
        const scene = GameScene.Instance;

        if(!this._container) {
            const container = this._container = scene.add.container();
            //const sprite = scene.add.image(0, 0, 'tile2');
            //sprite.setTint(Math.random()*10000000)

            //container.add(sprite);
        }

        this._container.setPosition(this._position.x, this._position.y);
    }

    public getTileItem(id: string): TileItem | undefined {
        const ts = this._tileItems.filter(tileItem => tileItem.id == id);
        if(ts.length > 0) return ts[0];
        return
    }

    public getTileInOffset(x: number, y: number): Tile | undefined {
        const tileMap = this.tileMap;
        const findX = this.x + x
        const findY = this.y + y

        if(!tileMap.tileExists(findX, findY)) return

        return tileMap.getTile(findX, findY)
    }

    public getTileItemsOfType(type: TileItemType) {
        return this.tileItems.filter(tileItem => tileItem.tileItemInfo.type == type);
    }

    public getIsWalkable() {
        const tileItems = this.getTileItemsThatOcuppesThisTile()
    
        try {
            for (const tileItem of tileItems)
        {
            if(tileItem.tileItemInfo.type == TileItemType.WALL)
            {
                const wall = tileItem as TileItemWall

                if(wall.getDoorInFront())
                {
                    return true
                }
            }

            if(
                tileItem.tileItemInfo.placeType == TileItemPlaceType.FLOOR
                && tileItem.tileItemInfo.type != TileItemType.FLOOR
                && tileItem.tileItemInfo.type != TileItemType.DOOR
            ) return false

            
        }
        
        } catch (error) {
            console.error(error);
            console.log(this);
        }

        
        return true
    }

    private getTileItemsThatOcuppesThisTile() {
        const cell = this.tileMap.grid.getCell(this.x, this.y);
        const items = cell.ocuppiedByItems;

        return items.map(item => {
            const cell = item.getOriginCell()
            const tile = this.tileMap.getTile(cell.x, cell.y)

            return tile.getTileItem(item.id)!
        })
    }

    public getDoor() {
        const doors = this.getTileItemsOfType(TileItemType.DOOR);
        return doors[0] as TileItemDoor;
    }

    public getAdjacentTiles() {
        const directions = [Direction.NORTH, Direction.SOUTH, Direction.EAST, Direction.WEST]
        const tiles: Tile[] = []

        for (const direction of directions) {
            const offset = Tile.getOffsetFromDirection(direction)
            const tile = this.getTileInOffset(offset.x, offset.y)

            if(tile) tiles.push(tile)
        }

        return tiles
    }

    public serialize() {
        const data: ITileSerializedData = {
            x: this.x,
            y: this.y,
            tileItems: this.tileItems.map(tileItem => tileItem.serialize())
        }
        return data;
    }
    
    //

    public static getTilePosition(x: number, y: number) {
        const sx = (Tile.SIZE.x / 2) - 1
        const sy = (Tile.SIZE.y / 2) - 0.5

        return new Phaser.Math.Vector2(
            (x * sx) - (y * sx),
            (y * sy) + (x * sy)
        )
    }

    public static getTileGridBounds(sizex: number, sizey: number)
    {
        const rect = new Phaser.Geom.Rectangle()

        const tileAtTop = Tile.getTilePosition(0, 0)
        const tileAtLeft = Tile.getTilePosition(0, (sizey-1))
        const tileAtRight = Tile.getTilePosition((sizex-1), 0)
        const tileAtBottom = Tile.getTilePosition((sizex-1), (sizey-1))

        rect.top = tileAtTop.y

        rect.left = tileAtLeft.x
        rect.right = tileAtRight.x + (Tile.SIZE.x - 1)

        rect.bottom = tileAtBottom.y + (Tile.SIZE.y - 1)

        return rect
    }

    public static getOffsetFromDirection(direction: Direction)
    {
        interface IOption
        {
            x: number
            y: number
        }

        const options = new Map<Direction, IOption>()

        options.set(Direction.NORTH, {x: 0, y: -1})
        options.set(Direction.SOUTH, {x: 0, y: 1})
        options.set(Direction.EAST, {x: 1, y: 0})
        options.set(Direction.WEST, {x: -1, y: 0})

        options.set(Direction.SOUTH_EAST, {x: 1, y: 1})
        options.set(Direction.NORTH_WEST, {x: -1, y: -1})
        options.set(Direction.NORTH_EAST, {x: 1, y: -1})
        options.set(Direction.SOUTH_WEST, {x: -1, y: 1})

        return options.get(direction)!
    }

    public static getDirectionFromOffset(x: number, y: number)
    {
        const options = new Map<string, Direction>()

        options.set(`0:-1`, Direction.NORTH)
        options.set(`0:1`, Direction.SOUTH)
        options.set(`1:0`, Direction.EAST)
        options.set(`-1:0`, Direction.WEST)

        options.set(`1:1`, Direction.SOUTH_EAST)
        options.set(`-1:-1`, Direction.NORTH_WEST)
        options.set(`1:-1`, Direction.NORTH_EAST)
        options.set(`-1:1`, Direction.SOUTH_WEST)

        const find = `${x}:${y}`

        if(!options.has(find)) throw "Invalid offset"

        return options.get(find)!
    }

    public static getClosestTile(position: Phaser.Math.Vector2, tiles: Tile[])
    {
        let closestTile = tiles[0]

        for (const tile of tiles)
        {
            if(tile == closestTile) continue

            const tileDistance = Phaser.Math.Distance.BetweenPoints(position, tile.position)
            const closestTileDistance = Phaser.Math.Distance.BetweenPoints(position, closestTile.position)

            if(tileDistance < closestTileDistance)
            {
                closestTile = tile
            }
        }
        
        return closestTile
    }
}