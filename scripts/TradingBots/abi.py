router_abi = [
    {
      "inputs": [
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
          "internalType": "address",
          "name": "gasSink_",
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
      "name": "InvalidFee",
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
      "anonymous": False,
      "inputs": [
        {
          "indexed": True,
          "internalType": "address",
          "name": "User",
          "type": "address"
        },
        {
          "indexed": True,
          "internalType": "address",
          "name": "Token0",
          "type": "address"
        },
        {
          "indexed": True,
          "internalType": "address",
          "name": "Token1",
          "type": "address"
        },
        {
          "indexed": False,
          "internalType": "uint256",
          "name": "amountIn",
          "type": "uint256"
        },
        {
          "indexed": False,
          "internalType": "uint256",
          "name": "amountOut",
          "type": "uint256"
        },
        {
          "indexed": False,
          "internalType": "uint24",
          "name": "poolFee",
          "type": "uint24"
        },
        {
          "indexed": False,
          "internalType": "uint256",
          "name": "version",
          "type": "uint256"
        },
        {
          "indexed": False,
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
          "name": "v2_1Pair",
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
      "inputs": [
        {
          "internalType": "address",
          "name": "gasSink_",
          "type": "address"
        }
      ],
      "name": "setGasSink",
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
      "inputs": [],
      "name": "withdrawMaxGasFees",
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

multicall_abi = [
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "internalType": "address[]",
          "name": "tokens",
          "type": "address[]"
        }
      ],
      "name": "fetchMultiBalances",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "balances",
          "type": "uint256[]"
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
          "internalType": "address[]",
          "name": "tokens",
          "type": "address[]"
        }
      ],
      "name": "fetchMultiBalancesAndDecimals",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "balances",
          "type": "uint256[]"
        },
        {
          "internalType": "uint8[]",
          "name": "decimals",
          "type": "uint8[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ]