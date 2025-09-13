import decimal

from web3 import Web3
abi = [
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
# set to corresponding rpc
# rpc = 'https://rpc.blast.io'
# rpc = "https://arb-mainnet.g.alchemy.com/v2/xkIcuOrk0eDv9TaZxMXtkwptU91055bi"
# rpc = "https://bsc-pokt.nodies.app"
rpc = "https://mainnet.base.org/"
rpc = 'https://polygon-mainnet.g.alchemy.com/v2/xkIcuOrk0eDv9TaZxMXtkwptU91055bi'

w3 = Web3(Web3.HTTPProvider(rpc))
# set to corresponding router address
# contract_address = w3.to_checksum_address('0x73297aD9e715c0cd591bc5F5CC158FB248906f28')
# contract_address = w3.to_checksum_address('0xa4a4368829402b14b8E1D163CaFD2B01Af775d60')
contract_address = w3.to_checksum_address('0x21D3bEB73880feF23Fdc322e679E8bDb630740Df') # mainnet
tokens = ['0xfA889BA268ba5b368C4991448666E8835667e5B7', '0xfA1A0edD5df48C0EAB711013B0Ec3b7Cc1f010DE', '0x720031b8A83E369a4D97f184d837a2daEd61cE91', '0xe72D0B7c421Ca7f97247Ec7ba5c314C7444A5b4f', '0xF5CAA4248A23c2d1A944dC8a6f4b1c18aB34E71F', '0xc446a9622307a2a0CAA7dbcf3D25cC0F1103C9e8', '0x433cDE5a82b5e0658dA3543b47A375dffd126Eb6', '0x8cF77cb4bA568eea42A2CdB20dA655920cbf5f12', '0x6c18DDE3606FAdB8C55039483FeCc0741429E5d4', '0x6cB7628e3729427ecBa2782E7E7BC38D706e5371', '0xE6986F2C0d5e740595BA260911a9e6E35219F936', '0xdD69F71d1B32bDBb491E038c136e11df9A169326', '0x1720F20561FE5F2cae3AC95afeCC7C303Efb3a74', '0x5084F60887ff5757EeA07779835a3000A8f81CBC', '0xC15a35572A39001969C12F3e44a52D770Bd47Cc7', '0x6D36E66A1a3a411e11a8b5921F1F2dE8CeBc2618', '0xB46Bb15efF1d79161D2b96172bDF34441D5e0758', '0x6C07ef14e9D54D860C06B87caFd4fbc428490a64', '0x4cE653467F7f9971b28e5A6c0234bA4a3A0F4Ac8', '0x1442fA6CE5a8E7b9cCe8b0435A52dbcf2B91F5db', '0xCf3bA91EeC7cF9E646c2d57C3F01476E72e24B05', '0x029a1d9BF4215ff5b922541673Bae8c85e3A4F80', '0x62D3c4D43d1e5921dE27c6e01af0675644aE166e', '0x5176CBCAf9E0FdfC3e7f3ae5B7256c73b36dDe51', '0x4b8Da00c1b0177a5666d198d944c8fCE78240A8a', '0xB54a9d97c08DAafc8344278e26eE50906B44225c', '0x29eBAe17A103Dd2d8420f48E1116CfDE7DA4A445', '0x2b4B6389a1104C9b14712B9fD9769aB18C7A853C', '0xd25DAB78038E399e2772B28E59390e6d1A60E336', '0x645B28102f69CE4A8Ad0C5aC60469EA6BB748ddc', '0x6135E3a856B60104a4fE76412DD1Bb78E683fccB', '0x986FD58531a80ac451b96EDb41594439D613A0A6', '0xC268D3c8340eC4234cA828Dd5b655215D5a2e777', '0xa95FDF8fE0bbc70D2740749c7659c6dd6620c157', '0x3Dd9e79Dd035cFcdc539bdac5cecA20F6b7E97A7', '0xa540f883E059F0fcbe7757d4bD06bEeEA41e3177', '0xe55a7dD9b924E1Ffcb9480001D664069F319E6eC', '0x78b57067e5BBbed9cE2d48044EC7FaE3Df3B2624', '0x1f6c0F7Df4e2a81556E50490F2782BA8F3f52737', '0x52b005d5AF18e0093E08067503c502858Cf411bC', '0xD1E17DD9404674C0AEC7747Ef000902a4D80350a', '0x82a6B149959718F55429659ABafFBC05cB4E722b', '0x0252b2270fdBF25932480d7828DD322cf450ADbC', '0x82421437D929876d7C52bc24c6556debeb866Ecf', '0x60DA2905B8d8b8D3F705A7410d83d3884bfec4D8', '0x61e75a20b23920eFeCa6fa4536c7b91B4E1EF478', '0xb5e0CFe1B4dB501aC003B740665bf43192cC7853', '0x5b2a7C619A283b3E58E74293841789DCaea5EBD4', '0xDA6b27159b227d0438167A78886A0Be1893ddDFC', '0x42939C84600f2EF46B4364712745CdEf42bd0fc4']
router = w3.eth.contract(address=contract_address, abi=abi)


# Method to find the best path across all available pools
# Input:
#   - tokenAddress, The address of the token we want to trade
#   - amountIn, The amount we want to swap (could be WETH or token)
#   - flag, 0 for sell native, 1 for sell token
#   - slippage, The desired slippage in basis points, 10000 = 1%
# Returns a list of 4 items:
#   - version (0 or 1)
#   - amountOut, The minimum expected amount of the swap after slippage
#   - fee, The pools fee if version is 1
#   - amountIn, The swaps amount in

def getOptimalPath(tokenAddress, amountIn, flag, slippage) :
    #   if 0 we sell native for token
    if flag == 0:
        return router.functions.getOptimalPathBuy(tokenAddress, amountIn, slippage).call()
    # else we sell token for native
    else:
        return router.functions.getOptimalPathSell(tokenAddress, amountIn, slippage).call()

# Method to get the best path for the trade and construct the arguments for the function call
# Input:
#   - tokenAddress, The address of the token we want to trade
#   - amountIn, The amount we want to swap (could be WETH or token)
#   - slippage, The desired slippage in basis points, 10000 = 1%
# Returns 6 items in the correct order to be appended in the function call from mobile:
#    - tokenAddress , The tokens address
#    - amountOut, The minimum expected amount of the swap after slippage
#    - version (0 or 1)
#    - fee, The pools fee
#    - commands, The commands execute the swap
#    - amountIn, To be used as the transactions value

def constructSellNativeForToken(tokenAddress, amountIn, slippage):
    quote = getOptimalPath(tokenAddress, amountIn, 0, slippage)
    commands = ''
    if quote[0] == 0:
        commands = '0x0b08'
    else:
        commands = '0x0b00'
    return tokenAddress, quote[1], quote[0], quote[2], commands, amountIn

# Method to get the best path for the trade and construct the arguments for the function call
# Input:
#   - tokenAddress, The address of the token we want to trade
#   - amountIn, The amount we want to swap (could be WETH or token)
#   - slippage, The desired slippage in basis points, 10000 = 1%
# Returns 6 items in the correct order to be appended in the function call from mobile:
#    - tokenAddress , The tokens address
#    - amountIn, The token's amount to swap
#    - amountOut, The minimum expected amount of the swap after slippage
#    - version (0 or 1)
#    - fee, The pools fee
#    - commands, The commands execute the swap
def constructSellTokenForNative(tokenAddress, amountIn, slippage):
    quote = getOptimalPath(tokenAddress, amountIn, 1, slippage)
    commands = ''
    if quote[0] == 0:
        commands = '0x08'
    else:
        commands = '0x00'
    return tokenAddress, amountIn, quote[1], quote[0], quote[2], commands


# Method to get a txn object ready to get signed from mobile
# Input:
#   - account, User's address
#   - tokenAddress, The address of the token we want to trade
#   - amountIn, The amount we want to swap (could be WETH or token)
#   - slippage, The desired slippage in basis points, 10000 = 1%
# Returns 1 item:
#    - txn , A txn object, we might only need txn.data
#    Example: {'gas': 183670, 'maxFeePerGas': 1132220702, 'maxPriorityFeePerGas': 1000000000, 'chainId': 31337, 'from': '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', 'nonce': 49, 'value': 1000000000000000000, 'to': '0x809d550fca64d94Bd9F66E60752A544199cfAC3D', 'data': '0x0fc9f3280000000000000000000000004ed4e862860bed51a9570b96d89af5e1b0efefed00000000000000000000000000000000000000000000157c7ecf7c61a2d779d200000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000bb800000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000020b00000000000000000000000000000000000000000000000000000000000000'}
def constructPayloadForSellNative(account, tokenAddress, amount, slippage):
    base_fee = w3.eth.gas_price
    maxPriorityFeePerGas = w3.eth.max_priority_fee
    (tokenAdd, amountOut, version, fee, command, amountIn) = constructSellNativeForToken(tokenAddress, amount, slippage)
    txn = router.functions.sellNativeForToken(tokenAdd, amountOut, version, fee, command).build_transaction({
      "from": account,
      "nonce": w3.eth.get_transaction_count(account),
      "value": amountIn,
      "maxFeePerGas": base_fee + 2*maxPriorityFeePerGas,
      "maxPriorityFeePerGas": 2*maxPriorityFeePerGas
    })
    return txn


# Method to get a txn object ready to get signed from mobile
# Input:
#   - account, User's address
#   - tokenAddress, The address of the token we want to trade
#   - amountIn, The amount we want to swap (could be WETH or token)
#   - slippage, The desired slippage in basis points, 10000 = 1%
# Returns 1 item:
#    - txn , A txn object, we might only need txn.data
def constructPayloadForSellToken(account, tokenAddress, amount, slippage):
    (tokenAdd, amountIn, amountOut, version, fee, command) = constructSellTokenForNative(tokenAddress, amount, slippage)
    txn = router.functions.sellTokenForNative(tokenAdd, amountIn, amountOut, version, fee, command).build_transaction({
      "from": account,
      "nonce": w3.eth.get_transaction_count(account)
    })
    return txn

# Method to get a single token's info
# Input:
#   - tokenAddress, The address of the token we want to get info
# Returns 1 object with items in the following order:
#    - pairAddress, The optimal pair's address
#    - token0, The first token in the pair
#    - token1, The second token in the pair
#    - reserves0, The reserves of the first token in the pair
#    - reserves1, The reserves of the second token in the pair
#    - sqrtPriceX96, We need this to calculate liquidity price if v3 pair
#    - version, The pair's version 0=v2, 1=v3
#    - fee, The pair's fee if v3
#    - decimals, The token's decimals
#    - totalSupply, The token's totalSupply
#    - name, The token's name
#    - symbol, The token's symbol
def fetchSingleTokenInfo(tokenAddress):
  print(w3.eth.block_number)
  return router.functions.fetchTokenInfo(tokenAddress).call()
  # return router.functions.fetchTokenPairs(tokenAddress).call()

# Method to get multiple tokens info
# Input:
#   - tokenAddresses, A list of addresses of the tokens we want to get info
# Returns a list of objects with items in the following order:
#    - pairAddress, The optimal pair's address
#    - token0, The first token in the pair
#    - token1, The second token in the pair
#    - reserves0, The reserves of the first token in the pair
#    - reserves1, The reserves of the second token in the pair
#    - sqrtPriceX96, We need this to calculate liquidity price if v3 pair
#    - version, The pair's version 0=v2, 1=v3
#    - fee, The pair's fee if v3
#    - decimals, The token's decimals
#    - totalSupply, The token's totalSupply
def fetchMultiTokenInfo(tokenAddresses):
    return router.functions.fetchTokensInfo(tokenAddresses).call()

# Method to get liquidity price, token price and FDV for a single token **WE NEED TO USE AN API FOR ETH PRICE e.g CoinGecko
# url = 'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd';
# Input:
#   - tokenAddress, A token address
# Returns a list of objects with items in the following order:
#    - liquidityPrice, The liquidity price in dollars
#    - tokenPrice, The token price in dollars
#    - fdv, The FDV in dollars
def calculateLiquidityTokenPriceAndFDV(tokenAddress):
    weth_token_address = '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1'
    rsp = fetchSingleTokenInfo(tokenAddress)
    pair_address = rsp[0]
    token0 = rsp[1]
    token1 = rsp[2]
    reserves0 = rsp[3]
    reserves1 = rsp[4]
    sqrtPriceX96 = rsp[5]
    version = rsp[6]
    fee = rsp[7]
    decimals = rsp[8]
    total_supply = rsp[9]
    liquidity_value = 0
    print(token0)
    print(token1)
    token_price = 0
    eth_price = 3350 #dummy price we use coingecko api for real price
    if version == 0:
        token_price = float((w3.from_wei(reserves0, 'ether') * eth_price)) / float(reserves1 / 10**decimals) if token0 == weth_token_address else float(w3.from_wei(reserves1, 'ether') * eth_price) / float(reserves0 / 10**decimals)
        liquidity_value = float(w3.from_wei(2*reserves0, 'ether') * eth_price) if token0 == weth_token_address else float(w3.from_wei(2*reserves1, 'ether') * eth_price)
    else:
        token_price = ((1/((sqrtPriceX96/(2**96))**2))*eth_price) * ((10**decimals) / 10**18) if token0 == weth_token_address else (((sqrtPriceX96/(2**96))**2)*eth_price) * ((10**decimals) / 10**18)
        liquidity_value = float(w3.from_wei(reserves0, 'ether') * eth_price) + float(reserves1 / 10**decimals) * token_price if token0 == weth_token_address else float(w3.from_wei(reserves1, 'ether') * eth_price) + float(reserves0 / 10**decimals) * token_price
    fdv = token_price * (total_supply/10**decimals)
    return liquidity_value, token_price, fdv

def calculateLiquidityTokenPriceAndFDVinWETH(tokenAddress):
  weth_token_address = '0x4200000000000000000000000000000000000006'
  rsp = fetchSingleTokenInfo(tokenAddress)
  pair_address = rsp[0]
  token0 = rsp[1]
  token1 = rsp[2]
  reserves0 = rsp[3]
  reserves1 = rsp[4]
  sqrtPriceX96 = rsp[5]
  version = rsp[6]
  fee = rsp[7]
  decimals = rsp[8]
  total_supply = rsp[9]
  liquidity_value = 0
  token_price = 0
  if version == 0:
    token_price = float((w3.from_wei(reserves0, 'ether'))) / float(
      reserves1 / 10 ** decimals) if token0 == weth_token_address else float(
      w3.from_wei(reserves1, 'ether') ) / float(reserves0 / 10 ** decimals)
    liquidity_value = float(w3.from_wei(2 * reserves0, 'ether')) if token0 == weth_token_address else float(
      w3.from_wei(2 * reserves1, 'ether'))
  else:
    token_price = ((1 / ((sqrtPriceX96 / (2 ** 96)) ** 2))) * (
              (10 ** decimals) / 10 ** 18) if token0 == weth_token_address else (((sqrtPriceX96 / (
              2 ** 96)) ** 2)) * ((10 ** 18) / 10 ** decimals)
    liquidity_value = float(w3.from_wei(reserves0, 'ether')) + float(
      reserves1 / 10 ** decimals) * token_price if token0 == weth_token_address else float(
      w3.from_wei(reserves1, 'ether')) + float(reserves0 / 10 ** decimals) * token_price
  fdv = token_price * (total_supply / 10 ** decimals)
  return liquidity_value, token_price, fdv

def calculateLiquidityTokenPriceAndFDVinWEI(tokenAddress):
  weth_token_address = '0x4200000000000000000000000000000000000006'
  rsp = fetchSingleTokenInfo(tokenAddress)
  pair_address = rsp[0]
  token0 = rsp[1]
  token1 = rsp[2]
  reserves0 = decimal.Decimal(rsp[3])
  reserves1 = decimal.Decimal(rsp[4])
  sqrtPriceX96 = decimal.Decimal(rsp[5])
  version = rsp[6]
  fee = rsp[7]
  decimals = rsp[8]
  total_supply = decimal.Decimal(rsp[9])
  liquidity_value = 0
  token_price = 0
  if version == 0:
    token_price = (reserves0 / reserves1) * 10 ** decimals if token0 == weth_token_address else (reserves1 / reserves0) * 10 ** decimals
    liquidity_value = 2 * reserves0 if token0 == weth_token_address else 2 * reserves1
  else:
    token_price = (1 / ((sqrtPriceX96 / (2 ** 96)) ** 2)) * (10 ** decimals) if token0 == weth_token_address else ((sqrtPriceX96 / (2 ** 96)) ** 2) * ((10 ** 36) / 10 ** decimals)
    liquidity_value = reserves0 + (reserves1 / 10 ** decimals) * token_price if token0 == weth_token_address else reserves1 + (reserves0 / 10 ** decimals) * token_price
  fdv = token_price * (total_supply / 10 ** decimals)
  return liquidity_value, token_price, fdv

def fetch_single_token_info(router_contract_address: str, token_address: str, native_address: str):
    """
    Returns a single token's information.

    :param router_contract_address: Smart contract address
    :param token_address: The address of the token we want to get its information
    :param native_address: Native token address
    :return: dict
           - pair_address, The optimal pair's address
           - token0, The first token in the pair
           - token1, The second token in the pair
           - reserves0, The reserves of the first token in the pair
           - reserves1, The reserves of the second token in the pair
           - sqrtPriceX96, We need this to calculate liquidity price if v3 pair
           - version, The pair's version 0=v2, 1=v3
           - fee, The pair's fee if v3
           - decimals, The token's decimals
           - total_supply, The token's totalSupply
           - name, The token's name
           - symbol, The token's symbol
           - liquidity, the liquidity value in Wei
           - price, the token price in Wei
           - fdv, the FDV in Wei
    """
    rsp = fetchSingleTokenInfo(token_address)

    native_address = w3.to_checksum_address(native_address)

    pair_address = w3.to_checksum_address(rsp[0])
    token0 = w3.to_checksum_address(rsp[1])
    token1 = w3.to_checksum_address(rsp[2])
    reserves0 = rsp[3]
    reserves1 = rsp[4]
    sqrt_price_x96 = rsp[5]
    version = rsp[6]
    fee = rsp[7]
    decimals = rsp[8]
    total_supply = rsp[9]
    name = rsp[10]
    symbol = rsp[11]

    reserves0_decimal = decimal.Decimal(reserves0)
    reserves1_decimal = decimal.Decimal(reserves1)
    sqrt_price_x96_decimal = decimal.Decimal(sqrt_price_x96)
    decimals_decimal = decimal.Decimal(decimals)
    total_supply_decimal = decimal.Decimal(total_supply)

    try:
      if version == 0:
        if token0 == native_address:
          token_price = (reserves0_decimal / reserves1_decimal) * 10 ** decimals_decimal
          liquidity_value = 2 * reserves0_decimal
        else:
          token_price = (reserves1_decimal / reserves0_decimal) * 10 ** decimals_decimal
          liquidity_value = 2 * reserves1_decimal
      else:
        if token0 == native_address:
          token_price = (1 / ((sqrt_price_x96_decimal / (2 ** 96)) ** 2)) * (10 ** decimals_decimal)
          liquidity_value = reserves0_decimal + (reserves1_decimal / 10 ** decimals_decimal) * token_price
        else:
          token_price = ((sqrt_price_x96_decimal / (2 ** 96)) ** 2) * (10 ** decimals_decimal)
          liquidity_value = reserves1_decimal + (reserves0_decimal / 10 ** decimals_decimal) * token_price

      fdv = decimal.Decimal(token_price) * (decimal.Decimal(total_supply_decimal) / 10 ** decimals_decimal)
    except decimal.DivisionByZero:
      token_price = 0
      liquidity_value = 0
      fdv = 0
    except decimal.InvalidOperation as e:
      if 'DivisionUndefined' in str(e):
        token_price = 0
        liquidity_value = 0
        fdv = 0
      else:
        raise

    return {
      'pair_address': pair_address,
      'token0': token0,
      'token1': token1,
      'reserves0': reserves0,
      'reserves1': reserves1,
      'sqrtPriceX96': sqrt_price_x96,
      'version': version,
      'fee': fee,
      'decimals': decimals,
      'total_supply': total_supply,
      'name': name,
      'symbol': symbol,
      'liquidity': int(liquidity_value),
      'price': int(token_price),
      'fdv': int(fdv)
    }

for token in tokens:
  try:
    print(fetchSingleTokenInfo(token))
  except Exception as e:
    print('ERROR', token, e)


# print(fetchSingleTokenInfo('0x929b1607dF8851e3896037ECEACF1Fa4fD7b189E'))
# print(fetchSingleTokenInfo('0x929eDC90062e1f0d732C31bc6F70FE2c17E7c736'))
# print(fetchSingleTokenInfo('0x92A062bB26A0Cbc704BF7dcD4C833d4e1beeb83d'))


# print(calculateLiquidityTokenPriceAndFDV(w3.to_checksum_address('0x09199d9A5F4448D0848e4395D065e1ad9c4a1F74')))
# print(calculateLiquidityTokenPriceAndFDVinWETH(w3.to_checksum_address('0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed')))
# print(calculateLiquidityTokenPriceAndFDVinWEI(w3.to_checksum_address('0xd43D8aDAC6A4C7d9Aeece7c3151FcA8f23752cf8')))
# print(calculateLiquidityTokenPriceAndFDVinWEI(w3.to_checksum_address('0x3054E8F8fBA3055a42e5F5228A2A4e2AB1326933')))

# print(fetchSingleTokenInfo(w3.to_checksum_address('0x23ee2343B892b1BB63503a4FAbc840E0e2C6810f')))
# print(fetchMultiTokenInfo([w3.to_checksum_address('0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed')]))
# print(constructSellNativeForToken(w3.to_checksum_address('0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed'), w3.to_wei('1', 'ether'), 10000))
# print(constructSellTokenForNative(w3.to_checksum_address('0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed'), 101466230064330277616082, 10000))
# print(constructPayloadForSellNative('0xF977814e90dA44bFA03b6295A0616a897441aceC', w3.to_checksum_address('0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed'), w3.to_wei('1', 'ether'), 10000))
# print(constructPayloadForSellToken('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', w3.to_checksum_address('0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed'), 101466230064330277616082, 10000))