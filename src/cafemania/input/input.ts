import { Debug } from "../debug/debug";
import { MoveTileItem } from "../shop/moveTileItem";

export class Input {
    public static events = new Phaser.Events.EventEmitter();
    
    public static mousePosition = new Phaser.Math.Vector2();
    public static mouseDown: boolean = false;
    public static isDragging: boolean = false;
    public static minDragDistance: number = 3;

    private static _dragStartPos = new Phaser.Math.Vector2();

    private static _sceneWorldPosition = new Phaser.Math.Vector2();

    private static _movingScene?: Phaser.Scene;
    
    public static simulatePointerUp(pointer) {
        this.onPointerUp(pointer);
    }

    private static onPointerUp(ev) {
        if(!this.mouseDown) return;
        this.mouseDown = false;

        Debug.log('pointerup');
        this.events.emit('pointerup', ev);

        if(this.isDragging) {
            this.isDragging = false;
            Debug.log('enddrag');
            this.events.emit('enddrag', ev);
        }

        this._movingScene = undefined;
    }

    private static onPointerDown(ev) {
        if(this.mouseDown) return;

        this._movingScene = undefined;

        this.mouseDown = true;
        this._dragStartPos.x = ev.position.x;
        this._dragStartPos.y = ev.position.y;

        console.log(this._dragStartPos)

        Debug.log('pointerdown');
        this.events.emit('pointerdown', ev);
    }

    private static onPointerMove(scene: Phaser.Scene, ev) {
        this.mousePosition.x = ev.x;
        this.mousePosition.y = ev.y;

        if(!this._movingScene) this._movingScene = scene;

        if(this._movingScene != scene) return;
        
        this._sceneWorldPosition.x = scene.input.activePointer.worldX;
        this._sceneWorldPosition.y = scene.input.activePointer.worldY;

        if(this.mouseDown) {
            if(!this.isDragging) {
                const distance = Phaser.Math.Distance.BetweenPoints(this._dragStartPos, ev.position);

                if(distance > this.minDragDistance) {
                    this.isDragging = true;
                    this._dragStartPos.x = ev.position.x;
                    this._dragStartPos.y = ev.position.y;
                    
                    Debug.log('begindrag');
                    this.events.emit('begindrag', ev);

                }
            }
        }
        this.events.emit('pointermove', ev);
    }

    public static addScene(scene: Phaser.Scene) {
        console.log("input add scene", scene);

        scene.input.on('pointerup', this.onPointerUp.bind(this));
        scene.input.on('pointerdown', this.onPointerDown.bind(this));
        scene.input.on('pointermove', pointer => {
            this.onPointerMove(scene, pointer);
        });
    }

    public static getMouseWorldPosition() {
        return new Phaser.Math.Vector2(
            this._sceneWorldPosition.x,
            this._sceneWorldPosition.y
        );
    }
}