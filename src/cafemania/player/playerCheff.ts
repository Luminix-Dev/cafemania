import { Dish } from "../dish/dish";
import { SoundManager } from "../soundManager/soundManager";
import { TileItemStove } from "../tileItem/items/tileItemStove";
import { SyncType, World } from "../world/world";
import { Player } from "./player";
import { PlayerType } from "./playerType";

export class PlayerCheff extends Player {

    private _checkStovesTime: number = 0;

    private _goingToAnyStove: boolean = false;

    private _stovesToCook: TileItemStove[] = [];
    private _stovesToTake: TileItemStove[] = [];

    constructor(world: World) {
        super(world);
        this._type = PlayerType.CHEFF;
        //this._spriteTextureName = "PlayerSpriteTexture_Waiter";

        //this.speed = 1.7;
    }
    
    public update(dt: number) {
        super.update(dt);

        if(this.world.sync != SyncType.SYNC) {
            this.updateCheffBehavior(dt);
        }
    }

    public updateCheffBehavior(dt: number) {
        this._checkStovesTime += dt;
        if(this._checkStovesTime >= 0) {
            this._checkStovesTime = 0;

            this.checkStoves();
            
        }
    }

    public render(dt: number) {
        super.render(dt);
    }

    public addStoveToCookQuery(stove: TileItemStove) {
        if(this._stovesToCook.includes(stove)) return;
        this._stovesToCook.push(stove);
    }

    public removeStoveFromCookQuery(stove: TileItemStove) {
        if(!this._stovesToCook.includes(stove)) return;
        this._stovesToCook.splice(this._stovesToCook.indexOf(stove), 1);
    }

    //

    public removeStoveFromTakeQuery(stove: TileItemStove) {
        if(!this._stovesToTake.includes(stove)) return;
        this._stovesToTake.splice(this._stovesToTake.indexOf(stove), 1);
    }

    public addStoveToTakeQuery(stove: TileItemStove) {
        if(this._stovesToTake.includes(stove)) return;
        this._stovesToTake.push(stove);
    }

    private checkStovesToTake() {
        const stoves = this._stovesToTake;

        for (const stove of stoves) {
            if(this._goingToAnyStove) return;

            this._goingToAnyStove = true;

            const tile = stove.tile;
            const dish = stove.getCookingDish();

            this.log(">>>>>>>>>>>>>> going to stove", dish)

            this.taskWalkNearToTile(tile);
            this.taskPlaySpecialAction('look_to_tile', [tile.x, tile.y]);
            this.taskPlaySpecialAction('cheff_prepare_to_take', [stove.id]);
            this.taskPlayAnimation("Eat", 2000);
            this.taskPlaySpecialAction('cheff_take_dish', [stove.id]);

            this.setAsChangedState();
        }
    }

    private checkStovesToCook() {
        const stoves = this._stovesToCook;

        for (const stove of stoves) {
            if(this._goingToAnyStove) return;

            const toCookDish = stove.getToCookDish();

            if(toCookDish) {
                const tile = stove.tile;

                this._goingToAnyStove = true;

                this.log(">>>>>>>>>>>>>> going to stove", stove.isCooking ? "cooking" : "not cooking", toCookDish)

                this.taskWalkNearToTile(tile);
                this.taskPlaySpecialAction('look_to_tile', [tile.x, tile.y]);
                this.taskPlaySpecialAction('cheff_prepare_to_cook', [toCookDish.id, stove.id]);
                this.taskPlayAnimation("Eat", 2000);
                this.taskPlaySpecialAction('cheff_start_cook', [toCookDish.id, stove.id]);

                this.setAsChangedState();
            }
        }
    }

    private checkStoves() {
        if(this._goingToAnyStove) return;

        if(this._stovesToCook.length > 0) {
            this.checkStovesToCook();
            return;
        }

        this.checkStovesToTake();

        /*
        add: closest stove
        */
        
        
        
        

    }

    public async startSpecialAction(action: string, args: any[]) {
        await super.startSpecialAction(action, args);

        if(action == "cheff_prepare_to_cook") {
            const dishId = args[0] as string;
            const stoveId = args[1] as string;

            const dish = this.world.game.dishFactory.getDish(args[0]);

            const stove = this.world.game.tileItemFactory.getTileItem(args[1]) as TileItemStove;

            stove.prepareToCook();

            SoundManager.play("begin_cook");
        }

        if(action == "cheff_start_cook") {
            const dishId = args[0] as string;
            const stoveId = args[1] as string;

            const dish = this.world.game.dishFactory.getDish(args[0]);
            const stove = this.world.game.tileItemFactory.getTileItem(args[1]) as TileItemStove;

            stove.clearToCookDish();
            stove.setCookingDish(dish);

            //stove.addDishToCook(dish);

            this.removeStoveFromCookQuery(stove);
            
            this._goingToAnyStove = false;
        }   

        if(action == "cheff_prepare_to_take") {
        }
        
        if(action == "cheff_take_dish") {
            //const dish = this.world.game.dishFactory.getDish(args[0]);
            const stove = this.world.game.tileItemFactory.getTileItem(args[0]) as TileItemStove; 
            
            stove.sendDishToCounter();
            stove.clearDish();
            stove.setAsChangedState();

            this.removeStoveFromTakeQuery(stove);
            
            this._goingToAnyStove = false;

            stove.setTransparent(false);

            SoundManager.play("counter")
        }
    }
}