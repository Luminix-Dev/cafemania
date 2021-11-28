import { Camera } from "./camera/camera";
import { Debug } from "./debug/debug";
import { Gameface } from "./gameface/gameface";
import { Input } from "./input/input";
import { DebugScene } from "./scenes/debugScene";
import { GameScene } from "./scenes/gameScene";

console.log("cafemania index");

const gameface = new Gameface();
gameface.start();

window["gameface"] = gameface;
window["Debug"] = Debug;
window['DebugScene'] = DebugScene;
window['GameScene'] = GameScene;
window['Camera'] = Camera;
window['Input'] = Input;