import { Gameface } from "../gameface/gameface";
import { GameScene } from "../scenes/gameScene";
import { Panel } from "../ui/panel";
import { Hud } from "./hud";
import { HudLockZone } from "./hudLockZone";
import { HudShopPanel } from "./hudShopPanel";

export class HudMainPanel {
    private static _panel?: Panel;

    public static create() {
        const scene = GameScene.Instance;

        const width = 760;
        const height = 150;
        const gameSize = GameScene.Instance.scale;
        const positionX = gameSize.width/2 - width/2;
        const positionY = gameSize.height - height - 5

        const panel = this._panel = new Panel(GameScene.Instance, width, height);
        panel.setButtonsOffset(180, 0);
        panel.container.setPosition(positionX, positionY);
        GameScene.Instance.hudContainer.add(panel.container);

        //panel.addTab("button/panel/waiter")
        //panel.addTab("button/panel/waiter")

        const shopButton = panel.addButton("button/panel/shop");
        shopButton.onClick = () => {
            HudMainPanel.destroy();
            HudShopPanel.create();
        }

        panel.addButton("button/panel/clothes")
        panel.addButton("button/panel/clothes")
        panel.addButton("button/panel/clothes")
        panel.addButton("button/panel/clothes")

        HudLockZone.addLockZone('mainPanel', positionX, positionY, width, height);
    }

    public static destroy() {
        this._panel?.container.destroy();
        HudLockZone.removeLockZone('mainPanel');
    }
}