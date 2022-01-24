import { AssetManager } from "../assetManager/assetManager";

/*
export enum AUDIO {
    TIP
}
*/

export class SoundManager {
    private static _scene?: Phaser.Scene;
    
    public static init() {
        window['SoundManager'] = this;

        this.registerAudio("tip");
        this.registerAudio("menu_open");
        this.registerAudio("menu_changepage");
        this.registerAudio("beep_1");
        this.registerAudio("beep_2");
        this.registerAudio("counter");
        this.registerAudio("begin_cook");
        this.registerAudio("begin_eat0");
        this.registerAudio("begin_eat1");
        this.registerAudio("begin_eat2");
        this.registerAudio("begin_eat3");
    }

    public static setScene(scene: Phaser.Scene) {
        this._scene = scene;
    }

    public static registerAudio(name: string) {
        AssetManager.addAudio("audio/" + name, 'audio/' + name + '.mp3');
    }

    public static play(audio: string) {
        this._scene?.sound.play("audio/" + audio);
    }
}