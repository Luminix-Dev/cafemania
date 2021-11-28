import socketio, { Socket } from 'socket.io';
import { BaseObject } from '../baseObject/baseObject';
import { Game } from '../game/game';

export class ServerHost extends BaseObject {
    constructor(io: socketio.Server) {
        super();
        io.on('connection', socket => this.onSocketConnect(socket));

        this.log("constructor");
    }

    private onSocketConnect(socket: socketio.Socket) {
        this.log(socket.id + " connected");

        /*
        const game = new Game();

        game.events.on('ready', () => {
            game.createWorld();
        })

        game.start();
        */
    }
}