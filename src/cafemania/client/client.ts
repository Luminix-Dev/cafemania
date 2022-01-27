
import { v4 as uuidv4 } from 'uuid';

import socketio, { Socket } from 'socket.io';
import { BaseObject } from '../baseObject/baseObject';
import { Game } from "../game/game";
import { Gamelog } from '../gamelog/gamelog';
import { IPacket, IPacketData_JoinServer, IPacketData_JoinServerStatus, IPacketData_MovePlayer, IPacketData_ServerList, IPacketData_SignIn, IPacketData_SignInResult, IPacketData_StartCook, IPacketData_StoveTakeDish, IPacketData_WorldData, PACKET_TYPE } from '../network/packet';
import { Player } from '../player/player';
import { PlayerClient } from '../player/playerClient';
import { Server } from '../server/server';
import { MasterServer } from '../masterServer/masterServer';
import { TileItemStove } from '../tileItem/items/tileItemStove';
import { TileItem } from '../tileItem/tileItem';
import { SyncType, World } from '../world/world';
import { WorldEvent } from '../world/worldEvents';
import { IUserInfo, User } from './user';
import { Gameface } from '../gameface/gameface';
import { ServersListScene } from '../scenes/serverListScene';

/*
const game = new Game();
const world = game.createWorld();
world.sync = SyncType.HOST;
world.generateBaseWorld();

game.start();
*/



export class Client extends BaseObject {
    public get id() { return this._id; }
    public get socket() { return this._socket; }
    public get user() { return this._user!; }
    
    private _id: string = uuidv4();
    private _socket: socketio.Socket;
    private _user?: User;


    constructor(socket: socketio.Socket) {
        super();

        this._socket = socket;
    }

    public getCurrentAddress() {
        const f = this._socket?.handshake.headers["x-forwarded-for"]
        if(typeof f == 'object') return f[0];
        if(!f) return this._socket?.handshake.address || ""
        return f;
    }

    public onConnect() {
        Gamelog.log(this.getCurrentAddress(), `${this.socket.id} connected`);

        //this.sendServersList();
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

    /*

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

    */

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

    /*
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

    */

    public send(packetId: number, data: any) {
        const packet: IPacket = {
            type: packetId,
            data: data
        }
        this.socket.emit('p', packet);

        //this.log(`sent packet '${packet.type}'`);
    }

    public setUser(user: User) {
        this._user = user;
        
        user.setClient(this);
    }

    public onReceivePacket(packet: IPacket) {
        //this.log(`reiceved packet '${packet.type}'`);

        if(packet.type == PACKET_TYPE.SIGN_IN) {
            const packetData: IPacketData_SignIn = packet.data;

            const id = packetData.id;

            if(id) {
                console.log("google", id)

                const user = MasterServer.Instance.createUser();
                user.nickname = "User " + user.id.slice(0, 8);

                this.setUser(user);

            } else {
                console.log("guest")

                const user = MasterServer.Instance.createUser();
                user.nickname = "Guest " + user.id.slice(0, 8);

                this.setUser(user);
            }

            //
            const server = MasterServer.Instance.createServer(`${this.user.nickname}'s cafe`);
            server.setOwnerUser(this.user);
            server.start();
            this.user.setMainServer(server);
            //



            const data: IPacketData_SignInResult = {
                success: true,
                userInfo: this.user.getUserInfo()
            }
            this.send(PACKET_TYPE.SIGN_IN_RESULT, data);
        }

        if(packet.type == PACKET_TYPE.REQUEST_SERVER_LIST) {
            this.sendServersList();
        }

        if(packet.type == PACKET_TYPE.JOIN_SERVER) {
            const packetData: IPacketData_JoinServer = packet.data;
            const server = MasterServer.Instance.getServerById(packetData.id);

            if(server) {
                this.user.joinServer(server);
            }
        }

        if(packet.type == PACKET_TYPE.LEAVE_SERVER) {
            this.user.leaveServer();
        }

        this._user?.onReceivePacket(packet);

        /*
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

        

        

        if(packet.type == PACKET_TYPE.ENTER_WORLD) {
            //this.joinWorld(this.game.worlds[0]);
        }

        if(packet.type == PACKET_TYPE.LEAVE_WORLD) {
            //this.joinWorld(this.game.worlds[0]);
        }
        */
    }
}