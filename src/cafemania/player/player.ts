import { v4 as uuidv4 } from 'uuid';

import { BaseObject } from "../baseObject/baseObject";
import { Debug } from '../debug/debug';
import { GameScene } from "../scenes/gameScene";
import { Tile } from '../tile/tile';
import { TileItemChair } from '../tileItem/items/tileItemChair';
import { TileItemType } from '../tileItem/tileItemInfo';
import { DebugText } from '../utils/debugText';
import { Direction } from '../utils/direction';
import { PathFind } from '../utils/pathFind';
import { PathFindVisualizer } from '../utils/pathFindVisualizer';
import { Utils } from '../utils/utils';
import { World } from "../world/world";
import { WorldEvent } from '../world/worldEvent';
import { PlayerAnimation } from './playerAnimation';
import { PlayerInfo } from './playerInfo';
import { PlayerType } from './playerType';
import { IPlayerTaskSerializedData, PlayerTaskType, TaskExecuteAction, TaskManager, TaskPlayAnimation, TaskPlaySpecialAction, TaskWalkToTile } from './taskManager';

export enum PlayerState {
    IDLE,
    WALKING,
    SITTING,
    EATING
}



export interface IPlayerSerializedData {
    id: string
    type: PlayerType
    x: number
    y: number
    direction: number
    tasks: IPlayerTaskSerializedData[]
    playerInfo: PlayerInfo
}

class PlayerPathFindMovement {
    public distanceWalked: number = 0;

    public onFinishCallback?: () => void;

    private _startPosition = new Phaser.Math.Vector2();
    private _positions: Phaser.Math.Vector2[] = [];
    private _tiles: Tile[] = [];
    private _callbacks: {[positionKey: string]: () => void} = {};

    private _prevIndex: number = 0;
    private _currentIndex: number = 0;

    private _totalDistance: number = 0;

    
    
    public setStart(position: Phaser.Math.Vector2) {
        this._startPosition.set(position.x, position.y);
        this._positions = [];
        this._tiles = [];
        this.distanceWalked = 0;
        this._callbacks = {};
        this._totalDistance = 0;
    }
    
    public getTotalDistance() {
        return this._totalDistance;
    }

    public getCurrentIndex() {
        return this._currentIndex;
    }

    public getTileAt(index: number) {
        return this._tiles[index];
    }

    public addPosition(position: Phaser.Math.Vector2, tile: Tile, whenReachCallback?: () => void) {

        if(this._positions.length > 0) {

            const prevPos = this._positions[this._positions.length-1];
            const distance = Phaser.Math.Distance.BetweenPoints(prevPos, position);

            this._totalDistance += distance;
            
            //console.log("d", distance, this._totalDistance)
        }

        this._positions.push(position);
        this._tiles.push(tile);

        if(whenReachCallback) {
            this._callbacks[`${this._positions.length-1}`] = whenReachCallback;
        }
    }



    public getLastPosition() {
        return this._positions[this._positions.length-1];
    }

    public getCurrentPosition(distanceWalked: number) {
        let prevPosition = this._startPosition;
        let walked = 0;

        this._currentIndex = 0;

        let positionWhereStopped: Phaser.Math.Vector2 | undefined;
        
        for (const position of this._positions) {
            let index = this._positions.indexOf(position);
            let key = `${index}`;

            
            
            if(!positionWhereStopped) {
                this._currentIndex = index;

                

                const distance = Phaser.Math.Distance.BetweenPoints(prevPosition, position);

                


                walked += distance;

                

            
                if(walked > distanceWalked) {
                    
                    

                    let walkedInThisTile = distance - (walked - distanceWalked);
                    const angle = Phaser.Math.Angle.BetweenPoints(prevPosition, position);

                    //console.log("here", walkedInThisTile, "of", distance);
                    //console.log(positionWhereStopped)

                    positionWhereStopped = new Phaser.Math.Vector2(
                        prevPosition.x + (Math.cos(angle) * walkedInThisTile),
                        prevPosition.y + (Math.sin(angle) * walkedInThisTile)
                    );
                }
                prevPosition = position.clone();

              
            }
        }


        if(!positionWhereStopped) {
            this._currentIndex++;
        }


        
        let index = this._currentIndex-1;
        const tile = this._tiles[index];
        if(tile) {
            let key = `${index}`;

            if(this._callbacks[key]) {

                this._callbacks[key]?.();
                delete this._callbacks[key];
                
            }

            if(tile == this._tiles[this._tiles.length-1]) {
                //console.log("helo? end?")

                const cb = this.onFinishCallback;
                this.onFinishCallback = undefined;
                cb?.();
            }
        }


        

        return positionWhereStopped;
    }

    /*
    const vec: PathVector = {
                start: prevPos,
                end: new Phaser.Math.Vector2()
            };
    */
    public update(dt: number) {

    }
}

export class Player extends BaseObject {
    public test_1: number = 0;

    public id: string = uuidv4();
    //public data: any = undefined;
    public get position() { return this._position; }
    public get world() { return this._world; }
    public get direction() { return this._direction; }
    public get atTile() { return this._atTile!; }
    public get debugText() { return this._debugText; }
    public get type() { return this._type; }
    public get state() { return this._state; }
    public get taskManager() { return this._taskManager; }
    public get pathFindMovement() { return this._pathFindMovement; }
    public get playerInfo() { return this._playerInfo; }
    public speed: number = 1;

    private _position = new Phaser.Math.Vector2();
    private _hasCreatedSprites: boolean = false;
    private _atTile?: Tile;
    private _world: World;
    private _taskManager: TaskManager;

    private _playingAnimation?: string;


    private _direction: Direction = Direction.NORTH;
    private _debugText = new DebugText();
    private _container?: Phaser.GameObjects.Container;
    private _sprite?: Phaser.GameObjects.Sprite;
    private _nicknameText?: Phaser.GameObjects.Text;

    private _pathFind?: PathFind;
    private _pathFindVisuals?: PathFindVisualizer;

    private _pathFindMovement = new PlayerPathFindMovement();

    private _canWalk: boolean = false;
   
    private _movingToTile?: Tile;

    public depth: number = 0;
    protected _type: PlayerType = PlayerType.NONE;
    protected _spriteTextureName: string = "PlayerSpriteTexture_NoTexture";

    private _animation: PlayerAnimation;
    private _state: PlayerState = PlayerState.IDLE;
    private _sittingAtChair: TileItemChair | undefined;

    private _playerInfo: PlayerInfo = {
        id: '',
        nickname: 'Player',
        clothes: [],
    }

    constructor(world: World) {
        super();
        this._world = world;
        this._animation = new PlayerAnimation(this);
        this._taskManager = new TaskManager();

        this.speed = 1.3;
    }


    public getSprite() { return this._sprite; }

    public setPlayerInfo(playerInfo: PlayerInfo) {
        this._playerInfo = playerInfo;
    }

    public setAtTileCoord(x: number, y: number, updatePosition = true) {
        this.setAtTile(this.world.tileMap.getTile(x, y), updatePosition);
    }

    public walkToTile(x: number, y: number, callback?: () => void) {
        Debug.log("player walk to " + x + ', ' + y);


        if(this._sittingAtChair) this.liftUpfromChair();

        this.setState(PlayerState.WALKING);

        var self = this;
        var cb = function() {
            //self.setState(PlayerState.IDLE);

            self.setAtTile(self.world.tileMap.getTile(x, y), true);

            callback?.();
        }

        this.pathFindToCoord(x, y, cb);
    }

    public taskWalkToTile(tile: Tile) {
        //this.log(`taskWalkToTile ${tile.id}`);
        
        const task = new TaskWalkToTile(this, tile);

        this._taskManager.addTask(task);

        this.setAsChangedState();
    }

    public taskPlayAnimation(animation: string, time: number) {
        this.log(`taskPlayAnimation ${animation} ${time}`);
        
        const task = new TaskPlayAnimation(this, animation, time);

        this._taskManager.addTask(task);

        this.setAsChangedState();
    }

    public playAnimation(animation: string) {
        console.log("playAnimation", animation)

        this._playingAnimation = animation;
    }

    public stopPlayingAnimation() {
        this._playingAnimation = undefined;
            console.log("stopped playAnimation");
    }

    public taskPlaySpecialAction(action: string, args: any[], callback?: () => void) {
        console.log("added task", action, args)

        const task = new TaskPlaySpecialAction(this, action, args);
        task.timeToComplete = 1;

        if(callback) task.onComplete.push(callback);

        this._taskManager.addTask(task);

        this.setAsChangedState();
    }

    public async startSpecialAction(action: string, args: any[]) {
        console.warn(action, args);

        if(action == "look_to_tile") {
        
            const tile = this.world.tileMap.getTile(args[0], args[1]);
            this.lookToTile(tile);
        }

        if(action == "test_1") {
            const n: number = args[0];

            this.test_1 = n;
        }
    }

    public lookToTile(tile: Tile) {
        const offset = {
            x: tile.x - this.atTile.x,
            y: tile.y - this.atTile.y
        }
        this.setDirection(Tile.getDirectionFromOffset(Math.sign(offset.x), Math.sign(offset.y)));
    }

    public taskExecuteAction(action: () => Promise<void>, callback?: () => void) {
        //this.log(`taskExecuteAction`);
        
        const task = new TaskExecuteAction(action);

        if(callback) task.onComplete.push(callback);

        this._taskManager.addTask(task);
    }

    
    public taskWalkNearToTile(tile: Tile) {
        console.warn("change");
        //need own TaskWalkNearToTile

        const tiles = tile.getAdjacentTiles().filter(tile => tile.getIsWalkable());
        const closestTile = Tile.getClosestTile(this.position, tiles);

        this.taskWalkToTile(closestTile);
    }

    /*
    public taskExecuteFunction(fn: () => Promise<void>) {
        const task = (async(resolve) => {
            await fn();
            resolve();
        });
        this._taskManager.addTask(task);
    }
    */

    public beginMoveToPosition(x: number, y: number) {
        //this._canMoveToPosition = true;
        //this._targetMovePosition.set(x, y);
    }

    public setAtTile(tile: Tile, updatePosition = true) {
        if(updatePosition) this.setPosition(tile.position.x, tile.position.y);
        this._atTile = tile;

        const chair = tile.getTileItemsOfType(TileItemType.CHAIR)[0];

        if(updatePosition && chair) {
            if(!this.getChairPlayerIsSitting()) {
                this.sitAtChair(chair as TileItemChair);
            }
        }
    }

    public setPosition(x: number, y: number) {
        this._position.set(x, y);
    }

    public sitAtChair(chair: TileItemChair) {
        this._sittingAtChair = chair;
        this._sittingAtChair.setPlayerSitting(this);
    }

    public liftUpfromChair() {
        this._sittingAtChair!.setPlayerSitting(undefined);
        this.setAtTile(this._sittingAtChair!.tile, false);
        this._sittingAtChair = undefined;
        this._state = PlayerState.IDLE;
    }

    public getChairPlayerIsSitting() { 
        return this._sittingAtChair;
    }

    public update(dt: number) {
        this._taskManager.update(dt);

        //  console.log(dt)
    }

    public setPathFindDistanceWalked(distance: number) {
        const pathFindMovement = this._pathFindMovement;

        pathFindMovement.distanceWalked = distance;

        var position = pathFindMovement.getCurrentPosition(pathFindMovement.distanceWalked);

        
     
        const index = pathFindMovement.getCurrentIndex();
        const tile = pathFindMovement.getTileAt(index)
        this._movingToTile = tile;

        if(position) {
            this.setPosition(position.x, position.y);
        }
       

        if(this._movingToTile) {
            const delta = new Phaser.Math.Vector2(
                this._movingToTile.x - this.atTile.x,
                this._movingToTile.y - this.atTile.y
            );

            try {
                this._direction = Tile.getDirectionFromOffset(delta.x, delta.y);
            } catch (error) {}
        }

        /*
        var p = world.players[0]._pathFindMovement.getCurrentPosition(330)
        world.players[0].setPosition(p.x, p.y)
        */
    }


    public static getDistanceFromPoints(points: Phaser.Math.Vector2[]) {

    }

    public pathFindToCoord(x: number, y: number, callback?: () => void) {
        const pathFind = this._pathFind = new PathFind();
        this.world.tileMap.tiles.forEach(tile => {
            pathFind.addNode(tile.x, tile.y, tile.getIsWalkable());
        });

        
        if(this._movingToTile) {
            this.setAtTile(this._movingToTile, false);
        }

        let atTile = this._atTile!;

        pathFind.goToClosesetTileIfNotWalkable = false;
        pathFind.setStart(atTile.x, atTile.y);
        pathFind.setEnd(x, y);

        const d = Date.now();
        while(!pathFind.hasEnded) pathFind.process();
        //console.log(`Took ${Date.now() - d}ms`);

        const etime = Date.now() - d;

        this._pathFindMovement.setStart(new Phaser.Math.Vector2(this.position.x, this.position.y));

        const self = this;

        let i = 0;
        for (const node of pathFind.path) {

            const tile = this.world.tileMap.getTile(node.x, node.y);
            const nodePosition = new Phaser.Math.Vector2(tile.position.x, tile.position.y);
            
            this._pathFindMovement.addPosition(nodePosition, tile, () => {
                //self.log(`at node ${node.x}, ${node.y}`)

                self.setAtTile(tile, false);
            });

            i++;
        }


        this._canWalk = true;

        //this.log(`Path find from (${atTile.x}, ${atTile.y}) to (${x}, ${y}) [${etime}ms]`, callback ? "hascallback" : 'nocb');


        this._pathFindMovement.onFinishCallback = () => {
            
            

            const lastPosition = this._pathFindMovement.getLastPosition();

            this.setPosition(lastPosition.x, lastPosition.y);

            //this.log("ended movement");

            this._pathFind = undefined;

            this._canWalk = false;

            if(this._movingToTile) this.setAtTile(this._movingToTile, true);

            this._movingToTile = undefined;

            if(callback) {
                callback();
            }
        }


            
    }

    public clearMovements() {
        this._pathFind = undefined;
        this._pathFindMovement.onFinishCallback = undefined;
        this._canWalk = false;
        this._movingToTile = undefined;
    }

    public render(dt: number) {
        const scene = GameScene.Instance;
        
        //this.debugText.setTextLine('data', JSON.stringify(this.data));
        this.debugText.setTextLine('attile', `${this.atTile.x}, ${this.atTile.y}`);
        this.debugText.setTextLine('ttile', `${this._movingToTile?.x}, ${this._movingToTile?.y}`);
        this.debugText.setTextLine('index', `${this._pathFindMovement.getCurrentIndex()}`);

        this.renderSprite();
        //this.renderDebugText(dt);
        //this.renderPathFind(dt);

 

        const chair = this.getChairPlayerIsSitting();
        if(chair) {
            if(this._state != PlayerState.EATING) this._state = PlayerState.SITTING;

            const isBehind = this.direction == Direction.SOUTH || this.direction == Direction.EAST;
            this.depth = isBehind ? 6 : 1;
            this._direction = chair.direction;
        }
        
        let animKey = 'Idle';
        switch (this._state) {
            case PlayerState.EATING:
                animKey = 'Eat';
                break
            case PlayerState.SITTING:
                animKey = 'Sit';
                break
            case PlayerState.WALKING:
                animKey = 'Walk';
                break
        }

        if(this._playingAnimation) {
            animKey = this._playingAnimation;
        }
        

        this._animation.play(animKey)
        this._animation.update(dt);
    }

    private renderDebugText(dt: number) {
        const debugText = this._debugText;
        debugText.setEnabled(true);
        debugText.setTextLine('default', `PLAYER`);
        debugText.setPosition(this._position.x, this._position.y);
        debugText.update();
    }

    private renderPathFind(dt: number) {
        const scene = GameScene.Instance;

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

    private renderSprite() {
        const scene = GameScene.Instance;

        if(!this._hasCreatedSprites) {
            this._hasCreatedSprites = true;
            this._container = scene.add.container(0, 0);
            scene.layerObjects.add(this._container);

            this.createSprite();

            //this._nicknameText = scene.add.text(0, -170, `${this.playerInfo.nickname}`, {color: "black"});
            //this._nicknameText.setOrigin(0.5);
            //this._container.add(this._nicknameText);
        }

        this._container?.setPosition(this._position.x, this._position.y);
        this._container?.setDepth(this._position.y + this.depth);
    }

    private createSprite(textureName?: string) {
        const scene = GameScene.Instance;
        
        if(textureName) {
            /*
            const PTF = await import("./PlayerTextureFactory");
            await PTF.PlayerTextureFactory.generatePlayerTexture(textureName, {animations: []}) ;
            */
        } else {
            textureName = this._spriteTextureName;
        }

        if(this._sprite) this._sprite.destroy();

        const sprite = this._sprite = scene.add.sprite(0, 42, textureName);
        sprite.setScale(1.05);
        sprite.setOrigin(0.5, 1);
        sprite.setFrame(`Idle_0_0`);
        this._container!.add(sprite);
    }

    public setState(state: PlayerState) {
        this._state = state;
    }

    public setDirection(direction: Direction) {
        this._direction = direction;
    }



    public getClosestDoor() {
        const doors = this.world.getDoors();
        const tile = Tile.getClosestTile(this.position, doors.map(door => door.tile));
        return tile.getDoor();
    }

    public serialize() {
        const tasks: IPlayerTaskSerializedData[] = []
        
        this.taskManager.tasks.map(task => {
            let taskData: IPlayerTaskSerializedData = {
                taskId: task.id,
                taskType: PlayerTaskType.OTHER
            }

            if(task instanceof TaskWalkToTile) {
                taskData.taskType = PlayerTaskType.WALK_TO_TILE;
                taskData.tileX = task.tile.x;
                taskData.tileY = task.tile.y;
                taskData.distance = task.distanceWalked
            }

            if(task instanceof TaskPlayAnimation) {
                taskData.taskType = PlayerTaskType.PLAY_ANIM;
                taskData.anim = task.animation;
                taskData.time = task.time;
            }

            if(task instanceof TaskPlaySpecialAction) {
                taskData.taskType = PlayerTaskType.SPECIAL_ACTION;
                taskData.action = task.action;
                taskData.args = task.args;
            }
            
            if(taskData.taskType == PlayerTaskType.OTHER) {
                return;
            }

            tasks.push(taskData);

        })

        //console.log(tasks.length + " tasks")

        const data: IPlayerSerializedData = {
            id: this.id,
            type: this.type,
            x: this.atTile.x,
            y: this.atTile.y,
            direction: this.direction,
            tasks: tasks,
            playerInfo: this.playerInfo
            //data: this.data
        }


        return data;
    }
    
    public serializeStatus(): any {}

    public setAsChangedState() {
        //this.log(">> state changed");

        this.world.events.emit(WorldEvent.PLAYER_STATE_CHANGED, this);
    }

    public destroy() {
        this._sprite?.destroy();
        this._container?.destroy();
        this._debugText.setEnabled(false);
        this._pathFindVisuals?.destroy();
    }
}