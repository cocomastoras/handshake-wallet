import sys
from web3 import Web3


mainnet_providers = {
    'ethereum': "https://eth-mainnet.g.alchemy.com/v2/xkIcuOrk0eDv9TaZxMXtkwptU91055bi",
    'base': "https://base-rpc.publicnode.com",
    'arbitrum': "https://arb-mainnet.g.alchemy.com/v2/xkIcuOrk0eDv9TaZxMXtkwptU91055bi",
    'blast': 'https://rpc.blast.io',
    'binance': 'https://rpc.ankr.com/bsc',
    'matic': "https://polygon-mainnet.g.alchemy.com/v2/xkIcuOrk0eDv9TaZxMXtkwptU91055bi"
}

admin_pk = ''

def send_native():
    provider = mainnet_providers[sys.argv[1]]
    w3 = Web3(Web3.HTTPProvider(provider))
    admin = w3.eth.account.from_key(admin_pk)
    to_address = w3.to_checksum_address(sys.argv[2])
    amount = w3.to_wei(sys.argv[3], 'ether')
    new_transaction = {
        'chainId': w3.eth.chain_id,
        'from': admin.address,
        'to': to_address,
        'value': amount,
        'nonce': w3.eth.get_transaction_count(admin.address),
        'gasPrice': w3.eth.gas_price,
    }
    gas = w3.eth.estimate_gas(new_transaction)
    new_transaction['gas'] = gas
    try:
        sign_txn = w3.eth.account.sign_transaction(new_transaction, admin.key)
        sent = w3.eth.send_raw_transaction(sign_txn.rawTransaction)
        w3.eth.wait_for_transaction_receipt(sent)
    except Exception as e:
        print(e)
        print("Failed for Rpc:", provider)


def main():
    send_native() #args: network_name, to_address, amount

if __name__ == "__main__":
    main()
