import { v4 as uuidv4 } from 'uuid';
import { Client } from '../client/client';
import { Game } from '../game/game';
import { PlayerState } from '../player/player';
import { SyncType } from '../world/world';

export class ServerListInfo {
    id: string
    name: string
    players: number
}

export class Server {
    public get id() { return this._id; }
    public get name() { return this._name; }
    public get game() { return this._game; }

    private _id: string = uuidv4();
    private _name: string = "Server";
    private _game: Game;

    constructor() {
        this._game = new Game();
    }

    public start() {
        const game = this._game;
        const world = game.createWorld();
        world.sync = SyncType.HOST;
        world.generateBaseWorld();

        game.start();
    }
    
    public setName(name: string) {
        this._name = name;
    }

    public getServerListInfo() {
        const info: ServerListInfo = {
            id: this.id,
            name: this.name,
            players: 6,
        }

        return info;
    }

    public destroy() {

        this.game.removeWorlds();

    }

    public onClientJoin(client: Client) {
        const world = this.game.worlds[0];

        const player = world.spawnPlayer();
        player.setAtTileCoord(3, (Math.round(Math.random()*5)))
        player.setAsChangedState();

        client.setPlayer(player);

        /*
        setInterval(() => {
            if(player.state != PlayerState.WALKING) {
                player.taskWalkNearToTile(player.world.tileMap.getTile(Math.round(Math.random()*5), Math.round(Math.random()*5)));
            }
        }, 500)
        */
    }
}