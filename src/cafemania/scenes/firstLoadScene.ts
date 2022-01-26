import { AssetManager, AssetType } from "../assetManager/assetManager";
import { Debug } from "../debug/debug";
import { Gameface } from "../gameface/gameface";
import { BonePart } from "../playerTextureFactory/bonePart";
import { LoadScene, LoadSceneType } from "./loadScene";

export class FirstLoadScene extends Phaser.Scene {
    public static Instance: FirstLoadScene;
    
    //private _loadText: Phaser.GameObjects.Text;

    //public onFinishLoad?: () => void;

    constructor() {
        super({});
        FirstLoadScene.Instance = this;
    }

    public startLoad(callback: () => void) {
        this.processLoadScene(() => {
            callback();
        });
    }

    public async create() {
        this.add.image(0, 0, 'background').setOrigin(0);
        //this.add.image(0, 0, 'loading_background').setOrigin(0);

        //this._loadText = this.add.text(50, 50, "Loading...", {color: "black"});
    }

    public async processLoadScene(callback: () => void) {
        const gameface = Gameface.Instance;
        //const phaser = gameface.phaser;
        
        console.log('processLoadScene')

        LoadScene.createScene(LoadSceneType.PROGRESS, async () => {
            const loadScene = LoadScene.Instance;

            loadScene.scene.bringToTop();

            this.getLoadTileItemInfo().map(a => AssetManager.addImage(a[0], a[1]));
            this.getLoadDishes().map(a => AssetManager.addImage(a[0], a[1]));

            AssetManager.getAssets(AssetType.IMAGE).map(asset => {
                loadScene.loadImage(asset.key, asset.path);
            })

            AssetManager.getAssets(AssetType.AUDIO).map(asset => {
                loadScene.loadAudio(asset.key, asset.path);
            })

            await this.loadPlayerTextureFactory(loadScene);
        
            loadScene.loadTask('Connecting...', (async () => {
                await new Promise<void>((res) => {
                    const network = gameface.network;
                    network.connect(() => res());
                });
            }))

            //

            loadScene.onProgress = (progress, text) => {
                //this._loadText.setText(`[ ${(progress * 100).toFixed(0)}% ] ${text}`);
            }
            loadScene.startLoadingAssets(() => {

                loadScene.scene.remove();

                callback();
            });

            
        });
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

    private async loadPlayerTextureFactory(loadScene: LoadScene) {
        const PlayerTextureFactory = (await import("../playerTextureFactory/playerTextureFactory")).PlayerTextureFactory
        const PlayerSpritesheetGenerator = (await import("../playerTextureFactory/playerSpritesheetGenerator")).PlayerSpritesheetGenerator

        loadScene.loadTask('Loading player model', (async () => {
            await PlayerTextureFactory.init();
            await PlayerTextureFactory.placeCameraAtDefaultPosition();

            await PlayerTextureFactory.attachModelToBone('models/hair/1.glb', BonePart.HAIR);
            await PlayerTextureFactory.attachModelToBone('models/shoes/1.glb', BonePart.FEET_L);
            await PlayerTextureFactory.attachModelToBone('models/shoes/1.glb', BonePart.FEET_R);
            await PlayerTextureFactory.updateBodySkins();
        }))
        
        const tag = 'PlayerSpriteTexture_';
        loadScene.loadTask('Loading player textures', (async () => {
            await PlayerTextureFactory.setSkinColor("#ffffff");
            await PlayerTextureFactory.updateBodySkins();

            await PlayerSpritesheetGenerator.generate(tag + 'NoTexture', {animations: ['Idle', 'Walk', 'Sit', 'Eat']});
        }))

        loadScene.loadTask('Loading player textures', (async () => {
            await PlayerTextureFactory.setSkinColor("#d7c85d");
            await PlayerTextureFactory.updateBodySkins();

            await PlayerSpritesheetGenerator.generate(tag + 'Client', {animations: ['Idle', 'Walk', 'Sit', 'Eat']});
        }))

        loadScene.loadTask('Loading player textures', (async () => {
            await PlayerTextureFactory.setSkinColor("#5b76b5");
            await PlayerTextureFactory.updateBodySkins();
            await PlayerSpritesheetGenerator.generate(tag + 'Waiter', {animations: ['Idle', 'Walk', 'Sit', 'Eat']});
            //await PlayerTextureFactory.generateTestPlayerSkin(tag + 'Waiter', "#FF6A44", ['Idle', 'Walk', 'Sit', 'Eat']);
        }))
    }
}