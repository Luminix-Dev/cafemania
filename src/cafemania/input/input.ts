import { Camera } from "../camera/camera";
import { GameScene } from "../scenes/gameScene";

export class Input {
    public static mousePosition = new Phaser.Math.Vector2();
    public static mouseDown: boolean = false;
    private static _sceneWorldPosition = new Phaser.Math.Vector2();
    private static _scene: Phaser.Scene;

    public static init(scene: Phaser.Scene) {
        this._scene = scene;

        const self = this;

        scene.input.on('pointerdown', () => {
            self.mouseDown = true;
        });

        scene.input.on('pointerup', () => {
            self.mouseDown = false;
        });

        scene.input.on('pointermove', pointer => {
            self.mousePosition.x = pointer.x;
            self.mousePosition.y = pointer.y;

            self._sceneWorldPosition.x = scene.input.activePointer.worldX;
            self._sceneWorldPosition.y = scene.input.activePointer.worldY;
        });
    }

    public static getMouseWorldPosition() {
        const scene = this._scene;

        return new Phaser.Math.Vector2(
            this._sceneWorldPosition.x,
            this._sceneWorldPosition.y
        );
    }
}