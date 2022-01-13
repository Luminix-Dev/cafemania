import { Camera } from "../camera/camera";
import { Debug } from "../debug/debug";
import { Gameface } from "../gameface/gameface";
import { Input } from "../input/input";
import { MoveScene } from "../utils/moveScene";
import { World } from "../world/world";
import { MapGridScene } from "./mapGridScene";

export class GameScene extends Phaser.Scene {
    public static Instance: GameScene;

    public get world() {
        return this._world!;
    }

    public _world?: World;

    public layerFloor: Phaser.GameObjects.Layer;
    public layerObjects: Phaser.GameObjects.Layer;
    public layerTop: Phaser.GameObjects.Layer;

    constructor() {
        super({});
        GameScene.Instance = this;
    }

    public setWorld(world: World | undefined) {
        this._world = world;

        if(world) {
    
            Debug.log(`world ${world.id}`);

            MapGridScene.grid = world.tileMap.grid;
        }
    }



    public create() {
        Debug.log("game scene");
        
        Camera.setScene(this);
        //Input.initScene(this, true);

        this.layerFloor = this.add.layer();
        this.layerFloor.setDepth(0);

        this.layerObjects = this.add.layer();
        this.layerObjects.setDepth(100);

        this.layerTop = this.add.layer();
        this.layerTop.setDepth(1000);

        //this.cameras.main.setBackgroundColor(0x000D56);
    }

    public update(time: number, delta: number) {
        if(!this._world) return;
        this._world.render(delta);
    }

    public static startNewScene(world: World) {
        //Gameface.Instance.removeScene(GameScene);

        console.log("start net")

        if(!Gameface.Instance.hasSceneStarted(GameScene)) {
            console.log("create")
            const s = Gameface.Instance.startScene(GameScene) as GameScene;
        }

        GameScene.Instance.setWorld(world);

        //const phaser = Gameface.Instance.phaser;
        //const scene = phaser.scene.add('GameScene', GameScene, true, {world: world}) as GameScene;
    }

    public destroy() {

        alert("destr")

    }
}