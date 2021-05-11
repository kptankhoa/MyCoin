const blockchain = require("./blockchain");
const wallet = require("./wallet");
const transactionPool = require("./transactionPool");
wallet.initWallet();

let blockData = [{
    txIns: [{signature: "", txOutId: "", txOutIndex: 1}],
    txOuts:
        [{
            address: "04bfcab8722991ae774db48f934ca79cfb7dd991229153b9f732ba5334aafcd8e7266e47076996b55a14bf9913ee3145ce0cfc1372ada8ada74bd287450313534a",
            amount: 50
        }],
    id: "f089e8113094fab66b511402ecce021d0c1f664a719b5df1652a24d532b2f749"
}]


const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});
let next = 0;
function loop() {
    console.log('1. getBlockchain');
    console.log('2. getUnspentTxOuts');
    console.log('3. getMyUnspentTransactionOutputs');
    console.log('4. generateRawNextBlock');
    console.log('5. generateNextBlock');
    console.log('6. getAccountBalance');
    console.log('7. getPublicFromWallet')
    console.log('8. generateNextBlockWithTransaction');
    console.log('9. sendTransaction');
    console.log('10. getTransactionPool');
    console.log('0. exit');
    readline.question('Choice?', choice => {
        switch (parseInt(choice)) {
            case 0:
                readline.close();
                process.exit();
                break;
            case 1:
                console.log('Blockchain: ');
                console.log(blockchain.getBlockchain());
                break;
            case 2:
                console.log('UnspentTxOut:');
                console.log(blockchain.getUnspentTxOuts());
                break;
            case 3:
                console.log('getMyUnspentTransactionOutputs:');
                console.log(blockchain.getMyUnspentTransactionOutputs());
                break;
            case 4:
                let newBlock1 = blockchain.generateRawNextBlock(blockData);
                if (newBlock1 === null) {
                    console.log("generateRawNextBlock failed!");
                } else {
                    console.log(newBlock1);
                }
                break;
            case 5:
                console.log('generateNextBlock...')
                let newBlock2 = blockchain.generateNextBlock();
                if (newBlock2 === null) {
                    console.log("generateNextBlock failed!");
                } else {
                    console.log(newBlock2);
                }
                break;
            case 6:
                let balance = blockchain.getAccountBalance();
                console.log('balance: ' + balance);
                break;
            case 7:
                const address = wallet.getPublicFromWallet();
                console.log('Address: ' + address);
                break;
            case 8:
                console.log('ganeratefromTx...')
                const resp = blockchain.generateNextBlockWithTransaction("04bfcab8722991ae774db48f934ca79cfb7dd991229153b9f732ba5334aafcd8e7266e47076996b55a14bf9913ee3145ce0cfc1372ada8ada74bd287450313534b", 30);
                console.log(resp);
            case 9:
                break;
            case 10:
                console.log(transactionPool.getTransactionPool());
                break;
            default:
                loop();

        }
        loop();
    })
}

loop();

