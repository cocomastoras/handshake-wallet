import express from 'express';
import {
    Connection,
    Keypair,
    VersionedTransaction,
    PublicKey,
    sendAndConfirmRawTransaction,
} from '@solana/web3.js';
import fetch from 'cross-fetch';
import { Wallet } from '@project-serum/anchor';
import bs58 from 'bs58';
import bodyParser from "body-parser";

const app = express();
const connection = new Connection('https://solana-rpc.publicnode.com');

const wallet = new Wallet(Keypair.fromSecretKey(bs58.decode('PK')));

function constructQuoteUrlBuy(outputMint, amount) {
  const url = new URL('https://quote-api.jup.ag/v6/quote?inputMint=So11111111111111111111111111111111111111112');
  url.searchParams.append('outputMint', outputMint);
  url.searchParams.append('amount',  amount);
  url.searchParams.append('slippageBps', '1000');
  url.searchParams.append('maxAccounts', 20)
  return url.toString();
}

function constructQuoteUrlSell(inputMint, amount) {
  const url = new URL('https://quote-api.jup.ag/v6/quote?');
  url.searchParams.append('inputMint', inputMint )
  url.searchParams.append('outputMint', 'So11111111111111111111111111111111111111112');
  url.searchParams.append('amount', amount);
  url.searchParams.append('slippageBps', '1000');
  url.searchParams.append('maxAccounts', 20)
  return url.toString();
}

async function buyToken(tokenAddress, amount, priorityFees) {
    const quoteResponse = await (
      await fetch(constructQuoteUrlBuy(tokenAddress, amount))
    ).json();
    // console.log(quoteResponse)
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
        })
      })
    ).json();
    const swapTransactionBuf = Buffer.from(swapTransaction, 'base64')
    let transaction = VersionedTransaction.deserialize(swapTransactionBuf)
    transaction.sign([wallet.payer])
    // const simulation = await connection.simulateTransaction(transaction, { commitment: "confirmed" });
    // console.log(simulation.value.logs)
    // console.log(simulation.value.err)
    // if (simulation.value.err) {
    //     throw new Error(`Simulation failed: ${simulation.value.err.toString()}`);
    // }
    const rawTransaction = transaction.serialize()
    const txid = await sendAndConfirmRawTransaction(connection, Buffer.from(rawTransaction), {
      skipPreflight: true,
      commitment: 'confirmed',
      maxRetries: 5
    })
    console.log(`https://solscan.io/tx/${txid}`)
}

async function sellToken(tokenAddress, amount, priorityFees) {
    const quoteResponse = await (
      await fetch(constructQuoteUrlSell(tokenAddress, amount))
    ).json();

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
        })
      })
    ).json();

    const swapTransactionBuf = Buffer.from(swapTransaction, 'base64')
    let transaction = VersionedTransaction.deserialize(swapTransactionBuf)

    transaction.sign([wallet.payer])

    // const simulation = await connection.simulateTransaction(transaction, { commitment: "confirmed" });
    // console.log(simulation.value.logs)
    // console.log(simulation.value.err)
    // if (simulation.value.err) {
    //     throw new Error(`Simulation failed: ${simulation.value.err.toString()}`);
    // }
    // // console.log(simulation)
    const rawTransaction = transaction.serialize()
    const txid = await sendAndConfirmRawTransaction(connection, Buffer.from(rawTransaction), {
      skipPreflight: true,
      commitment: 'confirmed',
      maxRetries: 5
    })
    console.log(`https://solscan.io/tx/${txid}`)
}

app.use(bodyParser.json());

app.post('/swap', async (req, res) => {
    console.log('Received webhook:', JSON.stringify(req.body, null, 4));
    const tokenBalanceChanges = req.body['token_balance_changes']
    const filteredBalances = tokenBalanceChanges.filter(item => (item.owner === "3ESYpN6WpEdN5syU5ohucpfEC8txmoF8VFpeJwRdnVHm") || (item.owner === '5ouEtaVsa4rW9L7mLZoF9r5b2S1jmssvqTSTQoG3ABii'));
    const token = filteredBalances[0]['mint']
    if (filteredBalances[0]['change_amount'] < 0) {
        //sell
        const percentage = (-1 * filteredBalances[0]['change_amount']) / filteredBalances[0]['pre_balance']
        const tokenAccount = await connection.getTokenAccountsByOwner(wallet.publicKey, { mint: new PublicKey(token)}, 'confirmed')
        console.log(tokenAccount)
        try {
            let myBalance = await connection.getTokenAccountBalance(tokenAccount.value[0].pubkey, 'confirmed')
            if (myBalance > 0) {
                myBalance = Math.floor(myBalance * percentage)
                try {
                    await sellToken(token, myBalance, 10000000)
                } catch (e) {
                    console.log(e)
                }
            }
        } catch (e) {
            console.log(e)
        }
    } else {
        //buy
        const nativeBalanceAfter= req.body['raw']['meta']['postBalances'][0]
        const nativeBalancePre = req.body['raw']['meta']['preBalances'][0]

        const percentage = 1 - nativeBalanceAfter / nativeBalancePre
        // set my address and wallet
        const myNativeBalance = await connection.getBalance(wallet.publicKey, 'confirmed')
        const toBuyAmount = Math.floor(myNativeBalance * percentage)
        try {
            await buyToken(token, toBuyAmount, 10000000)
        } catch (e) {
            console.log(e)
        }
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});