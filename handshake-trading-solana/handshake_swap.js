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
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
} from 'firebase/auth';

const connection = new Connection('https://mainnet.helius-rpc.com/?api-key=');

const wallet = new Wallet(Keypair.fromSecretKey(bs58.decode('')));
console.log(wallet.publicKey.toString())

//dev
const firebaseConfig = {
    apiKey: '',
    authDomain: '',
    projectId: '',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

async function getFirebaseBearerToken(email, password){
    try {
        const signInCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log('Successfully signed in user');
        return await signInCredential.user.getIdToken();
      } catch (error) {
        console.error('Error signing in:', error.code, error.message);
      }
}


async function buyToken({bearerToken, walletAddress, tokenAddress, tokenAmountSol, slippagePercentage, priorityFeesSol}) {
    const url = 'https://app.handshake.money/api/buy-token';
    const payload = {
        wallet_address: walletAddress,
        token_id: `${tokenAddress}:sol`,
        token_amount: tokenAmountSol,
        slippage: slippagePercentage,
        priority_fees: priorityFeesSol
    };
    console.log(payload)
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${bearerToken}`,
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
        const simulation = await connection.simulateTransaction(dec, { commitment: "finilized" });
        console.log(simulation.value.logs)
        console.log(simulation.value.err)
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

async function sellToken({bearerToken, walletAddress, tokenAddress, tokenAmountSol, slippagePercentage, priorityFeesSol}) {
    const url = 'https://app.handshake.money/api/sell-token';

    if (tokenAmountSol == null){
        const tokenAccount = await connection.getTokenAccountsByOwner(new PublicKey(walletAddress), { mint: new PublicKey(tokenAddress)}, 'confirmed')
        const tok = tokenAccount.value[0].pubkey
        const balance = await connection.getTokenAccountBalance(tok, 'confirmed')
        tokenAmountSol = balance.value.uiAmount
    }

    const payload = {
        wallet_address: walletAddress,
        token_id: `${tokenAddress}:sol`,
        token_amount: tokenAmountSol,
        slippage: slippagePercentage,
        priority_fees: priorityFeesSol
    };
    console.log(payload)
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${bearerToken}`,
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
        const simulation = await connection.simulateTransaction(dec, { commitment: "confirmed" });
        console.log(simulation.value.logs)
        console.log(simulation.value.err)
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
    await buyToken({bearerToken: bearerToken, walletAddress: "BEbyyrt9Luf31agFAPJ5Dm4HVcpJZPGVKrzBQ9YoqYGK", tokenAddress: "Df6yfrKC8kZE3KNkrHERKzAetSxbrWeniQfyJY4Jpump", tokenAmountSol: 0.002, slippagePercentage: 0.4, priorityFeesSol: 0.001})
    await sellToken({bearerToken: bearerToken, walletAddress: "BEbyyrt9Luf31agFAPJ5Dm4HVcpJZPGVKrzBQ9YoqYGK", tokenAddress: "Df6yfrKC8kZE3KNkrHERKzAetSxbrWeniQfyJY4Jpump", tokenAmountSol: null, slippagePercentage: 0.2,priorityFeesSol: 0.001})
}

complete()