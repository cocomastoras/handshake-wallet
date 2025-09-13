import csv
import sys
from web3 import Web3

router_abi = [
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
      "inputs": [],
      "name": "freezeContract",
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
          "name": "feeSink_",
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
    }
]

mainnet_providers = {
    'ethereum': "https://eth-mainnet.g.alchemy.com/v2/xkIcuOrk0eDv9TaZxMXtkwptU91055bi",
    'base': "https://base-rpc.publicnode.com",
    'arbitrum': "https://arb-mainnet.g.alchemy.com/v2/xkIcuOrk0eDv9TaZxMXtkwptU91055bi",
    'blast': 'https://rpc.blast.io',
    'binance': 'https://rpc.ankr.com/bsc',
    'matic': "https://polygon-mainnet.g.alchemy.com/v2/xkIcuOrk0eDv9TaZxMXtkwptU91055bi"
}

contract_address = '0x21D3bEB73880feF23Fdc322e679E8bDb630740Df'

admin_pk = ''

def extract_addresses_from_csv(csv_file_path, w3):
    with open(csv_file_path, 'r', encoding='utf-8-sig') as csvfile:
        csv_reader = csv.DictReader(csvfile)
        addresses = []
        for row in csv_reader:
            addresses.append(w3.to_checksum_address(row['address']))
        return addresses

def freeze_contract():
    provider = mainnet_providers[sys.argv[2]]
    w3 = Web3(Web3.HTTPProvider(provider))
    admin = w3.eth.account.from_key(admin_pk)
    router_contract = w3.eth.contract(address=w3.to_checksum_address(contract_address), abi=router_abi)
    txn_gas = router_contract.functions.freezeContract().estimate_gas({'from': admin.address})
    new_transaction = {
        'nonce': w3.eth.get_transaction_count(admin.address),
        'gasPrice': w3.eth.gas_price,
        'from': admin.address,
        'gas': txn_gas
    }
    try:
        txn = router_contract.functions.freezeContract().build_transaction(new_transaction)
        sign_txn = w3.eth.account.sign_transaction(txn, admin.key)
        sent = w3.eth.send_raw_transaction(sign_txn.rawTransaction)
        w3.eth.wait_for_transaction_receipt(sent)
    except:
        print("Failed for Rpc:", provider)

def unfreeze_contract():
    provider = mainnet_providers[sys.argv[2]]
    w3 = Web3(Web3.HTTPProvider(provider))
    admin = w3.eth.account.from_key(admin_pk)
    router_contract = w3.eth.contract(address=w3.to_checksum_address(contract_address), abi=router_abi)
    txn_gas = router_contract.functions.freezeContract().estimate_gas({'from': admin.address})
    new_transaction = {
        'nonce': w3.eth.get_transaction_count(admin.address),
        'gasPrice': w3.eth.gas_price,
        'from': admin.address,
        'gas': txn_gas
    }
    try:
        txn = router_contract.functions.freezeContract().build_transaction(new_transaction)
        sign_txn = w3.eth.account.sign_transaction(txn, admin.key)
        sent = w3.eth.send_raw_transaction(sign_txn.rawTransaction)
        w3.eth.wait_for_transaction_receipt(sent)
    except:
        print("Failed for Rpc:", provider)

def update_feesink():
    provider = mainnet_providers[sys.argv[2]]
    w3 = Web3(Web3.HTTPProvider(provider))
    admin = w3.eth.account.from_key(admin_pk)
    router_contract = w3.eth.contract(address=w3.to_checksum_address(contract_address), abi=router_abi)
    txn_gas = router_contract.functions.setFeeSink(w3.to_checksum_address(sys.argv[3])).estimate_gas({'from': admin.address})
    new_transaction = {
        'nonce': w3.eth.get_transaction_count(admin.address),
        'gasPrice': w3.eth.gas_price,
        'from': admin.address,
        'gas': txn_gas
    }
    try:
        txn = router_contract.functions.setFeeSink(w3.to_checksum_address(sys.argv[3])).build_transaction(new_transaction)
        sign_txn = w3.eth.account.sign_transaction(txn, admin.key)
        sent = w3.eth.send_raw_transaction(sign_txn.rawTransaction)
        w3.eth.wait_for_transaction_receipt(sent)
    except:
        print("Failed for Rpc:", provider)

def update_gassink():
    provider = mainnet_providers['blast']
    w3 = Web3(Web3.HTTPProvider(provider))
    admin = w3.eth.account.from_key(admin_pk)
    router_contract = w3.eth.contract(address=w3.to_checksum_address(contract_address), abi=router_abi)
    txn_gas = router_contract.functions.setGasSink(w3.to_checksum_address(sys.argv[1])).estimate_gas({'from': admin.address})
    new_transaction = {
        'nonce': w3.eth.get_transaction_count(admin.address),
        'gasPrice': w3.eth.gas_price,
        'from': admin.address,
        'gas': txn_gas
    }
    try:
        txn = router_contract.functions.setGasSink(w3.to_checksum_address(sys.argv[1])).build_transaction(new_transaction)
        sign_txn = w3.eth.account.sign_transaction(txn, admin.key)
        sent = w3.eth.send_raw_transaction(sign_txn.rawTransaction)
        w3.eth.wait_for_transaction_receipt(sent)
    except:
        print("Failed for Rpc:", provider)

def claim_fees():
    provider = mainnet_providers[sys.argv[2]]
    w3 = Web3(Web3.HTTPProvider(provider))
    admin = w3.eth.account.from_key(admin_pk)
    router_contract = w3.eth.contract(address=w3.to_checksum_address(contract_address), abi=router_abi)
    txn_gas = router_contract.functions.withdrawFees().estimate_gas({'from': admin.address})
    new_transaction = {
        'nonce': w3.eth.get_transaction_count(admin.address),
        'gasPrice': w3.eth.gas_price,
        'from': admin.address,
        'gas': txn_gas
    }
    try:
        txn = router_contract.functions.withdrawFees().build_transaction(new_transaction)
        sign_txn = w3.eth.account.sign_transaction(txn, admin.key)
        sent = w3.eth.send_raw_transaction(sign_txn.rawTransaction)
        w3.eth.wait_for_transaction_receipt(sent)
    except:
        print("Failed for Rpc:", provider)

def claim_gas_fees():
    provider = mainnet_providers['blast']
    w3 = Web3(Web3.HTTPProvider(provider))
    admin = w3.eth.account.from_key(admin_pk)
    router_contract = w3.eth.contract(address=w3.to_checksum_address(contract_address), abi=router_abi)
    txn_gas = router_contract.functions.withdrawMaxGasFees().estimate_gas({'from': admin.address})
    new_transaction = {
        'nonce': w3.eth.get_transaction_count(admin.address),
        'gasPrice': w3.eth.gas_price,
        'from': admin.address,
        'gas': txn_gas
    }
    try:
        txn = router_contract.functions.withdrawMaxGasFees().build_transaction(new_transaction)
        sign_txn = w3.eth.account.sign_transaction(txn, admin.key)
        sent = w3.eth.send_raw_transaction(sign_txn.rawTransaction)
        w3.eth.wait_for_transaction_receipt(sent)
    except:
        print("Failed for Rpc:", provider)

def claim_tokens():
    provider = mainnet_providers[sys.argv[2]]
    w3 = Web3(Web3.HTTPProvider(provider))
    admin = w3.eth.account.from_key(admin_pk)
    router_contract = w3.eth.contract(address=w3.to_checksum_address(contract_address), abi=router_abi)
    tokens = extract_addresses_from_csv(sys.argv[3], w3)
    txn_gas = router_contract.functions.withdrawToken(tokens).estimate_gas({'from': admin.address})
    new_transaction = {
        'nonce': w3.eth.get_transaction_count(admin.address),
        'gasPrice': w3.eth.gas_price,
        'from': admin.address,
        'gas': txn_gas
    }
    try:
        txn = router_contract.functions.withdrawToken(tokens).build_transaction(new_transaction)
        sign_txn = w3.eth.account.sign_transaction(txn, admin.key)
        sent = w3.eth.send_raw_transaction(sign_txn.rawTransaction)
        w3.eth.wait_for_transaction_receipt(sent)
    except:
        print("Failed for Rpc:", provider)

def update_buy_fee():
    provider = mainnet_providers[sys.argv[2]]
    w3 = Web3(Web3.HTTPProvider(provider))
    admin = w3.eth.account.from_key(admin_pk)
    router_contract = w3.eth.contract(address=w3.to_checksum_address(contract_address), abi=router_abi)
    txn_gas = router_contract.functions.updateBuyFeeBPS(int(sys.argv[3])).estimate_gas({'from': admin.address})
    new_transaction = {
        'nonce': w3.eth.get_transaction_count(admin.address),
        'gasPrice': w3.eth.gas_price,
        'from': admin.address,
        'gas': txn_gas
    }
    try:
        txn = router_contract.functions.updateBuyFeeBPS(int(sys.argv[3])).build_transaction(new_transaction)
        sign_txn = w3.eth.account.sign_transaction(txn, admin.key)
        sent = w3.eth.send_raw_transaction(sign_txn.rawTransaction)
        w3.eth.wait_for_transaction_receipt(sent)
    except:
        print("Failed for Rpc:", provider)

def update_sell_fee():
    provider = mainnet_providers[sys.argv[2]]
    w3 = Web3(Web3.HTTPProvider(provider))
    admin = w3.eth.account.from_key(admin_pk)
    router_contract = w3.eth.contract(address=w3.to_checksum_address(contract_address), abi=router_abi)
    txn_gas = router_contract.functions.updateSellFeeBPS(int(sys.argv[3])).estimate_gas({'from': admin.address})
    new_transaction = {
        'nonce': w3.eth.get_transaction_count(admin.address),
        'gasPrice': w3.eth.gas_price,
        'from': admin.address,
        'gas': txn_gas
    }
    try:
        txn = router_contract.functions.updateSellFeeBPS(int(sys.argv[3])).build_transaction(new_transaction)
        sign_txn = w3.eth.account.sign_transaction(txn, admin.key)
        sent = w3.eth.send_raw_transaction(sign_txn.rawTransaction)
        w3.eth.wait_for_transaction_receipt(sent)
    except:
        print("Failed for Rpc:", provider)

def add_to_token_allowlist():
    provider = mainnet_providers[sys.argv[2]]
    w3 = Web3(Web3.HTTPProvider(provider))
    admin = w3.eth.account.from_key(admin_pk)
    router_contract = w3.eth.contract(address=w3.to_checksum_address(contract_address), abi=router_abi)
    tokens = extract_addresses_from_csv(sys.argv[3], w3)
    txn_gas = router_contract.functions.addToTokenAllowlist(tokens).estimate_gas({'from': admin.address})
    new_transaction = {
        'nonce': w3.eth.get_transaction_count(admin.address),
        'gasPrice': w3.eth.gas_price,
        'from': admin.address,
        'gas': txn_gas
    }
    try:
        txn = router_contract.functions.addToTokenAllowlist(tokens).build_transaction(new_transaction)
        sign_txn = w3.eth.account.sign_transaction(txn, admin.key)
        sent = w3.eth.send_raw_transaction(sign_txn.rawTransaction)
        w3.eth.wait_for_transaction_receipt(sent)
    except:
        print("Failed for Rpc:", provider)

def remove_from_token_allowlist():
    provider = mainnet_providers[sys.argv[2]]
    w3 = Web3(Web3.HTTPProvider(provider))
    admin = w3.eth.account.from_key(admin_pk)
    router_contract = w3.eth.contract(address=w3.to_checksum_address(contract_address), abi=router_abi)
    tokens = extract_addresses_from_csv(sys.argv[3], w3)
    txn_gas = router_contract.functions.removeFromTokenAllowlist(tokens).estimate_gas({'from': admin.address})
    new_transaction = {
        'nonce': w3.eth.get_transaction_count(admin.address),
        'gasPrice': w3.eth.gas_price,
        'from': admin.address,
        'gas': txn_gas
    }
    try:
        txn = router_contract.functions.removeFromTokenAllowlist(tokens).build_transaction(new_transaction)
        sign_txn = w3.eth.account.sign_transaction(txn, admin.key)
        sent = w3.eth.send_raw_transaction(sign_txn.rawTransaction)
        w3.eth.wait_for_transaction_receipt(sent)
    except:
        print("Failed for Rpc:", provider)

def add_to_denylist():
    provider = mainnet_providers[sys.argv[2]]
    w3 = Web3(Web3.HTTPProvider(provider))
    admin = w3.eth.account.from_key(admin_pk)
    router_contract = w3.eth.contract(address=w3.to_checksum_address(contract_address), abi=router_abi)
    denylist = extract_addresses_from_csv(sys.argv[3], w3)
    txn_gas = router_contract.functions.addToDenylist(denylist).estimate_gas({'from': admin.address})
    new_transaction = {
        'nonce': w3.eth.get_transaction_count(admin.address),
        'gasPrice': w3.eth.gas_price,
        'from': admin.address,
        'gas': txn_gas
    }
    try:
        txn = router_contract.functions.addToDenylist(denylist).build_transaction(new_transaction)
        sign_txn = w3.eth.account.sign_transaction(txn, admin.key)
        sent = w3.eth.send_raw_transaction(sign_txn.rawTransaction)
        w3.eth.wait_for_transaction_receipt(sent)
    except:
        print("Failed for Rpc:", provider)

def remove_from_denylist():
    provider = mainnet_providers[sys.argv[2]]
    w3 = Web3(Web3.HTTPProvider(provider))
    admin = w3.eth.account.from_key(admin_pk)
    router_contract = w3.eth.contract(address=w3.to_checksum_address(contract_address), abi=router_abi)
    denylist = extract_addresses_from_csv(sys.argv[3], w3)
    txn_gas = router_contract.functions.removeFromDenylist(denylist).estimate_gas({'from': admin.address})
    new_transaction = {
        'nonce': w3.eth.get_transaction_count(admin.address),
        'gasPrice': w3.eth.gas_price,
        'from': admin.address,
        'gas': txn_gas
    }
    try:
        txn = router_contract.functions.removeFromDenylist(denylist).build_transaction(new_transaction)
        sign_txn = w3.eth.account.sign_transaction(txn, admin.key)
        sent = w3.eth.send_raw_transaction(sign_txn.rawTransaction)
        w3.eth.wait_for_transaction_receipt(sent)
    except:
        print("Failed for Rpc:", provider)

def add_to_allowlist():
    provider = mainnet_providers[sys.argv[2]]
    w3 = Web3(Web3.HTTPProvider(provider))
    admin = w3.eth.account.from_key(admin_pk)
    router_contract = w3.eth.contract(address=w3.to_checksum_address(contract_address), abi=router_abi)
    allowlist = extract_addresses_from_csv(sys.argv[3], w3)
    txn_gas = router_contract.functions.addToAllowlist(allowlist).estimate_gas({'from': admin.address})
    new_transaction = {
        'nonce': w3.eth.get_transaction_count(admin.address),
        'gasPrice': w3.eth.gas_price,
        'from': admin.address,
        'gas': txn_gas
    }
    try:
        txn = router_contract.functions.addToAllowlist(allowlist).build_transaction(new_transaction)
        sign_txn = w3.eth.account.sign_transaction(txn, admin.key)
        sent = w3.eth.send_raw_transaction(sign_txn.rawTransaction)
        w3.eth.wait_for_transaction_receipt(sent)
    except:
        print("Failed for Rpc:", provider)

def remove_from_allowlist():
    provider = mainnet_providers[sys.argv[2]]
    w3 = Web3(Web3.HTTPProvider(provider))
    admin = w3.eth.account.from_key(admin_pk)
    router_contract = w3.eth.contract(address=w3.to_checksum_address(contract_address), abi=router_abi)
    allowlist = extract_addresses_from_csv(sys.argv[3], w3)
    txn_gas = router_contract.functions.removeFromAllowlist(allowlist).estimate_gas({'from': admin.address})
    new_transaction = {
        'nonce': w3.eth.get_transaction_count(admin.address),
        'gasPrice': w3.eth.gas_price,
        'from': admin.address,
        'gas': txn_gas
    }
    try:
        txn = router_contract.functions.removeFromAllowlist(allowlist).build_transaction(new_transaction)
        sign_txn = w3.eth.account.sign_transaction(txn, admin.key)
        sent = w3.eth.send_raw_transaction(sign_txn.rawTransaction)
        w3.eth.wait_for_transaction_receipt(sent)
    except:
        print("Failed for Rpc:", provider)

methods = {
    'freezeContract': freeze_contract, #args: network name
    'unfreezeContract': unfreeze_contract,  #args: network name
    'updateFeeSink': update_feesink,  #args: network name, address
    'updateGasSink': update_gassink, #args: address
    'claimFees': claim_fees,  #args: network
    'claimGasFees': claim_gas_fees, #args: empty
    'claimTokens': claim_tokens, #args: network, path to csv
    'updateBuyFee': update_buy_fee,  #args: network, fee(int)
    'updateSellFee': update_sell_fee, #args: network, fee(int)
    'addToTokenAllowlist': add_to_token_allowlist, #args: network, path to csv
    'removeFromTokenAllowlist': remove_from_token_allowlist, #args: network, path to csv
    'addToDenylist': add_to_denylist, #args: network, path to csv
    'removeFromDenylist': remove_from_denylist, #args: network, path to csv
    'addToAllowlist': add_to_allowlist, #args: network, path to csv
    'removeFromAllowlist': remove_from_allowlist, #args: network, path to csv
}

def main():
    methods[sys.argv[1]]()

if __name__ == "__main__":
    main()
