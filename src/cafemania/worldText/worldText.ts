//destroy textgo

export class WorldText {
    public lifetime: number;
    public speed: number;
    public container: Phaser.GameObjects.Container;
    public position: Phaser.Math.Vector2;

    constructor(scene: Phaser.Scene, text: string, lifetime: number, speed: number) {
        this.lifetime = lifetime
        this.speed = speed;
        this.container = scene.add.container();
        this.position = new Phaser.Math.Vector2();

        const textGo = scene.add.text(0, 0, text, {fontFamily: 'AlfaSlabOne-Regular', color: "#D3900E"});
        textGo.setFontSize(10);
        textGo.setStroke("#55330D", 8);

        this.container.add(textGo);
    }

    public destroy() {
        this.container.destroy();
    }
}