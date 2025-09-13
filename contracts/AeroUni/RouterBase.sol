// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.23;

import {IUniversalRouter} from '@uniswap/universal-router/contracts/interfaces/IUniversalRouter.sol';
import {IWNATIVE} from './interfaces/IWNATIVE.sol';
import {IPermit2} from './interfaces/IPermit2.sol';
import {SafeTransferLib} from "solady/src/utils/SafeTransferLib.sol";
import {IRouterErrors} from "./interfaces/IRouterErrors.sol";
import {IRouterEvents} from "./interfaces/IRouterEvents.sol";
import {IPoolFactory, ICLFactory, IPool} from "./interfaces/IPoolFactories.sol";
import {IQuoterV2}  from '@uniswap/v3-periphery/contracts/interfaces/IQuoterV2.sol';
import {IUniswapV3Factory} from '@uniswap/v3-core/contracts/interfaces/IUniswapV3Factory.sol';
import {IUniswapV3Pool} from '@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol';
import {IUniswapV2Factory} from '@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol';
import {IUniswapV2Pair} from '@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol';
import {IRouterStructs} from "./interfaces/IRouterStructs.sol";
import {IAeroRouter} from "./interfaces/IAeroRouter.sol";
import {IDataFetcher} from "./interfaces/IDataFetcher.sol";

/// @author 0xCocomastoras
/// @custom:version 2.0
/// @title Handshake Router
contract RouterAeroUniBase is IRouterEvents, IRouterErrors, IRouterStructs {
    // @dev universal router interfaces for uni and aero
    IUniversalRouter constant UNI_ROUTER = IUniversalRouter(0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD);
    IUniversalRouter constant AERO_ROUTER = IUniversalRouter(0x6Cb442acF35158D5eDa88fe602221b67B400Be3E);
    // @dev WETH inteface
    IWNATIVE constant internal WETH_WRAPPER = IWNATIVE(0x4200000000000000000000000000000000000006);
    // @dev aero new Factory
    IPoolFactory constant internal AERO_POOL_FACTORY = IPoolFactory(0x420DD381b31aEf6683db6B902084cB0FFECe40Da);
    // @dev aero old Factory
    ICLFactory constant internal AERO_CL_FACTORY = ICLFactory(0x5e7BB104d84c7CB9B682AaC2F3d509f5F406809A);
    // @dev uniswap v3 Factory
    IUniswapV3Factory constant internal V3_FACTORY = IUniswapV3Factory(0x33128a8fC17869897dcE68Ed026d694621f6FDfD);
    // @dev uniswap v2 Factory
    IUniswapV2Factory constant internal V2_FACTORY = IUniswapV2Factory(0x8909Dc15e40173Ff4699343b6eB8132c65e18eC6);
    // @dev uniswap quoter interface
    IQuoterV2 constant internal UNI_QUOTER = IQuoterV2(0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a);
    // @dev aero quoter interface
    IQuoterV2 constant internal AERO_QUOTER = IQuoterV2(0x254cF9E1E6e233aa1AC962CB9B05b2cfeAaE15b0);
    // @dev aero router for new factory
    IAeroRouter constant internal AERO_ROUTER_2 = IAeroRouter(0xcF77a3Ba9A5CA399B7c97c74d54e5b1Beb874E43);

    address internal feeSink;
    address internal owner;
    // @dev the protocols fee in bps, 1% = 10000
    uint256 internal buyFeeBps;
    uint256 internal sellFeeBps;
    uint256 internal frozen;

    // @dev intterface of deployed dataFecher
    IDataFetcher internal dataFetcher;

    // @dev mapping of a token to a boolean to check if token is excluded from protocol fees
    mapping(address => bool) internal tokenAllowlist;
    // @dev mapping of a user address to a boolean to check if user is denylisted
    mapping(address => bool) internal userDenylist;
    // @dev mapping of a user address to a boolean to check if user is excluded from protocol fees
    mapping(address => bool) internal walletAllowlist;

    constructor(address dataFetcher_, address owner_, address feeSink_, uint256 buyFeeBps_, uint256 sellFeeBps_){
        dataFetcher = IDataFetcher(dataFetcher_);
        feeSink = feeSink_;
        owner = owner_;
        buyFeeBps = buyFeeBps_;
        sellFeeBps = sellFeeBps_;
    }


    /**
        @notice Callers swaps native currency for a given token
        @param tokenTo The address of the token to swap to
        @param minAmountOut The minimum amount the user should receive
        @param version A flag that distinguishes the protocols gonna be swapped through (0=uniV2, 1=uniV3, 2=aeroVolatile, 3=aeroStable, 4=aeroCL)
        @param fee The pairs fee if it's a v3 or aeroCL
        @param commands The router commands for the swap , must be either '0x0b08' for v2 or '0x0b00' for v3 and aeroCL
    */
    function sellNativeForToken(address tokenTo, uint256 minAmountOut, uint256 version, uint24 fee, bytes calldata commands) external payable {
        require(!userDenylist[msg.sender], 'DL');
        require(frozen == 0, 'CF');
        // @dev check if the traded token is excluded from protocol fees
        uint256 amount =_calculateAmount(msg.value, tokenTo, 0);
        uint256 pFees = msg.value - amount;
        // @dev inputs list for the corresponding commands
        bytes[] memory inputs;
        // @dev store user's balance of the token before the swap , we need this for the event
        uint256 balancePre =  SafeTransferLib.balanceOf(tokenTo, msg.sender);
        {   // @dev stack too deep
            if (version == 0) {
                inputs = _createUniV2Txn(tokenTo, amount, minAmountOut, 0);
                // @dev executes the swaps
                UNI_ROUTER.execute{value: amount}(commands, inputs, block.timestamp + 100);
            } else if (version == 1) {
                // V3 pair
                inputs = _createUniV3Txn(tokenTo, amount, minAmountOut, fee, 0);
                // @dev executes the swaps
                UNI_ROUTER.execute{value: amount}(commands, inputs, block.timestamp + 100);
            } else if (version == 2) {
                    IAeroRouter.Route[] memory route = new IAeroRouter.Route[](1);
                    route[0] = IAeroRouter.Route(address(WETH_WRAPPER), tokenTo, false, 0x420DD381b31aEf6683db6B902084cB0FFECe40Da);
                    AERO_ROUTER_2.swapExactETHForTokensSupportingFeeOnTransferTokens{value: amount}(minAmountOut, route, msg.sender, block.timestamp + 100);
                } else if (version == 3) {
                    IAeroRouter.Route[] memory route = new IAeroRouter.Route[](1);
                    route[0] = IAeroRouter.Route(address(WETH_WRAPPER), tokenTo, true, 0x420DD381b31aEf6683db6B902084cB0FFECe40Da);
                    AERO_ROUTER_2.swapExactETHForTokensSupportingFeeOnTransferTokens{value: amount}(minAmountOut, route, msg.sender, block.timestamp + 100);
                } else if (version == 4) {
                    inputs = _createUniV3Txn(tokenTo, amount, minAmountOut, fee, 0);
                    AERO_ROUTER.execute{value: amount}(commands, inputs, block.timestamp + 100);
                } else {
                    // @dev only 0,1,2,3,4 are valid versions
                    revert InvalidVersion();
                }
        }
        {
            // @dev stack too deep
            // @dev get caller's balance after the swap
            uint256 balanceAfter = SafeTransferLib.balanceOf(tokenTo, msg.sender);
            emit SwapExecuted(msg.sender, address(WETH_WRAPPER), tokenTo, msg.value, balanceAfter-balancePre, fee, version, pFees);
        }
    }

     /**
        @notice Callers swaps a given token for native currency
        @param tokenFrom The address of the token to swap from
        @param amountIn The amount of the token to swap
        @param minAmountOut The minimum amount the user should receive
        @param version A flag that distinguishes the protocols gonna be swapped through (0=uniV2, 1=uniV3, 2=aeroVolatile, 3=aeroStable, 4=aeroCL)
        @param fee The pairs fee if it's a v3 or aeroCL
        @param commands The router commands for the swap , must be either '0x08' for v2 or '0x00' for v3 or aeroCL
    */
    function sellTokenForNative(address tokenFrom, uint256 amountIn, uint256 minAmountOut, uint256 version, uint24 fee, bytes calldata commands) external {
        require(!userDenylist[msg.sender], 'DL');
        require(frozen == 0, 'CF');
        // @dev inputs list for the corresponding commands
        bytes[] memory inputs;
        {   // @dev stack too deep
            if (version == 0) {
                // @dev transfer the desired token amount from the user to the router
                SafeTransferLib.safeTransferFrom(tokenFrom, msg.sender, address(UNI_ROUTER), amountIn);
                // @dev override amountIn if the token has fee on transfer
                amountIn = SafeTransferLib.balanceOf(tokenFrom, address(UNI_ROUTER));
                inputs = _createUniV2Txn(tokenFrom, amountIn, minAmountOut, 1);
                // @dev executes the swaps
                UNI_ROUTER.execute(commands, inputs, block.timestamp + 100);
            } else if (version == 1) {
                // V3 pair
                // @dev transfer the desired token amount from the user to the router
                SafeTransferLib.safeTransferFrom(tokenFrom, msg.sender, address(UNI_ROUTER), amountIn);
                // @dev override amountIn if the token has fee on transfer
                amountIn = SafeTransferLib.balanceOf(tokenFrom, address(UNI_ROUTER));
                inputs = _createUniV3Txn(tokenFrom, amountIn, minAmountOut, fee, 1);
                // @dev executes the swaps
                UNI_ROUTER.execute(commands, inputs, block.timestamp + 100);
            } else if (version == 2) {
                // @dev transfer the desired token amount from the user to the router
                SafeTransferLib.safeTransferFrom(tokenFrom, msg.sender, address(this), amountIn);
                amountIn = SafeTransferLib.balanceOf(tokenFrom, address(this));
                SafeTransferLib.safeApproveWithRetry(tokenFrom, address(AERO_ROUTER_2), amountIn);
                IAeroRouter.Route[] memory route = new IAeroRouter.Route[](1);
                route[0] = IAeroRouter.Route(tokenFrom, address(WETH_WRAPPER), false, 0x420DD381b31aEf6683db6B902084cB0FFECe40Da);
                AERO_ROUTER_2.swapExactTokensForTokensSupportingFeeOnTransferTokens(amountIn, minAmountOut, route, address(this), block.timestamp + 100);
            } else if (version == 3) {
                SafeTransferLib.safeTransferFrom(tokenFrom, msg.sender, address(this), amountIn);
                amountIn = SafeTransferLib.balanceOf(tokenFrom, address(this));
                SafeTransferLib.safeApproveWithRetry(tokenFrom, address(AERO_ROUTER_2), amountIn);
                IAeroRouter.Route[] memory route = new IAeroRouter.Route[](1);
                route[0] = IAeroRouter.Route(tokenFrom, address(WETH_WRAPPER), true, 0x420DD381b31aEf6683db6B902084cB0FFECe40Da);
                AERO_ROUTER_2.swapExactTokensForTokensSupportingFeeOnTransferTokens(amountIn, minAmountOut, route, address(this), block.timestamp + 100);
            } else if (version == 4) {
                SafeTransferLib.safeTransferFrom(tokenFrom, msg.sender, address(AERO_ROUTER), amountIn);
                // @dev override amountIn if the token has fee on transfer
                amountIn = SafeTransferLib.balanceOf(tokenFrom, address(AERO_ROUTER));
                inputs = _createUniV3Txn(tokenFrom, amountIn, minAmountOut, fee, 1);
                AERO_ROUTER.execute(commands, inputs, block.timestamp + 100);
            } else {
                // @dev only 0,1,2,3,4 are valid versions
                revert InvalidVersion();
            }
        }
        // @dev get the amount out of the swap
        uint256 balance_ = WETH_WRAPPER.balanceOf(address(this));
        // @dev unwrap the native
        WETH_WRAPPER.withdraw(balance_);
        // @dev check of the traded token is excluded from protocol fees, if not deduct fees
        uint256 balanceAfterFee = _calculateAmount(balance_, tokenFrom, 1);
        emit SwapExecuted(msg.sender, tokenFrom, address(WETH_WRAPPER), amountIn, balance_, fee, version, balance_ - balanceAfterFee);
        // @dev send amountOut after fees to caller
        assembly {
            if iszero( call(
                gas(),
                caller(),
                balanceAfterFee,
                0,
                0,
                0,
                0
             )) {
                 revert(0,0)
             }
        }
    }


    /**
        @notice Should be called via static call to get the optimal router for the swap
        @param token The address of the token to swap to
        @param amountIn The amount of native to swap
        @param slippage The swaps slippage in bps, 10000 = 1%

        Returns:
        - version:  0=uniV2, 1=uniV3, 2=aeroVolatile, 3=aeroStable, 4 = aeroCl,
        - maxAmountOut The best quotes amount out
        - fee The pools fee if v3 or aeroCL
        - amountIn: The amount of native to swap
    */
    function getOptimalPathBuy(address token, uint256 amountIn, uint256 slippage) external returns(uint256 version, uint256 maxAmountOut, uint256 fee, uint256 ){
        // @dev calculate the amountIn after protocol fees
        uint256 amountInAfterFee = tokenAllowlist[token] ? amountIn : amountIn - ((amountIn * buyFeeBps) / 1000000);
        {   // @dev stack too deep
             // @dev get v2 pair address if exists
            address uniV2Pair = V2_FACTORY.getPair(token, address(WETH_WRAPPER));
            // @dev for gas efficiency we store all possible pools of v3 or address(0)
            address[4] memory pools = [V3_FACTORY.getPool(address(WETH_WRAPPER), token, 100), V3_FACTORY.getPool(address(WETH_WRAPPER), token, 500), V3_FACTORY.getPool(address(WETH_WRAPPER), token, 3000), V3_FACTORY.getPool(address(WETH_WRAPPER), token, 10000)];
            // @dev for efficiency we store all possible fees of v3 pairs
            uint24[4] memory fees = [uint24(100), uint24(500), uint24(3000), uint24(10000)];
            // @dev  uniswap quotes
            if (uniV2Pair != address(0)) {
                // @dev get amount out of v2 pair
                uint256 amountOutV2 = _getV2Quotes(uniV2Pair, amountIn, amountInAfterFee, 0);
                // @dev store the info if amountOut greater than stored max
                if (amountOutV2 > maxAmountOut){
                    maxAmountOut = amountOutV2;
                    version = 0;
                    fee = 0;
                }
            }

            for(uint i = 0; i<4; i++) {
                if(pools[i] != address(0)){
                    // @dev get v3 quote and store info if greater than stored
                    uint256 amountOut = _getQuotes(token, amountIn, amountInAfterFee, fees[i], 0);
                    if (amountOut > maxAmountOut) {
                        maxAmountOut = amountOut;
                        version = 1;
                        fee = fees[i];
                    }
                }
            }
        }
        {
            // @dev stack too deep
            address stablePair = AERO_POOL_FACTORY.getPool(token, address(WETH_WRAPPER), true);
            address volatilePair = AERO_POOL_FACTORY.getPool(token, address(WETH_WRAPPER), false);
            address clPair = AERO_CL_FACTORY.getPool(token, address(WETH_WRAPPER), 200);
            // @dev aerodrome quotes
            if (volatilePair != address(0)) {
                // @dev get amount out of volatile pair
                uint256 amountOutVolatile = _getAeroPoolQuotes(volatilePair, amountInAfterFee, address(WETH_WRAPPER));
                // @dev store the info if amountOut greater than stored max
                if (amountOutVolatile > maxAmountOut) {
                    maxAmountOut = amountOutVolatile;
                    version = 2;
                    fee = 0;
                }
            }
            if (stablePair != address(0)) {
                // @dev get amount out of volatile pair
                uint256 amountOutStable = _getAeroPoolQuotes(stablePair, amountInAfterFee, address(WETH_WRAPPER));
                // @dev store the info if amountOut greater than stored max
                if (amountOutStable > maxAmountOut) {
                    maxAmountOut = amountOutStable;
                    version = 3;
                    fee = 0;
                }
            }
            // @dev for gas efficiency we store all possible pools of v3 or address(0)
            // @dev for efficiency we store all possible fees of v3 pairs
            if (clPair != address(0)) {
                // @dev get v3 quote and store info if greater than stored
                uint256 amountOut = _getAeroCLQuotes(token, amountIn, amountInAfterFee, 0);
                if (amountOut > maxAmountOut) {
                    maxAmountOut = amountOut;
                    version =4;
                    fee = 200;
                }
            }
        }
        // @dev deduct slippage
        maxAmountOut = maxAmountOut - ((maxAmountOut*slippage)/1000000);
        return(version, maxAmountOut, fee, amountIn);
    }

    /**
        @notice Should be called via static call to get the optimal router for the swap
        @param token The address of the token to swap from
        @param amountIn The amount of token to swap
        @param slippage The swaps slippage in bps, 10000 = 1%

        Returns:
        - version:  0=uniV2, 1=uniV3, 2=aeroVolatile, 3=aeroStable, 4 = aeroCl,
        - maxAmountOut The best quote's amount out
        - fee The pools fee if v3 or aeroCL
        - amountIn: The amount of token to swap
    */
    function getOptimalPathSell(address token, uint256 amountIn, uint256 slippage) external returns(uint256 version, uint256 maxAmountOut, uint256 fee, uint256 ){

        {
            // @dev stack too deep
            address stablePair = AERO_POOL_FACTORY.getPool(token, address(WETH_WRAPPER), true);
            address volatilePair = AERO_POOL_FACTORY.getPool(token, address(WETH_WRAPPER), false);
            address clPair = AERO_CL_FACTORY.getPool(token, address(WETH_WRAPPER), 200);
            // @dev aerodrome quotes
            if (volatilePair != address(0)) {
                // @dev get amount out of volatile pair
                uint256 amountOutVolatile = _getAeroPoolQuotes(volatilePair, amountIn, token);
                // @dev store the info if amountOut greater than stored max
                if (amountOutVolatile > maxAmountOut) {
                    maxAmountOut = amountOutVolatile;
                    version = 2;
                    fee = 0;
                }
            }
            if (stablePair != address(0)) {
                // @dev get amount out of volatile pair
                uint256 amountOutStable = _getAeroPoolQuotes(stablePair, amountIn, token);
                // @dev store the info if amountOut greater than stored max
                if (amountOutStable > maxAmountOut) {
                    maxAmountOut = amountOutStable;
                    version = 3;
                    fee = 0;
                }
            }
            // @dev for gas efficiency we store all possible pools of v3 or address(0)
            // @dev for efficiency we store all possible fees of v3 pairs
            if (clPair != address(0)) {
                // @dev get v3 quote and store info if greater than stored
                uint256 amountOut = _getAeroCLQuotes(token, amountIn, 0, 1);
                if (amountOut > maxAmountOut) {
                    maxAmountOut = amountOut;
                    version = 4;
                    fee = 200;
                }
            }
        }

        {
            // @dev stack too deep
            // @dev get v2 pair address if exists
            address uniV2Pair = V2_FACTORY.getPair(token, address(WETH_WRAPPER));
            // @dev for gas efficiency we store all possible pools of v3 or address(0)
            address[4] memory pools = [V3_FACTORY.getPool(address(WETH_WRAPPER), token, 100), V3_FACTORY.getPool(address(WETH_WRAPPER), token, 500), V3_FACTORY.getPool(address(WETH_WRAPPER), token, 3000), V3_FACTORY.getPool(address(WETH_WRAPPER), token, 10000)];
            // @dev for efficiency we store all possible fees of v3 pairs
            uint24[4] memory fees = [uint24(100), uint24(500), uint24(3000), uint24(10000)];
            {
                // @dev stack too deep
                // @dev  uniswap quotes
                if (uniV2Pair != address(0)) {
                    // @dev get amount out of v2 pair
                    uint256 amountOutV2 = _getV2Quotes(uniV2Pair, amountIn, 0, 1);
                    // @dev store the info if amountOut greater than stored max
                    if (amountOutV2 > maxAmountOut){
                        maxAmountOut = amountOutV2;
                        version = 0;
                        fee = 0;
                    }
                }

                for(uint i = 0; i<4; i++) {
                    if(pools[i] != address(0)){
                        // @dev get v3 quote and store info if greater than stored
                        uint256 amountOut = _getQuotes(token, amountIn, 0, fees[i], 1);
                        if (amountOut > maxAmountOut) {
                            maxAmountOut = amountOut;
                            version = 1;
                            fee = fees[i];
                        }
                    }
                }
            }
        }
        // @dev deduct slippage
        maxAmountOut = maxAmountOut - ((maxAmountOut*slippage)/1000000);
        return(version, maxAmountOut, fee, amountIn);
    }

    /**
        @notice View function that returns info for a given token
        @param token The address of the token to get info

        Returns:
        - pairAddress: The token's optimal pair address
        - token0: The first token in the pair
        - token1: The second token in the pair
        - reserve0: The balance of the first token in the pair
        - reserve1: The balance of the second token in the pair
        - sqrtPriceX96: The current state of the pair if v3/aeroCL, or the token price if aeroStable
        - version: The pair's version 0=uniV2, 1=uniV3, 2=aeroVolatile, 3=aeroStable, 4 = aeroCl
        - fee The pools fee if v3 or aeroCL
        - decimals: The token's decimals
        - totalSupply: The token's totalSupply
        - name: The token's name
        - symbol: The token's symbol
    */
    function fetchTokenInfo(address token) external view returns (AllInfo memory info) {
        return dataFetcher.fetchTokenInfo(token);
    }

    /**
        @notice View function that returns info for multiple tokens
        @param tokens A list of token addresses to check

        Returns a list of:
        - pairAddress: The token's optimal pair address
        - token0: The first token in the pair
        - token1: The second token in the pair
        - reserve0: The balance of the first token in the pair
        - reserve1: The balance of the second token in the pair
        - sqrtPriceX96: The current state of the pair if v3/aeroCL, or the token price if aeroStable
        - version: The pair's version 0=uniV2, 1=uniV3, 2=aeroVolatile, 3=aeroStable, 4 = aeroCl
        - fee The pools fee if v3 or aeroCL
        - decimals: The token's decimals
        - totalSupply: The token's totalSupply
    */
    function fetchTokensInfo(address[] calldata tokens) external view returns (GeneralInfo[] memory info) {
        return dataFetcher.fetchTokensInfo(tokens);
    }

    function fetchTokenPairs(address token) external view returns (address v2Pair, address v3_100Pair, address v3_500Pair, address v3_3000Pair, address v3_10000Pair, address cl_pair, address stable_pair, address volatile_pair) {
        return dataFetcher.fetchTokenPairs(token);
    }

    /**
        @notice Owner updates the feeSink Address
        @param feeSink_ The new feeSink address
    */
    function setFeeSink(address feeSink_) external {
        require(msg.sender == owner);
        require(feeSink_ != address(0));
        feeSink = feeSink_;
    }

    /**
        @notice Admin withdraw contract's balance to fee sink
    */
    function withdrawFees() external {
        require(msg.sender == owner);
        address toAddress = feeSink;
        assembly {
            if iszero( call(
                gas(),
                toAddress,
                selfbalance(),
                0,
                0,
                0,
                0
             )) {
                 revert(0,0)
             }
        }
    }

     /**
        @notice Admin withdraw given tokens whole balance to fee sink
        @param token A list of tokens
    */
    function withdrawToken(address[] calldata token) external {
        require(msg.sender == owner);
        address toAddress = feeSink;
        for(uint i=0; i<token.length; i++){
            SafeTransferLib.safeTransferAll(token[i], toAddress);
        }
    }

    /**
        @notice Owner updates the buy fee bps
        @param feeBps_ The new fee in Bps
    */
    function updateBuyFeeBPS(uint256 feeBps_) external {
        require(msg.sender == owner);
        buyFeeBps = feeBps_;
    }

    /**
        @notice Owner updates the sell fee bps
        @param feeBps_ The new fee in Bps
    */
    function updateSellFeeBPS(uint256 feeBps_) external {
        require(msg.sender == owner);
        sellFeeBps = feeBps_;
    }

    /**
        @notice Owner adds a list of addresses to the allowlist
        @param tokens The address of tokens to be allowlisted
    */
    function addToTokenAllowlist(address[] calldata tokens) external {
        require(msg.sender == owner);
        for(uint i=0; i<tokens.length; i++){
            tokenAllowlist[tokens[i]] = true;
        }
    }

    /**
        @notice Owner removed a list of addresses from the allowlist
        @param tokens The address of tokens to be removed from the allowlis
    */
    function removeFromTokenAllowlist(address[] calldata tokens) external {
        require(msg.sender == owner);
        for(uint i=0; i<tokens.length; i++){
            tokenAllowlist[tokens[i]] = false;
        }
    }

     /**
        @notice Owner adds a list of addresses to the denylist
        @param users The address of users to be denylisted
    */
    function addToDenylist(address[] calldata users) external {
        require(msg.sender == owner);
        for(uint i=0; i<users.length; i++){
            userDenylist[users[i]] = true;
        }
    }

    /**
        @notice Owner removes a list of addresses from the denylist
        @param users The address of users to be removed from the denyliste
    */
    function removeFromDenylist(address[] calldata users) external {
        require(msg.sender == owner);
        for(uint i=0; i<users.length; i++){
            userDenylist[users[i]] = false;
        }
    }

    /**
        @notice Owner adds a list of addresses to the whitelisted
        @param users The address of users to be whitelisted
    */
    function addToAllowlist(address[] calldata users) external {
        require(msg.sender == owner);
        for(uint i=0; i<users.length; i++){
            walletAllowlist[users[i]] = true;
        }
    }

    /**
        @notice Owner removes a list of addresses from the whiteliste
        @param users The address of users to be removed from the whiteliste
    */
    function removeFromAllowlist(address[] calldata users) external {
        require(msg.sender == owner);
        for(uint i=0; i<users.length; i++){
            walletAllowlist[users[i]] = false;
        }
    }

    /**
        @notice Owner freezes the contract
    */
    function freezeContract() external {
        require(msg.sender == owner);
        frozen = 1;
    }

    /**
        @notice Owner unfreezes the contract
    */
    function unfreezeContract() external {
        require(msg.sender == owner);
        frozen = 0;
    }

    /**
        @notice Internal view function that returns amount out for aero pool factory pairs
        @param poolPair The address of the pair to check
        @param amountIn The input amount to swap from
        @param tokenIn The address of the token to swap from
    */
    function _getAeroPoolQuotes(address poolPair, uint256 amountIn, address tokenIn) internal view returns(uint256 amountOutV2) {
        try IPool(poolPair).getAmountOut(amountIn, tokenIn) returns (uint256 amountOut) {
            return amountOut;
        } catch {
            return 0;
        }
    }

    /**
        @notice Internal view function that returns amount out for aero cl factory pairs
        @param token The address of the token to check
        @param amountIn The input amount to swap from
        @param amountInAfterFee The input amount to swap from after fee
        @param buyFlag 0 for sell native , 1 for sell token
    */
    function _getAeroCLQuotes(address token, uint256 amountIn, uint256 amountInAfterFee, uint256 buyFlag) internal returns (uint256) {
        IQuoterV2.QuoteExactInputSingleParams memory Quote;
        // @dev get Quote with amount in after fees if sell native or with amount in pre fees if sell token
        Quote = buyFlag == 0 ? IQuoterV2.QuoteExactInputSingleParams(address(WETH_WRAPPER), token, amountInAfterFee, 200, 0) : IQuoterV2.QuoteExactInputSingleParams(token, address(WETH_WRAPPER), amountIn, 200, 0);
        try AERO_QUOTER.quoteExactInputSingle(Quote) returns (uint256 amountOut, uint160, uint32 , uint256) {
            return amountOut;
        } catch {
            return 0;
        }
    }

    /**
        @notice Internal view function that returns amount out for uni v3 pairs
        @param token The address of the token to check
        @param amountIn The input amount to swap from
        @param amountInAfterFee The input amount to swap from after fee
        @param fee The pools fee
        @param buyFlag 0 for sell native , 1 for sell token
    */
    function _getQuotes(address token, uint256 amountIn, uint256 amountInAfterFee, uint24 fee, uint256 buyFlag) internal returns (uint256) {
        IQuoterV2.QuoteExactInputSingleParams memory Quote;
        // @dev get Quote with amount in after fees if sell native or with amount in pre fees if sell token
        Quote = buyFlag == 0 ? IQuoterV2.QuoteExactInputSingleParams(address(WETH_WRAPPER), token, amountInAfterFee, fee, 0) : IQuoterV2.QuoteExactInputSingleParams(token, address(WETH_WRAPPER), amountIn, fee, 0);
        try UNI_QUOTER.quoteExactInputSingle(Quote) returns (uint256 amountOut, uint160, uint32 , uint256) {
            return amountOut;
        } catch {
            return 0;
        }
    }

    /**
        @notice Internal view function that returns amount out for v2 pair
        @param v2Pair The address of the pair to check
        @param amountIn The input amount to swap from
        @param amountInAfterFee The input amount to swap from after fee
        @param buyFlag 0 for sell native , 1 for sell token
    */
    function _getV2Quotes(address v2Pair, uint256 amountIn, uint256 amountInAfterFee, uint256 buyFlag) internal view returns(uint256 amountOutV2) {
        address token0 = IUniswapV2Pair(v2Pair).token0();
        (uint112 reserve0, uint112 reserve1,) = IUniswapV2Pair(v2Pair).getReserves();
        if(buyFlag == 0) {
            // @dev set the correct reserves according to weth token position in the pair
            if(token0 == address(WETH_WRAPPER)) {
                amountOutV2 = _getAmountOutV2(amountInAfterFee, reserve0, reserve1);
            } else {
                amountOutV2 = _getAmountOutV2(amountInAfterFee, reserve1, reserve0);
            }
        } else {
            if(token0 == address(WETH_WRAPPER)) {
                amountOutV2 = _getAmountOutV2(amountIn, reserve1, reserve0);
            } else {
                amountOutV2 = _getAmountOutV2(amountIn, reserve0, reserve1);
            }
        }
    }

    /**
        @notice Internal view function that returns amount out for a v2 pair
        @param amountIn The input amount to swap from
        @param reserveIn The input's token reserve
        @param reserveOut The output's token reserve
    */
    function _getAmountOutV2(uint256 amountIn, uint112 reserveIn, uint112 reserveOut) internal pure returns(uint256) {
        // @dev v2 pairs have 0.3% fee
        uint256 amountInWithFee = amountIn * 997;
        uint256 numerator = amountInWithFee * uint256(reserveOut);
        uint256 denominator = (uint256(reserveIn) * 1000) + amountInWithFee;
        return numerator/denominator;
    }

    /**
        @notice Internal view function that calculates the amount after fees
        @param amount The input amount to swap from
        @param token The token's address
        @param flag 0 for buy 1 for sell
    */
    function _calculateAmount(uint256 amount, address token, uint256 flag) internal view returns(uint256) {
        if (flag == 0) {
            uint256 feeBps = (tokenAllowlist[token] || walletAllowlist[msg.sender]) ? 0 : buyFeeBps;
            return (amount - ((amount * feeBps) / 1000000));
        } else {
            uint256 feeBps = (tokenAllowlist[token] || walletAllowlist[msg.sender]) ? 0 : sellFeeBps;
            return (amount - ((amount * feeBps) / 1000000));
        }
    }

    /**
        @notice Internal view function that encodes the router args for a uni v2 swap
        @param amount The input amount to swap from
        @param token The token's address
        @param flag 0 for buy 1 for sell
        @param minAmountOut minimum tokens to get after swap
    */
    function _createUniV2Txn(address token, uint256 amount, uint256 minAmountOut, uint256 flag) internal view returns (bytes[] memory inputs) {
        if (flag == 0) {
            // BUY
            inputs = new bytes[](2);
            address[] memory path = new address[](2);
            path[0] = address(WETH_WRAPPER);
            path[1] = token;
            // @dev input to wrap native and store the balance in the router
            inputs[0] = abi.encode(address(2), amount);
            // @dev input to swap wrapped native to token and send tokens to caller
            inputs[1] = abi.encode(msg.sender, amount, minAmountOut, path, false);
        } else {
            inputs = new bytes[](1);
            address[] memory path = new address[](2);
            path[1] = address(WETH_WRAPPER);
            path[0] = token;
            // @dev input to swap token to wrapped native and send tokens to this contract
            inputs[0] = abi.encode(address(1), amount, minAmountOut, path, false);
        }
    }

    /**
        @notice Internal view function that encodes the router args for a uni v3 swap
        @param amount The input amount to swap from
        @param token The token's address
        @param flag 0 for buy 1 for sell
        @param minAmountOut minimum tokens to get after swap
        @param fee the pools fee
    */
    function _createUniV3Txn(address token, uint256 amount, uint256 minAmountOut, uint24 fee, uint256 flag) internal view returns (bytes[] memory inputs) {
        if (flag == 0) {
            // BUY
            // V3 pair
            inputs = new bytes[](2);
            // @dev construct path of the swap for the v3 pair (token from, pool fee, token to)
            bytes memory path = abi.encodePacked(address(WETH_WRAPPER), fee, token);
            // @dev input to wrap native and store the balance in the router
            inputs[0] = abi.encode(address(2), amount);
            // @dev input to swap wrapped native to token and send tokens to caller
            inputs[1] = abi.encode(msg.sender, amount, minAmountOut, path, false);
        } else {
            inputs = new bytes[](1);
            inputs[0] = abi.encode(address(1), amount, minAmountOut, abi.encodePacked(token, fee, address(WETH_WRAPPER)), false);
        }
    }

    receive() external payable {}
}
