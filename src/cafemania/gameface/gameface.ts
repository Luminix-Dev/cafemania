import { BaseObject } from "../baseObject/baseObject";
import { Game } from "../game/game";
import { Network } from "../network/network";
import { DebugScene } from "../scenes/debugScene";
import { LoadScene } from "../scenes/loadScene";
import { config } from "./config";

enum PreloadState {
    NOT_LOADED,
    LOADING_PHASER,
    LOADING_GAME,
    COMPLETED
}

export class Gameface extends BaseObject {
    public static Instance: Gameface;

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

        this.events.on("preload_finish", () => {
            this.log('preload_finish');
            this.onReady();
        })
        
        this.preload();
    }

    private onReady() {
        this.phaser.scene.add('DebugScene', DebugScene, true) as DebugScene;

        const loadScene = this.phaser.scene.add('LoadScene', LoadScene, true, {a: 123}) as LoadScene;

        this.network.connect(() => {
            this.log("network connected")
        });

        loadScene.startLoad(() => {
            this.log("loaded")
        });
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
            this._phaser = new Phaser.Game(config);
            this._phaser.events.once('ready', () => {
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
}