import { Dish } from "../../dish/dish";
import { DishPlate, DishPlateState } from "../../dish/dishPlate";
import { Tile } from "../../tile/tile"
import { TileItem } from "../tileItem"
import { TileItemInfo } from "../tileItemInfo";

export interface TableData {
    dish?: string
    currentEatTime: number
    maxEatTime: number
}

export class TileItemTable extends TileItem {
    public isWaitingForDish: boolean = false;

    private _dishPlate?: DishPlate
    
    private _data: TableData = {
        dish: undefined,
        currentEatTime: 20000,
        maxEatTime: 20000
    }

    public get isEmpty() { return this._data.dish == undefined; }
    public get currentEatTime() { return this._data.currentEatTime; }
    public set currentEatTime(value: number) { this._data.currentEatTime = value; }
    public get maxEatTime() { return this._data.maxEatTime; }
    public set maxEatTime(value: number) { this._data.maxEatTime = value; }

    constructor(tileItemInfo: TileItemInfo) {
        super(tileItemInfo);
        this.defaultCollisionValue = true;
    }

    public getDish() {
        return this.world.game.dishFactory.getDish(this._data.dish!)
    }

    public update(dt: number) {
        super.update(dt);
    }
 
    public render(dt: number) {
        super.render(dt);

        this.debugText.setTextLine('dish', `${this._data.dish}`);
        this.debugText.setTextLine('eat', `${(this._data.currentEatTime / this._data.maxEatTime).toFixed(2)}`);
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

            this._dishPlate.setState(DishPlateState.EATING);
            this._dishPlate.setPercentage( (1 - Math.max(0, this._data.currentEatTime / this._data.maxEatTime))  );
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