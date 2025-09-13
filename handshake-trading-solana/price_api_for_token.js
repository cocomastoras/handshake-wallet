import { gql, GraphQLClient } from "graphql-request";
import { Connection, PublicKey } from "@solana/web3.js";
import { OpenOrders } from "@project-serum/serum";

const endpoint = `https://programs.shyft.to/v0/graphql/?api_key=`;
const rpcEndpoint = `https://mainnet.helius-rpc.com/?api-key=`;

const graphQLClient = new GraphQLClient(endpoint, {
  method: `POST`,
  jsonSerializer: {
    parse: JSON.parse,
    stringify: JSON.stringify,
  },
});

async function queryLpByToken(token) {
  // Get all proposalsV2 accounts
  const query = gql`
    query MyQuery($where: Raydium_LiquidityPoolv4_bool_exp) {
  Raydium_LiquidityPoolv4(
    where: $where
  ) {
    _updatedAt
    amountWaveRatio
    baseDecimal
    baseLotSize
    baseMint
    baseNeedTakePnl
    baseTotalPnl
    baseVault
    depth
    lpMint
    lpReserve
    lpVault
    marketId
    marketProgramId
    maxOrder
    maxPriceMultiplier
    minPriceMultiplier
    minSeparateDenominator
    minSeparateNumerator
    minSize
    nonce
    openOrders
    orderbookToInitTime
    owner
    pnlDenominator
    pnlNumerator
    poolOpenTime
    punishCoinAmount
    punishPcAmount
    quoteDecimal
    quoteLotSize
    quoteMint
    quoteNeedTakePnl
    quoteTotalPnl
    quoteVault
    resetFlag
    state
    status
    swapBase2QuoteFee
    swapBaseInAmount
    swapBaseOutAmount
    swapFeeDenominator
    swapFeeNumerator
    swapQuote2BaseFee
    swapQuoteInAmount
    swapQuoteOutAmount
    systemDecimalValue
    targetOrders
    tradeFeeDenominator
    tradeFeeNumerator
    volMaxCutRatio
    withdrawQueue
    pubkey
  }
}`;

//Tokens can be either baseMint or quoteMint, so we will check for both with an _or operator
  const variables = {
    where: {
    _or: [
          {baseMint:{_eq:token}},
          {quoteMint:{_eq:token}},
      ]}
  };

  return await graphQLClient.request(query, variables);
}


async function parsePoolInfo(poolInfo) {
  const OPENBOOK_PROGRAM_ID = new PublicKey(
    "srmqPvymJeFKQ4zGQed1GFppgkRHL9kaELCbyksJtPX"
  );

  //to load openOorders from openbook
  const connection = new Connection(rpcEndpoint, "confirmed");

  const openOrders = await OpenOrders.load(
    connection,
    new PublicKey(poolInfo.openOrders),
    OPENBOOK_PROGRAM_ID
  );

  const baseDecimal = 10 ** poolInfo.baseDecimal; // e.g. 10 ^ 6
  const quoteDecimal = 10 ** poolInfo.quoteDecimal;

  const baseTokenAmount = await connection.getTokenAccountBalance(
    new PublicKey(poolInfo.baseVault)
  );
  const quoteTokenAmount = await connection.getTokenAccountBalance(
    new PublicKey(poolInfo.quoteVault)
  );

  const basePnl = poolInfo.baseNeedTakePnl / baseDecimal;
  const quotePnl = poolInfo.quoteNeedTakePnl / quoteDecimal;

  const openOrdersBaseTokenTotal =
    openOrders.baseTokenTotal / baseDecimal;
  const openOrdersQuoteTokenTotal =
    openOrders.quoteTokenTotal / quoteDecimal;

  const base =
    (baseTokenAmount.value?.uiAmount || 0) + openOrdersBaseTokenTotal - basePnl;
  const quote =
    (quoteTokenAmount.value?.uiAmount || 0) +
    openOrdersQuoteTokenTotal -
    quotePnl;

  //Get the price of the tokens
  //We are using Jup pricing APIs, you can use whichever you want
  const priceInfo = await getTokenPrices(poolInfo.baseMint, poolInfo.quoteMint);
  const flag = priceInfo.flag
  const baseLiquidity = base * priceInfo.basePrice;
  const quoteLiquidity = quote * priceInfo.quotePrice;
  if(flag === 1) {
    console.log(
    "Pool info:",
    "\n base tokens in pool " + quote,
    "\n quote tokens in pool " + base,
  );
  console.log(`Base Token liquidity: ${quoteLiquidity} \n`);
  console.log(`Quote Token liquidity: ${baseLiquidity} \n`);
  console.log(`Total liquidity in the pool: ${baseLiquidity + quoteLiquidity}`)
    return [quote, base,quoteLiquidity, baseLiquidity , priceInfo.quotePrice, priceInfo.basePrice]
  }
  console.log(
    "Pool info:",
    "\n base tokens in pool " + base,
    "\n quote tokens in pool " + quote,
  );
  console.log(`Base Token liquidity: ${baseLiquidity} \n`);
  console.log(`Quote Token liquidity: ${quoteLiquidity} \n`);
  console.log(`Total liquidity in the pool: ${baseLiquidity + quoteLiquidity}`)

  return [base, quote, baseLiquidity, quoteLiquidity, priceInfo.basePrice, priceInfo.quotePrice]
}

async function getTokenPrices(base, quote) {
  const baseMintPrice = await (await fetch(
    `https://price.jup.ag/v4/price?ids=${base}`)).json()
  const quoteMintPrice = await (await fetch(`https://price.jup.ag/v4/price?ids=${quote}`)).json()
  let flag = 0
  if ('So11111111111111111111111111111111111111112' in baseMintPrice.data) {
    flag = 1
  }
  return {basePrice: baseMintPrice.data[base]?.price || 0, quotePrice: quoteMintPrice.data[quote]?.price || 0, flag: flag}
}

const poolInfo = await queryLpByToken('8VKfndnsHmqydUJcZ2kw8WrWbA1iSEKqPPC6Vexpump');
await parsePoolInfo(poolInfo.Raydium_LiquidityPoolv4[0])

