import { Camera } from "../../camera/camera";
import { Debug } from "../../debug/debug";
import { Dish } from "../../dish/dish";
import { DishPlate, DishPlateState } from "../../dish/dishPlate";
import { Tile } from "../../tile/tile"
import { SyncType } from "../../world/world";
import { WorldEvent } from "../../world/worldEvents";
import { TileItem } from "../tileItem"
import { TileItemRender } from "../tileItemRender";
import { TileItemCounter } from "./tileItemCounter";

interface StoveData {
    cookingDish?: string
    cookTime: number
}


export class TileItemStove extends TileItem {
    public get isCooking() { return this._data.cookingDish != undefined }
    public get isDishReady() { return this.getCookingProgress() >= 1; }
    public tmpCookDish = "dish1";

    private _data: StoveData = {
        cookingDish: undefined,
        cookTime: -1
    }
    private _dishPlate?: DishPlate;
    
    public onCreateTileItemRender() {
        super.onCreateTileItemRender();
        this.setCollisionEnabled(true);
    }

    public update(dt: number) {
        super.update(dt);

        if(this.isCooking) {
            this._data.cookTime += dt;

            if(this.isDishReady) {
                this.onDishReady();
            }
        }
    }

    public render(dt: number) {
        super.render(dt);

        this.debugText.setTextLine('stove_cooking', `${this._data.cookingDish} (${this.getCookingProgress().toFixed(2)})`);
        this.renderDishPlate();
    }

    public clearDish() {
        this._data.cookingDish = undefined;
        this._data.cookTime = -1;
    }

    public onDishReady() {
        this.sendDishToCounter();
        this.clearDish();
        this.setAsChangedState();
    }

    private renderDishPlate() {
        if(this.isCooking) {
            if(!this._dishPlate) {
                const h = 20;
                const position = new Phaser.Math.Vector2(
                    this.position.x,
                    this.position.y - h
                )
                this._dishPlate = new DishPlate(this.getCookingDish());
                this._dishPlate.setPosition(position.x, position.y) ;
                this._dishPlate.setDepth(position.y + h);
                this._dishPlate.setState(DishPlateState.COOKING);
            }
            this._dishPlate.setPercentage(this.getCookingProgress());
        } else {
            if(this._dishPlate) {
                this._dishPlate.destroy()
                this._dishPlate = undefined
            }
        }
    }

    public onPointerUp() {
        super.onPointerUp();

        if(this.world.sync == SyncType.SYNC) {
            this.startCookingSomething();
            return;
        }


        if(!this.isCooking) {
            const cheff = this.world.getPlayerCheff();

            this.setTransparent(true);

            cheff.taskWalkNearToTile(this.tile);
            cheff.taskPlaySpecialAction('look_to_tile', [this.tile.x, this.tile.y]);
            cheff.taskPlayAnimation('Eat', 500);
            cheff.taskExecuteAction(async () => {
                this.startCookingSomething();

                this.setTransparent(false);
            })
        }

        
       

        /*
        
        cheff.taskExecuteAction(async () => {
            this.startCookingSomething();
        })
        */
        

        
    }

    public startCook(dish: Dish) {
        this._data.cookingDish = dish.id;
        this._data.cookTime = 0;

        this.setAsChangedState();
    }

    public startCookingSomething() {
        Debug.log("stove startCookingSomething");
        this.log("stove startCookingSomething");

        const dishFactory = this.world.game.dishFactory;

        const serveDish1 = false;
        const food = dishFactory.getDish(this.tmpCookDish);

        this.world.events.emit(WorldEvent.TILE_ITEM_STOVE_START_COOK, this, food);
        
        if(this.world.sync == SyncType.SYNC) {
            return;
        }

        this.startCook(food);

    }

    public getCookingProgress() {
        if(!this._data.cookingDish) return 0;
        const cookTime = this._data.cookTime;
        return Phaser.Math.Clamp(cookTime / this.getCookingDish().cookTime, 0, 1);
    }

    public getCookingDish() {
        return this.world.game.dishFactory.getDish(this._data.cookingDish!);
    }

    private sendDishToCounter() {
        const counters = this.getAvaliableCounters();

        if(counters.length == 0) return false;

        const counter = counters[0];
        counter.addDish(this.getCookingDish());

        counter.setAsChangedState();

        return true;
    }

    //move function
    private getAvaliableCounters() {
        let countersSameDish: TileItemCounter[] = [];
        let counters = this.world.getCounters();

        counters = counters.filter(counter => {
            if(counter.isEmpty) return true;

            if(counter.getDish().id == this.getCookingDish().id) {
                countersSameDish.push(counter);
                return true;
            }

            return false;
        })

        if(countersSameDish.length > 0) return countersSameDish;
        return counters;
    }

    public destroy() {
        super.destroy();

        this._dishPlate?.destroy();
        this._dishPlate = undefined;
    }

    public serializeData() {
        return this._data;
    }

    public unserializeData(data: StoveData) {
        this._data = data;
    };
}