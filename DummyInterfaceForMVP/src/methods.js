const { Web3 } =  require("web3");

const routerAbi = [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [],
      "name": "NoRouteFound",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "token",
          "type": "address"
        }
      ],
      "name": "fetchTokenInfo",
      "outputs": [
        {
          "internalType": "string",
          "name": "name",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "symbol",
          "type": "string"
        },
        {
          "internalType": "uint8",
          "name": "decimals",
          "type": "uint8"
        },
        {
          "internalType": "uint256",
          "name": "totalSupply",
          "type": "uint256"
        },
        {
          "internalType": "uint128[]",
          "name": "v2Reserves",
          "type": "uint128[]"
        },
        {
          "internalType": "uint112",
          "name": "v1Reserve",
          "type": "uint112"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "token1",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "token2",
          "type": "address"
        },
        {
          "internalType": "uint128",
          "name": "balance",
          "type": "uint128"
        }
      ],
      "name": "findBestPathFromAmountIn",
      "outputs": [
        {
          "components": [
            {
              "internalType": "address[]",
              "name": "route",
              "type": "address[]"
            },
            {
              "internalType": "address[]",
              "name": "pairs",
              "type": "address[]"
            },
            {
              "internalType": "uint256[]",
              "name": "binSteps",
              "type": "uint256[]"
            },
            {
              "internalType": "enum ILBRouter.Version[]",
              "name": "versions",
              "type": "uint8[]"
            },
            {
              "internalType": "uint128[]",
              "name": "amounts",
              "type": "uint128[]"
            },
            {
              "internalType": "uint128[]",
              "name": "virtualAmountsWithoutSlippage",
              "type": "uint128[]"
            },
            {
              "internalType": "uint128[]",
              "name": "fees",
              "type": "uint128[]"
            }
          ],
          "internalType": "struct ILBQuoter.Quote",
          "name": "rsp",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address[]",
          "name": "route",
          "type": "address[]"
        },
        {
          "internalType": "uint256",
          "name": "slippage",
          "type": "uint256"
        }
      ],
      "name": "sellNativeForToken",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint128",
          "name": "amount",
          "type": "uint128"
        },
        {
          "internalType": "address[]",
          "name": "route",
          "type": "address[]"
        },
        {
          "internalType": "uint256",
          "name": "slippage",
          "type": "uint256"
        }
      ],
      "name": "sellTokenForNative",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "withdraw",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "stateMutability": "payable",
      "type": "receive"
    }
  ]
const erc20Abi = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "spender",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "approve",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "account",
                "type": "address"
            }
        ],
        "name": "balanceOf",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
              "internalType": "address",
              "name": "owner",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "spender",
              "type": "address"
            }
        ],
        "name": "allowance",
        "outputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "spender",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "addedValue",
                "type": "uint256"
            }
        ],
        "name": "increaseAllowance",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    }
]
const quoterAbi = [
        {
          "inputs": [
            {
              "internalType": "address[]",
              "name": "route",
              "type": "address[]"
            },
            {
              "internalType": "uint128",
              "name": "amountIn",
              "type": "uint128"
            }
          ],
          "name": "findBestPathFromAmountIn",
          "outputs": [
            {
              "components": [
                {
                  "internalType": "address[]",
                  "name": "route",
                  "type": "address[]"
                },
                {
                  "internalType": "address[]",
                  "name": "pairs",
                  "type": "address[]"
                },
                {
                  "internalType": "uint256[]",
                  "name": "binSteps",
                  "type": "uint256[]"
                },
                {
                  "internalType": "enum ILBRouter.Version[]",
                  "name": "versions",
                  "type": "uint8[]"
                },
                {
                  "internalType": "uint128[]",
                  "name": "amounts",
                  "type": "uint128[]"
                },
                {
                  "internalType": "uint128[]",
                  "name": "virtualAmountsWithoutSlippage",
                  "type": "uint128[]"
                },
                {
                  "internalType": "uint128[]",
                  "name": "fees",
                  "type": "uint128[]"
                }
              ],
              "internalType": "struct ILBQuoter.Quote",
              "name": "quote",
              "type": "tuple"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        }
    ]

const httpProvider = new Web3('https://ava-testnet.public.blastapi.io/ext/bc/C/rpc');

const routerAddress = '0x78E7320E8316f010472997Fa3b39B9D7C8611D6F';
const quoterAddress = '0xd76019A16606FDa4651f636D9751f500Ed776250';
const wavax = '0xd00ae08403B9bbb9124bB305C09058E32C39A48c';
const usdt = '0xAb231A5744C8E6c45481754928cCfFFFD4aa0732';
const usdc = '0xB6076C93701D6a07266c31066B298AeC6dd65c2d';

function createWallet() {
    const wallet = httpProvider.eth.accounts.create()
    return [wallet.address, wallet.privateKey]
}
//Read only
async function fetchTokenInfo(walletPublicAddress, tokenAddress) {
    const routerContract = new httpProvider.eth.Contract(routerAbi, routerAddress);
    let rsp = await routerContract.methods.fetchTokenInfo(tokenAddress).call();
    const tokenName = rsp.name;
    const tokenSymbol = rsp.symbol;
    const tokenSupply = rsp.totalSupply/(10n**rsp.decimals);
    //Scan both version of TraderJoe pools for available liquidity
    //V1 single pool
    //V2 dynamic pools
    const liquidity = [rsp.v1Reserve].concat(rsp.v2Reserves)
    const maxLiquidity = liquidity.reduce((max, current) => (current > max ? current : max), liquidity[0]);
    const tokenLiquidity = maxLiquidity/10n**18n;
    const tokenContract = new httpProvider.eth.Contract(erc20Abi, tokenAddress);
    const balance = await tokenContract.methods.balanceOf(walletPublicAddress).call();
    const quoteContract = new httpProvider.eth.Contract(quoterAbi, quoterAddress);
    rsp = await routerContract.methods.findBestPathFromAmountIn(tokenAddress, wavax, balance).call();
    const usersTokenBalanceValuePricedInNative = rsp.amounts[1];
    return [tokenName, tokenSymbol, tokenSupply, tokenLiquidity, usersTokenBalanceValuePricedInNative];
}
//Read only
async function getNativeBalance(walletPublicAddress) {
    return await httpProvider.eth.getBalance(walletPublicAddress);
}


// Write needs balance
// slippage must be between 1-100
async function buyToken(walletPrivateKey, tokenAddress, inputAmount, slippage) {
    const path = [wavax, httpProvider.utils.toChecksumAddress(tokenAddress)];
    const account = httpProvider.eth.accounts.wallet.add(walletPrivateKey);
    let transaction = {
        from: httpProvider.utils.toChecksumAddress(account[0].address),
        to: httpProvider.utils.toChecksumAddress(routerAddress),
        value: httpProvider.utils.toWei(inputAmount, 'ether')
    };
    const routerContract = new httpProvider.eth.Contract(routerAbi, routerAddress);
    await routerContract.methods.sellNativeForToken(path, slippage).send(transaction);
    const tokenContract = new httpProvider.eth.Contract(erc20Abi, tokenAddress);
    //Auto increase allowance on swap to save user time
    const allowance = await tokenContract.methods.allowance(account[0].address, routerAddress).call();
    const balance = await tokenContract.methods.balanceOf(account[0].address).call();
    if (allowance < balance) {
        transaction = {
            from: httpProvider.utils.toChecksumAddress(account[0].address),
        };
        // Type(uint256).max
        // Increase to max value so that its safe for an one time action
        await tokenContract.methods.approve(routerAddress, 115792089237316195423570985008687907853269984665640564039457584007913129639935n).send(transaction);
    }
}

// Write needs balance
// slippage must be between 1-100
// positionPercentage must be between 1-100
async function sellToken(walletPrivateKey, tokenAddress, positionPercentage, slippage) {
    const account = httpProvider.eth.accounts.wallet.add(walletPrivateKey);
    const path = [tokenAddress, wavax];
     const transaction = {
        from: httpProvider.utils.toChecksumAddress(account[0].address),
        to: httpProvider.utils.toChecksumAddress(routerAddress),
    };
    const tokenContract = new httpProvider.eth.Contract(erc20Abi, tokenAddress);
    const balance = await tokenContract.methods.balanceOf(account[0].address).call();
    const routerContract = new httpProvider.eth.Contract(routerAbi, routerAddress);
    const amount = balance * httpProvider.utils.toBigInt(positionPercentage)/100n;
    await routerContract.methods.sellTokenForNative(amount, path, slippage).send(transaction);
}

async function dummyAsyncLogs(walletPublicAddress, tokenAddress) {
    console.log(await fetchTokenInfo(walletPublicAddress, tokenAddress))
    console.log(await getNativeBalance(walletPublicAddress))
}

console.log(createWallet())
dummyAsyncLogs('0xDDb2443Ec8823691a92629D03bF26c87207f39b2', usdc)