import { io, Socket } from "socket.io-client";
import { BaseObject } from "../baseObject/baseObject";
import { Debug } from "../debug/debug";

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
            //path: '/socket',
            autoConnect: false,
            reconnection: false
        });

        this._socket.once('connect', () => {
            this._onConnectCallback?.();
            Debug.log("connected")
        })

        /*
        this._socket.on('p', (packet: IPacket) => {
            this.onReceivePacket(packet);
        })
        */

        this.log(`address: (${this.getAddress()})`)
    }

    public connect(callback: () => void) {
        this._onConnectCallback = callback;
        this._socket.connect();

        Debug.log("connecting to " + this.getAddress() + "...")
    }

    public update(dt: number) {
        this._sendPacketTime += dt;

        if(this._sendPacketTime >= this.sendPacketIntervalMs / 1000) {
            this._sendPacketTime = 0;
        }

    }

    public getAddress() {
        if(location.host.includes('localhost')) return `${location.protocol}//${location.host}/`;
        return `${Network.SERVER_ADDRESS}`;
    }

    public send(packetId: number, data: any) {
        /*
        const packet: IPacket = {
            id: packetId,
            data: data
        }
        this._socket.emit('p', packet);
        */
    }

    /*
    public onReceivePacket(packet: IPacket) {
        if(packet.id == PACKET_TYPE.ENTITY_DATA) {
            WorldSync.processEntityPacketData(packet.data);
        }

        if(packet.id == PACKET_TYPE.CONTROL_ENTITY) {
            const data = packet.data as IPacket_ControlEntity;
            WorldSync.entityId = data.id;
        }
    }
    */
}