
import socketio, { Socket } from 'socket.io';
import { BaseObject } from '../baseObject/baseObject';
import { Game } from "../game/game";
import { IPacket, IPacketData_StoveBeginCookData, IPacketData_WorldData, PACKET_TYPE } from '../network/packet';
import { Player } from '../player/player';
import { PlayerClient } from '../player/playerClient';
import { ServerHost } from '../serverHost/serverHost';
import { TileItemStove } from '../tileItem/items/tileItemStove';
import { TileItem } from '../tileItem/tileItem';
import { SyncType, World } from '../world/world';
import { WorldEvent } from '../world/worldEvents';

const game = new Game();
const world = game.createWorld();
world.sync = SyncType.HOST;
world.generateBaseWorld();

game.start();

export class Client extends BaseObject {
    public get game() { return this._game; }
    public get socket() { return this._socket; }

    private _game: Game;
    private _socket: socketio.Socket;

    private _world?: World;

    constructor(socket: socketio.Socket) {
        super();

        this._socket = socket;
        this._game = game;

        socket.on('p', (packet: IPacket) => {
            this.onReceivePacket(packet);
        })
        socket.on('disconnect', () => {
            this.onDisconnect()
        })
        this.onConnect();
    }

    public getCurrentAddress() {
        return this._socket!.handshake.address
    }

    private onConnect() {
        ServerHost.postGameLog(this.getCurrentAddress(), "connected")
    }

    private onDisconnect() {
        ServerHost.postGameLog(this.getCurrentAddress(), "disconnected")
    }
    

    public joinWorld(world: World) {
        if(this._world) {
            this.removeListeners();
        }

        this._world = world;

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
        world.events.addListener(ev, fn);
    }

    public unbindWorldEvent(ev: WorldEvent) {
        this.log("unbind world event " + ev);

        const fn = this._bindedEvents.get(ev);
        this._world?.events.removeListener(ev, fn)
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

        const world = this._world;

        if(world) {
            if(packet.type == PACKET_TYPE.STOVE_BEGIN_COOK) {
                const packetData: IPacketData_StoveBeginCookData = packet.data;

                const stove = world.game.tileItemFactory.getTileItem(packetData.stoveId) as TileItemStove;
                stove.startCookingSomething();
            }
        }

        if(packet.type == PACKET_TYPE.ENTER_WORLD) {
            this.joinWorld(this.game.worlds[0]);
        }
    }
}