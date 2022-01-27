import { Auth } from "../auth/auth";
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

        const playbutton = new Button(this, x, y - 25, 244, 45, "button/play", 16, `Play`);
        playbutton.onClick = () => {
            console.log("play")

            Gameface.Instance.removeScene(UserScene);
            Gameface.Instance.startScene(ServersListScene);
        }

        const signOutButton = new Button(this, x, y + 25, 244, 45, "button/signout", 16, `Sign out`);
        signOutButton.onClick = () => {
            console.log("sign out")

            Auth.signOut(() => {

                this.scene.remove();
                Gameface.Instance.startScene(LoginScene)
            })

        }

        const singleplayer = new Button(this, x, gameSize.height - 30, 244, 45, "button/play", 16, `Singleplayer`);
        singleplayer.onClick = () => {
            console.log("singleplayer")

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
    }

  
}