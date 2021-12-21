import { TileItemStove } from "../tileItem/items/tileItemStove";
import { SyncType, World } from "../world/world";
import { Player } from "./player";
import { PlayerType } from "./playerType";

export class PlayerCheff extends Player {

    private _checkStovesTime: number = 0;

    private _goingToAnyStove: boolean = false;

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

    private checkStoves() {
        /*
        add: closest stove
        */
        
        if(this._goingToAnyStove) return;

        const stoves = this.world.getStoves();

        for (const stove of stoves) {
            if(this._goingToAnyStove) return;

            const toCookDish = stove.getToCookDish();

            if(toCookDish) {
                const tile = stove.tile;

                this._goingToAnyStove = true;

                this.log(">>>>>>>>>>>>>> going to stove", stove.isCooking ? "cooking" : "not cooking", toCookDish)

                this.taskWalkNearToTile(tile);
                this.taskPlaySpecialAction('look_to_tile', [tile.x, tile.y]);
                this.taskPlayAnimation("Eat", 1000);
                this.taskPlaySpecialAction('cheff_start_cook', [toCookDish.id, stove.id]);
    

                this.setAsChangedState();

                
            }
        }

    }

    public async startSpecialAction(action: string, args: any[]) {
        await super.startSpecialAction(action, args);

        if(action == "cheff_start_cook") {
            const dishId = args[0] as string;
            const stoveId = args[1] as string;

            const dish = this.world.game.dishFactory.getDish(args[0]);

            const stove = this.world.game.tileItemFactory.getTileItem(args[1]) as TileItemStove;

            stove.clearToCookDish();
            stove.startCook(dish);
            
            this._goingToAnyStove = false;
        }   
    }
}