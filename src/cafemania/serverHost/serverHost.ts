import socketio, { Socket } from 'socket.io';
import { BaseObject } from '../baseObject/baseObject';
import { Client } from '../client/client';

const request = require('request');

export class ServerHost extends BaseObject {
    constructor(io: socketio.Server) {
        super();
        io.on('connection', socket => this.onSocketConnect(socket));

        this.log("constructor");
    }

    private onSocketConnect(socket: socketio.Socket) {
        this.log(socket.id + " connected");

        const client = new Client(socket);
    }

    public static postGameLog(address: string, message: string) {
        console.log("postGameLog")

        let url = "https://dmdassc.glitch.me/gamelog/log"

        if(address.includes("127.0.0.1")) {
            url = "http://127.0.0.1:3000/gamelog/log";
        }

        const data = {
            service: 'cafemania',
            address: address,
            message: message
        }
        
        request.post(
            url,
            { json: data },
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    console.log(body);
                }
            }
        ); 
    }
}