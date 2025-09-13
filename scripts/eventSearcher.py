from web3 import Web3
abi = [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [],
      "name": "ReentrancyGuardReentrantCall",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "TransferFromFailed",
      "type": "error"
    },
    {
      "anonymous": False,
      "inputs": [
        {
          "indexed": True,
          "internalType": "address",
          "name": "Operator",
          "type": "address"
        },
        {
          "indexed": False,
          "internalType": "uint256[]",
          "name": "BundlesAmounts",
          "type": "uint256[]"
        },
        {
          "indexed": False,
          "internalType": "uint256[]",
          "name": "BundlesPrices",
          "type": "uint256[]"
        }
      ],
      "name": "BundlesUpdated",
      "type": "event"
    },
    {
      "anonymous": False,
      "inputs": [
        {
          "indexed": True,
          "internalType": "address",
          "name": "From",
          "type": "address"
        },
        {
          "indexed": True,
          "internalType": "address",
          "name": "Token",
          "type": "address"
        },
        {
          "indexed": False,
          "internalType": "uint256",
          "name": "RecipientsLength",
          "type": "uint256"
        },
        {
          "indexed": False,
          "internalType": "uint256",
          "name": "TotalAmount",
          "type": "uint256"
        }
      ],
      "name": "Erc20AirdropCustomAmount",
      "type": "event"
    },
    {
      "anonymous": False,
      "inputs": [
        {
          "indexed": True,
          "internalType": "address",
          "name": "From",
          "type": "address"
        },
        {
          "indexed": True,
          "internalType": "address",
          "name": "Token",
          "type": "address"
        },
        {
          "indexed": False,
          "internalType": "uint256",
          "name": "RecipientsLength",
          "type": "uint256"
        },
        {
          "indexed": False,
          "internalType": "uint256",
          "name": "TotalAmount",
          "type": "uint256"
        }
      ],
      "name": "Erc20AirdropEqualAmount",
      "type": "event"
    },
    {
      "anonymous": False,
      "inputs": [
        {
          "indexed": True,
          "internalType": "address",
          "name": "From",
          "type": "address"
        },
        {
          "indexed": True,
          "internalType": "address",
          "name": "Token",
          "type": "address"
        },
        {
          "indexed": False,
          "internalType": "uint256",
          "name": "RecipientsLength",
          "type": "uint256"
        }
      ],
      "name": "Erc721Airdrop",
      "type": "event"
    },
    {
      "anonymous": False,
      "inputs": [
        {
          "indexed": True,
          "internalType": "address",
          "name": "From",
          "type": "address"
        },
        {
          "indexed": False,
          "internalType": "uint256",
          "name": "RecipientsLength",
          "type": "uint256"
        },
        {
          "indexed": False,
          "internalType": "uint256",
          "name": "TotalAmount",
          "type": "uint256"
        }
      ],
      "name": "NativeAirdropCustomAmount",
      "type": "event"
    },
    {
      "anonymous": False,
      "inputs": [
        {
          "indexed": True,
          "internalType": "address",
          "name": "From",
          "type": "address"
        },
        {
          "indexed": False,
          "internalType": "uint256",
          "name": "RecipientsLength",
          "type": "uint256"
        },
        {
          "indexed": False,
          "internalType": "uint256",
          "name": "TotalAmount",
          "type": "uint256"
        }
      ],
      "name": "NativeAirdropEqualAmount",
      "type": "event"
    },
    {
      "anonymous": False,
      "inputs": [
        {
          "indexed": False,
          "internalType": "address[]",
          "name": "Wallet",
          "type": "address[]"
        },
        {
          "indexed": False,
          "internalType": "uint256[]",
          "name": "Txns",
          "type": "uint256[]"
        }
      ],
      "name": "TxnsAdded",
      "type": "event"
    },
    {
      "anonymous": False,
      "inputs": [
        {
          "indexed": True,
          "internalType": "address",
          "name": "Buyer",
          "type": "address"
        },
        {
          "indexed": False,
          "internalType": "uint256",
          "name": "Amount",
          "type": "uint256"
        },
        {
          "indexed": False,
          "internalType": "uint256",
          "name": "Txns",
          "type": "uint256"
        }
      ],
      "name": "TxnsBundleBought",
      "type": "event"
    },
    {
      "anonymous": False,
      "inputs": [
        {
          "indexed": True,
          "internalType": "address",
          "name": "Wallet",
          "type": "address"
        }
      ],
      "name": "WalletBaseFeeReset",
      "type": "event"
    },
    {
      "anonymous": False,
      "inputs": [
        {
          "indexed": True,
          "internalType": "address",
          "name": "Wallet",
          "type": "address"
        },
        {
          "indexed": False,
          "internalType": "uint256",
          "name": "BaseFeeInWei",
          "type": "uint256"
        }
      ],
      "name": "WalletBaseFeeSet",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "address[]",
          "name": "list",
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
          "name": "wallets",
          "type": "address[]"
        },
        {
          "internalType": "uint256[]",
          "name": "txns",
          "type": "uint256[]"
        }
      ],
      "name": "addTxnsToWallets",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "baseFee",
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
          "internalType": "uint256",
          "name": "bundleIndex",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "quantity",
          "type": "uint256"
        }
      ],
      "name": "buyTxnsBundle",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "claimFees",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address[]",
          "name": "recipients",
          "type": "address[]"
        },
        {
          "internalType": "uint256[]",
          "name": "amount",
          "type": "uint256[]"
        },
        {
          "internalType": "address",
          "name": "token",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "totalAmount",
          "type": "uint256"
        }
      ],
      "name": "erc20AirdropCustomAmount",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address[]",
          "name": "recipients",
          "type": "address[]"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "token",
          "type": "address"
        }
      ],
      "name": "erc20AirdropEqualAmount",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address[]",
          "name": "recipients",
          "type": "address[]"
        },
        {
          "internalType": "uint256[]",
          "name": "ids",
          "type": "uint256[]"
        },
        {
          "internalType": "address",
          "name": "token",
          "type": "address"
        }
      ],
      "name": "erc721Airdrop",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "value_",
          "type": "uint256"
        }
      ],
      "name": "freezeContract",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "frozen",
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
      "name": "getAvailableTxnsForWallet",
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
      "name": "getBaseFeeForWallet",
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
      "name": "getBundles",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "AvailableBundles",
          "type": "uint256[]"
        },
        {
          "internalType": "uint256[]",
          "name": "BundlesPrices",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getDenylist",
      "outputs": [
        {
          "internalType": "address[]",
          "name": "",
          "type": "address[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getUsersThatBoughtBundles",
      "outputs": [
        {
          "internalType": "address[]",
          "name": "Users",
          "type": "address[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "value_",
          "type": "uint256"
        }
      ],
      "name": "handleErc721Flag",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "admin_",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "feeSink_",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "baseFeeCostInWei",
          "type": "uint256"
        },
        {
          "internalType": "uint256[]",
          "name": "availableTxnsBundles_",
          "type": "uint256[]"
        },
        {
          "internalType": "uint256[]",
          "name": "txnsBundlesToPrice_",
          "type": "uint256[]"
        }
      ],
      "name": "initialize",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address[]",
          "name": "recipients",
          "type": "address[]"
        },
        {
          "internalType": "uint256[]",
          "name": "amounts",
          "type": "uint256[]"
        }
      ],
      "name": "nativeAirdropCustomAmount",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address[]",
          "name": "recipients",
          "type": "address[]"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "nativeAirdropEqualAmount",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "permitErc721",
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
          "internalType": "address[]",
          "name": "list",
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
          "internalType": "address",
          "name": "wallet",
          "type": "address"
        }
      ],
      "name": "resetBaseFeeForWallet",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "wallet",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amountInWei",
          "type": "uint256"
        }
      ],
      "name": "setBaseFeeForWallet",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "baseFee_",
          "type": "uint256"
        }
      ],
      "name": "setNewBaseFee",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256[]",
          "name": "availableTxnsBundles_",
          "type": "uint256[]"
        },
        {
          "internalType": "uint256[]",
          "name": "txnsBundlesToPrice_",
          "type": "uint256[]"
        }
      ],
      "name": "updateBundles",
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
      "name": "updateFeeSink",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "userToTxns",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ]
# set to corresponding rpc
rpc = "https://polygon.gateway.tenderly.co"
w3 = Web3(Web3.HTTPProvider(rpc))
w3_tr = Web3(Web3.HTTPProvider("https://base-pokt.nodies.app"))

# set to corresponding router address
# contract_address = w3.to_checksum_address('0xd4829f126075603f562d84D670Dee1930456203e')
contract_address = w3.to_checksum_address('0xa7b5B27eb5A29AFdfe0AEC8675eBe47Ba1dbD090')

slashToken = w3.eth.contract(address=contract_address, abi=abi)

blockFrom = 57566577
blockTo = 57566579
def find_events():
  # Change with NativeAirdropCustomAmount and walletAddress, blockFrom, blockTo
  events = slashToken.events.NativeAirdropCustomAmount().get_logs(fromBlock=blockFrom, toBlock=blockTo, argument_filters={'From': '0xBa88532750E9871ac4D34722fA45FBf5F61559e8'})
  txHashes = [event['transactionHash'].hex() for event in events]
  print(events)
  for tx_hash in txHashes:
    res = w3_tr.eth.get_transaction('tx_hash')
    input = res['input']
    input_decoded = slashToken.decode_function_input(input)
    print(input_decoded[1]['recipients'])
    print(input_decoded[1]['amounts'])

find_events()
