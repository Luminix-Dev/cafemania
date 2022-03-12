import { BaseObject } from "../baseObject/baseObject";
import { Camera } from "../camera/camera";
import { Debug } from "../debug/debug";
import { Game } from "../game/game";
import { Input } from "../input/input";
import { Network } from "../network/network";
import { GameScene } from "../scenes/gameScene";
import { WorldSyncHelper } from "../world/worldSyncHelper";
import { DebugScene } from "../scenes/debugScene";
import { MapGridScene } from "../scenes/mapGridScene";
import { PhaserLoad } from "./phaserLoad";
import { AssetManager, AssetType } from "../assetManager/assetManager";
import { MainScene } from "../scenes/mainScene";
import { WorldTextManager } from "../worldText/worldTextManager";
import { TileHoverDetection } from "../shop/tileHoverDetection";
import { Hud } from "../hud/hud";
import { SoundManager } from "../soundManager/soundManager";
import { Auth } from "../auth/auth";
import { LoadScene, LoadSceneType } from "../scenes/loadScene";
import { FirstLoadScene } from "../scenes/firstLoadScene";
import { LoginScene } from "../scenes/loginScene";
import { WorldSyncType } from "../world/worldSyncType";
import { World } from "../world/world";
import { TileItemDrag } from "../tileItemDrag/tileItemDrag";
import { GamefaceEvent } from "./gamefaceEvent";


export class Gameface extends BaseObject {
    public static Instance: Gameface;

    public events = new Phaser.Events.EventEmitter();
    public get game() { return this._game; }
    public get phaser() { return this._phaser; }
    public get network() { return this._network; }
    public get currentWorld() { return this._currentWorld; }

    private _game: Game;
    private _phaser: Phaser.Game;
    private _network: Network;

    private _currentWorld?: World;

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

        this.startPreload(() => {

            LoadScene.removeScene();

            this.startScene(GameScene);
            this.startScene(DebugScene);
            this.startScene(MapGridScene);

        
            //const mainScene = this.startScene(MainScene)
    
            this.startFirstLoad(() => {
                Hud.createHud();
                Hud.setVisible(false);

                Input.addScene(GameScene.Instance);
            
                Camera.setupMoveEvents();
                SoundManager.setScene(GameScene.Instance);
                WorldTextManager.init(GameScene.Instance);
                TileHoverDetection.init();
                WorldSyncHelper.init();
                TileItemDrag.init();

                console.log("first load completed")

                //Auth.init();

                this.startScene(LoginScene);
            });
        });

    
        
    }

    private startPreload(callback: () => void) {
        AssetManager.initPreloadAssets();

        LoadScene.createScene(LoadSceneType.NONE, () => {
            const loadScene = LoadScene.Instance;
            
            AssetManager.getPreloadAssets().map(asset => {

                switch(asset.type) {
                    case AssetType.IMAGE:
                        loadScene.loadImage(asset.key, asset.path)
                        break;
                    case AssetType.FONT:
                        loadScene.loadFont(asset.key, asset.path)
                        break;
                }
                
            })

            loadScene.startLoadingAssets(() => {
                callback();
            });
        });
    }


    private startFirstLoad(callback: () => void) {
        AssetManager.initAssets();
        SoundManager.init();
        
        const firstLoadScene = this.startScene(FirstLoadScene) as FirstLoadScene;
        firstLoadScene.startLoad(() => {
            firstLoadScene.scene.remove();

            callback();
        })
    }

    public render(dt: number) {
        Camera.update(dt);  
        WorldTextManager.update(dt);
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

            //if(a < 1) scaleManager.setGameSize(600 * s, 900 * s);
            //else scaleManager.setGameSize(1000, 600);

            scaleManager.setGameSize(1000, 600);
        });

        window.addEventListener('resize', () => {
            this.events.emit('resize');

            //fix weird resize bug
            
        })
        this.events.emit('resize');

        //setInterval(() => this.events.emit('resize'), 1000)
    }
    
    public createBaseWorld(isMultiplayer?: boolean) {
        const world = this.game.createWorld();

        if(isMultiplayer) {
            world.canSpawnPlayer = false;
            world.sync = WorldSyncType.SYNC;
        } else {
            world.generateBaseWorld();
        }

        console.log("start game scene..")

        if(!Gameface.Instance.hasSceneStarted(GameScene)) {
            Gameface.Instance.startScene(GameScene);

            console.log("created new");
        }

        this.setCurrentWorld(world);

        Camera.setZoom(1)
        Hud.setVisible(true);
     
        return world;
    }
    
    private setCurrentWorld(world?: World) {
        this._currentWorld = world;
        //GameScene.Instance.setWorld(undefined);
        this.events.emit(GamefaceEvent.SET_WORLD, world);
    }

    public destroyGameScene() {
        const world = GameScene.Instance.world;
        world.destroyRender();

        this.setCurrentWorld(undefined);
    }

    
    public createHud() {
        return;

        this.startScene(DebugScene);
        //this.startScene(MapGridScene);
        //this.startScene(HudScene);

        //Input.addScene(HudScene.Instance);
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
        GameScene.Instance?.scene.bringToTop();
        FirstLoadScene.Instance?.scene.bringToTop();
        LoadScene.Instance?.scene.bringToTop();
        DebugScene.Instance?.scene.bringToTop();
        MapGridScene.Instance?.scene.bringToTop();
        //HudScene.Instance?.scene.bringToTop();
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