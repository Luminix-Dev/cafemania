import { Dish } from "../../dish/dish";
import { DishPlate } from "../../dish/dishPlate";
import { Tile } from "../../tile/tile"
import { TileItem } from "../tileItem"

export interface TableData {
    dish?: string
    eatTime: number
}

export class TileItemTable extends TileItem {
    public isWaitingForDish: boolean = false;

    private _dishPlate?: DishPlate
    
    private _data: TableData = {
        dish: undefined,
        eatTime: 20000
    }

    public get isEmpty() { return this._data.dish == undefined; }
    public get eatTime() { return this._data.eatTime; }
    public set eatTime(value: number) { this._data.eatTime = value; }


    public getDish() {
        return this.world.game.dishFactory.getDish(this._data.dish!)
    }

    public update(dt: number) {
        super.update(dt);
    }
 
    public render(dt: number) {
        super.render(dt);

        this.debugText.setTextLine('dish', `${this._data.dish}`);
        this.debugText.setTextLine('eat', `${(this._data.eatTime / 1000).toFixed(1)}`);
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

    public clearDish() {
        this._data.dish = undefined;
        this.setAsChangedState();
    }

    public setDish(dish: Dish) {
        console.log("set dish")

        this._data.dish = dish.id;

        this.setAsChangedState();
    }

    public serializeData() {
        return this._data;
    }

    public unserializeData(data: TableData) {

        if(this.isWaitingForDish) return;

        this._data = data;
    };

    public destroy() {
        super.destroy();
    }

    public destroyVisuals() {
        super.destroyVisuals();

        this._dishPlate?.destroy();
        this._dishPlate = undefined;
    }
}