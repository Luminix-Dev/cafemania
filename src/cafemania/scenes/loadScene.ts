import { Debug } from "../debug/debug";

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

    constructor() {
        super({});
        LoadScene.Instance = this;

        window['LoadScene'] = LoadScene;
    }

    public create() {
        this._loadingBar = this.add.graphics();
        this._text = this.add.text(0, 0, '');
    }

    public update(time: number, delta: number) {
        this.updateLoadingBar();
    }

    public async loadAll() {
        Debug.log("begin load");
        
        return new Promise<void>(async (resolve) => {

            var i = 0;
        
            for (const task of this._loadTasks) {
                this._title = task.name;
                Debug.log(task.name);
                this.updateLoadingBar();
                await task.fn();
                i++;
                this.setProgress(i / this._loadTasks.length)
                this.updateLoadingBar();
            }

            resolve();
        })
    }

    public addLoadTask(name: string, fn: () => Promise<void>) {
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