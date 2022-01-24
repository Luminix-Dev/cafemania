import { Network } from "../network/network";

enum LoadState {
    NOT_LOADED,
    LOADING,
    LOADED
}

export enum AssetType {
    IMAGE,
    AUDIO
}

interface Asset {
    key: string
    path: string
    loadState: LoadState
    type: AssetType
}

export class AssetManager {
    public static ASSETS_URL = "";

    private static _assets = new Phaser.Structs.Map<string, Asset>([]);

    public static initAssets() {
        this.addImage('wallMask', 'wallMask.png');
        this.addImage('tile', 'tile.png');
        this.addImage('tile2', 'tile2.png');
        this.addImage('button/button1', 'button/button1.png');
        this.addImage('button/button_small_green', 'button/button_small_green.png');
        this.addImage('button/zoom_in', 'button/zoom_in.png');
        this.addImage('button/zoom_out', 'button/zoom_out.png');
        this.addImage('button/fullscreen', 'button/fullscreen.png');

        this.addImage('messagebox/1', 'messagebox/1.png');
        this.addImage('messagebox/1_bottom', 'messagebox/1_bottom.png');
        
        this.addImage('player/eye', 'player/eye.png');

        
    }

    public static getAssets(type: AssetType) {
        return this._assets.values().filter(asset => asset.type == type);
    }

    public static addImage(key: string, texture: string) {
        const asset: Asset = {
            key: key,
            path: texture,
            loadState: LoadState.NOT_LOADED,
            type: AssetType.IMAGE
        }

        this._assets.set(key, asset);
    }

    public static addAudio(key: string, path: string) {
        const asset: Asset = {
            key: key,
            path: path,
            loadState: LoadState.NOT_LOADED,
            type: AssetType.AUDIO
        }

        this._assets.set(key, asset);
    }

    public static init() {
        if(location.host.includes('localhost') || location.host.includes(':')) {
            this.ASSETS_URL = `${location.protocol}//${location.host}/assets/`;
        } else {
            this.ASSETS_URL = `${Network.SERVER_ADDRESS}/assets/`;
        }
        console.log(this.ASSETS_URL)
    }
}