const blockchain = require("./blockchain");

console.log(blockchain.getBlockchain());

let blockData = [{
    txIns: [{signature: "", txOutId: "", txOutIndex: 1}],
    txOuts:
        [{
            address: "04bfcab8722991ae774db48f934ca79cfb7dd991229153b9f732ba5334aafcd8e7266e47076996b55a14bf9913ee3145ce0cfc1372ada8ada74bd287450313534a",
            amount: 50
        }],
    id: "f089e8113094fab66b511402ecce021d0c1f664a719b5df1652a24d532b2f749"
}]

console.log("..mining..");
blockchain.generateNextBlock(blockData);
console.log(blockchain.getBlockchain());
