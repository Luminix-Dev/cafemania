import { Dish } from "../dish/dish";
import { DishPlate } from "../dish/dishPlate";
import { TileItemCounter } from "../tileItem/items/tileItemCounter";
import { TileItemTable } from "../tileItem/items/tileItemTable";
import { Utils } from "../utils/utils";
import { SyncType, World } from "../world/world";
import { Player } from "./player";
import { PlayerClient } from "./playerClient";
import { PlayerType } from "./playerType";


export class PlayerWaiter extends Player {
    private _checkClientsTime: number = 0;
    private _isBusy: boolean = false;

    private _dishPlate?: DishPlate;
    private _carryingDish?: Dish;
    
    private _goingToTable?: TileItemTable;
    private _goingToCounter?: TileItemCounter;

    constructor(world: World) {
        super(world);
        this._type = PlayerType.WAITER;
        this._spriteTextureName = "PlayerSpriteTexture_Waiter";

        //this.speed = 1.7;
    }
    
    public update(dt: number) {
        super.update(dt);

        if(this.world.sync != SyncType.SYNC) {
            this.updateWaiterBehavior(dt);
        }

    }

    private updateWaiterBehavior(dt: number) {
        this._checkClientsTime += dt;

        if(!this._isBusy) {

            if(this._checkClientsTime >= 1000) {
                this._checkClientsTime = 0;
                //this.log("looking for clients");
                this.checkClients_Serve();
            }
        }

    }


    public render(dt: number) {
        super.render(dt);
        this.renderDishPlate();
    }

    private renderDishPlate() {
        if(this._carryingDish) {
            if(!this._dishPlate) {
                const dish = this._carryingDish;
                this._dishPlate = new DishPlate(dish);
            }
            const h = 20;
            const position = new Phaser.Math.Vector2(
                this.position.x,
                this.position.y - h
            )
            this._dishPlate.setPosition(position.x, position.y) ;
            this._dishPlate.setDepth(position.y + h);
        } else {
            if(this._dishPlate) {
                this._dishPlate.destroy()
                this._dishPlate = undefined
            }
        }
    }

    private checkClients_Serve() {
        const client = this.getRandomPlayerWaitingForWaiter();
        const counter = this.getAnyAvaliableCounter();

        if(!client) return;
        if(!counter) return;

        this.log("need to serve client")

        this._isBusy = true;

        client.waitingForWaiter = false;

        const dish = counter.getDish();
        const table = client.getChairPlayerIsSitting()!.getTableInFront()!;

        //this.taskWalkNearToTile(counter.tile);

        console.warn("vai krl")

        counter.amountWaitersComing++;

        this.taskWalkNearToTile(counter.tile);
        this.taskPlaySpecialAction('look_to_tile', [counter.tile.x, counter.tile.y]);
        this.taskPlayAnimation("Eat", 1000);
        this.taskPlaySpecialAction('waiter_get_counter_dish', [dish.id, counter.id, table.id]);
        this.taskExecuteAction(async() => {
            counter.amountWaitersComing--;
        })
        this.taskWalkNearToTile(client.atTile);
        this.taskPlaySpecialAction('waiter_serve_dish', []);
    }


    private getRandomPlayerWaitingForWaiter() {
        const players = Utils.shuffleArray(this.world.getPlayerClients());
        for (const player of players) {
            if(player.waitingForWaiter) return player;
        }
        return;
    }

    public getAnyAvaliableCounter() {
        const counters = this.world.getCounters().filter(counter => {
            if(counter.isEmpty) return false
            const servings = counter.getDishAmount() - counter.amountWaitersComing
            if(servings <= 0) return false
            return true
        })
        if(counters.length == 0) return
        return Utils.shuffleArray(counters)[0]
    }

    public async startSpecialAction(action: string, args: any[]) {
        await super.startSpecialAction(action, args);

        if(action == "waiter_get_counter_dish") {
            
            this.setDirection(0);
            
            this._carryingDish = this.world.game.dishFactory.getDish(args[0]);

            this._goingToCounter = this.world.game.tileItemFactory.getTileItem(args[1]) as TileItemCounter;
            this._goingToCounter.addDishAmount(-1);
            this._goingToCounter.setAsChangedState();

            this._goingToTable = this.world.game.tileItemFactory.getTileItem(args[2]) as TileItemTable;
            this._goingToTable.isWaitingForDish = true;
            
        }

        if(action == "waiter_serve_dish") {
           

            try {
                const table = this._goingToTable!;
                const dish = this._carryingDish!;
                
        
                table.eatTime = 8000;
                table.setDish(dish);
                table.isWaitingForDish = false;
            } catch (error) {
                console.warn(error);
            }

            this._goingToCounter = undefined;
            this._goingToTable = undefined;
            this._carryingDish = undefined;
            this._isBusy = false;

        }
    }
}