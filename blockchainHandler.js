'use strict'

let CryptoJS = require("crypto-js");
let Block = require("./block");

let instance = null;

/** Define o manipulador de operações para a cadeia de blocos.*/
class BlockchainHandler {
    constructor() {
        if (!instance) {
            instance = this;
        }

        this._type = 'BlockchainHandler';
        this.blockchain = [];
        
        return instance;
    }

    /** Define a cadeia de blocos que será utiliza nas operações. */
    setBlockchain(blockchain) {
        this.blockchain = blockchain;
        this.blockchain.push(this.getGenesisBlock())
    }

    /** Gera o bloco de genesis, que é o primeiro bloco da aplicação. */
    getGenesisBlock() {
        let dataFromFirstBlock = {
            from: "Cwi Software",
            to: "Cwi Software",
            value: 1000000
        };
        
        return new Block(
            0, 
            "0", 
            1321009871, 
            JSON.stringify(dataFromFirstBlock), 
            "fdfc56a944e15d52997a8b2bc3bf8db9d27ac1e4370dff9487d2fc3eca214636"
        );
    }

    /** Gera um novo bloco. */
    generateNextBlock(blockData) {
        var previousBlock = this.getLatestBlock();
        var nextIndex = previousBlock.index + 1;
        var nextTimestamp = new Date().getTime() / 1000;
        var nextHash = this.calculateHash(nextIndex, previousBlock.hash, nextTimestamp, blockData);

        return new Block(nextIndex, previousBlock.hash, nextTimestamp, blockData, nextHash);
    }

    /** Busca o ultimo bloco gerado. */
    getLatestBlock() {
        return this.blockchain[this.blockchain.length - 1];
    }

    /** Verifica se o bloco é válido. */
    isValidNewBlock(newBlock, previousBlock) {
        if (newBlock.index !== previousBlock.index + 1) {
            console.log("Bloco inválido");
            return false;
        }

        if (newBlock.previousHash !== previousBlock.hash) {
            console.log("Hash anterior inválida!!");
            return false;
        }

        if (this.calculateHashForBlock(newBlock) !== newBlock.hash) {
            console.log("Cálculo de hash inválido");
            return false;
        }

        return true;
    }

    /** Adiciona um bloco na cadeia. */
    addBlock(newBlock) {
        if (this.isValidNewBlock(newBlock, this.getLatestBlock())) {
            this.blockchain.push(newBlock);
        }
    }

    /** Calcula o hash com os parâmetros do bloco. */
    calculateHash(index, previousHash, timestamp, data){
        return CryptoJS.SHA256(index + previousHash + timestamp + data).toString();
    }

    /** Calcula o hash com o objeto do bloco. */
    calculateHashForBlock(block){
        return this.calculateHash(block.index, block.previousHash, block.timestamp, block.data);
    }

    get type() {
        return this._type;
    }

    set type(value) {
        this._type = value;
    }
}

module.exports = BlockchainHandler;