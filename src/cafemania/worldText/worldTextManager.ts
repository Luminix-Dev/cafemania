import { Hud } from "../hud/hud";
import { GameScene } from "../scenes/gameScene";
import { WorldText } from "./worldText";

export class WorldTextManager {
    private static _scene?: Phaser.Scene;
    private static _worldTexts: WorldText[] = [];

    public static init(scene: Phaser.Scene) {
        this._scene = scene;
    }

    public static update(dt: number) {
        const scene = this._scene;
        const toDestroy: WorldText[] = [];

        for (const worldText of this._worldTexts) {

            
            worldText.lifetime -= dt;
            if(worldText.lifetime <= 0 || scene == undefined) {
                toDestroy.push(worldText)
                continue;
            }

            if(!worldText.container) {
                const container = worldText.container = scene.add.container();
                container.setDepth(10000);

                const textGo = scene.add.text(0, 0, worldText.text, {fontFamily: 'AlfaSlabOne-Regular', color: "#D3900E"});
                textGo.setFontSize(10);
                textGo.setStroke("#55330D", 8);

                container.add(textGo);

                if(worldText.atHud) {
                    GameScene.Instance.hudContainer.add(worldText.container);
                }
            }

            worldText.position.y -= (worldText.speed/10) * dt;

            if(worldText.atHud) {
                const screenPos = Hud.getScreenCoordsFromWorldCoords(new Phaser.Math.Vector2(worldText.position.x, worldText.position.y));
                worldText.container.setPosition(screenPos.x, screenPos.y);
            } else {
                worldText.container.setPosition(worldText.position.x, worldText.position.y);
            }

        }

        for (const worldText of toDestroy) {
            this._worldTexts.splice(this._worldTexts.indexOf(worldText), 1);
            worldText.container?.destroy();
        }

    }

    public static drawHudWorldText(text: string, x: number, y: number, lifetime: number, speed: number) {
        return this.drawWorldText(text, x, y, lifetime, speed, true);
    }

    public static drawWorldText(text: string, x: number, y: number, lifetime: number, speed: number, atHud: boolean = false) {
        if(!this._scene) return;

        const worldText: WorldText = {
            text: text,
            lifetime: lifetime,
            speed: speed,
            position: new Phaser.Math.Vector2(x, y),
            atHud: atHud
        }
       

        this._worldTexts.push(worldText);

        return worldText;
    }
}