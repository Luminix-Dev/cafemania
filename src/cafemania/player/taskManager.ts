import { v4 as uuidv4 } from 'uuid';

import { BaseObject } from "../baseObject/baseObject";
import { Debug } from "../debug/debug";
import { Tile } from "../tile/tile";
import { Player, PlayerState } from "./player";

export enum PlayerTaskType {
    OTHER,
    WALK_TO_TILE,
    PLAY_ANIM,
    SPECIAL_ACTION
}

export interface IPlayerTaskSerializedData {
    taskId: string
    taskType: PlayerTaskType

    tileX?: number
    tileY?: number
    distance?: number

    anim?: string
    time?: number

    action?: string
    args?: any[]
}

export class Task extends BaseObject {
    public timeToComplete: number = 0;
    public progress: number = 0;
    public id: string = uuidv4();
    public completed: boolean = false;
    public onComplete: (() => void)[] = [];

    public start() {
        //this.log("task started")
    }

    public update(dt: number) {}

    public forceComplete() {
        this.complete();
        //this.log("task force complete")
    }

    public complete() {
        if(!this.completed) this.completed = true;
        //this.log("task completed")
        this.onComplete.map(fn => fn());
    }
}

export class TaskWalkToTile extends Task {
    public player: Player;
    public tile: Tile;

    public targetWalkDistance?: number;
    public distanceWalked?: number;

    private _sendUpdateTime = 0;

    constructor(player: Player, tile: Tile) {
        super();

        this.player = player;
        this.tile = tile
    }

    public forceComplete() {
        this.player.clearMovements();
        this.player.setState(PlayerState.IDLE);
        this.player.setAtTile(this.tile, true);

        super.forceComplete();

    }

    public start() {
        super.start();

        const tile = this.tile;
        
        
        this.player.walkToTile(tile.x, tile.y);

        this.updateTimeToComplete();
        


        console.log("START", this.player.pathFindMovement.getTotalDistance())
    }

    private updateTimeToComplete() {
        this.timeToComplete = this.player.pathFindMovement.getTotalDistance() / this.player.speed * 10;
    }

    public update(dt: number) {
        super.update(dt);

        //this.updateTimeToComplete();

        //console.log("walktotileupdate")
        //console.log(this.progress, '/', this.timeToComplete)

        const p = this.progress / this.timeToComplete;

        const totalDistance = this.player.pathFindMovement.getTotalDistance();

        //console.log(p, totalDistance, p * totalDistance)

        this.player.setPathFindDistanceWalked(p * totalDistance);

        /*

        this.distanceWalked = this.player.pathFindMovement.distanceWalked;

        if(this.targetWalkDistance != undefined) {

            if(this.player.pathFindMovement.distanceWalked < this.targetWalkDistance) {
                this.player.pathFindMovement.distanceWalked = this.targetWalkDistance;

                //console.warn("fixed");
            }

        }

        this._sendUpdateTime += dt;
        if(this._sendUpdateTime >= 1000) {
            this._sendUpdateTime = 0;

            this.player.setAsChangedState();
        }

        */
    }
}

export class TaskPlayAnimation extends Task {
    public player: Player;
    public animation: string;
    public time: number;

    
    constructor(player: Player, animation: string, time: number) {
        super();

        this.player = player;
        this.animation = animation;
        this.time = time;
        
        this.timeToComplete = time;
    }

    public start() {
        super.start();

        this.player.playAnimation(this.animation);
    }

    public forceComplete() {
        this.complete();
        
        this.player.stopPlayingAnimation();
    }
}


export class TaskPlaySpecialAction extends Task {
    public player: Player;
    public action: string;
    public args: any[];

    
    constructor(player: Player, action: string, args: any[]) {
        super();

        this.player = player;
        this.action = action;
        this.args = args;
    }

    public async start() {
        super.start();
        
        this.player.startSpecialAction(this.action, this.args);

        //this.complete();
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
            //this.complete();
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

    private updateTaskTime(task: Task, dt: number) {
        task.progress += dt;
        if(task.progress == task.timeToComplete) {
            task.forceComplete();

            this.checkTasks();

            console.log(this.tasks.length + " left")
        }
    }

    public update(dt: number) {
        
        
        this.checkTasks();

        if(this._doingTask) {
            let time = dt;

            this.updateTaskTime(this.tasks[0], 0);
            
            while(time > 0) {
                const task = this.tasks[0];

                if(!task) {
                    time = 0;
                } else {
                    let add = Math.min(time, task.timeToComplete - task.progress);

                    this.updateTaskTime(task, add)

                    time -= add;
                }

            }

            //this.log("doing task")
        }

        this.tasks[0]?.update(dt);
    }

    private checkTasks() {
        if(!this.isDoingTask) {
            this.findNextTask();
        }
    }


    public addTask(task: Task) {
        this._tasks.push(task);
        
        this.update(0);

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

            //this.log("not doing tasks")

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