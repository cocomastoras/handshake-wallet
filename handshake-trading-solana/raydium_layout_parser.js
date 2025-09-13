import {liquidityStateV4Layout as LIQUIDITY_STATE_LAYOUT_V4} from "@raydium-io/raydium-sdk-v2";
import { Connection, PublicKey } from "@solana/web3.js";
const rpcEndpoint = `https://mainnet.helius-rpc.com/?api-key=`;
const connection = new Connection(rpcEndpoint, "confirmed");

const solMint = new PublicKey("So11111111111111111111111111111111111111112");
const tokenMint = new PublicKey("HEHT1eKNsTnuMAQaSM4ac8r3ynckmquxA3hUun5Npump");
const RAYDIUM_AMM_PROGRAM_ID = new PublicKey("675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8");

console.log(LIQUIDITY_STATE_LAYOUT_V4.span)
console.log(LIQUIDITY_STATE_LAYOUT_V4.offsetOf("baseMint"))
console.log(LIQUIDITY_STATE_LAYOUT_V4.offsetOf("quoteMint"))

const filters = [
  { dataSize: LIQUIDITY_STATE_LAYOUT_V4.span },
  {
    memcmp: {
      offset: LIQUIDITY_STATE_LAYOUT_V4.offsetOf("baseMint"),
      bytes: solMint.toBase58(),
    },
  },
  {
    memcmp: {
      offset: LIQUIDITY_STATE_LAYOUT_V4.offsetOf("quoteMint"),
      bytes: tokenMint.toBase58(),
    },
  },
];

const reverseFilters = [
  { dataSize: LIQUIDITY_STATE_LAYOUT_V4.span },
  {
    memcmp: {
      offset: LIQUIDITY_STATE_LAYOUT_V4.offsetOf("baseMint"),
      bytes: tokenMint.toBase58(),
    },
  },
  {
    memcmp: {
      offset: LIQUIDITY_STATE_LAYOUT_V4.offsetOf("quoteMint"),
      bytes: solMint.toBase58(),
    },
  },
];

const marketAccounts = await connection.getProgramAccounts(RAYDIUM_AMM_PROGRAM_ID, { filters });
const reverseMarketAccounts = await connection.getProgramAccounts(RAYDIUM_AMM_PROGRAM_ID, { filters: reverseFilters });

const allPools = [...marketAccounts, ...reverseMarketAccounts];

allPools.forEach((marketAccount) => {
  console.log(marketAccount.pubkey.toBase58())
  const marketData = LIQUIDITY_STATE_LAYOUT_V4.decode(marketAccount.account.data);
  // console.log(marketData)
  console.log(`Base Vault: ${marketData.baseVault.toBase58()}`);
  console.log(`Quote Vault: ${marketData.quoteVault.toBase58()}`);
});
