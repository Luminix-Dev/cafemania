import { Debug } from "../debug/debug";
import { Tile } from "../tile/tile";
import { TileItemChair } from "../tileItem/items/tileItemChair";
import { TileItemDoor } from "../tileItem/items/tileItemDoor";
import { Direction } from "../utils/direction";
import { Utils } from "../utils/utils";
import { SyncType, World } from "../world/world";
import { WorldEvent } from "../world/worldEvents";
import { Player, PlayerState, PlayerType } from "./player";

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
    
    public waitingForWaiter: boolean = false;

    public data: PlayerClientData = {
    }

    private _exitTile?: Tile;

    private _canFindChair: boolean = false;
    private _findChairAttempts: number = 0;
    private _findChairTime: number = -1;

    private _isGoingToDoor = false;
    private _isGoingToChair = false;
    private _hasReachedDoor: boolean = false;

    private _goingToChair?: TileItemChair;

    constructor(world: World) {
        super(world);
        this._type = PlayerType.CLIENT;
        this._spriteTextureName = "PlayerSpriteTexture_Client";

        this.speed = 3;
    }

    public update(dt: number) {
        super.update(dt);
        
        if(this.world.sync != SyncType.SYNC) {
            this.updateClientBehavior(dt);
        }



        /*
        //check sitting
        if(this.clientStatus.state == PlayerClientState.SITTING) {
            this.debugText.setTextLine('state', 'SITTING')

            const chair = this.world.game.tileItemFactory.getTileItem(this.clientStatus.goingToChairId!) as TileItemChair;
            const tile = chair.tile;

            if(this.atTile == tile) {
                if(!this.getChairPlayerIsSitting()) {
                    this.sitAtChair(chair);
                    this.log("sat");
                }
            }
        }
        */
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
            //console.log("at door")

            if(this._goingToChair) {

                if(!this._isGoingToChair) {
                    this._isGoingToChair = true;

                    this.log("going to chair");

                    this.taskWalkToTile(this._goingToChair.tile, () => {
                        this.log("at chair")

                        this.waitingForWaiter = true;
                    });
                }

            }
        }
        

        //
        const chair = this.getChairPlayerIsSitting();
        if(chair) {
            const table = chair.getTableInFront();
            if(table) {
                if(!table.isEmpty) {
                    this.setState(PlayerState.EATING);
                    table.eatTime -= dt;

                    if(table.eatTime <= 0) {
                        this.liftUpfromChair();
                        this.exitCafe();

                        table.clearDish();
                    }
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
                this.log('found chair')

                return chair;

                //this.clientStatus.goingToChairId = chair.id;
                //this.setAsChangedState();
                

                //this.walkToChairId(chair.id);
            } else {
                this.log('no chairs')

                /*
                if(this._findChairAttempts >= PlayerClient.MAX_FIND_CHAIR_ATTEMPS) {
                    this._waitingForChair = false;
                    this.exitCafe();
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
        const doors = this.world.getDoors().filter(door => door.tile.getIsWalkable());

        if(doors.length == 0) {
            console.error("no doors");
            return;
        }

        const door = Utils.shuffleArray(doors)[0];

        this.log("walkInFrontAnyDoor " + door.id)

        const tile = door.getTileBehind(2)!;

        this.taskWalkToTile(tile, () => {
            this.log("behind door");

            this._canFindChair = true;

            this.taskWalkToTile(door.tile, () => {
                this.log("at door");

                this._hasReachedDoor = true;
                this._isGoingToDoor = false;
            });
        });
    }

  

    public setExitTile(tile: Tile) {
        this._exitTile = tile;
    }

    public exitCafe() {
        let exitTile = this._exitTile;

        if(!exitTile) exitTile = this.world.getLeftSideWalkSpawn();

        this.taskWalkToTile(exitTile);

        this.world.events.emit(WorldEvent.PLAYER_CLIENT_DESTROYED, this);
    }

    public log(...args) {
        super.log.apply(this, [`${this.id}: `].concat(args));
    }
    
}