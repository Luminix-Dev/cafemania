import { BaseObject } from "../baseObject/baseObject";
import { Gameface } from "../gameface/gameface";
import { Grid } from "../grid/grid";
import { Tile } from "../tile/tile";
import { TileItem } from "../tileItem/tileItem";
import { TileItemType } from "../tileItem/tileItemInfo";
import { TileItemRender } from "../tileItem/tileItemRender";
import { Direction } from "../utils/direction";
import { World } from "./world";

export class TileMap extends BaseObject {
    public get tiles() { return this._tiles.values(); }
    public get grid() { return this._grid; }
    public get world() { return this._world; }

    private _tiles = new Phaser.Structs.Map<string, Tile>([]);
    private _grid: Grid;
    private _world: World;
    
    constructor(world: World) {
        super();
        this._grid = new Grid();
        this._world = world;
    }

    public tileExists(x: number, y: number) {
        return this._tiles.has(`${x}:${y}`)
    }

    public addTile(x: number, y: number) {
        const position = Tile.getTilePosition(x, y);

        const tile = new Tile(this, x, y);
        this._tiles.set(tile.id, tile);
        this._grid.addCell(x, y);

        tile.setPosition(position.x, position.y);

        return tile;
    }

    public getTile(x: number, y: number) {
        return this._tiles.get(`${x}:${y}`)
    }

    public putTileItemVisualsAtTile(tileItem: TileItem, tile: Tile) {
        if(tileItem.isAtAnyTile) tileItem.tile.removeTileItem(tileItem);

        tile.addTileItem(tileItem);
    }

    public forcePlaceTileItem(tileItem: TileItem, tile: Tile) {
        this.putTileItemVisualsAtTile(tileItem, tile);

        const tileItemInfo = tileItem.tileItemInfo;

        const gridItem = this.grid.addItem(tileItem.id, tile.x, tile.y, tileItemInfo.size)
        gridItem.name = tileItemInfo.name;

        
        const type = tileItemInfo.type
        if(type == TileItemType.FLOOR) gridItem.color = 0
        if(type == TileItemType.WALL) gridItem.color = 0xcccccc
        
        
    }

    public removeTileItemFromItsTile(tileItem: TileItem) {
        tileItem.tile.removeTileItem(tileItem);

        this.grid.removeItem(tileItem.id);
    }

    public tryPlaceItemAtTile(tileItem: TileItem, tile: Tile) {
        const canBePlaced = this.canTileItemBePlacedAtTile(tileItem, tile)

        if(!canBePlaced) {
            console.log("cannot");
            return false;
        }

        this.forcePlaceTileItem(tileItem, tile);

        return true;
    }

    public canTileItemBePlacedAtTile(tileItem: TileItem, tile: Tile, direction?: Direction)
    {
        //console.log(`canTileItemBePlacedAtTile :`, tileItem.getInfo().name)

        if(direction === undefined) direction = tileItem.direction

        const grid = this.grid;
        const cell = grid.getCell(tile.x, tile.y)
        const size = tileItem.tileItemInfo.size;

        const o = TileItemRender.valuesFromDirection(direction)
        

        var result = grid.canItemBePlaced(cell, size, o[0], o[1], (compareCell, compareItem) =>
        {

            if(!compareItem)
                return true

            if(compareItem.id == tileItem.id)
                return true

                

            const compareTileItem = this.getTile(compareItem.getOriginCell().x, compareItem.getOriginCell().y).getTileItem(compareItem.id)!

            //console.log(`compare ${compareTileItem.getInfo().name}`)


            if(tileItem.tileItemInfo.type == TileItemType.WALL)
                return false

            if(compareTileItem.tileItemInfo.type == tileItem.tileItemInfo.type)
                return false
                
            if(compareTileItem.tileItemInfo.placeType == tileItem.tileItemInfo.placeType && compareTileItem.tileItemInfo.type != TileItemType.FLOOR && tileItem.tileItemInfo.type != TileItemType.FLOOR)
                return false
                
            return true
        })

        //console.log("the result was ", result)

        return result;
    }
    
    public canTileItemRotateTo(tileItem: TileItem, direction: Direction) {
        return this.canTileItemBePlacedAtTile(tileItem, tileItem.tile, direction);
    }
    
    
}