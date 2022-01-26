import { AssetManager } from "../assetManager/assetManager";
import { Debug } from "../debug/debug";
import { Gameface } from "../gameface/gameface";
import { DebugScene } from "./debugScene";

enum LoadAssetType {
    IMAGE,
    AUDIO,
    TASK
}

interface LoadAsset {
    text: string
    type: LoadAssetType
    key?: string
    url?: string
    taskFn?: () => Promise<void>
}

export enum LoadSceneType {
    NONE,
    PROGRESS,
    SIGN
}

export class LoadScene extends Phaser.Scene {
    public static Instance: LoadScene;

    public onProgress?: (progress: number, text: string) => void;
    
    public get loader() { return this.load; }

    private _onCreateCallback?: (loadScene: LoadScene) => void;
    private _loadAssetsIndexes = new Map<string, number>();
    private _loadAssets: LoadAsset[] = [];
    private _totalLoadedAssets: number = 0;

    private _loadText?: Phaser.GameObjects.Text;
    private _percentageText?: Phaser.GameObjects.Text;

    private _type: LoadSceneType = LoadSceneType.NONE;

    constructor() {
        super({});
        LoadScene.Instance = this;
        window['LoadScene'] = LoadScene;
    }

    public static createScene(type: LoadSceneType, callback: () => void) {

        if(Gameface.Instance.hasSceneStarted(LoadScene)) {
            console.log(`[loadScene] removing scene`)
            Gameface.Instance.removeScene(LoadScene);
        }

        console.log(`[loadScene] creating loadScene...`)

        Gameface.Instance.phaser.scene.add('LoadScene', LoadScene, true, {type: type, oncreate: callback});
    }

    public static removeScene() {
        LoadScene.Instance?.scene.remove();
    }

    public init(data) {
        if(data.type) this._type = data.type;
        if(data.oncreate) this._onCreateCallback = data.oncreate;
    }

    public create() {
        const self = this;
        const loader = this.loader;

        loader.setPath(AssetManager.ASSETS_URL);
        loader.on('filecomplete', function(key, type, data) {
            const index = self._loadAssetsIndexes.get(key);

            if(index != undefined) {
                const loadAsset =  self._loadAssets[index];

                self.onAssetFinishLoad(loadAsset);
            }
        });

        //

        const gameSize = this.scale.gameSize;

        const x = gameSize.width/2;
        const y = gameSize.height/2;

        if(this._type == LoadSceneType.PROGRESS) {
            const bg = this.add.image(x, y, 'loading_background');
            bg.setScale(.9);

            const loadText = this._loadText = this.add.text(x, y + 180, "Loading", {fontFamily: 'AlfaSlabOne-Regular', color: "#FFFFFF"});
            loadText.setFontSize(18);
            loadText.setStroke("#55330D", 10)
            loadText.setOrigin(0.5)
    
            const percentageText = this._percentageText = this.add.text(x, y + 260, "0%", {fontFamily: 'AlfaSlabOne-Regular', color: "#FCE909"});
            percentageText.setFontSize(30);
            percentageText.setStroke("#55330D", 10)
            percentageText.setOrigin(0.5)

            
        }
        
        if(this._type == LoadSceneType.SIGN) {
            const sign = this.add.image(x, y, 'sign');
            sign.setScale(0.7)

            const loadText = this._loadText = this.add.text(x, y, "Loading\n...", {align: 'center', fontFamily: 'AlfaSlabOne-Regular', color: "#FFFFFF"});
            loadText.setFontSize(26);
            loadText.setStroke("#000000 ", 10)
            loadText.setOrigin(0.5);
        }

        //

        this.scene.bringToTop();

        this._onCreateCallback?.(this);
    }

    public update(time: number, delta: number) {
    }

    private onAssetFinishLoad(loadAsset: LoadAsset) {
        this._totalLoadedAssets++;

        const progress = this._totalLoadedAssets / this._loadAssets.length;
        const text = loadAsset.text;

        console.log(`[gameScene] loadAsset ${loadAsset.key} completed ( ${this._totalLoadedAssets} / ${this._loadAssets.length} )`);

        console.log(progress)

        this._loadText?.setText(text);
        this._percentageText?.setText(`${(progress * 100).toFixed(0)}%`);

        this.onProgress?.(progress, text);
    }

    public async startLoadingAssets(callback: () => void) {
        console.log(`[gameScene] startLoadingAssets`);

        console.log(this._loadAssets)

        const loader = this.loader;
        const indexes = this._loadAssetsIndexes;

        for (const loadAsset of this._loadAssets) {
            if(loadAsset.type == LoadAssetType.TASK) continue;

            const key = loadAsset.key!;
            const url = loadAsset.url!;

            indexes.set(key, this._loadAssets.indexOf(loadAsset));

            if(loadAsset.type == LoadAssetType.IMAGE) loader.image(key, url);
            if(loadAsset.type == LoadAssetType.AUDIO) loader.audio(key, url);
        }

        loader.once('complete', async () => {

            for (const loadAsset of this._loadAssets) {
                if(loadAsset.type == LoadAssetType.TASK) {
                    await loadAsset.taskFn?.();
                    this.onAssetFinishLoad(loadAsset);
                }
            }


            console.log(`[gameScene] completed`);

            

            this._loadAssetsIndexes.clear();
            this._loadAssets = [];
            this._totalLoadedAssets = 0;

            callback();
        });
        loader.start();
    }



    public loadImage(key: string, url: string) {
        console.log(`[loader] load image '${key}'`);

        const asset: LoadAsset = {
            text: `Loading image ${key}`,
            key: key,
            url: url,
            type: LoadAssetType.IMAGE
        }
        this._loadAssets.push(asset);
    }

    public loadAudio(key: string, url: string) {
        console.log(`[loader] load audio '${key}'`);

        const asset: LoadAsset = {
            text: `Loading audio ${key}`,
            key: key,
            url: url,
            type: LoadAssetType.AUDIO
        }
        this._loadAssets.push(asset);
    }

    public loadTask(text: string, fn: () => Promise<void>) {
        console.log(`[loader] add load task '${text}'`);

        const asset: LoadAsset = {
            text: text,
            type: LoadAssetType.TASK,
            taskFn: fn
        }
        this._loadAssets.push(asset);
    }
}