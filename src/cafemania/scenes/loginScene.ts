import { Auth } from "../auth/auth";
import { Debug } from "../debug/debug";
import { Gameface } from "../gameface/gameface";
import { IPacketData_SignIn, IPacketData_SignInResult, PACKET_TYPE } from "../network/packet";
import { Button } from "../ui/button";
import { LoadScene, LoadSceneType } from "./loadScene";
import { UserScene } from "./userScene";

export class LoginScene extends Phaser.Scene {
    public static Instance: LoginScene;
    
    constructor() {
        super({});
        LoginScene.Instance = this;
    }

    public async create() {
        this.add.image(0, 0, 'background').setOrigin(0);

        LoadScene.createScene(LoadSceneType.SIGN, () => {


            //
            this.sendSignInPacket();
            return;

            Auth.init(() => {

                if(Auth.getIsSignedIn()) {
                    if (Debug.consoleLog) console.log("wait..");

                    this.sendSignInPacket(Auth.getGoogleBasicProfileId());
                } else {
                    LoadScene.removeScene();

                    if (Debug.consoleLog) console.log("login buttons..")
                    this.createLoginButtons();
                }
    
    
            })

        });


        
    }

    public createLoginButtons() {
        const gameSize = this.scale.gameSize;

        const x = gameSize.width/2;
        const y = gameSize.height/2;


        const signInGooglebutton = new Button(this, `Sign in with Google`, x, y - 25, 244, 45, "button/signin_google");
        signInGooglebutton.onClick = () => {

            LoadScene.createScene(LoadSceneType.SIGN, () => {
                const loadScene = LoadScene.Instance;

                Auth.googleSignIn((signedIn, id) => {

                    if(signedIn) {

                        if (Debug.consoleLog) console.log("YES")

                        this.sendSignInPacket(Auth.getGoogleBasicProfileId());
                    }

                });

                

                if (Debug.consoleLog) console.log("created")
            })
        }

        const signInGuestbutton = new Button(this, `Guest`, x, y + 25, 244, 45, "button/signin_guest");
        signInGuestbutton.onClick = () => {
            this.sendSignInPacket();

            LoadScene.createScene(LoadSceneType.SIGN, () => {
                const loadScene = LoadScene.Instance;

                if (Debug.consoleLog) console.log("created")
            })
        }
    }

    public sendSignInPacket(id?: string) {
        const network = Gameface.Instance.network;

        const data: IPacketData_SignIn = {
            id: id
        }
        network.send(PACKET_TYPE.SIGN_IN, data);
    }

    public onReceiveSignInResult(data: IPacketData_SignInResult) {
        LoadScene.removeScene();

        if (Debug.consoleLog) console.log(data)

        this.scene.remove();

        Gameface.Instance.startScene(UserScene);
    }
}