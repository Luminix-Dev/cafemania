import { Debug } from "../debug/debug";
import { Gameface } from "../gameface/gameface";
import { Input } from "../input/input";
import { DebugScene } from "./debugScene";
import { GameScene } from "./gameScene";
import { HudScene } from "./hudScene";
import { LoadScene } from "./loadScene";
import { MapGridScene } from "./mapGridScene";

export class MainScene extends Phaser.Scene {
    public static Instance: MainScene;

    constructor() {
        super({});
        MainScene.Instance = this;
    }

    public preload() {
        Debug.startedAt = Date.now();

        this.load.setPath('cafemania/assets');
        this.load.image('wallMask', 'wallMask.png');
        this.load.image('tile', 'tile.png');
        this.load.image('tile2', 'tile2.png');
        this.load.image('button/zoom_in', 'button/zoom_in.png');
        this.load.image('button/zoom_out', 'button/zoom_out.png');
        this.load.image('button/fullscreen', 'button/fullscreen.png');

        this.loadTileItemInfo();
        this.loadDishes();
    }

    private loadTileItemInfo() {
        const tileItemInfoList = Gameface.Instance.game.tileItemFactory.tileItemInfoList;

        Debug.log("loading tile items...");

        for (const id in tileItemInfoList) {
            

            const tileItemInfo = tileItemInfoList[id]
            const texture = tileItemInfo.texture

            this.load.image(texture, `tileItem/${texture}.png`)
        }
    }

    private loadDishes() {
        const dishList = Gameface.Instance.game.dishFactory.getDishList();

        Debug.log("loading dishes...");

        for (const id in dishList)
        {
            const dish = dishList[id]
            const texture = dish.texture

            this.load.image(texture, `dish/${texture}.png`)
        }
    }

    public async create() {
        const gameface = Gameface.Instance;
        const phaser = gameface.phaser;
        const network = gameface.network;

        phaser.scene.add('DebugScene', DebugScene, true);
        phaser.scene.add('HudScene', HudScene, true);
        phaser.scene.add('MapGridScene', MapGridScene, true);

        Debug.log("main scene");

        const loadScene = phaser.scene.add('LoadScene', LoadScene, true, {a: 123}) as LoadScene;

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
        
        await loadScene.loadAll();
        
        loadScene.scene.remove();

        Debug.log("connecting to " + network.getAddress())

        network.connect(() => {
            Debug.log("connected");

            gameface.startMultiplayer();
            //gameface.startSinglePlayer();

            DebugScene.Instance?.scene.bringToTop();
            MapGridScene.Instance?.scene.bringToTop();
            HudScene.Instance?.scene.bringToTop();
        });

     
    }

    public update(time: number, delta: number) {
 
    }
}