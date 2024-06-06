import { Camera } from "../camera/camera";
import { Gameface } from "../gameface/gameface";
import { Input } from "../input/input";
import { PACKET_TYPE } from "../network/packet";
import { DebugScene } from "../scenes/debugScene";
import { GameScene } from "../scenes/gameScene";
import { ServersListScene } from "../scenes/serverListScene";
import { TileItemCategory, TileItemInfo, TileItemType } from "../tileItem/tileItemInfo";
import { Button } from "../ui/button";
import { GridLayout } from "../ui/gridLayout";
import { GridList } from "../ui/gridList";
import { Panel } from "../ui/panel";
import { TileItemShop } from "../ui/tileItemShop";
import { TileItemShopItem } from "../ui/tileItemShopItem";
import { WorldTextManager } from "../worldText/worldTextManager";
import { HudLockZone } from "./hudLockZone";
import { HudTopStatus } from "./hudTopStatus";
import { HudMainPanel } from "./hudMainPanel";
import { HudShopPanel } from "./hudShopPanel";
import { Debug } from "../debug/debug";



export class Hud {
    public static update(dt: number) {
        HudLockZone.update();

        const gameScene = GameScene.Instance;

        if(!gameScene) return;
        
        const position = Camera.getPosition();
        const gameSize = gameScene.game.scale.gameSize;
        
        
        gameScene.cameras.main.setScroll(
            position.x - gameSize.width / 2,
            position.y - gameSize.height / 2
        );

        const zoom = gameScene.cameras.main.zoom;
        const s = 1/zoom;
        gameScene.hudContainer.setScale(s);
        gameScene.hudContainer.setPosition(
            gameScene.cameras.main.scrollX - ((s-1)*(gameSize.width/2)),
            gameScene.cameras.main.scrollY - ((s-1)*(gameSize.height/2))
        );
    }

    public static setVisible(visible: boolean) {
        GameScene.Instance.hudContainer.visible = visible;
    }
 
    public static createHud() {
        HudTopStatus.create();
        HudMainPanel.create();

        this.createSideButtons();

        //this.createShopPanel();

        /*
        const sheet = GameScene.Instance.add.image(0, 0, "PlayerSpriteTexture_NoTexture")
        sheet.setDepth(1000)
        sheet.setOrigin(0.5, 1)
        sheet.setPosition(0, -300);
        */

        Input.events.on("pointerdown", () => {

            const worldPos = Input.getMouseWorldPosition();
            const screenPos = this.getScreenCoordsFromWorldCoords(worldPos);

            if (Debug.consoleLog) console.log("---")
            if (Debug.consoleLog) console.log(worldPos)
            if (Debug.consoleLog) console.log(screenPos);
            if (Debug.consoleLog) console.log("---")

        })

        //----------
        HudMainPanel.destroy();
        //HudShopPanel.create();
    }

    public static getScreenCoordsFromWorldCoords(worldPosition: Phaser.Math.Vector2) {
        const position = new Phaser.Math.Vector2();
       
        
        const gameScene = GameScene.Instance;
        const gameSize = gameScene.game.scale.gameSize;

        const zoom = gameScene.cameras.main.zoom;
        const s = 1/zoom;
        
        //position.x = worldPosition.x * zoom;
        //position.y = worldPosition.y * zoom;

        position.x += worldPosition.x
        position.y += worldPosition.y

        position.x -= gameScene.cameras.main.scrollX - ((s-1)*(gameSize.width/2));
        position.y -= gameScene.cameras.main.scrollY - ((s-1)*(gameSize.height/2));

        position.x *= zoom;
        position.y *= zoom;

        //position.x -= (gameSize.width/4) * (1-s);
        //position.y -= (gameSize.height/4) * (1-s);



        //position.x -= (gameScene.cameras.main.scrollX - ((s-1)*(gameSize.width/2)));
        //position.y -= (gameScene.cameras.main.scrollY - ((s-1)*(gameSize.height/2)))

        //position.x += gameSize.width/2
        //position.y += gameSize.height/2


 
        return position;
    }

    /*
    private static createShopPanel() {
        const scene = GameScene.Instance;
        const width = 760;
        const height = 250;
        const gameSize = GameScene.Instance.scale;
        const positionX = gameSize.width/2 - width/2;
        const positionY = gameSize.height - height - 5;
        
        const panel = new Panel(GameScene.Instance, width, height);
        panel.setPosition(positionX, positionY);
        GameScene.Instance.hudContainer.add(panel.container);

        const tileItemShop = new TileItemShop(scene);
        panel.container.add(tileItemShop.container);

        tileItemShop.closeButton.onClick = () => {
            panel.container.destroy();
            this.createMainPanel();

            HudLockZone.removeLockZone('tileItemShopPanel');
        }

        HudLockZone.addLockZone('tileItemShopPanel', positionX, positionY, width, height);  
    }
    */


    private static createMainPanel() {
        
    }

    private static createSideButtons() {
        const buttonSize = new Phaser.Math.Vector2(150, 35);
        const gameSize = GameScene.Instance.scale;

        const gridLayout = new GridLayout(GameScene.Instance, buttonSize.x + 10, 200, buttonSize.x, buttonSize.y, 0, 10);
        gridLayout.setItemsPerPage(1, 4);
        gridLayout.container.setPosition(gameSize.width - buttonSize.x - 20, 10);
        GameScene.Instance.hudContainer.add(gridLayout.container);


        let sideButtons = 0;
        const addSideButton = (button: Button) => {
            const position = gridLayout.getItemCenterPosition(0, sideButtons);
            button.container.setPosition(position.x, position.y)
            gridLayout.container.add(button.container);

            sideButtons++;
            return button;
        }


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
            if (Debug.consoleLog) console.log("cannot go back")
            return;
        }

        Gameface.Instance.network.sendLeaveServer();
       
        //Gameface.Instance.setHudVisible(false);
        Gameface.Instance.destroyGameScene()
        Gameface.Instance.game.removeWorlds();

        
        Gameface.Instance.startScene(ServersListScene);
        Gameface.Instance.network.sendLeaveServer();

        Hud.setVisible(false);
    }

    public static addButton(text: string, x: number, y: number, width: number, height: number, texture?: string) {

        if(!texture) texture = "button/button1_large";
        //if(!offset) offset = 16;

        const button = new Button(GameScene.Instance, text, x, y, width, height, texture);

        GameScene.Instance.hudContainer.add(button.container);

        return button;
    }

    public static addText(text: string, x: number, y: number, style: Phaser.Types.GameObjects.Text.TextStyle) {

        const textgo = GameScene.Instance.add.text(x, y, text, style);
        
        GameScene.Instance.hudContainer.add(textgo);

        return textgo;
    }

    /*public static addProgressBar(background: string, progress: string, min: number, max: number, x_background: number, y_background: number, x_progress: number, y_progress: number, style: Phaser.Types.GameObjects.Text.TextStyle) {

        const backgroundgo = GameScene.Instance.add.image(x_background, y_background, background).setOrigin(0);
        const icongo = GameScene.Instance.add.image(x_icon, y_icon, icon).setOrigin(0);
        const textgo = GameScene.Instance.add.text(x_text, y_text, text, style);
        
        GameScene.Instance.hudContainer.add(icongo);
        GameScene.Instance.hudContainer.add(textgo);

        return textgo;
    }*/

    public static addTextWithIcon(text: string, icon: string, x_icon: number, y_icon: number, x_text: number, y_text: number, style: Phaser.Types.GameObjects.Text.TextStyle) {

        const icongo = GameScene.Instance.add.image(x_icon, y_icon, icon).setOrigin(0);
        const textgo = GameScene.Instance.add.text(x_text, y_text, text, style);
        
        GameScene.Instance.hudContainer.add(icongo);
        GameScene.Instance.hudContainer.add(textgo);

        return textgo;
    }

    public static drawWorldText(text: string, x: number, y: number, lifetime: number, speed: number) {

        const worldText = WorldTextManager.drawHudWorldText(text, x, y, lifetime, speed)!;
        
        return worldText;
    }

}