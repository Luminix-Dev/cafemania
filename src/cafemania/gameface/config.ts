export const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.WEBGL,
    transparent: false,
    backgroundColor: 0x000,
    roundPixels: false,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 900,
        height: 600
    },
    scene: {}
}