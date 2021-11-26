import express from 'express';
import http from 'http';
import socketio from 'socket.io';
import path from 'path';
import { ServerHost } from '../cafemania/serverHost/serverHost';
import { BaseObject } from '../cafemania/baseObject/baseObject';

const app: express.Application = express();
const server: http.Server = http.createServer(app);
const io: socketio.Server = new socketio.Server();

const port = 3000;

app.use(express.static(path.join(__dirname, "..", "..", "public")));

io.attach(server, {
    //path: '/socket',
    cors: { origin: '*' }
});

server.listen(port, () => {
    //console.log(`Express web server started: http://localhost:${port}`)
});

BaseObject.useColor = false;
const serverHost = new ServerHost(io);