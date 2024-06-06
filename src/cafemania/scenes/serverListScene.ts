import { Auth } from "../auth/auth";
import { Debug } from "../debug/debug";
import { Gameface } from "../gameface/gameface";
import { PACKET_TYPE } from "../network/packet";
import { ServerListInfo } from "../server/server";
import { Button } from "../ui/button";

export class ServersListScene extends Phaser.Scene {
    public static Instance: ServersListScene;
    
    private static _servers: ServerListInfo[] = [];

    private _buttons = new Map<string, Button>();

    
    constructor() {
        super({});
        ServersListScene.Instance = this;
    }

    public static getServers() {
        return this._servers;
    }

    public static updateServerList(servers: ServerListInfo[]) {
        this._servers = servers;
    }

    public create() {
        Gameface.Instance.network.requestServerList();

        window['ServersListScene'] = ServersListScene;

        //this.add.image(0, 0, 'background').setOrigin(0)

        const gameSize = this.scale.gameSize;

        const x = gameSize.width/2;
        const y = gameSize.height/2;

        
    }

    public update(dt: number) {

        const servers = ServersListScene.getServers();

        for (const server of servers) {
            
            if(!this._buttons.has(server.id)) {

                const serverName = (Auth.getUserInfo().id == server.ownerUserId ? "(Home) " : '') + server.name;

                const button = new Button(this, serverName, 300, 50 + servers.indexOf(server) * 50, 360, 45, "button/signout");
                button.onClick = () => {
                    if (Debug.consoleLog) console.log("sv")

                    Gameface.Instance.network.sendJoinServer(server.id);
                }

                this._buttons.set(server.id, button);

            }

        }


    }
}