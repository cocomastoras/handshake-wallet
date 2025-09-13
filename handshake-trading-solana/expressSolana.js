import {
    Connection,
    Keypair,
    SystemProgram,
    VersionedTransaction,
    Transaction,
    PublicKey,
    TransactionInstruction,
    AddressLookupTableAccount,
    TransactionMessage, sendAndConfirmRawTransaction,
} from '@solana/web3.js';

import {
    createTransferInstruction,
    getAssociatedTokenAddressSync,
    createAssociatedTokenAccountInstruction,
} from '@solana/spl-token';

import fetch from 'cross-fetch';
import { Wallet } from '@project-serum/anchor';
import bs58 from 'bs58';
import {toNumber} from "ethers";
import fs from 'fs';

const connection = new Connection('https://mainnet.helius-rpc.com/?api-key=');

const wallet = new Wallet(Keypair.fromSecretKey(bs58.decode('')));
const feeWalletPublicKey = new PublicKey("ByV8scaDhhF1ha1dzchUMY6Dcqja6JUZYE31nXoP8qHi")
const feeWalletPublicKeyBuy = new PublicKey("7XGwj8qQMft14LCDehT1CkPJCdnHfsy1gHkqw2aVzC1Q")

let token = ''

function constructQuoteUrlBuy(outputMint, amount, slippageBps) {
  const url = new URL('https://quote-api.jup.ag/v6/quote?inputMint=So11111111111111111111111111111111111111112');
  url.searchParams.append('outputMint', outputMint);
  url.searchParams.append('amount',  amount - Math.floor(amount/100));
  url.searchParams.append('slippageBps', slippageBps);
  url.searchParams.append('maxAccounts', 54);
  url.searchParams.append('platformFee', 0);
  url.searchParams.append('onlyDirectRoutes', true);
  return url.toString();
}

async function transferTokens(to, amount, tokenAddress) {
    const fromTokenAccount = getAssociatedTokenAddressSync(new PublicKey(tokenAddress), wallet.payer.publicKey, true)
    const toTokenAccount = getAssociatedTokenAddressSync(new PublicKey(tokenAddress), new PublicKey(to), true)
    const transferInstruction = createTransferInstruction(fromTokenAccount, toTokenAccount, wallet.payer.publicKey, amount,[], new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'))
    // No token account
    const account = await connection.getAccountInfo(toTokenAccount, 'confirmed');
    if (account == null) {

        const createTokenAccountInstruction = createAssociatedTokenAccountInstruction(wallet.payer.publicKey, toTokenAccount, new PublicKey(to), new PublicKey(tokenAddress))
        const rsp = await connection.getLatestBlockhash("finalized")
        const messageV0 = new TransactionMessage({payerKey: wallet.payer.publicKey, recentBlockhash: rsp['blockhash'], instructions: [createTokenAccountInstruction, transferInstruction]}).compileToV0Message()
        const transaction = new VersionedTransaction(messageV0)
        transaction.sign([wallet.payer])
        const rawTransaction = transaction.serialize()
        const txid = await connection.sendRawTransaction(Buffer.from(rawTransaction), {
          skipPreflight: false,
          commitment: 'confirmed',
          maxRetries: 10
        })
        const { lastValidBlockHeight, blockhash } = await connection.getLatestBlockhash("confirmed");
        await connection.confirmTransaction({blockhash: blockhash, lastValidBlockHeight: lastValidBlockHeight, signature: txid}, "confirmed")
        console.log(`https://solscan.io/tx/${txid}`)
    } else {
        console.log(1)
        const rsp = await connection.getLatestBlockhash("finalized")
        const messageV0 = new TransactionMessage({payerKey: wallet.payer.publicKey, recentBlockhash: rsp['blockhash'], instructions: [transferInstruction]}).compileToV0Message()
        const transaction = new VersionedTransaction(messageV0)
        transaction.sign([wallet.payer])
        const rawTransaction = transaction.serialize()
        const txid = await connection.sendRawTransaction(Buffer.from(rawTransaction), {
          skipPreflight: false,
          commitment: 'confirmed',
          maxRetries: 10
        })
        const { lastValidBlockHeight, blockhash } = await connection.getLatestBlockhash("confirmed");
        await connection.confirmTransaction({blockhash: blockhash, lastValidBlockHeight: lastValidBlockHeight, signature: txid}, "confirmed")
        console.log(`https://solscan.io/tx/${txid}`)
    }
}


async function deriveRefferalPublicKey() {
     const [feeAccount] = await PublicKey.findProgramAddressSync(
        [
            Buffer.from("referral_ata"),
            feeWalletPublicKey.toBuffer(), // your referral account public key
            new PublicKey('So11111111111111111111111111111111111111112').toBuffer(), // the token mint, output mint for ExactIn, input mint for ExactOut.
            ],
            new PublicKey("REFER4ZgmyYx9c6He5XfaTMiGfdLwRnkV4RPp9t9iF3") // the Referral Program
        );
     console.log(feeAccount.toString())
}

function constructQuoteUrlSell(inputMint, amount, slippageBps) {
  const url = new URL('https://quote-api.jup.ag/v6/quote?');
  url.searchParams.append('inputMint', inputMint )
  url.searchParams.append('outputMint', 'So11111111111111111111111111111111111111112');
  url.searchParams.append('amount', amount);
  url.searchParams.append('platformFeeBps', 100)
  url.searchParams.append('slippageBps', slippageBps);
  url.searchParams.append('maxAccounts', 40);
  url.searchParams.append('onlyDirectRoutes', true);
  return url.toString();
}

async function buyToken(tokenAddress, amount, slippage, priorityFees) {
    const amountIn = amount - Math.floor(amount / 100)
    const fees = Math.floor(amount / 100)

    const quoteResponse = await (
        await fetch(constructQuoteUrlBuy(tokenAddress, amountIn, slippage))
    ).json();
    console.log(quoteResponse)
    return
    const {swapTransaction} = await (
        await fetch('https://quote-api.jup.ag/v6/swap', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                // quoteResponseBuy from /quote api
                quoteResponse,
                // user public key to be used for the swap
                userPublicKey: wallet.publicKey.toBase58(),
                prioritizationFeeLamports: priorityFees,
                // auto wrap and unwrap SOL. default is true
                wrapAndUnwrapSol: true,
            })
        })
    ).json();

    const swapTransactionBuf = Buffer.from(swapTransaction, 'base64')
    let transaction = VersionedTransaction.deserialize(swapTransactionBuf)
    const transferInstruction = SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: feeWalletPublicKeyBuy,
        lamports: fees
    })
    const addressLookupTableAccounts = await Promise.all(
        transaction.message.addressTableLookups.map(async (lookup) => {
            return new AddressLookupTableAccount({
                key: lookup.accountKey,
                state: AddressLookupTableAccount.deserialize(await connection.getAccountInfo(lookup.accountKey).then((res) => res.data)),
            })
        })
    )
    let message = TransactionMessage.decompile(transaction.message, {addressLookupTableAccounts: addressLookupTableAccounts})
    message.instructions.push(transferInstruction)
    transaction.message = message.compileToV0Message(addressLookupTableAccounts)
    console.log(transaction)

    transaction.sign([wallet.payer])
    const simulation = await connection.simulateTransaction(transaction, {commitment: "confirmed"});
    console.log(simulation.value.logs)
    console.log(simulation.value.err)
    if (simulation.value.err) {
        throw new Error(`Simulation failed: ${simulation.value.err.toString()}`);
    }
    const rawTransaction = transaction.serialize()
    const txid = await sendAndConfirmRawTransaction(connection, Buffer.from(rawTransaction), {
      skipPreflight: true,
      commitment: 'confirmed',
      maxRetries: 2
    })
    console.log(`https://solscan.io/tx/${txid}`)
}

async function sellToken(tokenAddress, slippage, priorityFees) {
    const tokenAccount = await connection.getTokenAccountsByOwner(new PublicKey('BEbyyrt9Luf31agFAPJ5Dm4HVcpJZPGVKrzBQ9YoqYGK'), { mint: new PublicKey(tokenAddress)}, 'confirmed')
    const tok = tokenAccount.value[0].pubkey
    const balance = await connection.getTokenAccountBalance(tok, 'confirmed')
    const amount = balance.value.amount
    const quoteResponse = await (
      await fetch(constructQuoteUrlSell(tokenAddress, amount, slippage))
    ).json();
    const [feeAccount] = await PublicKey.findProgramAddressSync(
        [
            Buffer.from("referral_ata"),
            feeWalletPublicKey.toBuffer(), // your referral account public key
            new PublicKey('So11111111111111111111111111111111111111112').toBuffer(), // the token mint, output mint for ExactIn, input mint for ExactOut.
        ],
    new PublicKey("REFER4ZgmyYx9c6He5XfaTMiGfdLwRnkV4RPp9t9iF3") // the Referral Program
    );
    const { swapTransaction } = await (
      await fetch('https://quote-api.jup.ag/v6/swap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          // quoteResponseBuy from /quote api
          quoteResponse,
          // user public key to be used for the swap
          userPublicKey: wallet.publicKey.toBase58(),
          prioritizationFeeLamports: priorityFees,
          // auto wrap and unwrap SOL. default is true
          wrapAndUnwrapSol: true,
          // feeAccount is optional. Use if you want to charge a fee.  feeBps must have been passed in /quote API.
          feeAccount: feeAccount
        })
      })
    ).json();
    const swapTransactionBuf = Buffer.from(swapTransaction, 'base64')
    let transaction = VersionedTransaction.deserialize(swapTransactionBuf)

    transaction.sign([wallet.payer])

    const simulation = await connection.simulateTransaction(transaction, { commitment: "confirmed" });
    if (simulation.value.err) {
        throw new Error(`Simulation failed: ${simulation.value.err.toString()}`);
    }

    const rawTransaction = transaction.serialize()
    const txid = await sendAndConfirmRawTransaction(connection, Buffer.from(rawTransaction), {
      skipPreflight: true,
      commitment: 'confirmed',
      maxRetries: 4
    })
    console.log(`https://solscan.io/tx/${txid}`)
}

async function buyTokenApi(tokenAddress) {
    const time = Date.now();
    const url = 'https://app.handshake.money/api/buy-token';

    // Define the payload
    const payload = {
        wallet_address: "BEbyyrt9Luf31agFAPJ5Dm4HVcpJZPGVKrzBQ9YoqYGK",
        token_id: tokenAddress+':sol',
        token_amount: 30000000/10**9,
        slippage: 1000/10**4,
        priority_fees: 800000/10**9
    };
    // Send the POST request
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        const data = await response.json();
        const dataIn = Buffer.from(data['data']['txn'], 'base64')
        let dec = VersionedTransaction.deserialize(dataIn)
        const rsp = await connection.getLatestBlockhash("confirmed")
        dec.message.recentBlockhash = rsp['blockhash']
        dec.sign([wallet.payer])
        const simulation = await connection.simulateTransaction(dec, { commitment: "finilized" });
        console.log(simulation.value.logs)
        console.log(simulation.value.err)
        const rawTransaction = dec.serialize()
        const txid = await connection.sendRawTransaction(Buffer.from(rawTransaction), {
          skipPreflight: false,
          commitment: 'confirmed',
          maxRetries: 10
        })
        const { lastValidBlockHeight, blockhash } = await connection.getLatestBlockhash("confirmed");
        await connection.confirmTransaction({blockhash: blockhash, lastValidBlockHeight: lastValidBlockHeight, signature: txid}, "confirmed")
        console.log(`https://solscan.io/tx/${txid}`)
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    }
}

async function sellTokenApi(tokenAddress) {
    const url = 'https://app.handshake.money/api/sell-token';
    const tokenAccount = await connection.getTokenAccountsByOwner(new PublicKey('BEbyyrt9Luf31agFAPJ5Dm4HVcpJZPGVKrzBQ9YoqYGK'), { mint: new PublicKey(tokenAddress)}, 'confirmed')
    const tok = tokenAccount.value[0].pubkey
    const balance = await connection.getTokenAccountBalance(tok, 'confirmed')
    // Define the payload
    const payload = {
        wallet_address: "BEbyyrt9Luf31agFAPJ5Dm4HVcpJZPGVKrzBQ9YoqYGK",
        token_id: tokenAddress+':sol',
        token_amount: balance.value.uiAmount,
        slippage: 2000/10**4,
        priority_fees: 800000/10**9
    };
    // Send the POST request
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        const data = await response.json();
        const dataIn = Buffer.from(data['data']['txn'], 'base64')
        let dec = VersionedTransaction.deserialize(dataIn)
        const blockHash = await connection.getLatestBlockhash("confirmed")
        dec.message.recentBlockhash = blockHash['blockhash']
        dec.sign([wallet.payer])
        // const simulation = await connection.simulateTransaction(dec, { commitment: "confirmed" });
        // console.log(simulation.value.logs)
        // console.log(simulation.value.err)
        const rawTransaction = dec.serialize()
        const txid = await sendAndConfirmRawTransaction(connection, Buffer.from(rawTransaction), {
          skipPreflight: false,
          commitment: 'confirmed',
          maxRetries: 10
        })
        console.log(`https://solscan.io/tx/${txid}`)
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    }
}

async function complete() {
    await buyTokenApi('5UjbS1bECmQo7B5f817151ctvWskB92aDqu9drsipump');
    await sellTokenApi('5UjbS1bECmQo7B5f817151ctvWskB92aDqu9drsipump');
}

async function dummyAsync() {
    await buyToken('F96nSREXuGnRrTczkHoS2gfYak5PrDARuSvnzuUo6ATJ', 100000000, 9000, 1050000)
    await sellToken('HeJUFDxfJSzYFUuHLxkMqCgytU31G6mjP4wKviwqpump', 500, 4050000)
    await transferTokens('5ouEtaVsa4rW9L7mLZoF9r5b2S1jmssvqTSTQoG3ABii', 10**6, 'GAMwtMB6onAvBNBQJCJFuxoaqfPH8uCQ2dewNMVVpump')
}

async function parseBlock(blockNumber) {
   const rsp = await connection.getBlock(blockNumber, {maxSupportedTransactionVersion: 3, transactionDetails:  'accounts', rewards: false})
    for (let i=0; i<rsp['transactions'].length; i++) {
        if(rsp['transactions'][i]['transaction']['signatures'][0] == 'rj39e1eewqXUnSVrN9d1dcdcjwDRzcjHhk3uZ1qHeynLCdo3i2MQP8hVSoa8i9oR1U2UctoX47cHwf9MKAzvs11') {
            console.log(rsp['transactions'][i])
        }
    }
}

async function getSignatures(addressTo, slot) {
   let rsp = await connection.getSignaturesForAddress(new PublicKey(addressTo))
   const final = []
   rsp.map(rs => {
       if(rs.slot >= slot) {
           final.push(rs.signature)
       }
   })
   //  console.log(final)
    console.log(await connection.getSlot('confirmed'))
    rsp = await connection.getLatestBlockhashAndContext('confirmed')
    console.log(await connection.getParsedBlock(rsp.context.slot,  {maxSupportedTransactionVersion: 3}))
}

async function getTransactions(signatures) {
   const rsp = await connection.getTransactions(signatures, {maxSupportedTransactionVersion: 3, transactionDetails: 'full', rewards: false})
   console.log(rsp[0]['meta']['fee'])
   console.log(rsp[0]['meta']['postBalances'])
   console.log(rsp[0]['meta']['preBalances'])
   console.log(rsp[0]['transaction']['message']['staticAccountKeys'])
   console.log(rsp[0]['meta']['postTokenBalances'])
   console.log(rsp[0]['meta']['preTokenBalances'])
}

async function getFees() {
    const payload = {
        "jsonrpc": "2.0",
        "id": "1",
        "method": "getPriorityFeeEstimate",
        "params": [{
            "accountKeys": ["JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4"],
            "options": {
                "includeAllPriorityFeeLevels": true
            }
        }]
    }

}

async function getTokens() {
    const url = "https://solana-rpc.publicnode.com";
    const requestBody = {
      "jsonrpc": "2.0",
      "id": 1,
      "method": "getTokenAccountsByOwner",
      "params": [
        "FWznbcNXWQuHTawe9RxvQ2LdCENssh12dsznf4RiouN5",
        {
          "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "encoding": "jsonParsed"
        }
      ]
    };

    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    })
    .then(response => response.json())
    // .then(data => console.log(data['result']['value']))
    .then(data => {
        console.log(data['result']['value'].length)
        console.log(JSON.stringify(data['result']['value'], null, 4))
        for (let i = 0; i < data['result']['value'].length; i++) {
            fs.appendFile('output.json', JSON.stringify(data['result']['value'][i], null, 4), (err) => {
                    if (err) {
                        console.error('Error writing to file:', err);
                    } else {
                        console.log('Data successfully written to output.json');
                    }
                }
            )
        }
    }
    )
    .catch(error => console.error('Error:', error));
}


