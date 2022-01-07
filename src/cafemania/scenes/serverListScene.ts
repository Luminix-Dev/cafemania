import { Camera } from "../camera/camera";
import { Gameface } from "../gameface/gameface";
import { Grid } from "../grid/grid"
import { PACKET_TYPE } from "../network/packet";
import { ServerListInfo } from "../server/server";
import { Button } from "../ui/button";
import { GameScene } from "./gameScene";

export class ServerListScene extends Phaser.Scene {
    public static Instance: ServerListScene;

    private _servers: ServerListInfo[] = [];

    constructor() {
        super({});
        ServerListScene.Instance = this;
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

                ServerListScene.destroy();
                Gameface.Instance.setHudVisible(true)
            }

            i++;
        }  
    }

    public joinServer(id: string) {
        Gameface.Instance.createBaseWorld(true);
        Gameface.Instance.network.sendJoinServer(id);
    }

    public preload() {
        this.load.setPath(Gameface.ASSETS_URL);
    }

    public create() {
        
    }

    public static show() {
        const phaser = Gameface.Instance.phaser;
        phaser.scene.add('ServerListScene', ServerListScene, true);
    }

    public static destroy() {
        this.Instance.scene.remove();
    }
}