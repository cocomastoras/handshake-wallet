import random
from datetime import datetime, time

from hexbytes import HexBytes

from network import w3
from scripts.TradingBots.helpers.dummy_db import get_wallet_history, local_storage
from scripts.TradingBots.network import network_to_tokens
from scripts.TradingBots.contract_actions import fetch_token_balances, fetch_multitoken_info, getOptimalPath, \
    constructPayloadForSellToken, constructPayloadForSellNative

# add accounts here
bots = {
    'bot_1': {'public_key': '0xaa3f427edB213F89E0Cd763dAe84B38178A2541C',
              'private_key': '', 'amount': 0.0001, 'initial_balance': w3.to_wei(0.00075, 'ether')},
    'bot_2': {'public_key': '0xaa3f427edB213F89E0Cd763dAe84B38178A2541C',
              'private_key': '', 'amount': 0.00015, 'initial_balance': w3.to_wei(0.00075, 'ether')},
    'bot_3': {'public_key': '0xaa3f427edB213F89E0Cd763dAe84B38178A2541C',
              'private_key': '', 'amount': 0.00012, 'initial_balance': w3.to_wei(0.00075, 'ether')},
}

group1 = [bots['bot_1']]
group2 = [bots['bot_2']]
group3 = [bots['bot_3']]

time_ranges = {
    "Group1": (time(13, 0), time(23, 0)),  # 13:00 to 23:00
    "Group2": (time(22, 0), time(7, 0)),  # 22:00 to 7:00
    "Group3": (time(6, 0), time(14, 0))  # 6:00 to 14:00
}

bot_total_actions = {
    bots['bot_1']['public_key']: {'buys': 0, 'sells': 0},
    bots['bot_2']['public_key']: {'buys': 0, 'sells': 0},
    bots['bot_3']['public_key']: {'buys': 0, 'sells': 0},
}

def is_within_time_range(start, end, current):
    return start <= current <= end

def elect_bot():
    current_time = datetime.now().time()
    if is_within_time_range(time_ranges["Group1"][0], time_ranges["Group1"][1], current_time):
        account = random.choice(group1)
        print(f"{account['public_key']} from 'Group1' is performing the action.")
        return account
    elif is_within_time_range(time_ranges["Group2"][0], time_ranges["Group2"][1], current_time):
        account = random.choice(group2)
        print(f"{account['public_key']} from 'Group2' is performing the action.")
        return account
    else:
        account = random.choice(group3)
        print(f"{account['public_key']} from 'Group3' is performing the action.")
        return account

def get_bot_actions(bot_public_key: str):
    return bot_total_actions[bot_public_key]

def get_bot_native_balance(bot_public_key: str):
    return w3.eth.get_balance(w3.to_checksum_address(bot_public_key))

def get_bot_token_balances(bot_public_key: str):
    return fetch_token_balances(bot_public_key, network_to_tokens['base'])

def get_bot_total_info(bot_public_key: str):
    bot_total_info = {'bot_native_balance': get_bot_native_balance(bot_public_key),
                      'bot_token_balances': get_bot_token_balances(bot_public_key),
                      'bot_actions': bot_total_actions[bot_public_key],
                      'tokens_info': fetch_multitoken_info(network_to_tokens['base'])}
    return bot_total_info

def decide_bot_action(bot_public_key: str, bot_info, bot_private_key: str):
    token_balances = bot_info['bot_token_balances']
    bot_balance = bot_info['bot_native_balance']
    token_index = 0
    min_num = 2**128
    max_token_index = 0
    max_num = 0
    tokens = network_to_tokens['base']
    num_of_actions = 0
    account = w3.eth.account.from_key(bot_private_key)
    get_wallet_history(bot_public_key, 'base-mainnet', True)
    for i in range(len(token_balances)):
        if token_balances[i] > 0:  # in order for this to work we need clean wallets or else firestore going to return null
            rsp = getOptimalPath(tokens[i], token_balances[i], 1, 100000)
            value = rsp[1] - (int(local_storage['base-mainnet'][bot_public_key][tokens[i]]['amount_purchased_lossless']) - int(local_storage['base-mainnet'][bot_public_key][tokens[i]]['amount_sold_lossless']))
            print(value / 10**18)
            if value < min_num:
                min_num = value
                token_index = i
            if value > max_num:
                max_num = value
                max_token_index = i
            try:
                if (int(local_storage['base-mainnet'][bot_public_key][tokens[i]]['amount_purchased_lossless']) - int(local_storage['base-mainnet'][bot_public_key][tokens[i]]['amount_sold_lossless'])) < rsp[1] * 0.9:
                    print('APPROVE')
                    base_fee = w3.eth.gas_price
                    maxPriorityFeePerGas = w3.eth.max_priority_fee
                    txn = {
                        'chainId': w3.eth.chain_id,
                        'from': account.address,
                        'to': tokens[i],
                        'data': '0x095ea7b300000000000000000000000021d3beb73880fef23fdc322e679e8bdb630740dfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
                        'nonce': w3.eth.get_transaction_count(account.address),
                        'gas': 100000,
                        'value': 0,
                        "maxFeePerGas": base_fee + 2 * maxPriorityFeePerGas,
                        "maxPriorityFeePerGas": 2 * maxPriorityFeePerGas
                    }
                    signed_txn = w3.eth.account.sign_transaction(txn, account.key)
                    response = w3.eth.send_raw_transaction(signed_txn.rawTransaction)
                    w3.eth.wait_for_transaction_receipt(response)
                    print('SELL TOKEN: ', tokens[i])
                    txn = constructPayloadForSellToken(bot_public_key, tokens[i], token_balances[i], 10000)
                    signed_txn = w3.eth.account.sign_transaction(txn, account.key)
                    response = w3.eth.send_raw_transaction(signed_txn.rawTransaction)
                    w3.eth.wait_for_transaction_receipt(response)
                    num_of_actions += 1
                    bot_total_actions[bot_public_key]['sells'] += 1
            except Exception as e:
                print(e)
    if num_of_actions == 0:
        if bot_balance < bot_info['initial_balance'] * 1 / 4:
            try:
                print('APPROVE')
                base_fee = w3.eth.gas_price
                maxPriorityFeePerGas = w3.eth.max_priority_fee
                txn = {
                    'chainId': w3.eth.chain_id,
                    'from': account.address,
                    'to': tokens[token_index],
                    'data': '0x095ea7b300000000000000000000000021d3beb73880fef23fdc322e679e8bdb630740dfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
                    'nonce': w3.eth.get_transaction_count(account.address),
                    'gas': 100000,
                    'value': 0,
                    "maxFeePerGas": base_fee + 2 * maxPriorityFeePerGas,
                    "maxPriorityFeePerGas": 2 * maxPriorityFeePerGas
                }
                signed_txn = w3.eth.account.sign_transaction(txn, account.key)
                response = w3.eth.send_raw_transaction(signed_txn.rawTransaction)
                w3.eth.wait_for_transaction_receipt(response)
                print('FORCED SELL TOKEN:', tokens[token_index])
                txn = constructPayloadForSellToken(bot_public_key, tokens[token_index], token_balances[token_index], 30000)
                signed_txn = w3.eth.account.sign_transaction(txn, account.key)
                response = w3.eth.send_raw_transaction(signed_txn.rawTransaction)
                confirmation = w3.eth.wait_for_transaction_receipt(response)
                num_of_actions += 1
                sell_rsp_event = [log['data'] for log in confirmation['logs'] if
                                  log['topics'][0] == HexBytes(
                                      '0x6b42d4c23f80014bff1ca8ba13278e754634e37685110f43621486635bd92e76')]
                data: HexBytes = sell_rsp_event[0]
                amount_out = w3.to_int(data[32:64])
                bot_total_actions[bot_public_key]['sells'] += 1
                print('BUY DCA TOKEN: ', tokens[max_token_index])
                txn = constructPayloadForSellNative(bot_public_key, tokens[max_token_index], min(int(bot_info['initial_balance'] / 2), int(amount_out/3)),
                                                   50000)
                signed_txn = w3.eth.account.sign_transaction(txn, account.key)
                response = w3.eth.send_raw_transaction(signed_txn.rawTransaction)
                w3.eth.wait_for_transaction_receipt(response)
                num_of_actions += 1
                bot_total_actions[bot_public_key]['buys'] += 1
            except Exception as e:
                print(e)
        else:
            token_index = random.randint(0, len(tokens) - 1)
            try:
                print('BUY TOKEN: ', tokens[token_index])
                txn = constructPayloadForSellNative(bot_public_key, tokens[token_index],
                                                    w3.to_wei(bot_info['amount'], 'ether'), 50000)
                signed_txn = w3.eth.account.sign_transaction(txn, account.key)
                response = w3.eth.send_raw_transaction(signed_txn.rawTransaction)
                w3.eth.wait_for_transaction_receipt(response)
                bot_total_actions[bot_public_key]['buys'] += 1
            except Exception as e:
                print(e)
