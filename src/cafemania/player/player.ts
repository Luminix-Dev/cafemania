import { v4 as uuidv4 } from 'uuid';

import { BaseObject } from "../baseObject/baseObject";
import { GameScene } from "../scenes/gameScene";
import { Tile } from '../tile/tile';
import { Direction } from '../utils/direction';
import { PathFind } from '../utils/pathFind';
import { PathFindVisualizer } from '../utils/pathFindVisualizer';
import { World } from "../world/world";

export class Player extends BaseObject {
    public id: string = uuidv4();
    public get position() { return this._position; }
    public get world() { return this._world; }
    public get direction() { return this._direction; }
    public speed: number = 1;

    private _position = new Phaser.Math.Vector2();
    private _hasCreatedSprites: boolean = false;
    private _atTile?: Tile;
    private _world: World;
    private _pathFind?: PathFind;
    private _pathFindVisuals?: PathFindVisualizer;
    private _targetMovePosition = new Phaser.Math.Vector2();
    private _canMoveToPosition = false;
    private _direction: Direction = Direction.NORTH;
    private _debugText?: Phaser.GameObjects.Text;
    private _container?: Phaser.GameObjects.Container;
    private _sprite?: Phaser.GameObjects.Sprite;


    constructor(world: World) {
        super();
        this._world = world;
    }

    public getSprite() { return this._sprite; }

    public setAtTileCoord(x: number, y: number, updatePosition = true) {
        this.setAtTile(this.world.tileMap.getTile(x, y), updatePosition);
    }

    public walkToTile(x: number, y: number) {
        this._canMoveToPosition = false;

        const tile = this.world.tileMap.getTile(x, y);
        this.pathFindToCoord(x, y);
    }

    public beginMoveToPosition(x: number, y: number) {
        this._canMoveToPosition = true;
        this._targetMovePosition.set(x, y);
    }

    public setAtTile(tile: Tile, updatePosition = true) {
        if(updatePosition) this.setPosition(tile.position.x, tile.position.y);
        this._atTile = tile;
    }

    public setPosition(x: number, y: number) {
        this._position.set(x, y);
    }

    public update(dt: number) {
        this.updatePathfindMovement(dt);
        this.updatePlayerMovement(dt);
    }

    private updatePathfindMovement(dt: number) {
        if(this._pathFind) {
            const path = this._pathFind.path;

            if(path.length == 0) return;

            const tile = this.world.tileMap.getTile(path[0].x, path[0].y);

            if(!this._canMoveToPosition) {
                this.beginMoveToPosition(tile.position.x, tile.position.y);
            }

            if(Phaser.Math.Distance.BetweenPoints(this.position, tile.position) < 3) {
                this.setAtTile(tile, false);

                this._canMoveToPosition = false;
                path.shift();
            }
        }
    }

    private updatePlayerMovement(dt: number) {
        if(this._canMoveToPosition) {
            const speed = this.speed / 10;
            const angle = Phaser.Math.Angle.BetweenPoints(this.position, this._targetMovePosition);

            const dir = {
                x: Math.cos(angle),
                y: Math.sin(angle)
            }

            this._position.x += dir.x * speed * dt;
            this._position.y += dir.y * speed * dt;
        }
    }

    public render(dt: number) {
        const scene = GameScene.Instance;
        
        if(!this._hasCreatedSprites) {
            this._hasCreatedSprites = true;

            this._debugText = scene.add.text(0, 0, '');
            this._debugText.setDepth(10000);
        }

        const debugText = this._debugText;
        if(debugText) {
            let str = `PLAYER`;

            debugText.setText(str);
            debugText.setPosition(this._position.x, this._position.y)
        }

        if(this._pathFind && !this._pathFindVisuals) {
            const visuals = this._pathFindVisuals = new PathFindVisualizer(this._pathFind, this.world);
            visuals.showPathOnly = true;

            const container = visuals.createContainer(scene);
            container.setDepth(1000)
        }

        if(this._pathFindVisuals) {
            this._pathFindVisuals.render(dt);

            if(this._pathFindVisuals.pathFind != this._pathFind) {
                this._pathFindVisuals.destroy();
                this._pathFindVisuals = undefined;
            }
        }
    }

    public pathFindToCoord(x: number, y: number) {
        const pathFind = this._pathFind = new PathFind();
        this.world.tileMap.tiles.forEach(tile => {
            pathFind.addNode(tile.x, tile.y, tile.getIsWalkable());
        });

        const atTile = this._atTile!;

        pathFind.goToClosesetTileIfNotWalkable = false;
        pathFind.setStart(atTile.x, atTile.y);
        pathFind.setEnd(x, y);

        const d = Date.now();
        while(!pathFind.hasEnded) pathFind.process();
        console.log(`Took ${Date.now() - d}ms`);

        //pathFind.path.shift();
    }
}