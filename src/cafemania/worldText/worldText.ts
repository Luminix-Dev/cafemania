//destroy textgo

export interface WorldText {
    text: string;
    lifetime: number;
    speed: number;
    container?: Phaser.GameObjects.Container;
    position: Phaser.Math.Vector2;
    atHud: boolean;
}