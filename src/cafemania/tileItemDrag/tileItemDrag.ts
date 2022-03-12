import { Debug } from "../debug/debug";
import { Gameface } from "../gameface/gameface";
import { GamefaceEvent } from "../gameface/gamefaceEvent";
import { Hud } from "../hud/hud";
import { HudLockZone } from "../hud/hudLockZone";
import { Input } from "../input/input";
import { GameScene } from "../scenes/gameScene";
import { TileHoverDetection } from "../shop/tileHoverDetection";
import { Tile } from "../tile/tile";
import { TileItem } from "../tileItem/tileItem";
import { TileItemInfo, TileItemType } from "../tileItem/tileItemInfo";
import { World } from "../world/world";
import { WorldEvent } from "../world/worldEvent";

export class TileItemDrag {
    public static get isMovingAnyTileItem() { return this._movingTileItem != undefined; }

    public static onStopMoving?: () => void;

    private static _world?: World;
    private static _selectedTileItem?: TileItem;
    private static _movingTileItem?: TileItem;
    private static _hoveringWallOrFloor?: TileItem;
    private static _placeAtTile?: Tile;
    
    private static _showMouseIcon = true;
    private static _mouseIcon?: Phaser.GameObjects.Graphics;

    private static _hoveringTileItem?: TileItem;

    public static init() {
        window['TileItemDrag'] = TileItemDrag;

        Gameface.Instance.events.on(GamefaceEvent.SET_WORLD, (world: World) => {
            this.setWorld(world);
        });

        Input.events.on("pointerup", () => {
            if(this.isMovingAnyTileItem) {
                this.stopMoving();
            }
        })

        Input.events.on("begindrag", () => {
            if(this._selectedTileItem != undefined) {
                if(this._selectedTileItem == this._hoveringTileItem) {
                    console.log("begin drag tileitem");

                    if(!this.isMovingAnyTileItem) {

                        const shop = this._selectedTileItem.world.game.shop;

                        shop.startMoveTileItem(this._selectedTileItem)

                    }
                }
            }
        })

        Input.events.on("pointermove", (ev) => {
            this.onPointerMove();
        });
    }

    private static setWorld(world?: World) {
        this._world = world;

        if(world) {
            window['test'] = this.startTestMove;
        }

        if(world) this.setupWorldEvents();
    }

    private static setupWorldEvents() {
        const world = this._world!;

        world.events.on(WorldEvent.TILE_ITEM_POINTER_UP, (tileItem: TileItem) => {
            Debug.log("tile_item_pointer_up");

            if(!Input.isDragging && !this.isMovingAnyTileItem) {

                if(tileItem.tileItemInfo.type == TileItemType.FLOOR || tileItem.tileItemInfo.type == TileItemType.WALL || tileItem.tileItemInfo.type == TileItemType.STOVE) return;

                this.trySelect(tileItem);
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

    public static startTestMove(tileItemInfo?: TileItemInfo) {
        const tileItem = this._world!.game.tileItemFactory.createTileItem(tileItemInfo ? tileItemInfo.id : "table1");

        this.startMove(tileItem);

        
    }

    private static onPointerMove() {
        this.processMouseIcon();

        this.processPlaceMovingTileItem();
    }

    private static processMouseIcon() {
        const mousePos = Input.mousePosition;

        //if(!this.isMovingAnyTileItem) this._showMouseIcon = false;

        let showMouseIcon = this._showMouseIcon;
        if(!this.isMovingAnyTileItem) showMouseIcon = false;
        if(!HudLockZone.isZoneLocked()) showMouseIcon = false;

        if(showMouseIcon) {

            if(!this._mouseIcon) {
                const scene = GameScene.Instance;

                this._mouseIcon = scene.add.graphics();
                this._mouseIcon.fillStyle(0x000000);
                this._mouseIcon.fillRect(0, 0, 50, 50);
                
                GameScene.Instance.hudContainer.add(this._mouseIcon);
            }

            this._mouseIcon.setPosition(mousePos.x, mousePos.y);
        } else {
            if(this._mouseIcon) {
                this._mouseIcon.destroy();
                this._mouseIcon = undefined;
            }
        }
    }

    private static canTileItemBeMovedToTile(tileItem: TileItem, tile: Tile) {
        const world = this._world!;

        const canBePlaced = world.tileMap.canTileItemBePlacedAtTile(tileItem, tile);

        if(!canBePlaced) return false;

        return true;
        //if(atTileItem.tileItemInfo.type != TileItemType.FLOOR) return false;

        //if(atTileItem.tile == movingTileItem.tile) return false;
    }

    private static processPlaceMovingTileItem() {
        const movingTileItem = this._movingTileItem;

        if(!movingTileItem) return;

        if(HudLockZone.isZoneLocked()) return;

        const wallOrFloor = TileHoverDetection.testTileItem(Input.getMouseWorldPosition())

        if(wallOrFloor == undefined) return;

        const world = this._world!;

        const canBePlaced = this.canTileItemBeMovedToTile(movingTileItem, wallOrFloor.tile);

        if(this._hoveringWallOrFloor != wallOrFloor) {
            this._hoveringWallOrFloor = wallOrFloor;

            console.log(`Trying to place at ${wallOrFloor.tile.x} ${wallOrFloor.tile.y}`);


            if(canBePlaced) {
                this._placeAtTile = wallOrFloor.tile;
                
                if(!movingTileItem.tile) {
                    world.forceAddTileItemToTile(movingTileItem, wallOrFloor.tile)
                    
                }

                world.forceMoveTileItem(movingTileItem, wallOrFloor.tile)
                
                console.log(`Placed at at ${this._placeAtTile?.x} ${this._placeAtTile?.y}`);

            }    
        } 
    }

    public static removeMovingTileItem() {
        const world = this._world!;

        if(!this._movingTileItem) return;

        world.removeTileItem(this._movingTileItem);
    }

    public static stopMoving() {
        this._movingTileItem = undefined;

        const fn = this.onStopMoving;
        this.onStopMoving = undefined;
        fn?.();
    }

    public static stopMovingAndRemove() {
        this.removeMovingTileItem();
        this.stopMoving();
    }

    /*
    private static tryPlaceMovingTileItemAtTileItem(atTileItem: TileItem) {
        const movingTileItem = this._movingTileItem!;

        const world = this._world!;
        //const canBePlaced = world.tileMap.canTileItemBePlacedAtTile(movingTileItem, atTileItem.tile);

        const canBePlaced = world.tryMoveTileItem(movingTileItem, atTileItem.tile)
        
        if(canBePlaced) {
            this._placeAtTile = atTileItem.tile;
        }
        
        return canBePlaced;
    }
    */

    

    public static startMove(tileItem: TileItem) {
        this._movingTileItem = tileItem;
    }

    public static trySelect(tileItem: TileItem) {
        console.log("try select tileitem");

        if(this._selectedTileItem == tileItem) {
            this.unselectCurrentTileItem();
            return;
        }
        
        this.select(tileItem);
    }

    public static select(tileItem: TileItem) {
        if(tileItem == this._selectedTileItem) return;

        this.unselectCurrentTileItem();

        tileItem.setIsSelected(true);
        this._selectedTileItem = tileItem;
    }

    public static unselectCurrentTileItem() {
        if(this._selectedTileItem) {
            this._selectedTileItem.setIsSelected(false);
            this._selectedTileItem = undefined;
        }
    }
}