import { Input } from "../input/input";
import { GameScene } from "../scenes/gameScene";

export class HudLockZone {
    public static drawLockedZones: boolean = false;

    private static _lockedRects = new Map<string, Phaser.Geom.Rectangle>();
    private static _lockedRectsVisual = new Map<string, Phaser.GameObjects.Graphics>();
    private static _lockedZones: string[] = [];

    public static update() {
        window['HudLockZone'] = HudLockZone;

        this._lockedZones = [];

        const mousePos = Input.mousePosition;
    
        for (const id of this._lockedRects.keys()) {
            const rect = this._lockedRects.get(id)!;
            
            if(rect.contains(mousePos.x, mousePos.y)) {
                this._lockedZones.push(id);
            }

        }
    }

    public static addLockZone(id: string, x: number, y: number, width: number, height: number) {
        const rectangle = new Phaser.Geom.Rectangle(x, y, width, height);

        this._lockedRects.set(id, rectangle);

        if(this.drawLockedZones) {
            const scene = GameScene.Instance;
            const graphics = scene.add.graphics();
            graphics.fillStyle(0xff0000, 0.2);
            graphics.fillRect(0, 0, width, height);
            graphics.setPosition(x, y);
            scene.hudContainer.add(graphics);

            this._lockedRectsVisual.set(id, graphics);
        }
    }

    public static removeLockZone(id: string) {
        this._lockedRects.delete(id);

        this._lockedRectsVisual.get(id)?.destroy();
        this._lockedRectsVisual.delete(id);
    }

    public static isZoneLocked(id?: string) {
        if(id == undefined) {
            return this._lockedZones.length > 0;
        }
        return this._lockedZones.includes(id);
    }

    public static getLockedZones() {
        return this._lockedZones;
    }
}