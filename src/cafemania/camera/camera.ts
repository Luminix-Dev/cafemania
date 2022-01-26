import Phaser from 'phaser';
import { Input } from '../input/input';
import { GameScene } from '../scenes/gameScene';
import { MoveTileItem } from '../shop/moveTileItem';

export class Camera {
    public static canMove = true;

    private static _position = new Phaser.Math.Vector2();

    private static _startMovePosition = new Phaser.Math.Vector2();
    private static _startMoveScenePosition = new Phaser.Math.Vector2();
    private static _currentScroll = new Phaser.Math.Vector2();
    //private static _oldMovePosition = new Phaser.Math.Vector2();

    private static _isMoving: boolean = false;

    public static getPosition() {
        return new Phaser.Math.Vector2(this._position.x, this._position.y);
    }

    public static update(dt: number) {
        const scene = GameScene.Instance;

        if(!scene) return;

        const position = this._position;
        const gameSize = scene.game.scale.gameSize;

        //MainScene.Instance.worldContainer.setPosition(position.x, position.y)

        const gameScene = GameScene.Instance;
        
        gameScene.cameras.main.setScroll(
            position.x - gameSize.width / 2,
            position.y - gameSize.height / 2
        );

      
        const zoom = gameScene.cameras.main.zoom;
        const s = 1/zoom;
        gameScene.hudContainer.setScale(s);
        gameScene.hudContainer.setPosition(
            gameScene.cameras.main.scrollX - (((1/zoom)-1)*(gameSize.width/2)),
            gameScene.cameras.main.scrollY - (((1/zoom)-1)*(gameSize.height/2))
        );
        
    }

    public static setZoom(zoom: number) {
        GameScene.Instance.cameras.main.setZoom(zoom);
    }

    public static zoomTo(zoom: number) {
        GameScene.Instance.cameras.main.zoomTo(zoom);
    }

    public static setPosition(x: number, y: number) {
        this._position.set(x, y);
    }

    public static setupMoveEvents() {
        
        Input.events.on('begindrag', (pointer) => {
            if(this.canMove) {
                if(!this._isMoving) {
                    this._isMoving = true;

                    const scene = GameScene.Instance;
                    const gameSize = scene.game.scale.gameSize;

                    this._startMovePosition.x = pointer.x
                    this._startMovePosition.y = pointer.y

                    this._startMoveScenePosition.x = scene.cameras.main.scrollX + gameSize.width/2
                    this._startMoveScenePosition.y = scene.cameras.main.scrollY + gameSize.height/2

                    console.log("camera begin drag")
                }
            }
        });

        Input.events.on('enddrag', (pointer) => {
            if(this._isMoving) {
                this._isMoving = false;
                console.log("camera begin drag")
            }
            
        });

        Input.events.on('pointermove', (pointer) => {
            
            if(MoveTileItem.isMovingAnyTileItem) return;
            
            if(this._isMoving) {
                console.log("camera mov")

                const scene = GameScene.Instance;
                const zoom = scene.cameras.main.zoom;

                const delta = new Phaser.Math.Vector2(this._startMovePosition.x - pointer.x, this._startMovePosition.y - pointer.y);

                this._currentScroll.x = Math.round(this._startMoveScenePosition.x + (delta.x / zoom))
                this._currentScroll.y = Math.round(this._startMoveScenePosition.y + (delta.y / zoom))

                this.updateSceneScroll();
            }
        });
        

    }

    private static updateSceneScroll()
    {
        const currentScroll = this._currentScroll;

        //while((currentScroll.x - (this._mPixelsX.offset || 0)) % this._mPixelsX.interval != 0) currentScroll.x += 1
        //while((currentScroll.y - (this._mPixelsY.offset || 0)) % this._mPixelsY.interval != 0) currentScroll.y += 1

        Camera.setPosition(currentScroll.x, currentScroll.y)
    }

    private static updateMovePosition(pos: Phaser.Math.Vector2) {
        //this._oldMovePosition.x = pos.x;
        //this._oldMovePosition.y = pos.y;
    }
}