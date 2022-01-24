import { AssetManager, AssetType } from "../assetManager/assetManager";
import { Debug } from "../debug/debug";
import { Gameface } from "../gameface/gameface";
import { PACKET_TYPE } from "../network/packet";
import { BonePart } from "../playerTextureFactory/bonePart";
import { Button } from "../ui/button";
import { LoadScene } from "./loadScene";
import { ServerListScene } from "./serverListScene";

export class PreloadScene extends Phaser.Scene {
    public static Instance: PreloadScene;
    
    constructor() {
        super({});
        PreloadScene.Instance = this;
    }

    public async create() {
        const gameface = Gameface.Instance;
        const phaser = gameface.phaser;
        const network = gameface.network;

        await this.processLoadScene();

        gameface.onEnterMainMenu(); 
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

                this.getLoadTileItemInfo().map(a => AssetManager.addImage(a[0], a[1]));
                this.getLoadDishes().map(a => AssetManager.addImage(a[0], a[1]));
    
                AssetManager.getAssets(AssetType.IMAGE).map(asset => {
                    loadScene.loadImage(asset.key, asset.path);
                })

                AssetManager.getAssets(AssetType.AUDIO).map(asset => {
                    loadScene.loadAudio(asset.key, asset.path);
                })

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
        const PlayerSpritesheetGenerator = (await import("../playerTextureFactory/playerSpritesheetGenerator")).PlayerSpritesheetGenerator

        loadScene.addLoadTask('Loading player model', (async () => {
            await PlayerTextureFactory.init();
            await PlayerTextureFactory.placeCameraAtDefaultPosition();

            await PlayerTextureFactory.attachModelToBone('models/hair/1.glb', BonePart.HAIR);
            await PlayerTextureFactory.attachModelToBone('models/shoes/1.glb', BonePart.FEET_L);
            await PlayerTextureFactory.attachModelToBone('models/shoes/1.glb', BonePart.FEET_R);
            await PlayerTextureFactory.updateBodySkins();
        }))
        
        const tag = 'PlayerSpriteTexture_';
        loadScene.addLoadTask('Loading player textures', (async () => {
            await PlayerTextureFactory.setSkinColor("#ffffff");
            await PlayerTextureFactory.updateBodySkins();
            await PlayerSpritesheetGenerator.generate(tag + 'NoTexture', {animations: ['Idle', 'Walk', 'Sit', 'Eat']});
        }))

        loadScene.addLoadTask('Loading player textures', (async () => {
            await PlayerTextureFactory.setSkinColor("#d7c85d");
            await PlayerTextureFactory.updateBodySkins();

            await PlayerSpritesheetGenerator.generate(tag + 'Client', {animations: ['Idle', 'Walk', 'Sit', 'Eat']});
        }))

        loadScene.addLoadTask('Loading player textures', (async () => {
            await PlayerTextureFactory.setSkinColor("#5b76b5");
            await PlayerTextureFactory.updateBodySkins();
            await PlayerSpritesheetGenerator.generate(tag + 'Waiter', {animations: ['Idle', 'Walk', 'Sit', 'Eat']});
            //await PlayerTextureFactory.generateTestPlayerSkin(tag + 'Waiter', "#FF6A44", ['Idle', 'Walk', 'Sit', 'Eat']);
        }))
    }
}