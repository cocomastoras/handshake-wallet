const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const fetch = require('node-fetch');
const { gql, GraphQLClient } = require("graphql-request");
const { Connection, PublicKey } = require("@solana/web3.js");
const { OpenOrders } = require("@project-serum/serum");
const endpoint = `https://programs.shyft.to/v0/graphql/?api_key=`;
const rpcEndpoint = `https://mainnet.helius-rpc.com/?api-key=`;

const tokenDictionary = {};

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
  const baseLiquidity = base * priceInfo.basePrice;
  const quoteLiquidity = quote * priceInfo.quotePrice;

  if(priceInfo.flag === 1) {
     return [quote, base,quoteLiquidity, baseLiquidity , priceInfo.quotePrice, priceInfo.basePrice]
  }
  return  [base, quote, baseLiquidity, quoteLiquidity, priceInfo.basePrice, priceInfo.quotePrice]
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
function addTokenToDictionary(tokenDictionary, key, object) {
  tokenDictionary[key] = object;
  console.log(object)
}

// Use body-parser middleware to parse JSON bodies
app.use(bodyParser.json());

// Define the webhook endpoint
app.post('/webhooks', async (req, res) => {
  // console.log('Received webhook:', req.body);
  let mintAddress;
  const object = new Object();
  try {
    const body = req.body;
    mintAddress = body[0].tokenTransfers[0].mint
    if (mintAddress === 'So11111111111111111111111111111111111111112') {
      mintAddress = body[0].tokenTransfers[1].mint
    }
    object.mintAddress = mintAddress
    object.factory = body[0].source
    // console.log(mintAddress)
  } catch (e) {
    console.log(e)
  }
  // Send a response back to the sender
  res.status(200).send('Webhook received');
  // Process the webhook data here
  try {
    const response = await fetch('https://api.helius.xyz/v0/token-metadata?api-key=10764cdb-405b-479b-b0c2-db31f08102ec', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "mintAccounts": [
          mintAddress
        ],
        "includeOffChain": true
      }),
    });
    const data = await response.json();
    try {
      object.uri = data[0].offChainMetadata.uri
    } catch (e) {
      console.log(e)
    }
    try {
      object.offChainMetada = data[0].offChainMetadata.metadata
    } catch (e) {
      console.log(e)
    }
    try {
      object.onChainMetada = data[0].onChainMetadata['metadata'].data
      object.updateAuthority = data[0].onChainMetadata['metadata'].updateAuthority

    } catch (e) {
      console.log(e)
    }
  } catch (e) {
    console.log(e)
  }
  try {
    const response = await fetch('https://mainnet.helius-rpc.com/?api-key=10764cdb-405b-479b-b0c2-db31f08102ec', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "jsonrpc": "2.0",
        "id": mintAddress,
        "method": "getAsset",
        "params": {
          "id": mintAddress,
          "options": {
            "showUnverifiedCollections": true,
            "showCollectionMetadata": true,
            "showFungible": true,
            "showInscription": false
          }
        }
      }),
    });
    const data = await response.json();
    object.tokenInfo = data['result']['token_info']

  } catch (e) {
    console.log(e)
  }
  try {
    const poolInfo = await queryLpByToken(mintAddress);
    const rsp = await parsePoolInfo(poolInfo.Raydium_LiquidityPoolv4[0])
    const baseLpAMount = rsp[0]
    const quoteLpAmount = rsp[1]
    let baseLpPrice = rsp[2]
    const quoteLpPrice = rsp[3]
    let basePrice = rsp[4]
    const quotePrice = rsp[5]
    if(basePrice === 0 || isNaN(basePrice) || basePrice === undefined) {
      baseLpPrice = quoteLpPrice
      basePrice = (quoteLpAmount / baseLpAMount) * quotePrice
    }
    object.tokenLpAmount = baseLpAMount
    object.solLpAmount = quoteLpAmount
    object.lpPrice = quoteLpPrice + baseLpPrice
    object.tokenPrice = basePrice
    object.marketCap = (object.tokenInfo['supply'] / (10**object.tokenInfo['decimals'])) * basePrice
  } catch (e) {
    console.log(e)
  }
  addTokenToDictionary(tokenDictionary, mintAddress, object)
});

// Define a root endpoint to check if the server is running
app.get('/', (req, res) => {
  res.send('Webhook server is running');
});

app.get('/tokens', (req, res) => {
  res.send(JSON.stringify(tokenDictionary, null, 4));
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});


