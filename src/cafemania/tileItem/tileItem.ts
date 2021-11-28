import { v4 as uuidv4 } from 'uuid';

import { BaseObject } from "../baseObject/baseObject";
import { Debug } from "../debug/debug";
import { GameScene } from "../scenes/gameScene";
import { Tile } from "../tile/tile";
import { Direction } from '../utils/direction';
import { TileItemInfo, TileItemPlaceType, TileItemRotationType, TileItemType } from "./tileItemInfo";
import { TileItemRender } from "./tileItemRender";

export class TileItem extends BaseObject {
    public id: string = uuidv4();
    public get tileItemInfo() { return this._tileItemInfo; }
    public get tileItemRender() { return this._tileItemRender!; }
    public get tile() { return this._tile!; }
    public get isAtAnyTile() { return this._tile != undefined; }
    public get direction() { return this._direction; }
    public get position() { return this._position; }
    public animIndex: number = 0;
    public layerIndex: number = 0;
    public rotateOnLeftClick = true;
    
    private _tileItemInfo: TileItemInfo;
    private _position = new Phaser.Math.Vector2()
    private _hasCreatedSprites: boolean = false;
    private _tileItemRender?: TileItemRender;
    private _debugText?: Phaser.GameObjects.Text;
    private _tile?: Tile;
    private _direction: Direction = Direction.SOUTH;
    private _collisionEnabled: boolean = false;
    
    constructor(tileItemInfo: TileItemInfo) {
        super();
        this._tileItemInfo = tileItemInfo;
    }

    
    public render() {
        const scene = GameScene.Instance;
        
        if(!this._hasCreatedSprites) {
            this._hasCreatedSprites = true;

            this._tileItemRender = new TileItemRender(this.tileItemInfo);

            if(this.tileItemInfo.placeType == TileItemPlaceType.WALL) {

                if(this.tileItemInfo.type == TileItemType.DOOR) {
                    this._tileItemRender.depth = -Tile.SIZE.y/3;
                }

            }

            if(this.tileItemInfo.type == TileItemType.WALL) {
                this._tileItemRender.depth =-2;
            }

            this.updateSprites();

            //
            this.tileItemRender.events.on("pointerdown", () => {
                this.onLeftClick();
                this.log("onLeftClick");

                if(this.rotateOnLeftClick) this.rotate();
            })
            //
            
            this.onCreateTileItemRender();

            //const debugText = this._debugText = scene.add.text(0, 0, '');
            //debugText.setFontSize(10);
            //GameScene.Instance.layerTop.add(debugText);
        }

        const debugText = this._debugText;
        if(debugText) {
            debugText.setText(`${this.tileItemInfo.name}`);
            debugText.setPosition(this._position.x, this._position.y)
        }

        const tileItemRender = this._tileItemRender;
        if(tileItemRender) {
            tileItemRender.setPosition(this._position.x, this._position.y);
            tileItemRender.render();
        }

    
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
        console.log("current", this._direction)

        const rotationMap = [0, 2, 1, 3];

        if(this.tileItemInfo.rotationType == TileItemRotationType.SIDE_ONLY) {
            rotationMap.splice(rotationMap.indexOf(0), 1)    
            rotationMap.splice(rotationMap.indexOf(3), 1)    
        }

        let index = rotationMap.indexOf(this._direction);

        
        index++;
        if(index >= rotationMap.length) index = 0;
        
        console.log(rotationMap, index)

        
        return rotationMap[index];
    }
    */

    public setVisualsDirection(direction: Direction) {
        this._direction = direction;
        this.updateSprites();
    }

    public setCollisionEnabled(enabled: boolean) {
        if(this._collisionEnabled == enabled) return;
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

            tileItemRender.setRotation(os[0], os[1]);
            tileItemRender.setLayer(this.animIndex, this.layerIndex + (changeLayer ? 1 : 0));

            tileItemRender.setCollisionEnabled(this._collisionEnabled);
        }
    }

    public destroy() {
        Debug.log("destroy tileItem");

        this._hasCreatedSprites = false;
        this._tileItemRender?.destroy();
        this._tileItemRender = undefined;
        this._debugText?.destroy();
        this._debugText = undefined;
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

    public startRandomlyRotate(time: number) {
        return;
        
        setInterval(() => {
            this.rotate();
        }, time)
    }

    public onCreateTileItemRender() {}
    public onLeftClick() {}
}