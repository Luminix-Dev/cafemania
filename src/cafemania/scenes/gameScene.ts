import { Camera } from "../camera/camera";
import { Debug } from "../debug/debug";
import { Gameface } from "../gameface/gameface";
import { Input } from "../input/input";
import { MoveScene } from "../utils/moveScene";
import { World } from "../world/world";
import { MapGridScene } from "./mapGridScene";

export class GameScene extends Phaser.Scene {
    public static Instance: GameScene;

    public world: World;
    public layerFloor: Phaser.GameObjects.Layer;
    public layerObjects: Phaser.GameObjects.Layer;
    public layerTop: Phaser.GameObjects.Layer;

    constructor() {
        super({});
        GameScene.Instance = this;
    }

    public init(data) {
        this.world = data.world;
    }

    public create() {
        Debug.log("game scene");
        Debug.log(`world ${this.world.id}`);

        Camera.setScene(this);
        Input.init(this);

        this.layerFloor = this.add.layer();
        this.layerFloor.setDepth(0);

        this.layerObjects = this.add.layer();
        this.layerObjects.setDepth(100);

        this.layerTop = this.add.layer();
        this.layerTop.setDepth(1000);

        this.cameras.main.setBackgroundColor(0x000D56);

        const moveScene = new MoveScene(this);

        MapGridScene.grid = this.world.tileMap.grid;
    }

    public update(time: number, delta: number) {
        Gameface.Instance.render(delta);
        this.world.render(delta);
    }

    public static initScene(world: World) {
        const phaser = Gameface.Instance.phaser;
        const scene = phaser.scene.add('GameScene', GameScene, true, {world: world}) as GameScene;
    }
}