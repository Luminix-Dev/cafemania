import { Camera } from "../camera/camera";
import { Debug } from "../debug/debug";
import { Gameface } from "../gameface/gameface";
import { Input } from "../input/input";
import { Tile } from "../tile/tile";
import { TileItemRender } from "../tileItem/tileItemRender";
import { MoveScene } from "../utils/moveScene";
import { PathFind } from "../utils/pathFind";
import { PathFindVisualizer } from "../utils/pathFindVisualizer";
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

        /*
        const tileItemInfo = Gameface.Instance.game.tileItemFactory.getTileItemInfo('floorDecoration2');

        const tileItemRender = new TileItemRender(tileItemInfo);
        tileItemRender.render();

        window['tileItemRender'] = tileItemRender;
        */

        const moveScene = new MoveScene(this);

        MapGridScene.grid = this.world.tileMap.grid;

        

        /*
        const step = window['step'] = function() {
            pathFind.process();
            visuals.draw();
        }

        step();

        setInterval(() => {
            if(pathFind.state == 1) {
                step();
            }
        }, 100)
        */

        
    }


    public update(time: number, delta: number) {
        
        Gameface.Instance.update(delta);

        //this.world.update(delta);
        this.world.render(delta);

        const scene = this;
    }

    public static initScene(world: World) {
        const phaser = Gameface.Instance.phaser;
        const scene = phaser.scene.add('GameScene', GameScene, true, {world: world}) as GameScene;
    }
}