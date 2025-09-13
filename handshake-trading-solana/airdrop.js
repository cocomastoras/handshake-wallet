import {
  Connection,
  Keypair,
  VersionedTransaction,
  sendAndConfirmRawTransaction,
} from '@solana/web3.js';
import { Wallet } from '@project-serum/anchor';
import bs58 from 'bs58';

const connection = new Connection('https://mainnet.helius-rpc.com/?api-key=10764cdb-405b-479b-b0c2-db31f08102ec');
const wallet = new Wallet(Keypair.fromSecretKey(bs58.decode('pk here')));

var myHeaders = new Headers();
myHeaders.append("x-api-key", "d1o-mgvCXF-l2Fw1");
myHeaders.append("Content-Type", "application/json");

const addresses = [
  '7weF1CidTJSNAQLWzbdvnYrvFLWFU73dJKHVf2zs1yUk'
]

const transfer_info = addresses.map(address => { return({'to_address': address, 'amount': 2000})})

var raw = JSON.stringify({
  "network": "mainnet-beta",
  "token_address": "",
  "from_address": "",
  "transfer_info": transfer_info,
  "priority_fee": 1000000
});

var requestOptions = {
  method: 'POST',
  headers: myHeaders,
  body: raw,
  redirect: 'follow'
};

const rslt = await fetch("https://api.shyft.to/sol/v1/token/airdrop", requestOptions)
  .then(response => response.json())
  .then(result => {
    return result['result']['encoded_transaction']
  })
  .catch(error => console.log('error', error))

for(let i=0; i< rslt.length; i++){
  const dataIn = Buffer.from(rslt[i], 'base64')
  let dec = VersionedTransaction.deserialize(dataIn)
  const blockHash = await connection.getLatestBlockhash("confirmed")
  dec.message.recentBlockhash = blockHash['blockhash']
  try {
    dec.sign([wallet.payer])
    const rawTransaction = dec.serialize()
    const txid = await sendAndConfirmRawTransaction(connection, Buffer.from(rawTransaction), {
      skipPreflight: false,
      commitment: 'confirmed',
      maxRetries: 10
    })
    console.log(`https://solscan.io/tx/${txid}`)
  } catch (e) {
    console.log(i, e)
  }
}

