import { Camera } from "../camera/camera";
import { Gameface } from "../gameface/gameface";
import { PACKET_TYPE } from "../network/packet";
import { DebugScene } from "../scenes/debugScene";
import { GameScene } from "../scenes/gameScene";
import { ServersListScene } from "../scenes/serverListScene";
import { Button } from "../ui/button";
import { GridLayout } from "../ui/gridLayout";
import { Panel } from "../ui/panel";

export class Hud {

    public static init() {

    }


    public static createHud() {
        this.createMainPanel();
        this.createSideButtons();

        const sheet = GameScene.Instance.add.image(0, 0, "PlayerSpriteTexture_NoTexture")
        sheet.setDepth(1000)
        sheet.setOrigin(0.5, 1)
        sheet.setPosition(0, -300);
    }

    private static createMainPanel() {
        const width = 760;
        const height = 150;
        const gameSize = GameScene.Instance.scale;

        const panel = new Panel(GameScene.Instance, width, height);

        panel.addTab("button/panel/waiter")
        panel.addTab("button/panel/waiter")

        panel.addButton("button/panel/gift")
        panel.addButton("button/panel/gift")
        panel.addButton("button/panel/gift")

        panel.container.setPosition(gameSize.width/2 - width/2, gameSize.height - height - 5);

        GameScene.Instance.hudContainer.add(panel.container);
    }

    private static createSideButtons() {
        const buttonSize = new Phaser.Math.Vector2(150, 35);
        const gameSize = GameScene.Instance.scale;

        const gridLayout = new GridLayout(GameScene.Instance, buttonSize.x + 10, 200, buttonSize.x, buttonSize.y, 0, 10);
        gridLayout.setItemsPerPage(1, 4);
        gridLayout.container.setPosition(gameSize.width - buttonSize.x - 20, 10);
        GameScene.Instance.hudContainer.add(gridLayout.container);

        //

        let sideButtons = 0;
        const addSideButton = (button: Button) => {
            const position = gridLayout.getItemCenterPosition(0, sideButtons);
            button.container.setPosition(position.x, position.y)
            gridLayout.container.add(button.container);

            sideButtons++;
            return button;
        }

        //

        let zoom = 1;

        const zoomInButton = addSideButton(Hud.addButton("zoom in", 0, 0, buttonSize.x, buttonSize.y));
        zoomInButton.onClick = () => Camera.setZoom(zoom += 0.2);
        

        const zoomOutButton = addSideButton(Hud.addButton("zoom out", 0, 0, buttonSize.x, buttonSize.y));
        zoomOutButton.onClick = () => Camera.setZoom(zoom -= 0.2);

        const debugButton = addSideButton(Hud.addButton("debug", 0, 0, buttonSize.x, buttonSize.y));
        debugButton.onClick = () => {
            DebugScene.Instance.showDebugText = !DebugScene.Instance.showDebugText;
        }

        const serverListButton = addSideButton(Hud.addButton("server list", 0, 0, buttonSize.x, buttonSize.y));
        serverListButton.onClick = () => this.goBackToServerList();
    }

    private static goBackToServerList() {
        if(Gameface.Instance.hasSceneStarted(ServersListScene)) {
            console.log("cannot go back")
            return;
        }

        Gameface.Instance.network.sendLeaveServer();
       
        //Gameface.Instance.setHudVisible(false);
        Gameface.Instance.destroyGameScene()
        Gameface.Instance.game.removeWorlds();

        
        Gameface.Instance.startScene(ServersListScene);
        Gameface.Instance.network.sendLeaveServer();

        
        

        return;

        Gameface.Instance.game.removeWorlds();
        Gameface.Instance.destroyGameScene();
        //Gameface.Instance.startMainScene();

        Gameface.Instance.network.send(PACKET_TYPE.LEAVE_WORLD, null);
    }

    public static addButton(text: string, x: number, y: number, width: number, height: number, texture?: string, offset?: number) {

        if(!texture) texture = "button/button1";
        if(!offset) offset = 16;

        const button = new Button(GameScene.Instance, x, y, width, height, texture, offset, text);

        GameScene.Instance.hudContainer.add(button.container);

        return button;
    }

}