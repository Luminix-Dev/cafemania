import { Gameface } from "../gameface/gameface";
import { GameScene } from "../scenes/gameScene";
import { Button } from "../ui/button";
import { Hud } from "./hud";
import { HudShopPanel } from "./hudShopPanel";

export class HudTopStatus {
    public static create() {
        const scene = GameScene.Instance;

        const gold_text = Hud.addTextWithIcon("0", 'hud/gold', 24, 24, 52, 20, {fontFamily: 'AlfaSlabOne-Regular', color: "#FFFFFF"});
        gold_text.setFontSize(20);
        gold_text.setStroke("#442715", 6);

        const money_text = Hud.addTextWithIcon("0", 'hud/money', 174, 24, 202, 20, {fontFamily: 'AlfaSlabOne-Regular', color: "#FFFFFF"});
        money_text.setFontSize(20);
        money_text.setStroke("#09432A", 6);

        const text2 = Hud.addText("472 / 7600", 20, 60, {fontFamily: 'AlfaSlabOne-Regular', color: "#FFFFFF"});
        text2.setFontSize(14);
        text2.setStroke("#55330D", 10);

        const text3 = Hud.addText("+18 XP", 20, 100, {fontFamily: 'AlfaSlabOne-Regular', color: "#D3900E"});
        text3.setFontSize(12);
        text3.setStroke("#55330D", 10)
        
        const shopButton =  Hud.addButton("Shop", 60, 150, 80, 40, "button/button1")
        shopButton.onClick = () => {
            HudShopPanel.create()
        }
        
        setInterval(() => {
            const gold = Gameface.Instance.game.gold;
            gold_text.setText(`${gold}`);
        }, 200);
        
        setInterval(() => {
            const money = Gameface.Instance.game.money;
            money_text.setText(`${money}`);
        }, 200);

        setInterval(() => {
            const exp = Gameface.Instance.game.experience;
            text2.setText(`${exp} / ${3000}`);
        }, 200)
    }
}