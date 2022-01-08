import * as NineSlicePlugin from 'phaser3-nineslice'
import { config } from "./config";

enum PreloadState {
    NOT_LOADED,
    LOADING,
    COMPLETED
}

export class PhaserLoad {
    private static _loadState: PreloadState = PreloadState.NOT_LOADED;
    private static _callback?: (phaser: Phaser.Game) => void;
    private static _phaser?: Phaser.Game;

    public static load(callback: (phaser: Phaser.Game) => void) {
        this._callback = callback;
        this.processLoad();
    }

    private static processLoad() {
        console.log("processLoad", this._loadState)

        if(this._loadState == PreloadState.NOT_LOADED) {
            this._loadState = PreloadState.LOADING;

            const cfg = config;
            cfg.plugins = {
                global: [
                    NineSlicePlugin.Plugin.DefaultCfg
                ]
            }

            const phaser = this._phaser = new Phaser.Game(cfg);
            phaser.events.once('ready', () => {
                this.processLoad();
            });
            return;
        }

        this._loadState = PreloadState.COMPLETED;

        this._callback?.(this._phaser!);
        this._callback = undefined;
    }
}