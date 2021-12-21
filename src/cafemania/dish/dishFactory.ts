import { Dish } from "./dish"

export class DishFactory {
    private _dishList: {[id: string]: Dish} = {};

    constructor() {
        this.init();
    }

    private init() {
        this.createDish({
            id: "dish1",
            name: "Dish 1",
            cookTime: 3000,
            texture: "dish1",
            servings: 3,
            frames: {
                cooking: 2,
                eating: 2
            }
        });

        this.createDish({
            id: "dish2",
            name: "Dish 2",
            cookTime: 3000,
            texture: "dish2",
            servings: 3,
            frames: {
                cooking: 2,
                eating: 2
            }
        });
    }

    public createDish(dish: Dish) {
        this._dishList[dish.id] = dish;
    }

    public getDishList() {
        return this._dishList;
    }

    public getDish(id: string) {
        if(!this.hasDish(id)) throw `Invalid Dish ID '${id}'`;
        return this._dishList[id];
    }

    public hasDish(id: string) {
        return this._dishList[id] != undefined;
    }
}