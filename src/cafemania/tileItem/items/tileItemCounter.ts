import { Dish } from "../../dish/dish"
import { DishPlate } from "../../dish/dishPlate"
import { Tile } from "../../tile/tile"
import { TileItem } from "../tileItem"


export interface CounterData {
    dish?: string
    amount: number
}

export class TileItemCounter extends TileItem {
    public get isEmpty() { return this._data.dish == null; }

    private _data: CounterData = {
        dish: undefined,
        amount: 0
    }
    private _dishPlate?: DishPlate;

    public amountWaitersComing: number = 0;

    public onCreateTileItemRender() {
        super.onCreateTileItemRender();
        this.setCollisionEnabled(true);
    }

    public render(dt: number) {
        super.render(dt);

        this.debugText.setTextLine('dish', `${this._data.dish}`);
        this.debugText.setTextLine('amt', `${this._data.amount} (${Math.abs(this._data.amount - this.amountWaitersComing)})`);
        this.renderDishPlate();
    }

    private renderDishPlate() {
        if(!this.isEmpty) {
            if(!this._dishPlate) {
                const h = 20;
                const position = new Phaser.Math.Vector2(
                    this.position.x,
                    this.position.y - h
                )
                this._dishPlate = new DishPlate(this.getDish());
                this._dishPlate.setPosition(position.x, position.y) ;
                this._dishPlate.setDepth(position.y + h);
            }
        } else {
            if(this._dishPlate) {
                this._dishPlate.destroy()
                this._dishPlate = undefined
            }
        }
    }

    public getDishAmount() { return this._data.amount; }

    public addDishAmount(amount: number) {
        this._data.amount += amount;

        if(this._data.amount <= 0) {
            this._data.amount = 0;
            this._data.dish = undefined;
        }
    }

    public addDish(dish: Dish) {
        if(this.isEmpty)  {
            this.setDish(dish);
            return;
        }

        this.addDishAmount(dish.servings)
    }

    public getDish() {
        return this.world.game.dishFactory.getDish(this._data.dish!)
    }

    public setDish(dish: Dish, amount?: number) {
        this._data.dish = dish.id;
        this._data.amount = 0;
        
        this.addDishAmount(amount == undefined ? dish.servings : amount);
    }
    
    public serializeData() {
        return this._data;
    }

    public unserializeData(data: CounterData) {
        this._data = data;
    }

    public destroy() {
        super.destroy();

        this._dishPlate?.destroy();
        this._dishPlate = undefined;
    }
}