import socketio, { Socket } from 'socket.io';
import Phaser from 'phaser';
import { BaseObject } from '../baseObject/baseObject';
import { Client } from '../client/client';
import { IPacket } from '../network/packet';
import { Server } from '../server/server';

const request = require('request');

export class ServerHost extends BaseObject {
    public static Instance: ServerHost;

    public get servers() { return Array.from(this._servers.values()); }

    private _servers = new Phaser.Structs.Map<string, Server>([]); 

    constructor(io: socketio.Server) {
        super();
        ServerHost.Instance = this;
        
        io.on('connection', socket => {
            this.onSocketConnect(socket)
        });

        this.log("constructor");
    }

    public createServer(name: string) {
        const server = new Server();
        server.setName(name);

        this._servers.set(server.id, server);
        return server;
    }
    
    public removeServer(server: Server) {
        server.destroy();
        this._servers.delete(server.id);
    }

    public getServerById(id: string) {
        return this._servers.get(id);
    }

    private onSocketConnect(socket: socketio.Socket) {
        const client = new Client(socket);

        socket.on('disconnect', () => this.onClientDisconnect(client))
        socket.on('p', (packet: IPacket) => {
            client.onReceivePacket(packet);
        });

        this.onClientConnect(client);
    }

    public onClientConnect(client: Client) {
        const server = this.createServer(`${client.username}'s server`);
        server.start();
        client.setMainServer(server);

        client.onConnect()
    }

    public onClientDisconnect(client: Client) {
        client.onDisconnect()

        this.removeServer(client.mainServer);
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