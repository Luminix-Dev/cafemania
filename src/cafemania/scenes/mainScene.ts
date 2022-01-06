import { Debug } from "../debug/debug";
import { Gameface } from "../gameface/gameface";
import { Input } from "../input/input";
import { PACKET_TYPE } from "../network/packet";
import { Button } from "../ui/button";
import { DebugScene } from "./debugScene";
import { GameScene } from "./gameScene";
import { HudScene } from "./hudScene";
import { LoadScene } from "./loadScene";
import { MapGridScene } from "./mapGridScene";

export class MainScene extends Phaser.Scene {
    public static Instance: MainScene;
    public static hasLoaded: boolean = false;
    
    constructor() {
        super({});
        MainScene.Instance = this;
    }

    public preload() {
        Debug.startedAt = Date.now();

        this.load.setPath(Gameface.ASSETS_URL);

        this.load.image('wallMask', 'wallMask.png');
        this.load.image('tile', 'tile.png');
        this.load.image('tile2', 'tile2.png');
        this.load.image('button/button1', 'button/button1.png');
        this.load.image('button/zoom_in', 'button/zoom_in.png');
        this.load.image('button/zoom_out', 'button/zoom_out.png');
        this.load.image('button/fullscreen', 'button/fullscreen.png');
    }

    private getLoadTileItemInfo() {
        const images: string[][] = [];
        const tileItemInfoList = Gameface.Instance.game.tileItemFactory.tileItemInfoList;

        for (const id in tileItemInfoList) {
            const tileItemInfo = tileItemInfoList[id]
            const texture = tileItemInfo.texture
            images.push([texture, `tileItem/${texture}.png`])
        }

        return images;
    }

    private getLoadDishes() {
        const images: string[][] = [];
        const dishList = Gameface.Instance.game.dishFactory.getDishList();

        Debug.log("loading dishes...");

        for (const id in dishList)
        {
            const dish = dishList[id]
            const texture = dish.texture

            images.push([texture, `dish/${texture}.png`])
        }
        return images;
    }

    public async processLoadScene() {
        return new Promise<void>((complete) => {
            const gameface = Gameface.Instance;
            const phaser = gameface.phaser;
    
            const onCreateLoadScene = async (loadScene: LoadScene) => {

                this.getLoadTileItemInfo().map(a => loadScene.loadImage(a[0], a[1]));
                this.getLoadDishes().map(a => loadScene.loadImage(a[0], a[1]));
    
                await this.loadPlayerTextureFactory(loadScene);
    
                await loadScene.loadAll();
                
                loadScene.scene.remove();

                complete();
            }
    
            phaser.scene.add('LoadScene', LoadScene, true, {oncreate: onCreateLoadScene});
        })
    }

    private async loadPlayerTextureFactory(loadScene: LoadScene) {
        const PlayerTextureFactory = (await import("../playerTextureFactory/playerTextureFactory")).PlayerTextureFactory

        loadScene.addLoadTask('Loading player model', (async () => {
            await PlayerTextureFactory.init('player_render_canvas');
            await PlayerTextureFactory.updateBodySkins();
        }))
        
        const tag = 'PlayerSpriteTexture_';

        Debug.log("add load tasks");
        
        loadScene.addLoadTask('Loading player textures', (async () => {
            PlayerTextureFactory.skinColor = "#ffffff";
            await PlayerTextureFactory.updateBodySkins();
            await PlayerTextureFactory.generatePlayerTexture(tag + 'NoTexture', {animations: ['Idle', 'Walk', 'Sit', 'Eat']});
        }))


        loadScene.addLoadTask('Loading player textures', (async () => {
            PlayerTextureFactory.skinColor = "#f5e17d"
            await PlayerTextureFactory.updateBodySkins();
            await PlayerTextureFactory.generatePlayerTexture(tag + 'Client',  {animations: ['Idle', 'Walk', 'Sit', 'Eat']});
        }))

        loadScene.addLoadTask('Loading player textures', (async () => {
            PlayerTextureFactory.skinColor = "#FF6A44"
            await PlayerTextureFactory.updateBodySkins();
            await PlayerTextureFactory.generatePlayerTexture(tag + 'Waiter',  {animations: ['Idle', 'Walk', 'Sit', 'Eat']});
        }))
    }

    public async create() {
        const gameface = Gameface.Instance;
        const phaser = gameface.phaser;
        const network = gameface.network;

        if(!MainScene.hasLoaded) {
            MainScene.hasLoaded = true;
            
            await this.processLoadScene();

            phaser.scene.add('DebugScene', DebugScene, true);
            phaser.scene.add('HudScene', HudScene, true);
            phaser.scene.add('MapGridScene', MapGridScene, true);

            Debug.log("connecting to " + network.getAddress())
        }
        
        network.connect(() => {
            Debug.log("connected");

            this.testButtons();
        });
    }
    

    private testButtons() {

        const w = this.scale.width;
        const h = this.scale.height;

        const x = w * 0.5;
        const y = h * 0.5;
		
        const multiplayerBtn = new Button(this, x, y + 100, 200, 40, "button/button1", "Multiplayer");
        const singleplayerBtn = new Button(this, x, y + 160, 200, 40, "button/button1", "Singleplayer");


        const gameface = Gameface.Instance;
        const network = gameface.network;
        
        const destroyButtons = () => {
            multiplayerBtn.destroy();
            singleplayerBtn.destroy();
        }

        multiplayerBtn.onClick = () => {
            destroyButtons();

            Gameface.Instance.createBaseWorld(true);
            network.send(PACKET_TYPE.ENTER_WORLD, null);
        }

        singleplayerBtn.onClick = () => {
            destroyButtons();

            Gameface.Instance.createBaseWorld(false);
        }
    }

    public update(time: number, delta: number) {
 
    }
}