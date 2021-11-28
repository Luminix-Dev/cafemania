import Phaser from 'phaser';
import { BaseObject } from '../baseObject/baseObject';
import { Debug } from '../debug/debug';
import { TileItemFactory } from '../tileItem/tileItemFactory';
import { World } from '../world/world';

export class Game extends BaseObject {
    public events = new Phaser.Events.EventEmitter();
    public get worlds() { return this._worlds.values(); }
    public get tileItemFactory() { return this._tileItemFactory; }

    private _worlds = new Phaser.Structs.Map<string, World>([]);
    private _tileItemFactory: TileItemFactory;

    constructor() {
        super();
        this._tileItemFactory = new TileItemFactory();
        this.init();
    }

    public init() {
        this.log('init');
    }

    public start() { 
        this.log('start');

        this.events.emit("ready");
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