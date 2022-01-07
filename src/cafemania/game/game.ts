import Phaser from 'phaser';
import { BaseObject } from '../baseObject/baseObject';
import { Debug } from '../debug/debug';
import { DishFactory } from '../dish/dishFactory';
import { TileItemFactory } from '../tileItem/tileItemFactory';
import { World } from '../world/world';

export class Game extends BaseObject {
    public events = new Phaser.Events.EventEmitter();
    public get worlds() { return this._worlds.values(); }
    public get tileItemFactory() { return this._tileItemFactory; }
    public get dishFactory() { return this._dishFactory; }
    
    private _worlds = new Phaser.Structs.Map<string, World>([]);
    private _tileItemFactory: TileItemFactory;
    private _dishFactory: DishFactory;

    constructor() {
        super();
        this._tileItemFactory = new TileItemFactory();
        this._dishFactory = new DishFactory();
        this.init();
    }

    public init() {
        this.log('init');
    }

    private startIntervalUpdate() {
        
    }

    public start() { 
        this.log('start');

        console.log("interval update")

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