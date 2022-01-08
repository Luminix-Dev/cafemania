import { Gameface } from "../gameface/gameface";
import { ServerListInfo } from "../server/server";
import { Button } from "../ui/button";

export class ServerListScene extends Phaser.Scene {
    public static Instance: ServerListScene;

    private _servers: ServerListInfo[] = [];

    constructor() {
        super({});
        ServerListScene.Instance = this;
    }

    public create() {
        
    }

    public updateServerList(servers: ServerListInfo[]) {
        this._servers = servers;

        this.createServersButtons();
    }

    private createServersButtons() {
        let i = 0;

        for (const serverInfo of this._servers) {
            const joinBtn = new Button(this, this.scale.width/2, i * 40 + 20, 400, 35, "button/button1", `${serverInfo.name} (- players)`);
            
            joinBtn.onClick = () => {
                this.joinServer(serverInfo.id);
            }

            i++;
        }  
    }

    public joinServer(id: string) {
        Gameface.Instance.createBaseWorld(true);
        
        Gameface.Instance.removeScene(ServerListScene);
        Gameface.Instance.setHudVisible(true)

        Gameface.Instance.network.sendJoinServer(id);
    }


    
    /*
    private testButtons() {

        const w = this.scale.width;
        const h = this.scale.height;

        const x = w * 0.5;
        const y = h * 0.5;
		
        const multiplayerBtn = new Button(this, x, y + 100, 200, 40, "button/button1", "Multiplayer");
        const singleplayerBtn = new Button(this, x, y + 160, 200, 40, "button/button1", "Singleplayer");


        const gameface = Gameface.Instance;
        const network = gameface.network;
        
        const destroyButtons = () => {
            multiplayerBtn.destroy();
            singleplayerBtn.destroy();
        }

        multiplayerBtn.onClick = () => {
            destroyButtons();

            Gameface.Instance.createBaseWorld(true);
            network.send(PACKET_TYPE.ENTER_WORLD, null);
        }

        singleplayerBtn.onClick = () => {
            destroyButtons();

            Gameface.Instance.createBaseWorld(false);
        }
    }
    */
}