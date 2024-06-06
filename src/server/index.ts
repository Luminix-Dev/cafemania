import express from 'express';
import http from 'http';
import socketio from 'socket.io';
import path from 'path';

const app: express.Application = express();
const server: http.Server = http.createServer(app);
const io: socketio.Server = new socketio.Server();
const port = 3000;

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

app.use(express.static(path.join(__dirname, "..", "..", "public")));

io.attach(server, {
    //path: '/socket',
    cors: { origin: '*' }
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Express web server started: http://localhost:${port}`)
});


console.log("Starting geckos...")

import '@geckos.io/phaser-on-nodejs'
global['phaserOnNodeFPS'] = 5


import { BaseObject } from '../cafemania/baseObject/baseObject';
import { MasterServer } from '../cafemania/masterServer/masterServer';

BaseObject.useColor = false;
const masterServer = new MasterServer(io);

/*
TODO:

Add MainScene
Completely change how PlayerTexture Factory & Generator works
(maybe) Add point detection in floors and walls to increase performance
*/