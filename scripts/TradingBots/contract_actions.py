import time

from scripts.TradingBots.network import router, w3, multicall
import decimal

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
  return router.functions.fetchTokenInfo(tokenAddress).call()


def fetch_single_token_info(token_address: str):
    """
    Returns a single token's information.

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

    native_address = w3.to_checksum_address('0x4200000000000000000000000000000000000006')

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


# Method to get a single token's info
# Input:
#   - tokenAddress, List of token addresses of the tokens we want to get info
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


def fetch_multitoken_info(token_addresses: list[str]):
    """
    Returns n token's information.

    :param token_addresses: A list of addresses of the tokens we want to get information
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
    rsp = fetchMultiTokenInfo(token_addresses)

    native_address = w3.to_checksum_address('0x4200000000000000000000000000000000000006')

    return_list = []

    for item in rsp:
        pair_address = w3.to_checksum_address(item[0])
        token0 = w3.to_checksum_address(item[1])
        token1 = w3.to_checksum_address(item[2])
        reserves0 = item[3]
        reserves1 = item[4]
        sqrt_price_x96 = item[5]
        version = item[6]
        fee = item[7]
        decimals = item[8]
        total_supply = item[9]

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

        return_list.append({
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
          'liquidity': int(liquidity_value),
          'price': int(token_price),
          'fdv': int(fdv)
        })

    return return_list

def fetch_token_balances(user: str, token_addresses: list[str]):
    return multicall.functions.fetchMultiBalances(user, token_addresses).call()
