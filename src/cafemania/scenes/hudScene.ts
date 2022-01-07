import { Camera } from "../camera/camera";
import { Gameface } from "../gameface/gameface";
import { Grid } from "../grid/grid"
import { PACKET_TYPE } from "../network/packet";
import { Button } from "../ui/button";
import { GameScene } from "./gameScene";

export class HudScene extends Phaser.Scene {
    public static grid: Grid

    public static Instance: HudScene;

    constructor() {
        super({});
        HudScene.Instance = this;
    }

    public preload() {
        this.load.setPath(Gameface.ASSETS_URL);
    }

    public create() {
        this.createZoomButtons();

        

        const backBtn = new Button(this, 70, this.scale.height - 40, 100, 35, "button/button1", "Back");
        backBtn.onClick = () => {

            return;

            Gameface.Instance.game.removeWorlds();
            Gameface.Instance.destroyGameScene();
            Gameface.Instance.startMainScene();

            Gameface.Instance.network.send(PACKET_TYPE.LEAVE_WORLD, null);
        }
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
            Gameface.Instance.game.worlds[0].toggleFloorCollision(state);
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