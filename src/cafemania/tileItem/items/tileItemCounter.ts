import { Dish } from "../../dish/dish"
import { DishPlate } from "../../dish/dishPlate"
import { GameScene } from "../../scenes/gameScene";
import { Tile } from "../../tile/tile"
import { MessageBox } from "../../ui/messageBox";
import { TileItem } from "../tileItem"
import { TileItemInfo } from "../tileItemInfo";


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


    private _updateTime: number = 0;
    private _newAmount: number | undefined;

    constructor(tileItemInfo: TileItemInfo) {
        super(tileItemInfo);
        this.defaultCollisionValue = true;
    }

    public update(dt: number) {
        super.update(dt);

        this._updateTime += dt;


        if(this._updateTime >= 500 && this._newAmount != undefined) {
            console.log(this._updateTime)
            console.log(this._data.amount, 'to', this._newAmount)

            this._updateTime = 0;
            this._data.amount = this._newAmount;
            this._newAmount = undefined;
        }
    }

    public resetUpdateTimer() {
        this._updateTime = 0;
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

        const oldAmount = this._data.amount;
        this._newAmount = data.amount;
        
        this._data = data;
        this._data.amount = oldAmount;
    }

    public destroy() {
        super.destroy();
    }

    public destroyVisuals() {
        super.destroyVisuals();

        this._dishPlate?.destroy();
        this._dishPlate = undefined;
    }

    public onPointerOut() {
        super.onPointerOut();

        GameScene.Instance.remomveMessageBoxAboveTileItem(); 
    }

    public onPointerOver() {
        super.onPointerOver();

        const messageBox = new MessageBox(GameScene.Instance, this.position.x, this.position.y - 45, 200, 70, '1', (22-7));
        GameScene.Instance.setMessageBoxAboveTileItem(messageBox); 
    }
}