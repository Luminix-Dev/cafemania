import { Auth } from "../auth/auth";
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

            Auth.init(() => {

                if(Auth.getIsSignedIn()) {
                    console.log("wait..");

                    this.sendSignInPacket(Auth.getGoogleBasicProfileId());
                } else {
                    LoadScene.removeScene();

                    console.log("login buttons..")
                    this.createLoginButtons();
                }
    
    
            })

        });


        
    }

    public createLoginButtons() {
        const gameSize = this.scale.gameSize;

        const x = gameSize.width/2;
        const y = gameSize.height/2;


        const signInGooglebutton = new Button(this, x, y - 25, 244, 45, "button/signin_google", 16, ``);
        signInGooglebutton.onClick = () => {

            LoadScene.createScene(LoadSceneType.SIGN, () => {
                const loadScene = LoadScene.Instance;

                Auth.googleSignIn((signedIn, id) => {

                    if(signedIn) {

                        console.log("YES")

                        this.sendSignInPacket(Auth.getGoogleBasicProfileId());
                    }

                });

                

                console.log("created")
            })
        }

        const signInGuestbutton = new Button(this, x, y + 25, 244, 45, "button/signin_guest", 16, ``);
        signInGuestbutton.onClick = () => {
            this.sendSignInPacket();

            LoadScene.createScene(LoadSceneType.SIGN, () => {
                const loadScene = LoadScene.Instance;

                console.log("created")
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

        console.log(data)

        this.scene.remove();

        Gameface.Instance.startScene(UserScene);
    }
}