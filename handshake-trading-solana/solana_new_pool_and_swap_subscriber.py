import decimal
from decimal import Decimal

import solana
from orca_whirlpool.internal.utils.decimal_util import DecimalUtil
from orca_whirlpool.internal.utils.q64_fixed_point_math import Q64FixedPointMath
from solana.rpc.api import Client as SolanaClient
from flask import Flask, request, jsonify
from gql import gql, Client as GraphQLClient
from gql.transport.requests import RequestsHTTPTransport
import requests
import json
from typing import List, Union, Dict
from solana.rpc.commitment import Commitment

app = Flask(__name__)
tokenDict = {}

def sqrt_price_x64_to_price(sqrt_price_x64: int, decimals_a: int, decimals_b: int) -> Decimal:
    decimal_adjust = 10 ** (decimals_a - decimals_b)
    price = Q64FixedPointMath.x64int_to_decimal(int(decimal.Decimal(str(sqrt_price_x64))) ** int(decimal.Decimal(str(2))) * int(decimal.Decimal(str(decimal_adjust))))
    return price
def getWhirlpoolsforToken(tokenAddress):
    # you can cherry pick fields as per your requirements
    api_url = "https://programs.shyft.to/v0/graphql/?api_key="  # Replace with your actual GraphQL endpoint
    transport = RequestsHTTPTransport(
        url=api_url,
        headers={
            "Content-Type": "application/json"
            # Add authorization headers if needed, e.g., "Authorization": "Bearer YOUR_API_KEY"
        },
        use_json=True,
        method="POST"
    )
    client = GraphQLClient(transport=transport, fetch_schema_from_transport=True)
    query = gql("""
        query MyQuery($where: ORCA_WHIRLPOOLS_whirlpool_bool_exp) {
          ORCA_WHIRLPOOLS_whirlpool(
            where: $where 
          ) {
            tokenMintA
            tokenMintB
            tokenVaultA
            tokenVaultB
            sqrtPrice
            pubkey
          }
        }
        """)

    # Define the variables
    variables = {
        "where": {
            "liquidity": {"_gt": "0"},
            "_or": [
                {
                    "_and": [
                        {"tokenMintA": {"_eq": tokenAddress}},
                        {"tokenMintB": {"_eq": "So11111111111111111111111111111111111111112"}}
                    ]
                },
                {
                    "_and": [
                        {"tokenMintB": {"_eq": tokenAddress}},
                        {"tokenMintA": {"_eq": "So11111111111111111111111111111111111111112"}}
                    ]
                }
            ]
        }
    }

    # Execute the query
    response = client.execute(query, variable_values=variables)

    # Extract all pair addresses and fetch token balances for each like raydium
    rsp = response['ORCA_WHIRLPOOLS_whirlpool']
    pubKeys = []
    vaults = []
    if(len(rsp) > 0):
        for pair in rsp:
            print(pair)
            pubKeys.append(pair['pubkey'])
            vaults.append(solana.rpc.api.Pubkey.from_string(pair['tokenVaultA']))
            vaults.append(solana.rpc.api.Pubkey.from_string(pair['tokenVaultB']))
        connection = SolanaClient("https://mainnet.helius-rpc.com/?api-key=", Commitment("confirmed"))
        pairBalances = connection.get_multiple_accounts_json_parsed(vaults)
        pairBalances = pairBalances.value
        parsedData = {}
        for pair in pairBalances:
            if pair.data.parsed['info']['isNative']:
                parsedData[pair.data.parsed['info']['owner']] = {}
                parsedData[pair.data.parsed['info']['owner']]['native_token_amount'] = pair.data.parsed['info']['tokenAmount']['uiAmount']

            else:
                parsedData[pair.data.parsed['info']['owner']]['token_amount'] = pair.data.parsed['info']['tokenAmount']['uiAmount']

        max_key = max(parsedData, key=lambda k: parsedData[k]['native_token_amount'])
        max_value = parsedData[max_key]
        return [max_key, max_value['native_token_amount'], max_value['token_amount']]
    else:
        return ['', 0, 0]

SOL_NATIVE_ADDRESS = "So11111111111111111111111111111111111111112"

def get_pools_by_token(tokens: Union[str, List]) -> Dict[str, List[dict]]:
    graphql_api_base_url = "https://programs.shyft.to/v0/graphql"
    graphql_api_key = ""

    url = f"{graphql_api_base_url}"
    transport = RequestsHTTPTransport(
        url=url,
        headers={
            "Content-Type": "application/json"
        },
        params={
            'api_key': graphql_api_key
        },
        use_json=True,
        method="POST"
    )
    graphql_client = GraphQLClient(transport=transport, fetch_schema_from_transport=True)

    query = gql("""
        query MyQuery($where: Raydium_LiquidityPoolv4_bool_exp) {
            Raydium_LiquidityPoolv4(
                where: $where
            ) {
                baseMint
                baseVault
                quoteMint
                quoteVault
                pubkey
            }
        }
    """)

    if isinstance(tokens, str):
        tokens = [tokens]

    variables = {
        "where": {
            "_or": [
                {
                    "_and": [
                        {"baseMint": {"_in": tokens}},
                        {"quoteMint": {"_eq": SOL_NATIVE_ADDRESS}}
                    ]
                },
                {
                    "_and": [
                        {"quoteMint": {"_in": tokens}},
                        {"baseMint": {"_eq": SOL_NATIVE_ADDRESS}}
                    ]
                }
            ]
        }
    }

    response = graphql_client.execute(query, variable_values=variables)

    # keep pools per token as one token may have multiple pools
    # token address may be present in baseMint or quoteMint fields
    pools_by_token = {token: [] for token in tokens}

    for pool in response['Raydium_LiquidityPoolv4']:
        if pool['baseMint'] in tokens:
            pools_by_token[pool['baseMint']].append(pool)
        if pool['quoteMint'] in tokens:
            pools_by_token[pool['quoteMint']].append(pool)

    return pools_by_token
def get_pools_info(pools_by_token: Dict[str, List[dict]]) -> List:
    rpc_base_url = "https://mainnet.helius-rpc.com"
    rpc_api_key = ""
    rpc_url = f"{rpc_base_url}?api-key={rpc_api_key}"

    connection = SolanaClient(rpc_url, Commitment("confirmed"))

    accounts = []
    accounts_token_offsets = {}
    # add pairs of base
    for token_address, pools in pools_by_token.items():
        accounts_token_offsets[token_address] = len(accounts)
        for pool in pools:
            accounts.extend(
                [
                    solana.rpc.api.Pubkey.from_string(pool['baseVault']),
                    solana.rpc.api.Pubkey.from_string(pool['quoteVault'])
                ]
            )

    accounts_response = connection.get_multiple_accounts_json_parsed(accounts).value

    info = {}

    for token_address, pools in pools_by_token.items():
        pool_max_native_amount = None
        account_token_offset = accounts_token_offsets[token_address]
        account_response = accounts_response[account_token_offset:account_token_offset + len(pools) * 2]
        for index, pool in enumerate(pools):
            if pool['baseMint'] == SOL_NATIVE_ADDRESS:
                native_token = pool['baseMint']
                token = pool['quoteMint']
                native_and_token_indexes = (index * 2, index * 2 + 1)
            else:
                native_token = pool['quoteMint']
                token = pool['baseMint']
                native_and_token_indexes = (index * 2 + 1, index * 2)

            native_token_amount = account_response[native_and_token_indexes[0]].data.parsed['info']['tokenAmount']['uiAmount']

            if pool_max_native_amount is None:
                pool_max_native_amount = native_token_amount
            elif native_token_amount <= pool_max_native_amount:
                # if this is a pool with less native amount
                # than an already listed, then ignore quickly and discard
                continue

            token_amount = account_response[native_and_token_indexes[1]].data.parsed['info']['tokenAmount']['uiAmount']

            native_token_price, token_price = get_token_prices(native_token=native_token, token=token)
            native_token_liquidity = native_token_amount * native_token_price
            token_liquidity = token_amount * token_price

            token_pool_info = {
                "native_token_amount": native_token_amount,
                "token_amount": token_amount,
                "native_token_liquidity": native_token_liquidity,
                "token_liquidity": token_liquidity,
                "native_token_price": native_token_price,
                "token_price": token_price
            }

        info[token_address] = token_pool_info
    return info
def get_token_prices(native_token, token):
    url = f"https://price.jup.ag/v6/price?ids={native_token},{token}"
    response = requests.get(url)
    data = response.json().get('data', {}) or {}

    native_token_price = data.get(native_token, {}).get('price', 0)
    token_price = data.get(token, {}).get('price', 0)

    return native_token_price, token_price

def test_token(token):
    token_info = {}
    url = 'https://api.helius.xyz/v0/token-metadata?api-key='
    headers = {
        "Content-Type": "application/json"
    }
    data = {
        "mintAccounts": [
            token  # Replace with your actual mint address variable
        ],
        "includeOffChain": True
    }
    response = requests.post(url, headers=headers, data=json.dumps(data))
    if response.status_code == 200:
        rsp = response.json()  # Assuming the response is in JSON format
        if 'offChainMetadata' in rsp[0]:
            token_info['uri'] = rsp[0]['offChainMetadata']['uri']
            token_info['offChainMetada'] = rsp[0]['offChainMetadata']['metadata']
        if 'onChainMetadata' in rsp[0]:
            token_info['onChainMetada'] = rsp[0]['onChainMetadata']['metadata']['data']
            token_info['updateAuthority'] = rsp[0]['onChainMetadata']['metadata']['updateAuthority']
    else:
        print(f"Failed to fetch data: {response.status_code}")
        print(response.text)
    url = 'https://mainnet.helius-rpc.com/?api-key='
    headers = {
        "Content-Type": "application/json"
    }
    payload = {
        "jsonrpc": "2.0",
        "id": token,
        "method": "getAsset",
        "params": {
            "id": token,
            "options": {
                "showUnverifiedCollections": True,
                "showCollectionMetadata": True,
                "showFungible": True,
                "showInscription": False
            }
        }
    }
    response = requests.post(url, headers=headers, data=json.dumps(payload))
    if response.status_code == 200:
        rsp = response.json()  # Assuming the response is in JSON format
        token_info['token_info'] = rsp['result']['token_info']
    else:
        print(f"Failed to fetch data: {response.status_code}")
        return response.text
    pools = get_pools_by_token(token)
    pool_info = get_pools_info(pools)
    max_whirpool_info = getWhirlpoolsforToken(token)
    if pool_info[token]['native_token_amount'] > max_whirpool_info[1]:
        base_lp_amount = pool_info[token]['token_amount']
        quote_lp_amount = pool_info[token]['native_token_amount']
        base_lp_price = pool_info[token]['token_liquidity']
        quote_lp_price = pool_info[token]['native_token_liquidity']
        base_price = pool_info[token]['token_price']
        quote_price = pool_info[token]['native_token_price']
        if base_price == 0 or base_price is None:
            base_lp_price = quote_lp_price
            base_price = (quote_lp_amount / base_lp_amount) * quote_price
        token_info['mintAddress'] = token
        token_info['tokenLpAmount'] = base_lp_amount
        token_info['solLpAmount'] = quote_lp_amount
        token_info['lpPrice'] = quote_lp_price + base_lp_price
        token_info['tokenPrice'] = base_price
        token_info['marketCap'] = (token_info['token_info']['supply'] / (
                    10 ** token_info['token_info']['decimals'])) * base_price
        print(json.dumps(token_info,indent=2))
    else:
        print(1)
        base_lp_amount = max_whirpool_info[2]
        quote_lp_amount = max_whirpool_info[1]
        base_lp_price = pool_info[token]['token_price'] * base_lp_amount
        quote_lp_price = pool_info[token]['native_token_price'] * quote_lp_amount
        base_price = pool_info[token]['token_price']
        quote_price = pool_info[token]['native_token_price']
        if base_price == 0 or base_price is None:
            base_lp_price = quote_lp_price
            base_price = (quote_lp_amount / base_lp_amount) * quote_price
        token_info['mintAddress'] = token
        token_info['tokenLpAmount'] = base_lp_amount
        token_info['solLpAmount'] = quote_lp_amount
        token_info['lpPrice'] = quote_lp_price + base_lp_price
        token_info['tokenPrice'] = base_price
        token_info['marketCap'] = (token_info['token_info']['supply'] / (
                10 ** token_info['token_info']['decimals'])) * base_price
        print(json.dumps(token_info, indent=2))

@app.route('/webhookSwap', methods=['POST'])
def webhookSwap():
    try:
        data = request.get_json()  # Parse the JSON body
        print(json.dumps(data, indent=2))
        return jsonify({'status': 'Webhook received'}), 200
    except Exception as e:
        print(e)

@app.route('/webhooks', methods=['POST'])
def webhooks():
    try:
        data = request.get_json()  # Parse the JSON body
        if isinstance(data, list) and len(data) > 0 and 'tokenTransfers' in data[0]:
            token_info = {}
            mint_address = data[0]['tokenTransfers'][0]['mint']
            if mint_address == 'So11111111111111111111111111111111111111112':
                mint_address = data[0]['tokenTransfers'][1]['mint']
            # Fetch token metadata
            url = 'https://api.helius.xyz/v0/token-metadata?api-key='
            headers = {
                "Content-Type": "application/json"
            }
            data = {
                "mintAccounts": [
                    mint_address  # Replace with your actual mint address variable
                ],
                "includeOffChain": True
            }
            response = requests.post(url, headers=headers, data=json.dumps(data))
            token_info['mintAddress'] = mint_address
            if response.status_code == 200:
                rsp = response.json()  # Assuming the response is in JSON format
                if 'offChainMetadata' in rsp[0]:
                    token_info['uri'] = rsp[0]['offChainMetadata']['uri']
                    token_info['offChainMetada'] = rsp[0]['offChainMetadata']['metadata']
                if 'onChainMetadata' in rsp[0]:
                    token_info['onChainMetada'] = rsp[0]['onChainMetadata']['metadata']['data']
                    token_info['updateAuthority'] = rsp[0]['onChainMetadata']['metadata']['updateAuthority']
            else:
                print(f"Failed to fetch data: {response.status_code}")
                print(response.text)
            url = 'https://mainnet.helius-rpc.com/?api-key=10764cdb-405b-479b-b0c2-db31f08102ec'
            headers = {
                "Content-Type": "application/json"
            }
            payload = {
                "jsonrpc": "2.0",
                "id": mint_address,
                "method": "getAsset",
                "params": {
                    "id": mint_address,
                    "options": {
                        "showUnverifiedCollections": True,
                        "showCollectionMetadata": True,
                        "showFungible": True,
                        "showInscription": False
                    }
                }
            }
            response = requests.post(url, headers=headers, data=json.dumps(payload))
            if response.status_code == 200:
                rsp = response.json()  # Assuming the response is in JSON format
                token_info['token_info'] = rsp['result']['token_info']
            else:
                print(f"Failed to fetch data: {response.status_code}")
                return response.text
            pool_info = get_pools_by_token([mint_address])
            rsp = get_pools_info(pool_info)
            max_whirpool_info = getWhirlpoolsforToken(mint_address)
            if rsp[mint_address]['native_token_amount'] > max_whirpool_info[1]:
                base_lp_amount = rsp[mint_address]['token_amount']
                quote_lp_amount = rsp[mint_address]['native_token_amount']
                base_lp_price = rsp[mint_address]['token_liquidity']
                quote_lp_price = rsp[mint_address]['native_token_liquidity']
                base_price = rsp[mint_address]['token_price']
                quote_price = rsp[mint_address]['native_token_price']
                if base_price == 0 or base_price is None:
                    base_lp_price = quote_lp_price
                    base_price = (quote_lp_amount/base_lp_amount) * quote_price
                token_info['tokenLpAmount'] = base_lp_amount
                token_info['solLpAmount'] = quote_lp_amount
                token_info['lpPrice'] = quote_lp_price + base_lp_price
                token_info['tokenPrice'] = base_price
                token_info['marketCap'] = (token_info['token_info']['supply'] / (10 ** token_info['token_info']['decimals'])) * base_price
                print(json.dumps(token_info, indent=2))
                tokenDict[mint_address] = token_info
            else:
                base_lp_amount = max_whirpool_info[2]
                quote_lp_amount = max_whirpool_info[1]
                base_lp_price = rsp[mint_address]['token_price'] * base_lp_amount
                quote_lp_price = rsp[mint_address]['native_token_price'] * quote_lp_amount
                base_price = rsp[mint_address]['token_price']
                quote_price = rsp[mint_address]['native_token_price']
                if base_price == 0 or base_price is None:
                    base_lp_price = quote_lp_price
                    base_price = (quote_lp_amount / base_lp_amount) * quote_price
                token_info['tokenLpAmount'] = base_lp_amount
                token_info['solLpAmount'] = quote_lp_amount
                token_info['lpPrice'] = quote_lp_price + base_lp_price
                token_info['tokenPrice'] = base_price
                token_info['marketCap'] = (token_info['token_info']['supply'] / (
                        10 ** token_info['token_info']['decimals'])) * base_price
                print(json.dumps(token_info, indent=2))
                tokenDict[mint_address] = token_info
        else:
            print('Invalid data format')
        return jsonify({'status': 'Webhook received'}), 200
    except Exception as e:
        print('Error processing webhook:', e)
        return jsonify({'error': 'Error processing webhook'}), 500

@app.route('/tokens')
def tokens():
    return jsonify(tokenDict)

@app.route('/')
def home():
    return "Hello, Flask!"

if __name__ == '__main__':
    app.run(debug=True)

# test_token('EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm')
# getWhirlpoolsforToken('DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263')
# print(sqrt_price_x64_to_price(445148487704600021665, 5, 9))