export class LoadScene extends Phaser.Scene {
    public static Instance: LoadScene;

    private _loadingBar: Phaser.GameObjects.Graphics;
    private _loadingBarProgress = 0.1;
    private _loadingBarSize = new Phaser.Structs.Size(500, 30);

    constructor() {
        super({});
        LoadScene.Instance = this;

        window['LoadScene'] = LoadScene;
    }

    public preload() {
        this.load.setPath('cafemania/assets');
        this.load.image('button/zoom_in', 'button/zoom_in.png');
        this.load.image('button/zoom_out', 'button/zoom_out.png');
        this.load.image('button/fullscreen', 'button/fullscreen.png');
    }

    public create() {
        this._loadingBar = this.add.graphics();
    }

    public update(time: number, delta: number) {
        this.updateLoadingBar();
    }

    public startLoad(callback: () => void) {
        callback();
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
    }
}