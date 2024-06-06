import Phaser from 'phaser';
import { BaseObject } from '../baseObject/baseObject';
import { Debug } from '../debug/debug';
import { DishFactory } from '../dish/dishFactory';
import { Shop } from '../shop/shop';
import { TileItemFactory } from '../tileItem/tileItemFactory';
import { World } from '../world/world';

export class Game extends BaseObject {
    public events = new Phaser.Events.EventEmitter();
    public get worlds() { return this._worlds.values(); }
    public get tileItemFactory() { return this._tileItemFactory; }
    public get dishFactory() { return this._dishFactory; }
    public get shop() { return this._shop; }
    
    public get gold() { return this._gold }
    public set gold(value: number) { this._gold = value; }
    public get money() { return this._money }
    public set money(value: number) { this._money = value; }
    public get experience() { return this._experience }
    public set experience(value: number) { this._experience = value; }
    
    private _worlds = new Phaser.Structs.Map<string, World>([]);
    private _tileItemFactory: TileItemFactory;
    private _dishFactory: DishFactory;
    private _shop: Shop;

    private _gold: number = 999999;
    private _money: number = 999999;
    private _experience: number = 0;

    constructor() {
        super();
        this._tileItemFactory = new TileItemFactory();
        this._dishFactory = new DishFactory();
        this._shop = new Shop(this);
        this.init();
    }

    public init() {
        this.log('init');
    }

    private startIntervalUpdate() {
        
    }

    public start() { 
        this.log('start');

        if (Debug.consoleLog) console.log("interval update")

        var self = this;
        var lastUpdate = Date.now();
        var myInterval = setInterval(tick, 1);
        function tick() {
            var now = Date.now();
            var dt = now - lastUpdate;
            lastUpdate = now;
        
            if(dt == 0) dt = 0.01;

            self.update(dt);
        }

        this.events.emit("ready");
    }

    public update(dt: number) {
        this.worlds.map(world => world.update(dt))
    }

    public destroy() {
        this.removeWorlds();
    }

    public removeWorlds() {
        this.worlds.map(world => world.destroy());
        this._worlds.clear();
    }

    public createWorld() {
        this.log('create world');

        const world = new World(this);
        return this.addWorld(world);
    }

    public addWorld<T extends World>(world: T) {
        this._worlds.set(world.id, world);
        return world;
    }
}