import { Debug } from "./debug/debug";
import { Gameface } from "./gameface/gameface";
import { DebugScene } from "./scenes/debugScene";

console.log("cafemania index");

const game = new Gameface();
game.start();

window["game"] = game;
window["Debug"] = Debug;
window['DebugScene'] = DebugScene;