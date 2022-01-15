import { BaseObject } from "../baseObject/baseObject";
import { Camera } from "../camera/camera";
import { Debug } from "../debug/debug";
import { Game } from "../game/game";
import { Input } from "../input/input";
import { Network } from "../network/network";
import { GameScene } from "../scenes/gameScene";
import { PreloadScene } from "../scenes/preloadScene";
import { MoveTileItem } from "../shop/moveTileItem";
import { SyncType, World } from "../world/world";
import { WorldSyncHelper } from "../world/worldSyncHelper";
import { DebugScene } from "../scenes/debugScene";
import { MapGridScene } from "../scenes/mapGridScene";
import { HudScene } from "../scenes/hudScene";
import { PhaserLoad } from "./phaserLoad";
import { AssetManager } from "../assetManager/assetManager";
import { MainScene } from "../scenes/mainScene";
import { Button } from "../ui/button";
import { ServerListScene } from "../scenes/serverListScene";
import { Test1Scene } from "../scenes/test1Scene";


export class Gameface extends BaseObject {
    public static Instance: Gameface;

    public events = new Phaser.Events.EventEmitter();
    public get game() { return this._game; }
    public get phaser() { return this._phaser; }
    public get network() { return this._network; }

    private _game: Game;
    private _phaser: Phaser.Game;
    private _network: Network;

    constructor() {
        super();
        Gameface.Instance = this;
        this._game = new Game();
        this._network = new Network();
    }

    public start() {
        this.log("start");

        PhaserLoad.load((phaser) => {
            this._phaser = phaser;
            this.init();
        })

        this.game.start();
    }

    private init() {
        Debug.startedAt = Date.now();

        this.setupResize();

        AssetManager.init();
        AssetManager.initAssets();
        MoveTileItem.init();

        this.startScene(MainScene);
        this.startScene(GameScene);
        this.startScene(PreloadScene);

        Input.addScene(MainScene.Instance);
        Input.addScene(GameScene.Instance);
        

        //Camera.setScene(MainScene.Instance)
        Camera.setupMoveEvents();
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

    public onEnterMainMenu() {

        //this.startScene(Test1Scene);


        //return;

        const isSinglePlayer = false;

    
        const gameface = this;
        const network = this.network;

        if(isSinglePlayer) {
            gameface.createBaseWorld(false);
            //gameface.setHudVisible(true)
            gameface.createHud();
            gameface.updateScenesOrder();
        } else {
            Debug.log("connecting to " + network.getAddress())
            
            network.connect(() => {
                Debug.log("connected");
    
                gameface.startScene(ServerListScene);
                gameface.createHud();
            });
        }
        
    }
    
    public createBaseWorld(isMultiplayer: boolean) {
        const world = this.game.createWorld();

        if(isMultiplayer) {
            world.canSpawnPlayer = false;
            world.sync = SyncType.SYNC;

            WorldSyncHelper.setWorld(world);
        } else {
            world.generateBaseWorld();
        }

        this.createGameScene(world);

        return world;
    }

    public createGameScene(world: World) {
        GameScene.startNewScene(world);
        MoveTileItem.setWorld(world);

        this.updateScenesOrder();

        Camera.setZoom(1)
    }

    public destroyGameScene() {
        WorldSyncHelper.setWorld(undefined);
        
        const world = GameScene.Instance.world;
        world.destroyRender();

        GameScene.Instance.setWorld(undefined);

        //this.removeScene(GameScene);
        
    }

    public createHud() {
        this.startScene(DebugScene);
        this.startScene(MapGridScene);
        this.startScene(HudScene);

        Input.addScene(HudScene.Instance);
    }

    public setHudVisible(visible: boolean) {
        if(visible) {
            //this.startScene(DebugScene);
            //this.startScene(MapGridScene);
            //this.startScene(HudScene);
        } else {
            //this.removeScene(DebugScene);
            //this.removeScene(MapGridScene);
            //this.removeScene(HudScene);
        }
    }

    public updateScenesOrder() {
        DebugScene.Instance?.scene.bringToTop();
        MapGridScene.Instance?.scene.bringToTop();
        HudScene.Instance?.scene.bringToTop();
    }

    public startScene(scene: typeof Phaser.Scene) {
        const phaser = this.phaser;
        const key = scene.name;

        if(this.hasSceneStarted(scene)) {
            this.removeScene(scene);
        }

        const s = this.phaser.scene.add(key, scene, true);
        return s;
    }

    public removeScene(scene: typeof Phaser.Scene) {
        const phaser = this.phaser;
        const key = scene.name;

        console.log("removeScene", key, scene)

        if(this.hasSceneStarted(scene)) {
            const s = phaser.scene.keys[key];
            s.scene.remove();
        }
    }

    public hasSceneStarted(scene: typeof Phaser.Scene) {
        const phaser = this.phaser;
        return phaser.scene.keys[scene.name];
    }
}