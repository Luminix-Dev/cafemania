import socketio, { Socket } from 'socket.io';
import { BaseObject } from '../baseObject/baseObject';
import { Game } from "../game/game";
import { IPacket, IPacketData_StoveBeginCookData, IPacketData_WorldData, PACKET_TYPE } from '../network/packet';
import { Player } from '../player/player';
import { PlayerClient } from '../player/playerClient';
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
    }

    public joinWorld(world: World) {
        console.log("setup events on worlds")

        const onPlayerStateChangedEvent = (player: Player) => {
            console.log("\n\n\n\nCHANGED\n\n\n\n")

            //console.log("changed");

            const playerData = player.serialize();

            const packetData: IPacketData_WorldData = {
                worldData: {
                    tiles: [],
                    players: [playerData]
                }
            }
            this.send(PACKET_TYPE.WORLD_DATA, packetData);

            //console.log(playerData.tasks)
        }

        const onTileItemChangedEvent = (tileItem: TileItem) => {
            //console.log("changed");

            console.log("\n\n\n\nCHANGED\n\n\n\n")


            const packetData: IPacketData_WorldData = {
                worldData: {
                    tiles: [tileItem.tile.serialize()],
                    players: []
                }
            }
            this.send(PACKET_TYPE.WORLD_DATA, packetData);
        }

        if(this._world) {
            this._world.events.removeListener(WorldEvent.PLAYER_STATE_CHANGED, onPlayerStateChangedEvent)
            this._world.events.removeListener(WorldEvent.TILE_ITEM_CHANGED, onTileItemChangedEvent)
        }

        this._world = world;

        world.events.addListener(WorldEvent.PLAYER_STATE_CHANGED, onPlayerStateChangedEvent);
        world.events.addListener(WorldEvent.TILE_ITEM_CHANGED, onTileItemChangedEvent);
        
        
        //
        const packetData: IPacketData_WorldData = {
            worldData: world.getSerializedData()
        }
        this.send(PACKET_TYPE.WORLD_DATA, packetData);
        //
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