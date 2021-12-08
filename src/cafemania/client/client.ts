import socketio, { Socket } from 'socket.io';
import { BaseObject } from '../baseObject/baseObject';
import { Game } from "../game/game";
import { IPacket, IPacketData_StoveBeginCookData, IPacketData_WorldData, PACKET_TYPE } from '../network/packet';
import { Player } from '../player/player';
import { PlayerClient } from '../player/playerClient';
import { TileItemStove } from '../tileItem/items/tileItemStove';
import { TileItem } from '../tileItem/tileItem';
import { SyncType } from '../world/world';
import { WorldEvent } from '../world/worldEvents';

const game = new Game();
const world = game.createWorld();
world.sync = SyncType.HOST;
world.initBaseWorld();

game.start();

export class Client extends BaseObject {
    public get game() { return this._game; }
    public get socket() { return this._socket; }

    private _game: Game;
    private _socket: socketio.Socket;

    constructor(socket: socketio.Socket) {
        super();

        this._socket = socket;
        this._game = game;

        socket.on('p', (packet: IPacket) => {
            this.onReceivePacket(packet);
        })
        //

        console.log("setup events on worlds")
        game.worlds.map(world => {

            world.events.on(WorldEvent.PLAYER_STATE_CHANGED, (player: Player) => {
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
            })

            world.events.on(WorldEvent.TILE_ITEM_CHANGED, (tileItem: TileItem) => {
                //console.log("changed");

                const packetData: IPacketData_WorldData = {
                    worldData: {
                        tiles: [tileItem.tile.serialize()],
                        players: []
                    }
                }
                this.send(PACKET_TYPE.WORLD_DATA, packetData);
            })

        })
        
        const packetData: IPacketData_WorldData = {
            worldData: world.getSerializedData()
        }
        this.send(PACKET_TYPE.WORLD_DATA, packetData);
        
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

        const world = this.game.worlds[0];

        
        if(packet.type == PACKET_TYPE.STOVE_BEGIN_COOK) {
            const packetData: IPacketData_StoveBeginCookData = packet.data;

            const stove = world.game.tileItemFactory.getTileItem(packetData.stoveId) as TileItemStove;
            stove.startCookingSomething();
        }
    }
}