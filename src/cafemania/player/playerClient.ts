import { Debug } from "../debug/debug";
import { SoundManager } from "../soundManager/soundManager";
import { Tile } from "../tile/tile";
import { TileItemChair } from "../tileItem/items/tileItemChair";
import { TileItemDoor } from "../tileItem/items/tileItemDoor";
import { Utils } from "../utils/utils";
import { World } from "../world/world";
import { WorldEvent } from "../world/worldEvent";
import { WorldSyncType } from "../world/worldSyncType";
import { WorldTextManager } from "../worldText/worldTextManager";
import { Player, PlayerState } from "./player";
import { PlayerType } from "./playerType";

export enum PlayerClientState {
    NONE,
    GOING_TO_DOOR,
    GOING_TO_CHAIR,
    SITTING,
    EXITING_CAFE
}

export interface PlayerClientData {
    goingToDoorId?: string
    goingToChairId?: string
}

export class PlayerClient extends Player {
    public static MAX_FIND_CHAIR_ATTEMPS = 4;
    public static EAT_SOUND_VARIATION = 0;
    
    public waitingForWaiter: boolean = false;

    public data: PlayerClientData = {
    }

    private _exitTile?: Tile;

    private _canFindChair: boolean = false;
    private _findChairAttempts: number = 0;
    private _findChairTime: number = -1;

    private _closestDoor: TileItemDoor | null = null
    private _isGoingToDoor = false;
    private _isGoingToChair = false;
    private _hasReachedDoor: boolean = false;

    private _goingToChair?: TileItemChair;

    private _isExitingCafe: boolean = false;

    private _hasStartedEating: boolean = false;

    constructor(world: World) {
        super(world);
        this._type = PlayerType.CLIENT;
        this._spriteTextureName = "PlayerSpriteTexture_Client";

        //this.speed = 1.7;
    }

    public playEatSound() {
        PlayerClient.EAT_SOUND_VARIATION++;
        if(PlayerClient.EAT_SOUND_VARIATION >= 4) PlayerClient.EAT_SOUND_VARIATION = 0;

        SoundManager.play("begin_eat" + PlayerClient.EAT_SOUND_VARIATION)
    }

    public update(dt: number) {
        super.update(dt);
        
        const chair = this.getChairPlayerIsSitting();
        if(chair) {
            const table = chair.getTableInFront();
            if(table) {
                if(!table.isEmpty) {

                    if(!this._hasStartedEating) {
                        this._hasStartedEating = true;

                        this.playEatSound();
                    }

                    this.setState(PlayerState.EATING);
                    table.currentEatTime -= dt;

                    if(table.currentEatTime <= 0) {

                        
                        if(this.world.sync != WorldSyncType.SYNC) {
                            this.taskPlaySpecialAction('client_exit_cafe', []);
                        }

                    }
                }
            }

        }

        if(this.world.sync != WorldSyncType.SYNC) {
            this.updateClientBehavior(dt);
        }
    }

    public setAsAlreadySitted() {
        this._hasReachedDoor = true;
    }

    private updateClientBehavior(dt: number) {
        
        //
        if(!this._isGoingToDoor) {

            if(!this._hasReachedDoor) {
                this._isGoingToDoor = true;
                
                this.walkInFrontAnyDoor();
            }

        }
        

        //finding chair
        if(this._canFindChair) {
            const chair = this.processFindChair(dt);

            if(chair) {
                this._canFindChair = false;
                this._goingToChair = chair;
                chair.setIsReserved(true);
            }
        }
        
        //
        if(this._hasReachedDoor) {
            //if (Debug.consoleLog) console.log("at door")

            if(this._goingToChair) {

                if(!this._isGoingToChair) {
                    this._isGoingToChair = true;

                    //this.log("going to chair");

                    this.taskWalkToTile(this._goingToChair.tile);
                    this.taskExecuteAction(async() => {
                        
                        //this.log("at chair")

                        this.waitingForWaiter = true;
                        
                    })
                }

            }
        }
       
    }

    

    private processFindChair(dt: number) {
        if(this._findChairTime == -1 || this._findChairTime > 1000) {
            this._findChairTime = 0;
            this._findChairAttempts++;

            const chair = this.findAnyAvaliableChair();
            if(chair) {
                //this.log('found chair')

                return chair;

                //this.clientStatus.goingToChairId = chair.id;
                //this.setAsChangedState();
                

                //this.walkToChairId(chair.id);
            } else {
                //this.log('no chairs')

                /*
                if(this._findChairAttempts >= PlayerClient.MAX_FIND_CHAIR_ATTEMPS) {
                    this._waitingForChair = false;
                }
                */
            }
            
        }
        this._findChairTime += dt;
    }

    public findAnyAvaliableChair() {
        const chairs = this.world.getChairs(true).filter(chair => {
            if(!chair.getTableInFront()) return false;
            return true;
        });

        if(chairs.length == 0) return;

        const chair = Utils.shuffleArray(chairs)[0];

        return chair;
    }

    private walkInFrontAnyDoor() {
        if (!this._closestDoor) {
            const doors = this.world.getDoors().filter(door => door.tile.getIsWalkable());

            if(doors.length == 0) {
                if (Debug.consoleLog) console.error("no doors");
                return;
            }

            const tiles = doors.map(door => door.tile);
            this._closestDoor = Tile.getClosestTile(this.position, tiles).getDoor()!;
        }

        //this.log("walkInFrontAnyDoor " + door.id)

        const tile = this._closestDoor.getTileBehind(2)!;

        this.taskWalkToTile(tile);
        this.taskExecuteAction(async () => {
            //this.log("behind door");
            console.log(this._closestDoor);
            this._canFindChair = true;
        });
        this.taskWalkToTile(this._closestDoor.tile);
        this.taskExecuteAction(async () => {
            //this.log("at door");

            this._hasReachedDoor = true;
            this._isGoingToDoor = false;
        });
    }

  

    public setExitTile(tile: Tile) {
        this._exitTile = tile;
    }

    public exitCafe() {
        if(this._isExitingCafe) return;
        this._isExitingCafe = true;

        let exitTile = this._exitTile;

        if(!exitTile) exitTile = this.world.getLeftSideWalkSpawn();

        this.taskWalkToTile(exitTile);
        this.taskExecuteAction(async() => {
            this.world.removePlayer(this);
            this.world.events.emit(WorldEvent.PLAYER_CLIENT_DESTROYED, this);
        })

    }

    public log(...args) {
        super.log.apply(this, [`${this.id}: `].concat(args));
    }

   
    public async startSpecialAction(action: string, args: any[]) {
        await super.startSpecialAction(action, args);

        if(action == "client_exit_cafe") {
            
            if (Debug.consoleLog) console.error("exit cafe")

            const chair = this.getChairPlayerIsSitting();

            
            if(chair) {
                this.liftUpfromChair();

                const table = chair.getTableInFront()!;
                const dish = table.getDish();

                table.clearDish();
                
                this.world.events.emit(WorldEvent.PLAYER_CLIENT_FINISH_EAT, table, dish)

                
            }

            this.exitCafe();

            

        }
    }
}

