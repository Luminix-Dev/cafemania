import Phaser from 'phaser';

export class Camera {
    private static _position = new Phaser.Math.Vector2();
    public static canMove = true;

    private static _scene: Phaser.Scene;

    public static setScene(scene: Phaser.Scene) {
        this._scene = scene;
    }

    public static getPosition() {
        return new Phaser.Math.Vector2(this._position.x, this._position.y);
    }

    public static update(dt: number) {
        const scene = this._scene;
        const position = this._position;
        const gameSize = scene.game.scale.gameSize;

        this._scene.cameras.main.setScroll(
            position.x - gameSize.width / 2,
            position.y - gameSize.height / 2
        );
    }

    public static setZoom(zoom: number) {
        this._scene.cameras.main.setZoom(zoom);
    }

    public static zoomTo(zoom: number) {
        this._scene.cameras.main.zoomTo(zoom);
    }

    public static setPosition(x: number, y: number) {
        this._position.set(x, y);
    }
}