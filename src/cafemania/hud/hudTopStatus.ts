import { Gameface } from "../gameface/gameface";
import { GameScene } from "../scenes/gameScene";
import { Hud } from "./hud";

export class HudTopStatus {
    public static create() {
        const scene = GameScene.Instance;

        const text = Hud.addText( "211429", 20, 20, {fontFamily: 'AlfaSlabOne-Regular', color: "#FCE909"});
        text.setFontSize(20);
        text.setStroke("#55330D", 10)

        const text2 = Hud.addText("472 / 7600", 20, 60, {fontFamily: 'AlfaSlabOne-Regular', color: "#FFFFFF"});
        text2.setFontSize(14);
        text2.setStroke("#55330D", 10)

        const text3 = Hud.addText("+18 XP", 20, 100, {fontFamily: 'AlfaSlabOne-Regular', color: "#D3900E"});
        text3.setFontSize(12);
        text3.setStroke("#55330D", 10)

        setInterval(() => {
            const money = Gameface.Instance.game.money;
            text.setText(`${money}`);
        }, 200)

        setInterval(() => {
            const exp = Gameface.Instance.game.experience;
            text2.setText(`${exp} / ${3000}`);
        }, 200)
    }
}