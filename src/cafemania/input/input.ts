import { MoveTileItem } from "../shop/moveTileItem";

export class Input {
    public static events = new Phaser.Events.EventEmitter();
    
    public static mousePosition = new Phaser.Math.Vector2();
    public static mouseDown: boolean = false;
    public static isDragging: boolean = false;
    public static minDragDistance: number = 3;

    private static _dragStartPos = new Phaser.Math.Vector2();

    private static _sceneWorldPosition = new Phaser.Math.Vector2();
    private static _scene: Phaser.Scene;

    
    public static init(scene: Phaser.Scene) {
        this._scene = scene;

        const self = this;

        scene.input.on('pointerdown', (ev) => {
            self.mouseDown = true;
            self._dragStartPos.x = ev.position.x;
            self._dragStartPos.y = ev.position.y;

            console.log(self._dragStartPos)

            self.events.emit('pointerdown', ev);
        });

        scene.input.on('pointerup', (ev) => {
            self.mouseDown = false;
            
            if(self.isDragging) {
                self.isDragging = false;
                self.events.emit('enddrag', ev);
            }
            
            
            self.events.emit('pointerup', ev);

            //MoveTileItem.stopMoving();
        });

        scene.input.on('pointermove', pointer => {
            self.mousePosition.x = pointer.x;
            self.mousePosition.y = pointer.y;

            self._sceneWorldPosition.x = scene.input.activePointer.worldX;
            self._sceneWorldPosition.y = scene.input.activePointer.worldY;

            if(self.mouseDown) {

                if(!self.isDragging) {

                    const distance = Phaser.Math.Distance.BetweenPoints(self._dragStartPos, pointer.position);

                    if(distance > self.minDragDistance) {
                        self.isDragging = true;
                        self._dragStartPos.x = pointer.position.x;
                        self._dragStartPos.y = pointer.position.y;
                        self.events.emit('begindrag', pointer);
                    }
                }

            }
            self.events.emit('pointermove', pointer);
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