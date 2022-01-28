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
    preload: boolean
}

export class AssetManager {
    public static ASSETS_URL = "";

    private static _assets = new Phaser.Structs.Map<string, Asset>([]);
    private static _isPreload: boolean = true;

    public static initPreloadAssets() {
        this.addImage('background', 'background.png');
        this.addImage('loading_background', 'loading_background.png');
        this.addImage('sign', 'sign.png');
    }

    public static initAssets() {
        this._isPreload = false;

        this.addImage('wallMask', 'wallMask.png');
        this.addImage('tile', 'tile.png');
        this.addImage('tile2', 'tile2.png');
        this.addImage('panel', 'panel.png');
        
        this.addImage('button/panel/gift', 'button/panel/gift.png');
        this.addImage('button/panel/waiter', 'button/panel/waiter.png');
        this.addImage('button/panel/shop', 'button/panel/shop.png');
        this.addImage('button/panel/clothes', 'button/panel/clothes.png');
        this.addImage('button/panel/stove', 'button/panel/stove.png');
        this.addImage('button/panel/counter', 'button/panel/counter.png');
        this.addImage('button/panel/table', 'button/panel/table.png');
        this.addImage('button/panel/none', 'button/panel/none.png');

        this.addImage('button/button1', 'button/button1.png');
        this.addImage('button/button_small_green', 'button/button_small_green.png');
        this.addImage('button/zoom_in', 'button/zoom_in.png');
        this.addImage('button/zoom_out', 'button/zoom_out.png');
        this.addImage('button/fullscreen', 'button/fullscreen.png');

        this.addImage('button/signin_google', 'button/signin_google.png');
        this.addImage('button/signin_guest', 'button/signin_guest.png');
        this.addImage('button/signout', 'button/signout.png');
        this.addImage('button/play', 'button/play.png');
        
        this.addImage('messagebox/1', 'messagebox/1.png');
        this.addImage('messagebox/1_bottom', 'messagebox/1_bottom.png');
        
        this.addImage('player/eye', 'player/eye.png');
    }

    public static getPreloadAssets() {
        return this._assets.values().filter(asset => asset.preload == true);
    }

    public static getAssets(type?: AssetType) {
        if(type == undefined) {
            return this._assets.values();
        }
        return this._assets.values().filter(asset => asset.type == type && asset.preload == false);
    }

    public static addImage(key: string, texture: string) {
        const asset: Asset = {
            key: key,
            path: texture,
            loadState: LoadState.NOT_LOADED,
            type: AssetType.IMAGE,
            preload: this._isPreload
        }

        this._assets.set(key, asset);

        return asset;
    }



    public static addAudio(key: string, path: string) {
        console.log("> added autdio")

        const asset: Asset = {
            key: key,
            path: path,
            loadState: LoadState.NOT_LOADED,
            type: AssetType.AUDIO,
            preload: this._isPreload
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