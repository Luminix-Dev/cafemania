import { io, Socket } from "socket.io-client";
import { Auth } from "../auth/auth";
import { BaseObject } from "../baseObject/baseObject";
import { Debug } from "../debug/debug";
import { Dish } from "../dish/dish";
import { Gameface } from "../gameface/gameface";
import { Hud } from "../hud/hud";
import { ServersListScene } from "../scenes/serverListScene";
import { Tile } from "../tile/tile";
import { TileItemStove } from "../tileItem/items/tileItemStove";
import { TileItem } from "../tileItem/tileItem";
import { TileItemInfo } from "../tileItem/tileItemInfo";
import { WorldSyncHelper } from "../world/worldSyncHelper";
import { IPacket, IPacketData_BuyTileItem, IPacketData_JoinServer, IPacketData_JoinServerStatus, IPacketData_MovePlayer, IPacketData_MoveTileItem, IPacketData_ServerList, IPacketData_SignInResult, IPacketData_StartCook, IPacketData_StoveTakeDish, IPacketData_WorldData, PACKET_TYPE } from "./packet";

export class Network extends BaseObject {
    //public static SERVER_ADDRESS: string = "https://cafemania.danilomaioli.repl.co";
    public static SERVER_ADDRESS: string = "https://cafemania.glitch.me";
    public sendPacketIntervalMs: number = 80;

    public get socket() { return this._socket; }

    private _socket: Socket;
    private _sendPacketTime: number = 0;
    private _onConnectCallback?: () => void;

    constructor() {
        super();
        this.init();
    }

    public init() {
        this._socket = io(this.getAddress(), {
            autoConnect: false,
            reconnection: false
        });

        this._socket.once('connect', () => {
            this._onConnectCallback?.();
        })

        this._socket.on('p', (packet: IPacket) => {
            this.onReceivePacket(packet);
        })

        this.log(`address: (${this.getAddress()})`)
    }

    public connect(callback: () => void) {
        if(this.socket.connected) {
            callback();
            return; 
        }

        this._onConnectCallback = callback;
        this._socket.connect();
    }

    public update(dt: number) {
        this._sendPacketTime += dt;

        if(this._sendPacketTime >= this.sendPacketIntervalMs / 1000) {
            this._sendPacketTime = 0;
        }
    }

    public getAddress() {
        if(location.host.includes('localhost') || location.host.includes(':')) return `${location.protocol}//${location.host}/`;
        return `${Network.SERVER_ADDRESS}`;
    }

    public send(type: PACKET_TYPE, data: any) {
        const packet: IPacket = {
            type: type,
            data: data
        }
        this._socket.emit('p', packet);
        this.log(`sent packet '${packet.type}'`);
    }

    public sendJoinServer(id: string) {
        const packetData: IPacketData_JoinServer = {
            id: id
        };
        this.send(PACKET_TYPE.JOIN_SERVER, packetData);
    }

    public sendMovePlayer(x: number, y: number) {
        const packetData: IPacketData_MovePlayer = {
            x: x,
            y: y
        };
        this.send(PACKET_TYPE.MOVE_PLAYER, packetData);
    }

    public sendStoveTakeDish(stove: TileItemStove) {
        const packetData: IPacketData_StoveTakeDish = {
            stoveId: stove.id
        }
        
        this.send(PACKET_TYPE.STOVE_TAKE_DISH, packetData);
    }

    public sendStartCook(stove: TileItemStove, dish: Dish) {
        const packetData: IPacketData_StartCook = {
            stoveId: stove.id,
            dish: dish.id
        }
        
        this.send(PACKET_TYPE.START_COOK, packetData);
    }

    public sendLeaveServer() {
        this.send(PACKET_TYPE.LEAVE_SERVER, null);
    }
    
    public requestServerList() {
        this.send(PACKET_TYPE.REQUEST_SERVER_LIST, null);
    }

    public sendBuyTileItem(tileItemInfo: TileItemInfo, tile: Tile) {
        const packetData: IPacketData_BuyTileItem = {
            id: tileItemInfo.id,
            x: tile.x,
            y: tile.y
        }
        this.send(PACKET_TYPE.BUY_TILEITEM, packetData);

    }

    public sendMoveTileItem(tileItem: TileItem, tile: Tile) {
        const packetData: IPacketData_MoveTileItem = {
            id: tileItem.id,
            x: tile.x,
            y: tile.y
        }
        this.send(PACKET_TYPE.MOVE_TILEITEM, packetData);

    }

    public onReceivePacket(packet: IPacket) {
        //this.log(`reiceved packet '${packet.type}'`);

        if(packet.type == PACKET_TYPE.WORLD_DATA) {
            const packetData: IPacketData_WorldData = packet.data;
            WorldSyncHelper.processWorldData(packetData.worldData);
        }

        if(packet.type == PACKET_TYPE.SERVER_LIST) {
            const packetData: IPacketData_ServerList = packet.data;
            ServersListScene.updateServerList(packetData.servers);
        }

        if(packet.type == PACKET_TYPE.SIGN_IN_RESULT) {
            const packetData: IPacketData_SignInResult = packet.data;
            Auth.onReceiveSignInResult(packetData);
        }

        if(packet.type == PACKET_TYPE.JOIN_SERVER_STATUS) {
            const packetData: IPacketData_JoinServerStatus = packet.data;
            if (Debug.consoleLog) console.log(packetData)

            if(packetData.success) {
                Gameface.Instance.removeScene(ServersListScene);
                Gameface.Instance.createBaseWorld(true);
                
            }
        }

        /*
        if(packet.type == PACKET_TYPE.JOINED_SERVER) {
            const packetData: IPacketData_ServerList = packet.data;
            ServerListScene.Instance.updateServerList(packetData.servers);
        }
        */
    }
}