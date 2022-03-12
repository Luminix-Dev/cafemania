import { Debug } from "../debug/debug";
import { Input } from "../input/input";
import { Tile } from "../tile/tile";
import { TileItem } from "../tileItem/tileItem";
import { TileItemType } from "../tileItem/tileItemInfo";
import { World } from "../world/world";
import { WorldEvent } from "../world/worldEvent";
import { TileHoverDetection } from "./tileHoverDetection";

export class KMoveTileItem {
    public static get isMovingAnyTileItem() { return this._movingTileItem != undefined; }

    private static _movingTileItem?: TileItem;

    private static _selectedTileItem?: TileItem;

    private static _hoveringTileItem?: TileItem;

    private static _placeAtTile?: Tile;

    private static _world: World;

    private static _hoveringWallOrFloor?: TileItem;

    public static init() {
        Input.events.on("pointerup", () => {
            if(this.isMovingAnyTileItem) {
                this.stopMoving();
            }
        })

        Input.events.on("pointerdown", () => {
        })

        Input.events.on("pointermove", (ev) => {
            
            if(this.isMovingAnyTileItem) {

                const wallOrFloor = TileHoverDetection.testTileItem(Input.getMouseWorldPosition())


                if(wallOrFloor) {

                    if(this._hoveringWallOrFloor != wallOrFloor) {
                        this._hoveringWallOrFloor = wallOrFloor;

                        this.tryPlaceMovingTileItemAtTileItem(this._hoveringWallOrFloor);
                        console.log("try place here")
                    }
                }
                

                
                console.log("moveing")
            }
        })

        Input.events.on("begindrag", () => {
            


            if(this._selectedTileItem != undefined) {
                if(this._selectedTileItem == this._hoveringTileItem) {
                    console.log("begin drag tileitem");

                    if(!this.isMovingAnyTileItem) {
                        this.startMove(this._selectedTileItem);
                    }
                }

            }


        })
    }

    public static unselectCurrentTileItem() {
        if(this._selectedTileItem) {
            this._selectedTileItem.setIsSelected(false);
            this._selectedTileItem = undefined;
        }
    }

    public static selectTileItem(tileItem: TileItem) {
        if(tileItem == this._selectedTileItem) return;

        this.unselectCurrentTileItem();

        tileItem.setIsSelected(true);
        this._selectedTileItem = tileItem;
    }

    public static setWorld(world: World) {
        this._world = world;

        world.events.on(WorldEvent.TILE_ITEM_POINTER_DOWN, (tileItem: TileItem) => {
            
        })

        world.events.on(WorldEvent.TILE_ITEM_POINTER_UP, (tileItem: TileItem) => {
            Debug.log("tile_item_pointer_up")

            console.warn("isdragging", Input.isDragging)

            if(tileItem.tileItemInfo.type == TileItemType.FLOOR || tileItem.tileItemInfo.type == TileItemType.WALL || tileItem.tileItemInfo.type == TileItemType.STOVE) return;

            if(Input.isDragging) {
                Debug.log("Input.isDragging")
            }

            if(!Input.isDragging && !this.isMovingAnyTileItem) {
                console.log("try select tileitem");

                if(this._selectedTileItem == tileItem) {
                    this.unselectCurrentTileItem();
                    return;
                }
                
                this.selectTileItem(tileItem);
                

            }
        })


        
        world.events.on(WorldEvent.TILE_ITEM_POINTER_OVER, (tileItem: TileItem) => {
            this._hoveringTileItem = tileItem;

            /*
            if(this.isMovingAnyTileItem) {
                this.tryPlaceMovingTileItemAtTileItem();
            }
            */
        })

        world.events.on(WorldEvent.TILE_ITEM_POINTER_OUT, (tileItem: TileItem) => {
            this._hoveringTileItem = undefined;
        })
        
    }

    public static startMove(tileItem: TileItem) {
        if(tileItem.tileItemInfo.type == TileItemType.FLOOR || tileItem.tileItemInfo.type == TileItemType.WALL) return;

        this._movingTileItem = tileItem;

        tileItem.setIsMoving(true);
    }


    private static tryPlaceMovingTileItemAtTileItem(atTileItem: TileItem) {
        const movingTileItem = this._movingTileItem;

        if(!movingTileItem || !atTileItem) return false;

        if(atTileItem.tileItemInfo.type != TileItemType.FLOOR) return false;

        if(atTileItem.tile == movingTileItem.tile) return false;

        const world = movingTileItem.world;

        //const canBePlaced = world.tileMap.canTileItemBePlacedAtTile(movingTileItem, atTileItem.tile);

        const canBePlaced = world.tryMoveTileItem(movingTileItem, atTileItem.tile)
        
        if(canBePlaced) {
            this._placeAtTile = atTileItem.tile;
        }
        
        return canBePlaced;
    }

    public static stopMoving() {
        if(this._movingTileItem) {
            this._movingTileItem.setIsMoving(false);

            this._world.restoreAllItemsCollision();
        }
        this._movingTileItem = undefined;
    }
}