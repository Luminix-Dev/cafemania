import { Network } from "../network/network";

enum LoadState {
    NOT_LOADED,
    LOADING,
    LOADED
}

interface ImageAsset {
    key: string
    texture: string
    loadState: LoadState
}

export class AssetManager {
    public static ASSETS_URL = "";

    private static _imageAssets = new Phaser.Structs.Map<string, ImageAsset>([]);

    public static initAssets() {
        this.addImage('wallMask', 'wallMask.png');
        this.addImage('tile', 'tile.png');
        this.addImage('tile2', 'tile2.png');
        this.addImage('button/button1', 'button/button1.png');
        this.addImage('button/button_small_green', 'button/button_small_green.png');
        this.addImage('button/zoom_in', 'button/zoom_in.png');
        this.addImage('button/zoom_out', 'button/zoom_out.png');
        this.addImage('button/fullscreen', 'button/fullscreen.png');
        
        this.addImage('player/eye', 'player/eye.png');

        
    }

    public static getImageAssets() {
        return this._imageAssets.values();
    }

    public static addImage(key: string, texture: string) {
        const asset: ImageAsset = {
            key: key,
            texture: texture,
            loadState: LoadState.NOT_LOADED
        }

        this._imageAssets.set(key, asset);
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