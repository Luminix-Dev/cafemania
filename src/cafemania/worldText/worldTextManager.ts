import { WorldText } from "./worldText";

export class WorldTextManager {
    private static _scene?: Phaser.Scene;
    private static _worldTexts: WorldText[] = [];

    public static init(scene: Phaser.Scene) {
        this._scene = scene;
    }

    public static update(dt: number) {

        const toDestroy: WorldText[] = [];

        for (const worldText of this._worldTexts) {
            worldText.lifetime -= dt;
            if(worldText.lifetime <= 0) {
                toDestroy.push(worldText)
                continue;
            }

            worldText.position.y -= (worldText.speed/10) * dt;
            worldText.container.setPosition(worldText.position.x, worldText.position.y);
        }

        for (const worldText of toDestroy) {
            this._worldTexts.splice(this._worldTexts.indexOf(worldText), 1);
            worldText.destroy();
        }

    }

    public static drawWorldText(text: string, x: number, y: number, lifetime: number, speed: number) {
        if(!this._scene) return;

        const worldText = new WorldText(this._scene, text, lifetime, speed);
        worldText.position.set(x, y);
        worldText.container.setDepth(10000);

        this._worldTexts.push(worldText);
    }
}