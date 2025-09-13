# Uniswap Rourer documentation
UniswapAero router is a complete routing tool to swap tokens to and from native assets on the base network

## User Transactions reference
The possible user transactions are:

- sellNativeForToken
- sellTokenForNative

Details are presented below:

### sellNativeForToken
The __sellNativeForToken__ action takes 4 argument as input:
- tokenTo: address
- minAmountOut: uint256
- version: uint256
- fee: uint24
- commands: bytes

Reverts:
- CF: If contract frozen
- DL: If wallet denylisted
- InvalidVersion() : If version>4
- V3TooLittleReceived() : If the routing uses a v3 pool and the amount out is less than min accepted
- V2TooLittleReceived() : If the routing uses a v2 pool and the amount out is less than min accepted
- InsufficientOutputAmount(): if the swap occurred on an aero pool 

Emits:
- SwapExecuted

Swaps a native token for a given one 

### sellTokenForNative
The __sellTokenForNative__ action takes 4 argument as input:
- tokenFrom: address
- amountIn: uint256
- minAmountOut: uint256
- version: uint256
- fee: uint24
- commands: bytes

Reverts:
- CF: If contract frozen
- DL: If wallet denylisted
- InvalidVersion() : If version>4
- V3TooLittleReceived() : If the routing uses a v3 pool and the amount out is less than min accepted
- V2TooLittleReceived() : If the routing uses a v2 pool and the amount out is less than min accepted
- InsufficientOutputAmount() : if the swap occurred on an aero pool 

Emits:
- SwapExecuted

Swaps a given token for a native one 

## Admin transactions reference

The possible admin transactions are:

- setFeeSink
- withdrawFees
- withdrawToken
- updateBuyFeeBPS
- updateSellFeeBPS
- addToTokenAllowlist
- removeFromTokenAllowlist
- addToDenylist
- removeFromDenylist
- addToAllowlist
- removeFromAllowlist
- freezeContract
- unfreezeContract

Details are presented below:

### setFeeSink
The __setFeeSink__ action takes 1 argument as input:
- feeSink_: address

Reverts:
If not called by owner or feeSink_ is address(0)

Admin updates the feesink address

### withdrawFees
The __withdrawFees__ action takes 0 argument as input:

Admin withdraw all contract's balance to the feesink address

### withdrawToken
The __withdrawToken__ action takes 1 argument as input:
- tokens: address[]

Admin withdraw all contract's token balances to the feesink address

### updateBuyFeeBPS
The __updateBuyFeeBPS__ action takes 1 argument as input:
- feeBps_: uint256

Reverts:
If not called by the admin

Admin updated the buyFeeBPS, feeBps is calculated in basis points where 10000 = 1%

### updateSellFeeBPS
The __updateSellFeeBPS__ action takes 1 argument as input:
- feeBps_: uint256

Reverts:
If not called by the admin

Admin updated the sellFeeBPS, feeBps is calculated in basis points where 10000 = 1%

### addToTokenAllowlist
The __addToTokenAllowlist__ action takes 1 argument as input:
- tokens: address[]

Reverts:
If not called by admin

Admin whitelists a list of token addresses to exclude trading fees when they are swapped on/off

### removeFromTokenAllowlist
The __removeFromTokenAllowlist__ action takes 1 argument as input:
- tokens: address[]

Reverts:
If not called by admin

Admin remove from the whitelists a list of token addresses to include trading fees when they are swapped on/off

### addToDenylist
The __addToDenylist__ action takes 1 argument as input:
- users: address[]

Reverts:
If not called by admin

Admin denylists a list of user addresses to exclude from trading 

### removeFromDenylist
The __removeFromDenylist__ action takes 1 argument as input:
- users: address[]

Reverts:
If not called by admin

Admin remove from the denylist a list of user addresses 

### addToAllowlist
The __addToAllowlist__ action takes 1 argument as input:
- users: address[]

Reverts:
If not called by admin

Admin whitelists a list of user addresses to exclude trading fees when they are swapped on/off

### removeFromAllowlist
The __removeFromAllowlist__ action takes 1 argument as input:
- users: address[]

Reverts:
If not called by admin

Admin remove from the whitelists a list of user addresses to include trading fees when they are swapped on/off

### freezeContract
The __freezeContract__ action takes 0 argument as input:

Admin freezes the contract

### unfreezeContract
The __unfreezeContract__ action takes 0 argument as input:

Admin unfreezes the contract

## Internal transactions reference

- _findWethBalance
- _getAmountOutV2
- _getQuotes
- _getV2Quotes

Details are presented below:

### _findWethBalance
The ___findWethBalance__ action takes 2 argument as input:
- pairAddress address
- fee uint24

Returns:
- wethBalance: uint112

Returns the WETH balance in the given pair

### _getAmountOutV2
The ___getAmountOutV2__ action takes 3 argument as input:
- amountIn uint256
- reserveIn uint112
- reserveOut uint112

Returns :
- amountOut: uint256

Returns the amountOut of the swap for a v2 pair for the given values

### _getQuotes
The ___getQuotes__ action takes 5 argument as input:
- token address
- amountIn uint256
- amountInAfterFee uint256
- fee uint24
- buyFlag uint256

Returns :
- amountOut: uint256

Returns the amountOut of the swap for a v3 pair for the given values

### _getV2Quotes
The ___getV2Quotes__ action takes 4 argument as input:
- v2Pair address
- amountIn uint256
- amountInAfterFee uint256
- buyFlag uint256

Returns :
- amountOutV2: uint256

Returns the amountOut of the swap for a v2 pair for the given values


## Events:
    event SwapExecuted(address indexed User, address indexed Token0, address indexed Token1, uint256 amountIn, uint256 amountOut, uint24 poolFee, uint256 version);


## View transactions:
- getOptimalPathBuy
- getOptimalPathSell
- fetchTokenInfo
- fetchTokensInfo
- fetchTokenPairs


### getOptimalPathBuy():
Returns the pair's version, maxAmountOut, pair's fee and amountIn for a given swap

### getOptimalPathSell():
Returns the pair's version, maxAmountOut, pair's fee and amountIn for a given swap

### fetchTokenInfo():
Returns for a given token address:
- pairAddress: The token's optimal pair address 
- token0: The first token in the pair
- token1: The second token in the pair
- reserve0: The balance of the first token in the pair
- reserve1: The balance of the second token in the pair
- sqrtPriceX96: The current state of the pair if v3/aeroCL, or the token price if aeroStable
- version: The pair's version 0=uniV2, 1=uniV3, 2=aeroVolatile, 3=aeroStable, 4 = aeroCl
- fee: The pools fee if v3 or aeroCL
- decimals: The token's decimals
- totalSupply: The token's totalSupply
- name: The token's name
- symbol: The token's symbol

### fetchTokensInfo():
Accepts a list of tokens addresses and returns a list of:
- pairAddress: The token's optimal pair address 
- token0: The first token in the pair
- token1: The second token in the pair
- reserve0: The balance of the first token in the pair
- reserve1: The balance of the second token in the pair
- sqrtPriceX96: The current state of the pair if v3/aeroCL, or the token price if aeroStable
- version: The pair's version 0=uniV2, 1=uniV3, 2=aeroVolatile, 3=aeroStable, 4 = aeroCl
- fee: The pools fee if v3 or aeroCL
- decimals: The token's decimals
- totalSupply: The token's totalSupply



### fetchTokenPairs():
Returns for a given token address:
- v2Pair: The tokens v2Pair address or address(0)
- v3_100Pair: The tokens v3_100Pair address or address(0)
- v3_500Pair: The tokens v3_500Pair address or address(0)
- v3_3000Pair: The tokens v3_3000Pair address or address(0)
- v3_10000Pair: The tokens v3_10000Pair address or address(0)
- cl_pair : The tokens cl_pair or address(0)
- stable_pair: The tokens stable_pair or address(0)
- volatile_pair: The tokens volatile_pair or address(0)
