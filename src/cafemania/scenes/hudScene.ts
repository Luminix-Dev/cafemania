import { AssetManager } from "../assetManager/assetManager";
import { Camera } from "../camera/camera";
import { Gameface } from "../gameface/gameface";
import { Grid } from "../grid/grid"
import { PACKET_TYPE } from "../network/packet";
import { ServerListInfo } from "../server/server";
import { MenuItem } from "../shop/menu/menuItem";
import { Button } from "../ui/button";
import { GridLayout } from "../ui/gridLayout";
import { GameScene } from "./gameScene";
import { ServerListScene } from "./serverListScene";

export class HudScene extends Phaser.Scene {
    public static grid: Grid

    public static Instance: HudScene;

    constructor() {
        super({});
        HudScene.Instance = this;
    }

    public create() {
        this.createZoomButtons();


        //const menuItem1 = new MenuItem(this);
        //menuItem1.container.setPosition(300, 300);
        
        

        const backBtn = new Button(this, 70, this.scale.height - 40, 100, 35, "button/button1", 16, "Back");
        backBtn.onClick = () => {

            if(Gameface.Instance.hasSceneStarted(ServerListScene)) {

                console.log("cannot go back")
                return;
            }

            Gameface.Instance.network.sendLeaveServer();
           
            //Gameface.Instance.setHudVisible(false);
            Gameface.Instance.destroyGameScene()
            Gameface.Instance.game.removeWorlds();

            
            Gameface.Instance.startScene(ServerListScene)
            Gameface.Instance.network.send(PACKET_TYPE.REQUEST_SERVER_LIST, null);

            
            

            return;

            Gameface.Instance.game.removeWorlds();
            Gameface.Instance.destroyGameScene();
            //Gameface.Instance.startMainScene();

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
        fullscreen.on('pointerdown', this.toggleFullscreen.bind(this))
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

        //this.events.on("resize", () => updateButtonsPosition())

        updateButtonsPosition()

        setInterval(() => {
            updateButtonsPosition()
        }, 1000)
    }

    private toggleFullscreen() {
        Gameface.Instance.toggleFullscreen();
    }
}