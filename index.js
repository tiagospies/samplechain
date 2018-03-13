'use strict'

var express = require("express");
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var bodyParser = require('body-parser');
var ioClient = require('socket.io-client');
var util = require('util');

var Config = require("./config.json");
var BlockchainHandler = require("./blockchainHandler");

const blockchainHandler = new BlockchainHandler();

var http_port = Config.HttpPort;
var webSocketPort = Config.WebSocketPort;

var blockchain = [];
var connectedPeers = [];

blockchainHandler.setBlockchain(blockchain);

app.use(bodyParser.json());
app.get("/blocks", (req, res) => {
    res.json(blockchain);
});

app.get("/peers", (req, res) => {
    res.send(util.inspect(connectedPeers, { showHidden: true, depth: null }));
});

app.post("/createBlock", (req, res) => {
    var data = req.body.data;
    var newBlock = blockchainHandler.generateNextBlock(data);
    blockchainHandler.addBlock(newBlock);

    io.sockets.emit("processNewblock", JSON.stringify(newBlock));

    console.log("Bloco adicionado: " + JSON.stringify(newBlock));
    res.send();
});

app.post("/addPeers", (req, res) => {
    var peers = req.body.peers;
    peers.forEach((peer) => {
        var client = ioClient.connect(peer);
        client.on('connection', (client) => {
            connectedPeers.push(client);
            console.log("Peers conectados: " + JSON.stringify(connectedPeers));
        });
        
        client.on('processNewblock', (newBlock) => {
            var block = JSON.parse(newBlock);
            var latestBlock = blockchainHandler.getLatestBlock();
            if(latestBlock.hash === block.previousHash
                && block.index > latestBlock.index){
                    blockchain.push(block);
            }
        });
    });
    res.send();
});

app.listen(http_port, () => console.log('Listening http on port: ' + http_port));
io.listen(webSocketPort);

console.log(blockchain);