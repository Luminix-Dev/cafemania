import { Camera } from "../camera/camera";
import { Gameface } from "../gameface/gameface";
import { Grid } from "../grid/grid"
import { GameScene } from "./gameScene";

export class HudScene extends Phaser.Scene {
    public static grid: Grid

    public static Instance: HudScene;

    constructor() {
        super({});
        HudScene.Instance = this;
    }

    public preload() {
        this.load.setPath('/static/cafemania/assets');
        this.load.image('button/zoom_in', 'button/zoom_in.png');
        this.load.image('button/zoom_out', 'button/zoom_out.png');
        this.load.image('button/fullscreen', 'button/fullscreen.png');
    }

    public create() {
        this.createZoomButtons();
    }

    private createZoomButtons() {
        const zoomIn = this.add.sprite(0, 0, 'button/zoom_in')
        const zoomOut = this.add.sprite(0, 0, 'button/zoom_out')
        const fullscreen = this.add.sprite(0, 0, 'button/fullscreen')
        const test = this.add.sprite(0, 0, 'button/fullscreen')

        zoomIn.setInteractive()
        zoomOut.setInteractive()
        fullscreen.setInteractive()
        test.setInteractive()

        const gameScene = GameScene.Instance

        let state = false;

        zoomIn.on('pointerdown', () => Camera.setZoom(1))
        zoomOut.on('pointerdown', () => Camera.setZoom(0.5))
        fullscreen.on('pointerdown', this.goFullscreen.bind(this))
        test.on('pointerdown', () => {
            state = !state;
            Gameface.Instance.game.worlds[0].setFloorAndWallsCollision(state);
        })

        const updateButtonsPosition = () => {
            const x = this.game.scale.gameSize.width - 35

            const y = 200
            const o = 55

            zoomIn.setPosition(x, y + o)
            zoomOut.setPosition(x, y + o*2)
            fullscreen.setPosition(x, y + o*3)
            test.setPosition(x, y + o*5)
        }

        this.events.on("resize", () => updateButtonsPosition())

        updateButtonsPosition()
    }

    private goFullscreen() {
        Gameface.Instance.toggleFullscreen();
    }
}