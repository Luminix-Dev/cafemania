import { v4 as uuidv4 } from 'uuid';
import { Gamelog } from '../gamelog/gamelog';
import { IPacket, IPacketData_BuyTileItem, IPacketData_JoinServerStatus, IPacketData_MovePlayer, IPacketData_MoveTileItem, IPacketData_StartCook, IPacketData_StoveTakeDish, IPacketData_WorldData, PACKET_TYPE } from '../network/packet';

import { Player } from "../player/player";
import { Server } from "../server/server";
import { TileItemStove } from '../tileItem/items/tileItemStove';
import { TileItem } from '../tileItem/tileItem';
import { EventRegister } from '../utils/eventRegister';
import { World } from "../world/world";
import { WorldEvent } from '../world/worldEvent';
import { Client } from './client';
import { Debug } from '../debug/debug';

export interface IUserInfo {
    id: string
    name: string
}

export class User {
    public get id() { return this._id; };
    public get nickname() { return this._nickname; };
    public set nickname(value: string) { this._nickname = value; };
    public get mainServer() { return this._mainServer; }
    public get player() { return this._player!; }
    public get client() { return this._client!; }

    private _id: string = uuidv4();
    private _nickname: string = "";
    private _mainServer: Server;
    private _player?: Player;
    private _client?: Client;

    private _atServer?: Server;
    private _atWorld?: World;

    private _eventRegister: EventRegister;
    
    constructor() {
        this._eventRegister = new EventRegister(this);
    }

    public getUserInfo() {
        const info: IUserInfo = {
            id: this.id,
            name: this.nickname
        }
        return info;
    }

    public setPlayer(player: Player) {
        this._player = player;
    }

    public setClient(client: Client) {
        this._client = client;
    }

    public setMainServer(server: Server) {
        this._mainServer = server;
    }

    public joinServer(server: Server) {
        if(this._atServer) {
            const packetData: IPacketData_JoinServerStatus = {
                success: false
            }
            this.client.send(PACKET_TYPE.JOIN_SERVER_STATUS, packetData);

            return;
        }

        Gamelog.log(this.client.getCurrentAddress(), `${this.client.socket.id} joined server "${server.name}"`);

        this._atServer = server;

        server.onUserJoin(this);

        const packetData: IPacketData_JoinServerStatus = {
            success: true
        }
        this.client.send(PACKET_TYPE.JOIN_SERVER_STATUS, packetData);

        if (Debug.consoleLog) console.log(packetData)


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
        //if(this._atWorld) this.leaveWorld()
        this._atWorld = world;

        const worldEvents = world.events;

        this._eventRegister.addListener(worldEvents, WorldEvent.PLAYER_STATE_CHANGED, this.onPlayerStateChangedEvent.bind(this));
        this._eventRegister.addListener(worldEvents, WorldEvent.TILE_ITEM_CHANGED, this.onTileItemChangedEvent.bind(this));
        
        //
        const packetData: IPacketData_WorldData = {
            worldData: world.getSerializedData()
        }
        this.client.send(PACKET_TYPE.WORLD_DATA, packetData);
        //

    }

    public leaveWorld() {
        this.removeListeners();
        this._atWorld = undefined;
    }

    private removeListeners() {
        this._eventRegister.removeAllListeners();
    }

    //

    private onPlayerStateChangedEvent(player: Player) {
        const playerData = player.serialize();

        const packetData: IPacketData_WorldData = {
            worldData: {
                tiles: [],
                players: [playerData]
            }
        }
        this.client.send(PACKET_TYPE.WORLD_DATA, packetData);

        if (Debug.consoleLog) console.log("sent WORLD_DATA : onPlayerStateChangedEvent")
    }

    private onTileItemChangedEvent(tileItem: TileItem) {
        const packetData: IPacketData_WorldData = {
            worldData: {
                tiles: [tileItem.tile.serialize()],
                players: []
            }
        }
        this.client.send(PACKET_TYPE.WORLD_DATA, packetData);
    }

    public onReceivePacket(packet: IPacket) {
        const world = this._atWorld;

        if(world) {
            if(packet.type == PACKET_TYPE.START_COOK) {
                const packetData: IPacketData_StartCook = packet.data;

                const dishFactory = world.game.dishFactory;
                const dish = dishFactory.getDish(packetData.dish);

                const stove = world.game.tileItemFactory.getTileItem(packetData.stoveId) as TileItemStove;

                stove.startCook(dish);
            }

            if(packet.type == PACKET_TYPE.STOVE_TAKE_DISH) {
                const packetData: IPacketData_StoveTakeDish = packet.data;

                const stove = world.game.tileItemFactory.getTileItem(packetData.stoveId) as TileItemStove;

                stove.takeDish();
            }
        }

        //

        if(packet.type == PACKET_TYPE.MOVE_PLAYER) {
            const packetData: IPacketData_MovePlayer = packet.data;

            const tile = this._atWorld?.tileMap.getTile(packetData.x, packetData.y);

            if(tile && this._player) {
                this._player.taskWalkToTile(tile);
            }
        }

        if(packet.type == PACKET_TYPE.BUY_TILEITEM) {
            const packetData: IPacketData_BuyTileItem = packet.data;
            
            const world = this._atWorld!;

            const tileItem = world.game.tileItemFactory.createTileItem(packetData.id);
            const tile = world.tileMap.getTile(packetData.x, packetData.y);

            const result = world.tryAddTileItemToTile(tileItem, tile);

            if(result) {
                tileItem.setAsChangedState();
            } else {

                world.game.tileItemFactory.removeTileItem(tileItem.id);

                if (Debug.consoleLog) console.log("nope")

            }
        }

        
        if(packet.type == PACKET_TYPE.MOVE_TILEITEM) {
            const packetData: IPacketData_MoveTileItem = packet.data;
            
            const world = this._atWorld!;

            const tileItem = world.game.tileItemFactory.getTileItem(packetData.id);
            
            const tile = world.tileMap.getTile(packetData.x, packetData.y);

            //if (Debug.consoleLog) console.log(tileItem, tile)

            const result = world.tryMoveTileItem(tileItem, tile);

            if(result) {
                tileItem.setAsChangedState();
            } else {

                //world.game.tileItemFactory.removeTileItem(tileItem.id);

                if (Debug.consoleLog) console.log("nope")

            }
        }
    }
}