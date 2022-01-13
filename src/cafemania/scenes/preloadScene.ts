import { AssetManager } from "../assetManager/assetManager";
import { Debug } from "../debug/debug";
import { Gameface } from "../gameface/gameface";
import { PACKET_TYPE } from "../network/packet";
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
    
                AssetManager.getImageAssets().map(asset => {
                    loadScene.loadImage(asset.key, asset.texture);
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

        loadScene.addLoadTask('Loading player model', (async () => {
            await PlayerTextureFactory.init('player_render_canvas');
            //await PlayerTextureFactory.updateBodySkins();
        }))
        
        const tag = 'PlayerSpriteTexture_';
        loadScene.addLoadTask('Loading player textures', (async () => {
            await PlayerTextureFactory.generateTestPlayerSkin(tag + 'NoTexture', "#ffffff", ['Idle', 'Walk', 'Sit', 'Eat']);
        }))

        loadScene.addLoadTask('Loading player textures', (async () => {
            await PlayerTextureFactory.generateTestPlayerSkin(tag + 'Client', "#f5e17d", ['Idle', 'Walk', 'Sit', 'Eat']);
        }))

        loadScene.addLoadTask('Loading player textures', (async () => {
            await PlayerTextureFactory.generateTestPlayerSkin(tag + 'Waiter', "#FF6A44", ['Idle', 'Walk', 'Sit', 'Eat']);
        }))
    }
}