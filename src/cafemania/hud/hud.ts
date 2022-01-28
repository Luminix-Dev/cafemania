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



export class Hud {

    public static drawLockedZones: boolean = false;

    private static _mainPanel?: Panel;

    private static _lockedRects = new Map<string, Phaser.Geom.Rectangle>();
    private static _lockedRectsVisual = new Map<string, Phaser.GameObjects.Graphics>();
    private static _lockedZones: string[] = [];

    public static update(dt: number) {
        this.updateLockedZones();

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

    public static createHud() {
        this.createMainPanel();
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

            console.log("---")
            console.log(worldPos)
            console.log(screenPos);
            console.log("---")

        })
    }

    private static updateLockedZones() {
        this._lockedZones = [];

        const mousePos = Input.mousePosition;
    
        for (const id of this._lockedRects.keys()) {
            const rect = this._lockedRects.get(id)!;
            
            if(rect.contains(mousePos.x, mousePos.y)) {
                this._lockedZones.push(id);
            }

        }
    }

    public static getLockedZones() {
        return this._lockedZones;
    }

    public static isZoneLocked(id?: string) {
        if(id == undefined) {
            return this._lockedZones.length > 0;
        }
        return this._lockedZones.includes(id);
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

    public static addLockZone(id: string, x: number, y: number, width: number, height: number) {
        const rectangle = new Phaser.Geom.Rectangle(x, y, width, height);

        this._lockedRects.set(id, rectangle);

        if(this.drawLockedZones) {
            const scene = GameScene.Instance;
            const graphics = scene.add.graphics();
            graphics.fillStyle(0xff0000, 0.2);
            graphics.fillRect(0, 0, width, height);
            graphics.setPosition(x, y);
            scene.hudContainer.add(graphics);

            this._lockedRectsVisual.set(id, graphics);
        }

    }

    public static removeLockZone(id: string) {
        this._lockedRects.delete(id);

        this._lockedRectsVisual.get(id)?.destroy();
        this._lockedRectsVisual.delete(id);
    }
 
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

            this.removeLockZone('tileItemShopPanel');
        }

        this.addLockZone('tileItemShopPanel', positionX, positionY, width, height);

        return;

        /*
        const panel =  new Panel(GameScene.Instance, width, height);
        panel.setButtonsOffset(32, 32);
        panel.setPosition(gameSize.width/2 - width/2, gameSize.height - height - 5);
        GameScene.Instance.hudContainer.add(panel.container);

        const categoryTextures = new Map<TileItemCategory, string>();
        categoryTextures.set(TileItemCategory.STOVE, "button/panel/stove");
        categoryTextures.set(TileItemCategory.COUNTER, "button/panel/counter");
        categoryTextures.set(TileItemCategory.TABLE, "button/panel/table");

        const categoryItems = new Map<TileItemCategory, TileItemInfo[]>();
        const tileItemFactory = Gameface.Instance.game.tileItemFactory;

        for (const tileItemInfoId in tileItemFactory.tileItemInfoList) {
            const tileItemInfo = tileItemFactory.getTileItemInfo(tileItemInfoId);
            const category = tileItemInfo.category;

            if(!categoryItems.has(category)) categoryItems.set(category, []);
            categoryItems.get(category)!.push(tileItemInfo);
        }

        console.log(categoryItems)

        for (const category of categoryItems.keys()) {
            const texture = categoryTextures.get(category) || "button/panel/none";
            const categoryButton = panel.addButton(texture);

            categoryButton.onClick = () => {
                const items = categoryItems.get(category)!;
                console.log(items)

                
                const gridList = new GridList(scene, width-60, 120,    50, 50, 0);
                panel.container.add(gridList.container!);
                gridList.setItemsAmount(4);
                gridList.container!.setPosition(30, 80)

                gridList.onShowItem = (index: number, position: Phaser.Math.Vector2) => {
                    const shopItem = new TileItemShopItem(GameScene.Instance);
                    gridList.container!.add(shopItem.container);
                }
                gridList.onHideItem = (index: number) => {

                }
                gridList.show();

                //for (const item of items) {
                    
                    //const shopItem = new TileItemShopItem(GameScene.Instance);

                //}

            }
        }

        */
        
    }

    private static destroyMainPanel() {
        this._mainPanel?.container.destroy();
        this.removeLockZone('mainPanel');
    }

    private static createMainPanel() {
        const width = 760;
        const height = 150;
        const gameSize = GameScene.Instance.scale;
        const positionX = gameSize.width/2 - width/2;
        const positionY = gameSize.height - height - 5

        const panel = this._mainPanel = new Panel(GameScene.Instance, width, height);
        panel.setButtonsOffset(180, 0);
        panel.container.setPosition(positionX, positionY);
        GameScene.Instance.hudContainer.add(panel.container);

        //panel.addTab("button/panel/waiter")
        //panel.addTab("button/panel/waiter")

        const shopButton = panel.addButton("button/panel/shop");
        shopButton.onClick = () => {
            this.destroyMainPanel();
            this.createShopPanel();
        }

        panel.addButton("button/panel/clothes")
        panel.addButton("button/panel/clothes")
        panel.addButton("button/panel/clothes")
        panel.addButton("button/panel/clothes")

        this.addLockZone('mainPanel', positionX, positionY, width, height);
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