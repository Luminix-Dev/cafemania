import { Debug } from "../debug/debug";
import { Gameface } from "../gameface/gameface";

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