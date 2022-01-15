import { Camera } from "../camera/camera";
import { Debug } from "../debug/debug";
import { Gameface } from "../gameface/gameface";
import { Input } from "../input/input";
import { PlayerAnimation } from "../player/playerAnimation";
import { BonePart } from "../playerTextureFactory/bonePart";
import { Button } from "../ui/button";
import { MoveScene } from "../utils/moveScene";
import { World } from "../world/world";
import { MapGridScene } from "./mapGridScene";

export class MainScene extends Phaser.Scene {
    public static Instance: MainScene;

    constructor() {
        super({});
        MainScene.Instance = this;
    }

    public async create() {
        Debug.log("main scene");
    }

    public update(time: number, delta: number) {
        Gameface.Instance.render(delta);
    }
}