import { BaseObject } from "../baseObject/baseObject";
import { Camera } from "../camera/camera";
import { Debug } from "../debug/debug";
import { Game } from "../game/game";
import { Input } from "../input/input";
import { Network } from "../network/network";
import { GameScene } from "../scenes/gameScene";
import { MainScene } from "../scenes/mainScene";
import { MoveTileItem } from "../shop/moveTileItem";
import { SyncType, World } from "../world/world";
import { WorldSyncHelper } from "../world/worldSyncHelper";
import { config } from "./config";

import * as NineSlicePlugin from 'phaser3-nineslice'
import { DebugScene } from "../scenes/debugScene";
import { MapGridScene } from "../scenes/mapGridScene";
import { HudScene } from "../scenes/hudScene";

enum PreloadState {
    NOT_LOADED,
    LOADING_PHASER,
    LOADING_GAME,
    COMPLETED
}

export class Gameface extends BaseObject {
    public static Instance: Gameface;
    public static ASSETS_URL: string = ""

    public events = new Phaser.Events.EventEmitter();
    public get game() { return this._game; }
    public get phaser() { return this._phaser; }
    public get network() { return this._network; }

    private _game: Game;
    private _phaser: Phaser.Game;
    private _preloadState: PreloadState = PreloadState.NOT_LOADED;
    private _network: Network;

    constructor() {
        super();
        Gameface.Instance = this;
        this._game = new Game();
        this._network = new Network();
    }

    public start() {
        this.log("start");

        if(location.host.includes('localhost') || location.host.includes(':')) {
            Gameface.ASSETS_URL = `${location.protocol}//${location.host}/assets/`;
        } else {
            Gameface.ASSETS_URL = `${Network.SERVER_ADDRESS}/assets/`;
        }
        console.log(Gameface.ASSETS_URL)

        this.events.on("preload_finish", () => {
            this.log('preload_finish');
            this.onFinishPreload();
        })
        
        this.preload();
    }

    private onFinishPreload() {
        this.startMainScene();

        MoveTileItem.init();
    }

    public startMainScene() {
        if(MainScene.Instance) {
            MainScene.Instance.scene.remove();
        }

        this.phaser.scene.add('MainScene', MainScene, true);
    }

    public render(dt: number) {
        Camera.update(dt);
    }

    public toggleFullscreen() {
        if (this.phaser.scale.isFullscreen) {
            this.phaser.scale.stopFullscreen();
            return;
        }
        this.phaser.scale.startFullscreen({})
    }

    private preload() {
        this.log("preload", this._preloadState)

        if(this._preloadState == PreloadState.NOT_LOADED) {
            this._preloadState = PreloadState.LOADING_PHASER;

            const cfg = config;
            cfg.plugins = {
                global: [
                    NineSlicePlugin.Plugin.DefaultCfg
                ]
            }

            this._phaser = new Phaser.Game(cfg);
            this._phaser.events.once('ready', () => {
                this.setupResize();
                this.preload();
            });
            return;
        }

        if(this._preloadState == PreloadState.LOADING_PHASER) { 
            this._preloadState = PreloadState.LOADING_GAME;
            this.game.events.once('ready', () => {
                this.preload();
            });
            this.game.start();
            return;
        } 
        
        this._preloadState = PreloadState.COMPLETED;
        this.events.emit("preload_finish");
    }

    private setupResize() {
        const game = this.phaser;
        const scaleManager = game.scale;

        document.body.style.height = "100%";
        document.body.style.background = "#000000";
        game.canvas.style.width = "100%";
        game.canvas.style.height = "100%";
     
        this.events.on('resize', () => {
            const a = window.innerWidth / window.innerHeight;
            const s = 1;

            if(a < 1) scaleManager.setGameSize(600 * s, 900 * s);
            else scaleManager.setGameSize(1000, 600);
        });

        window.addEventListener('resize', () => {
            this.events.emit('resize');

            //fix weird resize bug
            
        })
        this.events.emit('resize');

        setInterval(() => this.events.emit('resize'), 1000)
    }
    
    public createBaseWorld(isMultiplayer: boolean) {
        const world = this.game.createWorld();

        if(isMultiplayer) {
            world.canSpawnPlayer = false;
            world.sync = SyncType.SYNC;
        } else {
            world.generateBaseWorld();
        }

        this.createGameScene(world);

        return world;
    }

    public createGameScene(world: World) {
        GameScene.initScene(world);
        WorldSyncHelper.setWorld(world);
        MoveTileItem.setWorld(world);

        this.updateScenesOrder();

        Camera.setZoom(1)
    }

    public destroyGameScene() {
        const world = GameScene.Instance.world;
        world.destroyRender();

        GameScene.Instance.scene.remove();
        WorldSyncHelper.setWorld(undefined);
    }

  

    public updateScenesOrder() {
        DebugScene.Instance?.scene.bringToTop();
        MapGridScene.Instance?.scene.bringToTop();
        HudScene.Instance?.scene.bringToTop();
    }
}