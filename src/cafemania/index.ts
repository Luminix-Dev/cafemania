import { Camera } from "./camera/camera";
import { Debug } from "./debug/debug";
import { Gameface } from "./gameface/gameface";
import { Hud } from "./hud/hud";
import { Input } from "./input/input";
import { DebugScene } from "./scenes/debugScene";
import { GameScene } from "./scenes/gameScene";
import { Shop } from "./shop/shop";
import { TileHoverDetection } from "./shop/tileHoverDetection";
import { Tile } from "./tile/tile";

console.log("cafemania index");

const gameface = new Gameface();
gameface.start();

window["gameface"] = gameface;
window["Debug"] = Debug;
window['DebugScene'] = DebugScene;
window['GameScene'] = GameScene;
window['Camera'] = Camera;
window['Input'] = Input;
window['Tile'] = Tile;
window['Shop'] = Shop;
window['TileHoverDetection'] = TileHoverDetection;
window['Hud'] = Hud;

