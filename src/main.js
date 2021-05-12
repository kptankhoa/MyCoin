const express = require("express");
const fs = require("fs");
const session = require('express-session');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const _ = require("lodash");
require('express-async-errors');

const blockchain = require("./model/blockchain");
const p2p = require("./model/p2p");
const transactionPool = require("./model/transactionPool");
const wallet = require("./model/wallet");

const httpPort = parseInt(process.env.HTTP_PORT) || 3001;
const p2pPort = parseInt(process.env.P2P_PORT) || 6001;

const initHttpServer = (myHttpPort) => {
    const app = express();
    app.use(express.json());
    app.use(cookieParser());
    app.use(morgan('dev'));
    app.use(cors());
    app.use(session({ secret: "not a secret", resave: true, saveUninitialized: true }));

    app.post('/signup',(req, res) => {
        const keyPair = wallet.registerNewWallet()
        //blockchain.sendTransaction(keyPair.publicKey, require('./model/transaction').COINBASE_AMOUNT);
        res.send(keyPair);
    });
    app.post('/signin',(req, res) => {
        const {privateKey} = req.body;
        if(wallet.isKeyExist(privateKey)){
            if(!req.session.user){
                req.session.user={};
            }
            fs.writeFileSync('node/wallet/private_key', privateKey);
            const publicKey = wallet.getWalletFromPrivate(privateKey);
            req.session.user = {...publicKey};
            //redirect to user wallet
            res.json({
                'message': 'logged in'
            })
        }
        //redirect to login page
        res.status(204);
    })
    app.get('/blocks', (req, res) => {
        res.send(blockchain.getBlockchain());
    });
    app.get('/block/:hash', (req, res) => {
        const block = _.find(blockchain.getBlockchain(), { 'hash': req.params.hash });
        res.send(block);
    });
    app.get('/transaction/:id', (req, res) => {
        const tx = _(blockchain.getBlockchain())
            .map((blocks) => blocks.data)
            .flatten()
            .find({ 'id': req.params.id });
        res.send(tx);
    });
    app.get('/address/:address', (req, res) => {
        const unspentTxOuts = _.filter(blockchain.getUnspentTxOuts(), (uTxO) => uTxO.address === req.params.address);
        res.send({ 'unspentTxOuts': unspentTxOuts });
    });
    app.get('/unspentTransactionOutputs', (req, res) => {
        res.send(blockchain.getUnspentTxOuts());
    });
    app.get('/myUnspentTransactionOutputs', (req, res) => {
        res.send(blockchain.getMyUnspentTransactionOutputs());
    });
    app.post('/mineRawBlock', (req, res) => {
        if (req.body.data == null) {
            res.send('data parameter is missing');
            return;
        }
        const newBlock = blockchain.generateRawNextBlock(req.body.data);
        if (newBlock === null) {
            res.status(400).send('could not generate block');
        }
        else {
            res.send(newBlock);
        }
    });
    app.post('/mineBlock', (req, res) => {
        const newBlock = blockchain.generateNextBlock();
        if (newBlock === null) {
            res.status(400).send('could not generate block');
        }
        else {
            res.send(newBlock);
        }
    });
    app.get('/balance', (req, res) => {
        const balance = blockchain.getAccountBalance();
        res.send({ 'balance': balance });
    });
    app.get('/address', (req, res) => {
        const address = wallet.getPublicFromWallet();
        res.send({ 'address': address });
    });
    app.post('/mineTransaction', (req, res) => {
        const address = req.body.address;
        const amount = req.body.amount;
        try {
            const resp = blockchain.generateNextBlockWithTransaction(address, amount);
            res.send(resp);
        }
        catch (e) {
            console.log(e.message);
            res.status(400).send(e.message);
        }
    });
    app.post('/sendTransaction', (req, res) => {
        try {
            const address = req.body.address;
            const amount = req.body.amount;
            if (address === undefined || amount === undefined) {
                throw Error('invalid address or amount');
            }
            const resp = blockchain.sendTransaction(address, amount);
            res.send(resp);
        }
        catch (e) {
            console.log(e.message);
            res.status(400).send(e.message);
        }
    });
    app.get('/transactionPool', (req, res) => {
        res.send(transactionPool.getTransactionPool());
    });
    app.get('/peers', (req, res) => {
        res.send(p2p.getSockets().map((s) => s._socket.remoteAddress + ':' + s._socket.remotePort));
    });
    app.post('/addPeer', (req, res) => {
        p2p.connectToPeers(req.body.peer);
        res.send();
    });
    app.post('/stop', (req, res) => {
        res.send({ 'msg': 'stopping server' });
        process.exit();
    });

    app.use(function (req, res, next) {
        res.status(404).json({
            error_message: 'Endpoint not found'
        });
    });

    app.use(function (err, req, res, next) {
        console.error(err.stack);
        res.status(500).json({
            error_message: 'Something broke!'
        });
    });

    app.use((err, req, res, next) => {
        if (err) {
            res.status(400).send(err.message);
        }
    });

    app.listen(myHttpPort, () => {
        console.log('Listening http on port: ' + myHttpPort);
    });
};

initHttpServer(httpPort);
p2p.initP2PServer(p2pPort);
wallet.initWallet();
