import { io, Socket } from "socket.io-client";
import { BaseObject } from "../baseObject/baseObject";
import { Debug } from "../debug/debug";
import { WorldSyncHelper } from "../world/worldSyncHelper";
import { IPacket, IPacketData_WorldData, PACKET_TYPE } from "./packet";

export class Network extends BaseObject {
    public static SERVER_ADDRESS: string = "https://cafemania.danilomaioli.repl.co";
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
        if(location.host.includes('localhost') || location.host.includes('192.168')) return `${location.protocol}//${location.host}/`;
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

    public onReceivePacket(packet: IPacket) {
        this.log(`reiceved packet '${packet.type}'`);

        if(packet.type == PACKET_TYPE.WORLD_DATA) {
            const packetData: IPacketData_WorldData = packet.data;

            if(!WorldSyncHelper.world) return;
            WorldSyncHelper.processWorldData(packetData.worldData);
        }
    }
}