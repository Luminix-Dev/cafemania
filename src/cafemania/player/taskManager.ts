import { v4 as uuidv4 } from 'uuid';

import { BaseObject } from "../baseObject/baseObject";
import { Debug } from "../debug/debug";
import { Tile } from "../tile/tile";
import { Player } from "./player";

export enum PlayerTaskType {
    OTHER,
    WALK_TO_TILE,
    PLAY_ANIM
}

export interface IPlayerTaskSerializedData {
    taskId: string
    taskType: PlayerTaskType

    tileX?: number
    tileY?: number
    distance?: number

    anim?: string
    time?: number
}

export class Task extends BaseObject {
    public id: string = uuidv4();
    public completed: boolean = false;
    public onComplete: (() => void)[] = [];

    public start() {
        this.log("task started")
    }

    public update(dt: number) {}

    public forceComplete() {
        this.complete();
        this.log("task force complete")
    }

    public complete() {
        if(!this.completed) this.completed = true;
        this.log("task completed")
        this.onComplete.map(fn => fn());
    }
}

export class TaskWalkToTile extends Task {
    public player: Player;
    public tile: Tile;

    public targetWalkDistance?: number;
    public distanceWalked?: number;

    constructor(player: Player, tile: Tile) {
        super();

        this.player = player;
        this.tile = tile
    }

    public forceComplete() {
        this.player.clearMovements();
        this.player.setAtTile(this.tile, true);

        super.forceComplete();
    }

    public start() {
        super.start();

        const tile = this.tile;
        
        this.player.walkToTile(tile.x, tile.y, () => {
            this.complete();
        })
    }

    public update(dt: number) {
        super.update(dt);

        this.distanceWalked = this.player.pathFindMovement.distanceWalked;

        if(this.targetWalkDistance != undefined) {

            if(this.player.pathFindMovement.distanceWalked < this.targetWalkDistance) {
                this.player.pathFindMovement.distanceWalked = this.targetWalkDistance;

                console.warn("fixed");
            }

        }
    }
}

export class TaskPlayAnimation extends Task {
    public player: Player;
    public animation: string;
    public time: number;

    
    constructor(player: Player, animation: string, time: number) {
        super();

        this.player = player;
        this.animation = animation
        this.time = time
    }

    public start() {
        super.start();
        
        this.log("time", this.time)

        setTimeout(() => {
            this.complete();
        }, this.time);
    }
}


export class TaskExecuteAction extends Task {
    public action: () => Promise<void>;

    constructor(action: () => Promise<void>) {
        super();

        this.action = action;
    }

    public start() {
        super.start();
        (async () => {
            await this.action();
            this.complete();
        })();
    }
}

export class TaskManager extends BaseObject {
    public get tasks() { return this._tasks; }
    public get isDoingTask() { return this._doingTask; }

    private _tasks: Task[] = [];
    private _doingTask: boolean = false;

    constructor() {
        super();
    }

    public update(dt: number) {
        if(!this.isDoingTask) {
            this.findNextTask();
        }

        if(this._doingTask) this.tasks[0].update(dt); 

        /*
        if(!this._doingTask && this._tasks.length > 0) {
            this._doingTask = true;

            const task = this._tasks[0];
            this._tasks.shift();

            task.onComplete = () => {
                this._doingTask = false;
            }
            task.start();
            
        }
        */
    }
    
    public addTask(task: Task) {
        this._tasks.push(task);
        this.log("task added")
        return task;
    }

    public hasTask(id: string) {
        for (const task of this.tasks) {
            if(task.id == id) return true
        }
        return false;
    }

    public findNextTask() {
        if(this.tasks.length == 0) return;

        const task = this._tasks[0];

        this._doingTask = true;

        task.onComplete.push(() => {
            this._doingTask = false;

            this.log("not doing tasks")

            this._tasks.shift();

            this.findNextTask();
        });
        task.start();
    }

    public forceCompleteTask(task: Task) {
        if(this._tasks[0] == task) {
            task.forceComplete();
        } else {
            this._tasks.splice(this._tasks.indexOf(task), 1);
        }
    }
}