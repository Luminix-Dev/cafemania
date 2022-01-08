
import socketio, { Socket } from 'socket.io';
import { BaseObject } from '../baseObject/baseObject';
import { Game } from "../game/game";
import { Gamelog } from '../gamelog/gamelog';
import { IPacket, IPacketData_JoinServer, IPacketData_ServerList, IPacketData_StoveBeginCookData, IPacketData_WorldData, PACKET_TYPE } from '../network/packet';
import { Player } from '../player/player';
import { PlayerClient } from '../player/playerClient';
import { Server } from '../server/server';
import { MasterServer } from '../masterServer/masterServer';
import { TileItemStove } from '../tileItem/items/tileItemStove';
import { TileItem } from '../tileItem/tileItem';
import { SyncType, World } from '../world/world';
import { WorldEvent } from '../world/worldEvents';

/*
const game = new Game();
const world = game.createWorld();
world.sync = SyncType.HOST;
world.generateBaseWorld();

game.start();
*/

export class Client extends BaseObject {
    public get socket() { return this._socket; }
    public get username() { return this._username; }
    public get mainServer() { return this._mainServer; }

    private _socket: socketio.Socket;

    private _mainServer: Server;

    private _atServer?: Server;
    private _atWorld?: World;

    private _username: string = "Guest " + Math.ceil(Math.random()*10000);

    constructor(socket: socketio.Socket) {
        super();

        this._socket = socket;
    }

    public setMainServer(server: Server) {
        this._mainServer = server;
    }

    public getCurrentAddress() {
        const f = this._socket?.handshake.headers["x-forwarded-for"]
        if(typeof f == 'object') return f[0];
        if(!f) return this._socket?.handshake.address || ""
        return f;
    }

    public onConnect() {
        Gamelog.log(this.getCurrentAddress(), `${this.socket.id} connected`);

        this.sendServersList();
    }

    public onDisconnect() {
        Gamelog.log(this.getCurrentAddress(), `${this.socket.id} disconnected`);
    }
    
    public sendServersList() {
        const packetData: IPacketData_ServerList = {
            servers: MasterServer.Instance.servers.map(server => server.getServerListInfo())
        }
        this.send(PACKET_TYPE.SERVER_LIST, packetData);
    }

    public leaveWorld() {
        this.removeListeners();
        this._atWorld = undefined;
    }

    public joinServer(server: Server) {
        Gamelog.log(this.getCurrentAddress(), `${this.socket.id} joined server "${server.name}"`);

        this._atServer = server;

        server.onClientJoin(this);

        const world = server.game.worlds[0];
        this.joinWorld(world);
    }

    public leaveServer() {
        if(!this._atServer) return;

        //this._atServer.onClientLeave
        this._atServer = undefined;


        this.leaveWorld();
    }

    public joinWorld(world: World) {
        if(this._atWorld) this.leaveWorld()
        this._atWorld = world;

        this.bindWorldEvent(WorldEvent.PLAYER_STATE_CHANGED, this.onPlayerStateChangedEvent.bind(this));
        this.bindWorldEvent(WorldEvent.TILE_ITEM_CHANGED, this.onTileItemChangedEvent.bind(this));
        
        
        
        //
        const packetData: IPacketData_WorldData = {
            worldData: world.getSerializedData()
        }
        this.send(PACKET_TYPE.WORLD_DATA, packetData);
        //

    }

    public onPlayerStateChangedEvent(player: Player) {
        const playerData = player.serialize();

        const packetData: IPacketData_WorldData = {
            worldData: {
                tiles: [],
                players: [playerData]
            }
        }
        this.send(PACKET_TYPE.WORLD_DATA, packetData);

        console.log("sent WORLD_DATA : onPlayerStateChangedEvent")
    }

    public onTileItemChangedEvent(tileItem: TileItem) {
        const packetData: IPacketData_WorldData = {
            worldData: {
                tiles: [tileItem.tile.serialize()],
                players: []
            }
        }
        this.send(PACKET_TYPE.WORLD_DATA, packetData);
    }

    private _bindedEvents = new Map<WorldEvent, (...args) => void>();

    public bindWorldEvent(ev: WorldEvent, fn: (...args) => void) {
        this.log("bind world event " + ev);

        this._bindedEvents.set(ev, fn);
        this._atWorld!.events.addListener(ev, fn);
    }

    public unbindWorldEvent(ev: WorldEvent) {
        this.log("unbind world event " + ev);

        const fn = this._bindedEvents.get(ev);
        this._atWorld!.events.removeListener(ev, fn)
        this._bindedEvents.delete(ev);
    }

    public removeListeners() {
        this.unbindWorldEvent(WorldEvent.PLAYER_STATE_CHANGED)
        this.unbindWorldEvent(WorldEvent.TILE_ITEM_CHANGED)
    }

    public send(packetId: number, data: any) {
        const packet: IPacket = {
            type: packetId,
            data: data
        }
        this.socket.emit('p', packet);

        //this.log(`sent packet '${packet.type}'`);
    }

    public onReceivePacket(packet: IPacket) {
        //this.log(`reiceved packet '${packet.type}'`);

        const world = this._atWorld;

        if(world) {
            if(packet.type == PACKET_TYPE.STOVE_BEGIN_COOK) {
                const packetData: IPacketData_StoveBeginCookData = packet.data;

                const stove = world.game.tileItemFactory.getTileItem(packetData.stoveId) as TileItemStove;
                stove.startCookingSomething();
            }
        }

        if(packet.type == PACKET_TYPE.JOIN_SERVER) {
            const packetData: IPacketData_JoinServer = packet.data;

            const server = MasterServer.Instance.getServerById(packetData.id);

            console.log(packetData);

            if(server) {
                this.joinServer(server)
            }
        }

        if(packet.type == PACKET_TYPE.LEAVE_SERVER) {
            this.leaveServer();
        }

        if(packet.type == PACKET_TYPE.REQUEST_SERVER_LIST) {
            this.sendServersList();
        }

        if(packet.type == PACKET_TYPE.ENTER_WORLD) {
            //this.joinWorld(this.game.worlds[0]);
        }

        if(packet.type == PACKET_TYPE.LEAVE_WORLD) {
            //this.joinWorld(this.game.worlds[0]);
        }
    }
}