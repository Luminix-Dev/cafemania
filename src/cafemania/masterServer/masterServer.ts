import socketio from 'socket.io';
import Phaser from 'phaser';
import { BaseObject } from '../baseObject/baseObject';
import { Client } from '../client/client';
import { IPacket } from '../network/packet';
import { Server } from '../server/server';
import { User } from '../client/user';
import { Debug } from '../debug/debug';

export class MasterServer extends BaseObject {
    public static Instance: MasterServer;

    public get servers() { return Array.from(this._servers.values()); }

    private _servers = new Phaser.Structs.Map<string, Server>([]); 
    private _users = new Phaser.Structs.Map<string, User>([]); 

    constructor(io: socketio.Server) {
        super();
        MasterServer.Instance = this;
        
        io.on('connection', socket => {
            this.onSocketConnect(socket)
        });
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
            try {
                client.onReceivePacket(packet);
            } catch (error) {
                if (Debug.consoleLog) console.error(error)
            }
        });

        this.onClientConnect(client);
    }

    public onClientConnect(client: Client) {
        /*
        const server = this.createServer(`${client.username}'s server`);
        server.start();
        client.setMainServer(server);
        */
        client.onConnect()
    }

    public onClientDisconnect(client: Client) {
        client.onDisconnect()

        //this.removeServer(client.mainServer);
    }
    
    public createUser() {
        const user = new User();
        this._users.set(user.id, user);
        return user;
    }
}