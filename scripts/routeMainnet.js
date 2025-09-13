const {ethers} = require("ethers");

//Network config
const tokenAddress = '0xd43D8aDAC6A4C7d9Aeece7c3151FcA8f23752cf8'
const tokenABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
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
        "name": "allowance",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "needed",
        "type": "uint256"
      }
    ],
    "name": "ERC20InsufficientAllowance",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "sender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "balance",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "needed",
        "type": "uint256"
      }
    ],
    "name": "ERC20InsufficientBalance",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "approver",
        "type": "address"
      }
    ],
    "name": "ERC20InvalidApprover",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "receiver",
        "type": "address"
      }
    ],
    "name": "ERC20InvalidReceiver",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "sender",
        "type": "address"
      }
    ],
    "name": "ERC20InvalidSender",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      }
    ],
    "name": "ERC20InvalidSpender",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "Approval",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "Transfer",
    "type": "event"
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
    "inputs": [],
    "name": "decimals",
    "outputs": [
      {
        "internalType": "uint8",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_value",
        "type": "uint256"
      }
    ],
    "name": "mint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "name",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
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
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "transfer",
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
        "name": "from",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "transferFrom",
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
const routerAddress = '0x73297aD9e715c0cd591bc5F5CC158FB248906f28'
const routerAbi = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "dataFetcher_",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "owner_",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "feeSink_",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "buyFeeBps_",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "sellFeeBps_",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "BalanceTooLow",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InsufficientOutputAmount",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "commandType",
        "type": "uint256"
      }
    ],
    "name": "InvalidCommandType",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidVersion",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "SliceOutOfBounds",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "V2InvalidPath",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "V2TooLittleReceived",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "V2TooMuchRequested",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "V3InvalidAmountOut",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "V3InvalidCaller",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "V3InvalidSwap",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "V3TooLittleReceived",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "V3TooMuchRequested",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "User",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "Token0",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "Token1",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amountIn",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amountOut",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint24",
        "name": "poolFee",
        "type": "uint24"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "version",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "platformFees",
        "type": "uint256"
      }
    ],
    "name": "SwapExecuted",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address[]",
        "name": "users",
        "type": "address[]"
      }
    ],
    "name": "addToAllowlist",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address[]",
        "name": "users",
        "type": "address[]"
      }
    ],
    "name": "addToDenylist",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address[]",
        "name": "tokens",
        "type": "address[]"
      }
    ],
    "name": "addToTokenAllowlist",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
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
        "components": [
          {
            "internalType": "address",
            "name": "pairAddress",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "token0",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "token1",
            "type": "address"
          },
          {
            "internalType": "uint112",
            "name": "reserves0",
            "type": "uint112"
          },
          {
            "internalType": "uint112",
            "name": "reserves1",
            "type": "uint112"
          },
          {
            "internalType": "uint160",
            "name": "sqrtPriceX96",
            "type": "uint160"
          },
          {
            "internalType": "uint24",
            "name": "version",
            "type": "uint24"
          },
          {
            "internalType": "uint24",
            "name": "fee",
            "type": "uint24"
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
            "internalType": "string",
            "name": "name",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "symbol",
            "type": "string"
          }
        ],
        "internalType": "struct IRouterStructs.AllInfo",
        "name": "info",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "token",
        "type": "address"
      }
    ],
    "name": "fetchTokenPairs",
    "outputs": [
      {
        "internalType": "address",
        "name": "v2Pair",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "v3_100Pair",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "v3_500Pair",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "v3_3000Pair",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "v3_10000Pair",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "cl_pair",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "stable_pair",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "volatile_pair",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address[]",
        "name": "tokens",
        "type": "address[]"
      }
    ],
    "name": "fetchTokensInfo",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "pairAddress",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "token0",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "token1",
            "type": "address"
          },
          {
            "internalType": "uint112",
            "name": "reserves0",
            "type": "uint112"
          },
          {
            "internalType": "uint112",
            "name": "reserves1",
            "type": "uint112"
          },
          {
            "internalType": "uint160",
            "name": "sqrtPriceX96",
            "type": "uint160"
          },
          {
            "internalType": "uint24",
            "name": "version",
            "type": "uint24"
          },
          {
            "internalType": "uint24",
            "name": "fee",
            "type": "uint24"
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
          }
        ],
        "internalType": "struct IRouterStructs.GeneralInfo[]",
        "name": "info",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "freezeContract",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "token",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amountIn",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "slippage",
        "type": "uint256"
      }
    ],
    "name": "getOptimalPathBuy",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "version",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "maxAmountOut",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "fee",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "token",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amountIn",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "slippage",
        "type": "uint256"
      }
    ],
    "name": "getOptimalPathSell",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "version",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "maxAmountOut",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "fee",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address[]",
        "name": "users",
        "type": "address[]"
      }
    ],
    "name": "removeFromAllowlist",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address[]",
        "name": "users",
        "type": "address[]"
      }
    ],
    "name": "removeFromDenylist",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address[]",
        "name": "tokens",
        "type": "address[]"
      }
    ],
    "name": "removeFromTokenAllowlist",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "tokenTo",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "minAmountOut",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "version",
        "type": "uint256"
      },
      {
        "internalType": "uint24",
        "name": "fee",
        "type": "uint24"
      },
      {
        "internalType": "bytes",
        "name": "commands",
        "type": "bytes"
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
        "internalType": "address",
        "name": "tokenFrom",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amountIn",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "minAmountOut",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "version",
        "type": "uint256"
      },
      {
        "internalType": "uint24",
        "name": "fee",
        "type": "uint24"
      },
      {
        "internalType": "bytes",
        "name": "commands",
        "type": "bytes"
      }
    ],
    "name": "sellTokenForNative",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "feeSink_",
        "type": "address"
      }
    ],
    "name": "setFeeSink",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "unfreezeContract",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "feeBps_",
        "type": "uint256"
      }
    ],
    "name": "updateBuyFeeBPS",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "feeBps_",
        "type": "uint256"
      }
    ],
    "name": "updateSellFeeBPS",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "withdrawFees",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address[]",
        "name": "token",
        "type": "address[]"
      }
    ],
    "name": "withdrawToken",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "stateMutability": "payable",
    "type": "receive"
  }
]
const baseRPC = "https://rpc.blast.io"
const baseProvider = new ethers.JsonRpcProvider(baseRPC)
const pk = ''
const baseSigner = new ethers.Wallet(pk, baseProvider)
console.log(baseSigner.address)

const routerContractInt = new ethers.Contract(routerAddress, routerAbi, baseSigner)
const tokenContractInt = new ethers.Contract(tokenAddress, tokenABI, baseSigner)

async function getOptimalPath(routerContract, tokenAddress, amountIn, flag, slippage) {
  if (flag === 0) {
    return await routerContract.getOptimalPathBuy.staticCall(tokenAddress, amountIn, slippage).catch({})
  } else {
    return await routerContract.getOptimalPathSell.staticCall(tokenAddress, amountIn, slippage).catch({})
  }
}

async function sellNativeForToken(routerContract, token, amountIn, slippage, account) {
  let quote = await getOptimalPath(routerContract, token, amountIn, 0, slippage)
  console.log(quote)
  let commands = ''
  if (quote[0] === 0n) {
    commands = '0x0b08'
  } else if (quote[0] === 1n) {
    commands = '0x0b00'
  } else if (quote[0] === 2n) {
    commands = '0x00'
  } else if (quote[0] === 3n) {
    commands = '0x00'
  } else {
    commands = '0x0b00'
  }
  const signer = routerContract.connect(account)
  const txn = await signer.sellNativeForToken(token, quote[1], quote[0], quote[2], commands, {value: amountIn})
  const rsp = await txn.wait();
  return rsp['hash']
}


async function sellTokenForNative(tokenContract, routerContract, amountIn, slippage, account) {
  let signer = tokenContract.connect(account)
  const appTxn = await signer.approve(await routerContract.getAddress(), amountIn)
  await appTxn.wait()
  let quote = await getOptimalPath(routerContract, await tokenContract.getAddress(), amountIn, 1, slippage)
  let commands = '';
  if (quote[0] === 0n) {
    commands = '0x08'
  } else if (quote[0] === 1n) {
    commands = '0x00'
  } else if (quote[0] === 2n) {
    commands = '0x00'
  } else if (quote[0] === 3n) {
    commands = '0x00'
  } else {
    commands = '0x00'
  }
  signer = routerContract.connect(account)
  const txn = await signer.sellTokenForNative(await tokenContract.getAddress(), amountIn, quote[1], quote[0], quote[2], commands)
  const rsp = await txn.wait();
  return rsp['hash']
}

async function dummyAsunc() {
  await sellNativeForToken(routerContractInt, await tokenContractInt.getAddress(), ethers.parseEther('0.0001'), 100000, baseSigner)
  let balance = await tokenContractInt.balanceOf(baseSigner.address)
  await sellTokenForNative(tokenContractInt, routerContractInt, balance, 30000, baseSigner)
}

dummyAsunc()

