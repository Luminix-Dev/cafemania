import { Debug } from "../debug/debug";
import { Gameface } from "../gameface/gameface";
import { DebugScene } from "./debugScene";

interface ILoadTask {
    name: string
    fn: () => Promise<void>
}

export class LoadScene extends Phaser.Scene {
    public static Instance: LoadScene;

    private _text: Phaser.GameObjects.Text;
    private _loadingBar: Phaser.GameObjects.Graphics;
    private _loadingBarProgress = 0;
    private _loadingBarSize = new Phaser.Structs.Size(500, 30);
    private _loadTasks: ILoadTask[] = [];
    private _title: string = "";
    
    private _loader: Phaser.Loader.LoaderPlugin;
    private _amountLoaderAssets: number = 0;
    private _amountLoaderAssetsLoaded: number = 0;
    
    
    private _onCreateCallback?: (loadScene: LoadScene) => void;

    //public get loader() { return this._loader; }

    constructor() {
        super({});
        LoadScene.Instance = this;

        window['LoadScene'] = LoadScene;
    }

    public init(data) {
        console.log(data)
        
        if(data.oncreate) {
            this._onCreateCallback = data.oncreate;
        }
    }

    public create() {
        const self = this;

        this._loader = this.load; //new Phaser.Loader.LoaderPlugin(this);
        this._loader.setPath(Gameface.ASSETS_URL);
        this._loader.on('filecomplete', function(key, type, data) {
            self._title = `Loading '${key}'`;
            self._amountLoaderAssetsLoaded++;

            self.setProgress(self._amountLoaderAssetsLoaded / (self._amountLoaderAssets + self._loadTasks.length));

            console.log(self._amountLoaderAssetsLoaded, '/', (self._amountLoaderAssets + self._loadTasks.length))
        });

        this._loadingBar = this.add.graphics();
        this._text = this.add.text(0, 0, '');

        this._onCreateCallback?.(this);
    }

    public update(time: number, delta: number) {
        this.updateLoadingBar();
    }

    public async loadAll() {
        Debug.log("begin load");

        DebugScene.Instance?.updateText();
        
        const loader = this._loader;
        const self = this;

        return new Promise<void>(async (resolve) => {
            
            console.log(self._amountLoaderAssets);

           
            await new Promise<void>((res) => {
                loader.once('complete', (key, type, data) => res());
                loader.start();
            })

            var i = 0;

            for (const task of this._loadTasks) {
                this._title = task.name;
                Debug.log(task.name);
                this.updateLoadingBar();
                await task.fn();
                i++;

      
                this.setProgress((i + self._amountLoaderAssetsLoaded) / (self._amountLoaderAssets + this._loadTasks.length))
                this.updateLoadingBar();

                DebugScene.Instance?.updateText();
            }

            resolve();
        })
    }

    public loadImage(key: string, url: string) {
        console.log(`[loader] load image '${key}'`);

        this._loader.image(key, url);
        this._amountLoaderAssets++;
    }

    public addLoadTask(name: string, fn: () => Promise<void>) {
        console.log(`[loader] add load task '${name}'`);

        this._loadTasks.push({
            name: name,
            fn: fn
        })
    }

    public setProgress(progress: number) {
        this._loadingBarProgress = progress;
    }

    private updateLoadingBar() {
        const loadingBar = this._loadingBar;
        const size = this._loadingBarSize;

        loadingBar.clear();
        loadingBar.fillStyle(0x2a2a2a);
        loadingBar.fillRect(0, 0, size.width, size.height);
        loadingBar.fillStyle(0xffff00);
        loadingBar.fillRect(0, 0, size.width * this._loadingBarProgress, size.height);

        //

        const gameSize = this.game.scale.gameSize;
        const centerPos = new Phaser.Structs.Size(gameSize.width / 2, gameSize.height / 2);

        loadingBar.setPosition(centerPos.width - size.width/2, gameSize.height - size.height - 20);

        const text = this._text;
        text.setPosition(centerPos.width - size.width/2, gameSize.height - size.height - 20 - 20);
        text.setText(this._title);
    }
}