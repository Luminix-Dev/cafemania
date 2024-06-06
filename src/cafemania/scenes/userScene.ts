import { Auth } from "../auth/auth";
import { Debug } from "../debug/debug";
import { Gameface } from "../gameface/gameface";
import { Button } from "../ui/button";
import { LoginScene } from "./loginScene";
import { ServersListScene } from "./serverListScene";

export class UserScene extends Phaser.Scene {
    public static Instance: UserScene;
    
    constructor() {
        super({});
        UserScene.Instance = this;
    }

    public async create() {
        this.add.image(0, 0, 'background').setOrigin(0);

        const gameSize = this.scale.gameSize;

        const x = gameSize.width/2;
        const y = gameSize.height/2;

        const playbutton = new Button(this, `Play`, x, y - 25, 244, 45, "button/play");
        playbutton.onClick = () => {
            if (Debug.consoleLog) console.log("play")

            Gameface.Instance.removeScene(UserScene);
            Gameface.Instance.startScene(ServersListScene);
        }

        const signOutButton = new Button(this, `Sign out`, x, y + 25, 244, 45, "button/signout");
        signOutButton.onClick = () => {
            if (Debug.consoleLog) console.log("sign out")

            Auth.signOut(() => {

                this.scene.remove();
                Gameface.Instance.startScene(LoginScene)
            })

        }

        const singleplayer = new Button(this, `Singleplayer`, x, gameSize.height - 30, 244, 45, "button/play");
        singleplayer.onClick = () => {
            if (Debug.consoleLog) console.log("singleplayer")

            Gameface.Instance.createBaseWorld();
            Gameface.Instance.removeScene(UserScene);
            //gameface.setHudVisible(true)
            //gameface.createHud();
            //gameface.updateScenesOrder();
        }

        
        const userInfo = Auth.getUserInfo();
        
        const userText = this.add.text(x, y + 140, userInfo.name, {fontFamily: 'AlfaSlabOne-Regular', color: "#FFFFFF"});
        userText.setFontSize(18);
        userText.setStroke("#55330D", 10)
        userText.setOrigin(0.5)
        
        const idText = this.add.text(x, y + 170, "ID " + userInfo.id, {fontFamily: 'AlfaSlabOne-Regular', color: "#FFFFFF"});
        idText.setFontSize(18);
        idText.setStroke("#55330D", 10)
        idText.setOrigin(0.5)

        //
        //singleplayer.onClick();
    }

  
}