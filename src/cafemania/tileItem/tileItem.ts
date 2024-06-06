import { v4 as uuidv4 } from 'uuid';
import { SoundManager } from '../soundManager/soundManager';

import { BaseObject } from "../baseObject/baseObject";
import { Debug } from "../debug/debug";
import { Input } from '../input/input';
import { GameScene } from "../scenes/gameScene";
import { Menu } from '../shop/menu/menu';
import { Tile } from "../tile/tile";
import { DebugText } from '../utils/debugText';
import { Direction } from '../utils/direction';
import { EventRegister } from '../utils/eventRegister';
import { WorldEvent } from '../world/worldEvent';
import { TileItemInfo, TileItemPlaceType, TileItemRotationType, TileItemType } from "./tileItemInfo";
import { TileItemRender } from "./tileItemRender";


export interface ITileItemSerializedData {
    id: string
    tileItemInfo: string
    direction: number
    data?: any
}

export class TileItem extends BaseObject {
    public id: string = uuidv4();
    public get tileItemInfo() { return this._tileItemInfo; }
    public get tileItemRender() { return this._tileItemRender!; }
    public get tile() { return this._tile!; }
    public get isAtAnyTile() { return this._tile != undefined; }
    public get direction() { return this._direction; }
    public get position() { return this._position; }
    public get debugText() { return this._debugText; }
    public get world() { return this.tile.tileMap.world; }
    public animIndex: number = 0;
    public layerIndex: number = 0;
    public rotateOnLeftClick = false;
    public showDebugText: boolean = false;
    public defaultCollisionValue: boolean = false;
    
    private _isPointerOver: boolean = false;

    private _canStartMove = false;

    private _eventRegister: EventRegister;


    private _isSelected: boolean = false;
    private _isMoving: boolean = false;
    private _isTryingToSelect = false;



    private _tileItemInfo: TileItemInfo;
    private _position = new Phaser.Math.Vector2()
    private _hasCreatedSprites: boolean = false;
    private _tileItemRender?: TileItemRender;
    private _tile?: Tile;
    private _direction: Direction = Direction.SOUTH;
    private _collisionEnabled: boolean = false;
    
    private _debugText = new DebugText();

    constructor(tileItemInfo: TileItemInfo) {
        super();
        this._tileItemInfo = tileItemInfo;
        this._eventRegister = new EventRegister(this);
    }

    public update(dt: number) {
        
    }
    
    public render(dt: number) {
        const scene = GameScene.Instance;

        if(!this._hasCreatedSprites) {
            this._hasCreatedSprites = true;

            this._collisionEnabled = this.defaultCollisionValue;

            this._tileItemRender = new TileItemRender(this.tileItemInfo);
            

            if(this.tileItemInfo.placeType == TileItemPlaceType.WALL) {

                if(this.tileItemInfo.type == TileItemType.DOOR) {
                    this._tileItemRender.depth = -Tile.SIZE.y/3;
                }

            }

            if(this.tileItemInfo.type == TileItemType.WALL) {
                this._tileItemRender.depth =-2;
            }

            this.tileItemRender.render();
            this.updateSprites();
            this.updateSpritesLayer();

            //

            const onPointerDown = () => {
                if(Menu.isOpen) return;
                
                if(this._isPointerOver) {
                    this.onPointerDown();
                    this.world.events.emit(WorldEvent.TILE_ITEM_POINTER_DOWN, this); 
                }
            }

            const onPointerUp = () => {
                if(Menu.isOpen) return;

                if(this._isPointerOver) {
                    this.onPointerUp();
                    this.world.events.emit(WorldEvent.TILE_ITEM_POINTER_UP, this);
                }
            }

            const onPointerOver = () => {
                if(Menu.isOpen) return;

                this.onPointerOver();
                this.world.events.emit(WorldEvent.TILE_ITEM_POINTER_OVER, this);
            }

            const onPointerOut = () => {
                if (Debug.consoleLog) console.log("\n\nou\n\n")

                this.onPointerOut();
                this.world.events.emit(WorldEvent.TILE_ITEM_POINTER_OUT, this);
            }

            const onPointerDown_Outside = () => {
                Debug.log("onPointerDown_Outside")
            }

            const onPointerUp_Outside = () => {
                Debug.log("onPointerUp_Outside")
            }

            this._eventRegister.addListener(Input.events, "pointerdown", onPointerDown);
            this._eventRegister.addListener(Input.events, "pointerup", onPointerUp);
            this._eventRegister.addListener(this.tileItemRender.events, "pointerover", onPointerOver);
            this._eventRegister.addListener(this.tileItemRender.events, "pointerout", onPointerOut);

            this._eventRegister.addListener(this.tileItemRender.events, "pointerdownoutside", onPointerDown_Outside);
            this._eventRegister.addListener(this.tileItemRender.events, "pointerupoutside", onPointerUp_Outside);
            
        }

        
        const debugText = this._debugText;
        debugText.setEnabled(this.showDebugText);
        debugText.setTextLine('default', `${this.tileItemInfo.id}`);
        debugText.setPosition(this._position.x, this._position.y);
        debugText.update();
        

        const tileItemRender = this._tileItemRender;
        if(tileItemRender) {
            tileItemRender.render();
        }


        if(this._isSelected || this._isMoving) {
            this.setTransparent(true);
        }

        this.debugText.setTextLine("sel", this._isSelected ? "selected" : "not selected")


    }
    
    private removeEventListeners() {

    }

    protected updateSpritesLayer() {
        const scene = GameScene.Instance;

        Debug.log('updateSpritesLayer');

        let layer = scene.layerObjects;
        if(this.tileItemInfo.type == TileItemType.FLOOR) layer = scene.layerFloor;


        this.tileItemRender.getSprites().map(sprite =>
        {
            if(sprite.image) layer.add(sprite.image)
            if(sprite.collisionSprite) layer.add(sprite.collisionSprite)
        })
    }

    public getAvaliableRotations() {
        const rotationMap = [0, 2, 1, 3];

        if(this.tileItemInfo.rotationType == TileItemRotationType.SIDE_ONLY) {
            rotationMap.splice(rotationMap.indexOf(0), 1)    
            rotationMap.splice(rotationMap.indexOf(3), 1)    
        }

        return rotationMap;
    }

    public getNextRotation(rotationMap: number[]) {
        let index = rotationMap.indexOf(this._direction);

        index++;
        if(index >= rotationMap.length) index = 0;
        return rotationMap[index];
    }

    /*
    public getNextRotation() {
        if (Debug.consoleLog) console.log("current", this._direction)

        const rotationMap = [0, 2, 1, 3];

        if(this.tileItemInfo.rotationType == TileItemRotationType.SIDE_ONLY) {
            rotationMap.splice(rotationMap.indexOf(0), 1)    
            rotationMap.splice(rotationMap.indexOf(3), 1)    
        }

        let index = rotationMap.indexOf(this._direction);

        
        index++;
        if(index >= rotationMap.length) index = 0;
        
        if (Debug.consoleLog) console.log(rotationMap, index)

        
        return rotationMap[index];
    }
    */

    public setVisualsDirection(direction: Direction) {
        this._direction = direction;
        this.updateSprites();
    }

    public setTransparent(value: boolean) {
        if(!this._hasCreatedSprites) return;

        this.tileItemRender.setTransparent(value);
        //this.updateSprites();
    }

    public setIsMoving(value: boolean) {
        this._isMoving = value;

        if(this._isMoving) {
            if (Debug.consoleLog) console.warn("START MOVE")
        } else {
            if (Debug.consoleLog) console.warn("NOT MOVING")
        }

        this.setTransparent(this._isMoving);
    }

    public setIsSelected(value: boolean) {
        this._isSelected = value;

        this.setTransparent(this._isSelected);
    }

    public setCollisionEnabled(enabled: boolean) {
        if(this._collisionEnabled == enabled) return;
        
        if(this._isPointerOver) this.onPointerOut();

        this._collisionEnabled = enabled;
        this.updateSprites();
    }

    public updateSprites() {
        const tileItemRender = this._tileItemRender
        const tile = this._tile

        if(tileItemRender)
        {
            const os = TileItemRender.valuesFromDirection(this._direction)

            const changeLayer = this.direction == Direction.NORTH || this.direction == Direction.WEST

            tileItemRender.setPosition(this.position.x, this.position.y);
            tileItemRender.setRotation(os[0], os[1]);
            tileItemRender.setLayer(this.animIndex, this.layerIndex + (changeLayer ? 1 : 0));
            tileItemRender.setCollisionEnabled(this._collisionEnabled);
        }
    }

    public destroy() {
        
        Debug.log("destroy tileItem");
        this.destroyVisuals();
    }

    public destroyVisuals() {
        Debug.log("destroy tileItem visuals");
        this._hasCreatedSprites = false;
        this._tileItemRender?.destroy();
        this._tileItemRender = undefined;
        this._debugText.setEnabled(false);
        this._eventRegister.removeAllListeners();

        this._isPointerOver = false;
    }

    public setPosition(x: number, y: number) {
        this._position.set(x, y);
    }

    public setTile(tile?: Tile) {
        this._tile = tile;
    }

    public setDirection(direction: Direction) {
        const tileItem = this;
        const tileMap = this.tile.tileMap;
        const tile = tileItem.tile;
        const canBePlaced = tileMap.canTileItemBePlacedAtTile(tileItem, tile, direction)

        if(!canBePlaced) return false
        
        const gridItem = tileMap.grid.getItem(tileItem.id)
        const o = TileItemRender.valuesFromDirection(direction)

        gridItem.setChangeRotation(o[0])
        gridItem.setFlipCells(o[1])

        tileItem.setVisualsDirection(direction);

        return true;
    }

    public rotate() {
        const tileMap = this.tile.tileMap;
        const rotationMap = this.getAvaliableRotations();
        const avaliable = rotationMap.filter(d => tileMap.canTileItemRotateTo(this, d));
        const nextDirection = this.getNextRotation(avaliable);

        this.setDirection(nextDirection);
    }

    public getTileInFront() {
        const offset = Tile.getOffsetFromDirection(this.direction);
        const tile = this.tile.getTileInOffset(offset.x, offset.y);
        return tile;
    }

    public getTileBehind(distance: number = 1) {
        const offset = Tile.getOffsetFromDirection(this.direction)
        const tile = this.tile.getTileInOffset(offset.x * -1 * distance, offset.y * -1 * distance)
        return tile;
    }

    public startRandomlyRotate(time: number) {
        setInterval(() => {
            this.rotate();
        }, time)
    }

    public onPointerDown() {
        this.log("onPointerDown");

        
     
    }

    public onPointerUp() {
        this.log("onPointerUp");
        if(this.rotateOnLeftClick) this.rotate();
    }

    public onPointerOver() {
        this._isPointerOver = true;
        this.showDebugText = true;
    }

    public onPointerOut() {
        this._isPointerOver = false;
        this.showDebugText = false;
    }

    public serialize() {
        const data: ITileItemSerializedData = {
            id: this.id,
            tileItemInfo: this.tileItemInfo.id,
            direction: this.direction
        }

        const d = this.serializeData();
        if(d) data.data = d;

        return data;
    }

    public serializeData(): any {}
    public unserializeData(data: any) {};

    public setAsChangedState() {
        //this.log("state changed");

        this.world.events.emit(WorldEvent.TILE_ITEM_CHANGED, this);
    }
}