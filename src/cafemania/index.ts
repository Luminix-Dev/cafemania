import { Gameface } from "./gameface/gameface";

console.log("cafemania index");

const game = new Gameface();
game.start();

window["game"] = game;