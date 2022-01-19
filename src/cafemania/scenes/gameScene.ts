import { Camera } from "../camera/camera";
import { Debug } from "../debug/debug";
import { Gameface } from "../gameface/gameface";
import { Hud } from "../hud/hud";
import { Input } from "../input/input";
import { PACKET_TYPE } from "../network/packet";
import { TileHoverDetection } from "../shop/tileHoverDetection";
import { NewTileCollisionFactory } from "../tile/newTileCollisionFactory";
import { Tile } from "../tile/tile";
import { TileItem } from "../tileItem/tileItem";
import { TileItemType } from "../tileItem/tileItemInfo";
import { Button } from "../ui/button";
import { MessageBox } from "../ui/messageBox";
import { MoveScene } from "../utils/moveScene";
import { World } from "../world/world";
import { MapGridScene } from "./mapGridScene";
import { ServerListScene } from "./serverListScene";

export class GameScene extends Phaser.Scene {
    public static Instance: GameScene;

    public get world() {
        return this._world!;
    }

    public _world?: World;

    public layerFloor: Phaser.GameObjects.Layer;
    public layerObjects: Phaser.GameObjects.Layer;
    public layerTop: Phaser.GameObjects.Layer;
    public layerHud: Phaser.GameObjects.Layer;

    public hudContainer: Phaser.GameObjects.Container;

    public messageBoxAboveTileItem?: MessageBox;

    public setMessageBoxAboveTileItem(messageBox: MessageBox) {
        this.remomveMessageBoxAboveTileItem();
        this.messageBoxAboveTileItem = messageBox;
    }

    public remomveMessageBoxAboveTileItem() {
        this.messageBoxAboveTileItem?.destroy();
        this.messageBoxAboveTileItem = undefined;
    }

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

    public static drawCircleNumber(text: string, position: Phaser.Math.Vector2) {
        const c = GameScene.Instance.add.circle(0, 0, 8, 0x0000ff);
        c.setOrigin(0.5)

        const s = GameScene.Instance.add.text(0, 0, text, {color: "yellow", fontFamily: 'AlfaSlabOne-Regular'});
        s.setFontStyle('bold')
        s.setOrigin(0.5)
        

        const container = GameScene.Instance.add.container();
        container.add(c);
        container.add(s);
        container.setDepth(100000)
        container.setPosition(position.x, position.y);

        return container;
    }

    public create() {
        Debug.log("game scene");

        console.log("yea, created")
        
        this.layerFloor = this.add.layer();
        this.layerFloor.setDepth(0);

        this.layerObjects = this.add.layer();
        this.layerObjects.setDepth(100);

        this.layerTop = this.add.layer();
        this.layerTop.setDepth(1000);

        this.layerHud = this.add.layer();
        this.layerHud.setDepth(10000);
        
        this.hudContainer = this.add.container();
        this.layerHud.add(this.hudContainer);

        this.cameras.main.setBackgroundColor(0x000D56);
        
        //

        Input.events.on("pointerdown", () => {

            if(!this._world) return;

            const tileItem = TileHoverDetection.testTileItem(Input.getMouseWorldPosition());

            if(tileItem) {
                if(tileItem.tileItemInfo.type == TileItemType.FLOOR) {
                    const tile = tileItem.tile;

                    if(!tile.getIsWalkable()) return;

                    Gameface.Instance.network.sendMovePlayer(tile.x, tile.y);
                }
            }

        });

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