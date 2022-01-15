import { Clothing } from "./clothing";

export class ClothingFactory {
    private _clothingList: {[id: string]: Clothing} = {};

    constructor() {
        this.init();
    }

    private init() {
        this.createClothing({
            id: "dish1",
            name: "Dish 1",
            texture: ""
        });
    }

    public createClothing(dish: Clothing) {
        this._clothingList[dish.id] = dish;
    }

    public getClothingList() {
        return this._clothingList;
    }

    public getClothing(id: string) {
        if(!this.hasClothing(id)) throw `Invalid Clothing ID '${id}'`;
        return this._clothingList[id];
    }

    public hasClothing(id: string) {
        return this._clothingList[id] != undefined;
    }
}