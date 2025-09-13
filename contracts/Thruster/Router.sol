// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.23;

import {IUniversalRouter} from '@uniswap/universal-router/contracts/interfaces/IUniversalRouter.sol';
import {IWNATIVE} from './interfaces/IWNATIVE.sol';
import {IERC20INFO} from './interfaces/IERC20INFO.sol';
import {IPermit2} from './interfaces/IPermit2.sol';
import {IUniswapV3Factory} from '@uniswap/v3-core/contracts/interfaces/IUniswapV3Factory.sol';
import {IUniswapV3Pool} from '@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol';
import {IUniswapV2Factory} from '@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol';
import {IUniswapV2Pair} from '@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol';
import {IQuoterV2}  from '@uniswap/v3-periphery/contracts/interfaces/IQuoterV2.sol';
import {IRouterEvents} from "./interfaces/IRouterEvents.sol";
import {IRouterStructs} from "./interfaces/IRouterStructs.sol";
import {SafeTransferLib} from "solady/src/utils/SafeTransferLib.sol";
import {IRouterErrors} from "./interfaces/IRouterErrors.sol";
import "./interfaces/ThrusterRouter.sol";
import {IBlast, IBlastPoints} from "./interfaces/IBlast.sol";

/// @author 0xCocomastoras
/// @custom:version 1.0
/// @title BlockHero Router
contract RouterThruster is IRouterEvents, IRouterStructs, IRouterErrors{
    // @dev universal router interface
    IUniversalRouter constant ROUTER = IUniversalRouter(0xC4af384fA1ff36a49C55549811E1B2dc1F72Ba44);
    // @dev WETH inteface
    IWNATIVE constant internal WETH_WRAPPER = IWNATIVE(0x4300000000000000000000000000000000000004);
    // @dev uniswap v3 Factory
    IUniswapV3Factory constant internal V3_FACTORY = IUniswapV3Factory(0x71b08f13B3c3aF35aAdEb3949AFEb1ded1016127);
    // @dev uniswap v2 Factory with 0.3% fee
    IUniswapV2Factory constant internal V2_FACTORY = IUniswapV2Factory(0xb4A7D971D0ADea1c73198C97d7ab3f9CE4aaFA13); //0.3%
    // @dev uniswap v2 Factory with 1% fee
    IUniswapV2Factory constant internal V2_1_FACTORY = IUniswapV2Factory(0x37836821a2c03c171fB1a595767f4a16e2b93Fc4); //1%
    // @dev v2 router for 0.3 fee
    ThrusterRouter constant internal TROUTER = ThrusterRouter(0x98994a9A7a2570367554589189dC9772241650f6); //0.3%
    // @dev v2 router for 1 fee
    ThrusterRouter constant internal TROUTER_2 = ThrusterRouter(0x44889b52b71E60De6ed7dE82E2939fcc52fB2B4E); //1%
    // @dev uniswap quoter interface
    IQuoterV2 constant internal QUOTER = IQuoterV2(0x3b299f65b47c0bfAEFf715Bc73077ba7A0a685bE);

    address constant internal YIELD_CONTRACT = 0x4300000000000000000000000000000000000002;
    address constant internal POINTS_CONTRACT = 0x2536FE9ab3F511540F2f9e2eC2A805005C3Dd800;

    address internal feeSink;
    address internal gasSink;
    address internal owner;
    // @dev the protocols fee in bps, 1% = 10000
    uint256 internal buyFeeBps;
    uint256 internal sellFeeBps;
    uint256 internal frozen;
    // @dev mapping of a token to a boolean to check if token is excluded from protocol fees
    mapping(address => bool) internal tokenAllowlist;
    // @dev mapping of a user address to a boolean to check if user is denylisted
    mapping(address => bool) internal userDenylist;
     // @dev mapping of a user address to a boolean to check if user is excluded from protocol fees
    mapping(address => bool) internal walletAllowlist;

    constructor(address owner_, address feeSink_, address gasSink_, uint256 buyFeeBps_, uint256 sellFeeBps_){
        feeSink = feeSink_;
        gasSink = gasSink_;
        owner = owner_;
        buyFeeBps = buyFeeBps_;
        sellFeeBps = sellFeeBps_;
        IBlast(YIELD_CONTRACT).configureAutomaticYield();
        IBlast(YIELD_CONTRACT).configureClaimableGas();
        IBlastPoints(POINTS_CONTRACT).configurePointsOperator(owner_);
    }

    /**
        @notice Callers swaps native currency for a given token
        @param tokenTo The address of the token to swap to
        @param minAmountOut The minimum amount the user should receive
        @param version A flag that distinguishes between v2 pairs and v3
        @param fee The pairs fee if it's a v3
        @param commands The router commands for the swap , must be either '0x0b08' for v2 or '0x0b00' for v3
    */
    function sellNativeForToken(address tokenTo, uint256 minAmountOut, uint256 version, uint24 fee, bytes calldata commands) external payable {
        require(!userDenylist[msg.sender], 'DL');
        require(frozen == 0, 'CF');
        // @dev check if the traded token is excluded from protocol fees
        uint256 amount =_calculateAmount(msg.value, tokenTo, 0);
        uint256 pFees = msg.value - amount;

        // @dev store user's balance of the token before the swap , we need this for the event
        uint256 balancePre =  SafeTransferLib.balanceOf(tokenTo, msg.sender);
        if (version == 0) {
            // V2 pair
            // @dev construct the path of the swap
            address[] memory path = new address[](2);
            path[0] = address(WETH_WRAPPER);
            path[1] = tokenTo;
            // @dev distinguish between a 0.3 or 1 % fee factory
            if(fee == 3000) {
                // @dev execute the swap
                TROUTER.swapExactETHForTokensSupportingFeeOnTransferTokens{value: amount}(minAmountOut, path, msg.sender, block.timestamp + 100);
            } else if (fee == 10000){
                // @dev execute the swap
                TROUTER_2.swapExactETHForTokensSupportingFeeOnTransferTokens{value: amount}(minAmountOut, path, msg.sender, block.timestamp + 100);
            } else {
                // @dev only 0.3 or 1 %  are valid fees
                revert InvalidFee();
            }
        }else if (version == 1){
            // V3 pair
            // @dev inputs list for the corresponding commands
            bytes[] memory inputs = new bytes[](2);
            // @dev construct path of the swap for the v3 pair (token from, pool fee, token to)
            bytes memory path = abi.encodePacked(address(WETH_WRAPPER), fee, tokenTo);
            inputs[0] = abi.encode(address(2), amount);
            inputs[1] = abi.encode(msg.sender, amount, minAmountOut, path, false);
            // @dev executes the swaps
            ROUTER.execute{value: amount}(commands, inputs, block.timestamp + 100);
        }else{
            revert InvalidVersion();
        }
        // @dev get caller's balance after the swap
        uint256 balanceAfter = SafeTransferLib.balanceOf(tokenTo, msg.sender);
        emit SwapExecuted(msg.sender, address(WETH_WRAPPER), tokenTo, msg.value, balanceAfter - balancePre, fee, version, pFees);
    }

    /**
        @notice Callers swaps a given token for native currency
        @param tokenFrom The address of the token to swap from
        @param amountIn The amount of the token to swap
        @param minAmountOut The minimum amount the user should receive
        @param version A flag that distinguishes between v2 pairs and v3
        @param fee The pairs fee if it's a v3
        @param commands The router commands for the swap , must be either '0x08' for v2 or '0x00' for v3
    */
    function sellTokenForNative(address tokenFrom, uint256 amountIn, uint256 minAmountOut, uint256 version, uint24 fee, bytes calldata commands) external {
        require(!userDenylist[msg.sender], 'DL');
        require(frozen == 0, 'CF');
        if (version == 0) {
            // V2 pair
            // @dev transfer the desired token amount from the user to this address
            SafeTransferLib.safeTransferFrom(tokenFrom, msg.sender, address(this), amountIn);
            // @dev override amountIn if the token has fee on transfer
            amountIn = SafeTransferLib.balanceOf(tokenFrom, address(this));
            // @dev construct the path of the swap
            address[] memory path = new address[](2);
            path[1] = address(WETH_WRAPPER);
            path[0] = tokenFrom;
            // @dev distinguish between a 0.3 or 1 % fee factory
            if(fee == 3000) {
                // @dev safe approve the router
                SafeTransferLib.safeApproveWithRetry(tokenFrom, address(TROUTER), amountIn);
                // @dev execute the swap
                TROUTER.swapExactTokensForTokensSupportingFeeOnTransferTokens(amountIn, minAmountOut, path, address(this), block.timestamp + 100);
            } else if (fee == 10000){
                // @dev safe approve the router
                SafeTransferLib.safeApproveWithRetry(tokenFrom, address(TROUTER_2), amountIn);
                // @dev execute the swap
                TROUTER_2.swapExactTokensForTokensSupportingFeeOnTransferTokens(amountIn, minAmountOut, path, address(this), block.timestamp + 100);
            } else {
                // @dev only 0,1 are valid versions
                revert InvalidVersion();
            }
        }else if (version ==1){
            // V3 pair
            bytes[] memory inputs = new bytes[](1);
            // @dev transfer the desired token amount from the user to the router
            SafeTransferLib.safeTransferFrom(tokenFrom, msg.sender, address(ROUTER), amountIn);
            // @dev override amountIn if the token has fee on transfer
            amountIn = SafeTransferLib.balanceOf(tokenFrom, address(ROUTER));
            // @dev input to swap token to wrapped native and send tokens to this contract
            inputs[0] = abi.encode(address(1), amountIn, minAmountOut, abi.encodePacked(tokenFrom, fee, address(WETH_WRAPPER)), false);
            // @dev executes the swaps
            ROUTER.execute(commands, inputs, block.timestamp + 100);
        }else{
            // @dev only 0,1 are valid versions
            revert InvalidVersion();
        }
        // @dev get the amount out of the swap
        uint256 balance_ = WETH_WRAPPER.balanceOf(address(this));
        // @dev unwrap the native
        WETH_WRAPPER.withdraw(balance_);
        // @dev check of the traded token is excluded from protocol fees, if not deduct fees
        uint256 balanceAfterFees = _calculateAmount(balance_, tokenFrom, 1);
        emit SwapExecuted(msg.sender, tokenFrom, address(WETH_WRAPPER), amountIn, balance_, fee, version, balance_ - balanceAfterFees);
        // @dev send amountOut after fees to caller
        assembly {
            if iszero( call(
                gas(),
                caller(),
                balanceAfterFees,
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
        - version: The pair's version 0=v2, 1=v3
        - maxAmountOut The best quotes amount out
        - fee The pools fee if v3
        - amountIn: The amount of native to swap
    */
    function getOptimalPathBuy(address token, uint256 amountIn, uint256 slippage) external returns(uint256 version, uint256 maxAmountOut, uint256 fee, uint256 ){
        // @dev get v2 pair address if exists with 0.3%
        address v2Pair = V2_FACTORY.getPair(token, address(WETH_WRAPPER));
        // @dev get v2 pair address if exists with 1%
        address v2_1Pair = V2_1_FACTORY.getPair(token, address(WETH_WRAPPER));
        // @dev calculate the amountIn after protocol fees
        uint256 amountInAfterFee = tokenAllowlist[token] ? amountIn : amountIn - ((amountIn * buyFeeBps) / 1000000);
        if (v2Pair != address(0)) {
            // @dev get amount out of v2 pair
            uint256 amountOutV2 = _getV2Quotes(v2Pair, amountIn, amountInAfterFee, 0);
            if (amountOutV2 > maxAmountOut){
                maxAmountOut = amountOutV2;
                version = 0;
                fee = 3000;
            }
        }
        if (v2_1Pair != address(0)) {
            // @dev get amount out of v2 pair
            uint256 amountOutV2 = _getV2_1Quotes(v2_1Pair, amountIn, amountInAfterFee, 0);
            if (amountOutV2 > maxAmountOut){
                maxAmountOut = amountOutV2;
                version = 0;
                fee = 10000;
            }
        }
        // @dev for gas efficiency we store all possible pools of v3 or address(0)
        address[4] memory pools = [V3_FACTORY.getPool(address(WETH_WRAPPER), token, 100), V3_FACTORY.getPool(address(WETH_WRAPPER), token, 500), V3_FACTORY.getPool(address(WETH_WRAPPER), token, 3000), V3_FACTORY.getPool(address(WETH_WRAPPER), token, 10000)];
        // @dev for efficiency we store all possible fees of v3 pairs
        uint24[4] memory fees = [uint24(100), uint24(500), uint24(3000), uint24(10000)];
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
        - version: The pair's version 0=v2, 1=v3
        - maxAmountOut The best quote's amount out
        - fee The pools fee if v3
        - amountIn: The amount of token to swap
    */
    function getOptimalPathSell(address token, uint256 amountIn, uint256 slippage) external returns(uint256 version, uint256 maxAmountOut, uint256 fee, uint256 ){
        // @dev get v2 pair address if exists with 0.3%
        address v2Pair = V2_FACTORY.getPair(token, address(WETH_WRAPPER));
        // @dev get v2 pair address if exists with 1%
        address v2_1Pair = V2_1_FACTORY.getPair(token, address(WETH_WRAPPER));
        if (v2Pair != address(0)) {
            // @dev get amount out of v2 pair
            uint256 amountOutV2 = _getV2Quotes(v2Pair, amountIn, 0, 1);
            // @dev store the info if amountOut greater than stored max
            if (amountOutV2 > maxAmountOut){
                maxAmountOut = amountOutV2;
                version = 0;
                fee = 3000;
            }
        }
        if (v2_1Pair != address(0)) {
            // @dev get amount out of v2 pair
            uint256 amountOutV2 = _getV2_1Quotes(v2_1Pair, amountIn, 0, 1);
            // @dev store the info if amountOut greater than stored max
            if (amountOutV2 > maxAmountOut){
                maxAmountOut = amountOutV2;
                version = 0;
                fee = 10000;
            }
        }
        // @dev for gas efficiency we store all possible pools of v3 or address(0)
        address[4] memory pools = [
            V3_FACTORY.getPool(address(WETH_WRAPPER), token, 100),
            V3_FACTORY.getPool(address(WETH_WRAPPER), token, 500),
            V3_FACTORY.getPool(address(WETH_WRAPPER), token, 3000),
            V3_FACTORY.getPool(address(WETH_WRAPPER), token, 10000)];
        // @dev for efficiency we store all possible fees of v3 pairs
        uint24[4] memory fees = [uint24(100), uint24(500), uint24(3000), uint24(10000)];
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
        - sqrtPriceX96: The current state of the pair if v3
        - version: The pair's version 0=v2, 1=v3
        - fee The pools fee if v3
        - decimals: The token's decimals
        - totalSupply: The token's totalSupply
        - name: The token's name
        - symbol: The token's symbol
    */
    function fetchTokenInfo(address token) external view returns (AllInfo memory info) {
        address pairAddress;
        uint256 maxEthBalance = type(uint256).max;
        uint24 fee;
        uint256 maxIndex;
         // @dev get info from the token contract
        info.totalSupply = IERC20INFO(token).totalSupply();
        info.decimals = IERC20INFO(token).decimals();
        info.name = IERC20INFO(token).name();
        info.symbol = IERC20INFO(token).symbol();
        // @dev for efficiency we store all possible pair's
        address[6] memory pairAddresses = [
            V2_FACTORY.getPair(token, address(WETH_WRAPPER)),
            V2_1_FACTORY.getPair(token, address(WETH_WRAPPER)),
            V3_FACTORY.getPool(token, address(WETH_WRAPPER), 100),
            V3_FACTORY.getPool(token, address(WETH_WRAPPER), 500),
            V3_FACTORY.getPool(token, address(WETH_WRAPPER), 3000),
            V3_FACTORY.getPool(token, address(WETH_WRAPPER), 10000)
        ];
         // @dev for efficiency we store all possible fees and 0 for v2
        uint24[6] memory fees = [uint24(3000), uint24(10000), uint24(100), uint24(500), uint24(3000), uint24(10000)];
        for (uint j=0; j<6; j++) {
            if (pairAddresses[j] != address(0)) {
                // @dev find and store the maximun weth balance from the pairs
                uint256 wethBalance = _findWethBalance(pairAddresses[j], j);
                if (maxEthBalance < wethBalance || maxEthBalance == type(uint256).max) {
                    maxEthBalance = wethBalance;
                    pairAddress = pairAddresses[j];
                    fee = fees[j];
                    maxIndex = j;
                }
            }
        }
        // @dev for v2 pairs
        if (maxIndex == 0 || maxIndex == 1) {
            info.pairAddress = pairAddresses[maxIndex];
            info.token0 = IUniswapV2Pair(pairAddresses[maxIndex]).token0();
            info.token1 = IUniswapV2Pair(pairAddresses[maxIndex]).token1();
            (uint112 token0R, uint112 token1R, ) = IUniswapV2Pair(pairAddresses[maxIndex]).getReserves();
            info.reserves0 = token0R;
            info.reserves1 = token1R;
            info.fee = fees[maxIndex];
        } else {
            // @dev for v3 pairs
            info.pairAddress = pairAddresses[maxIndex];
            info.token0 = IUniswapV3Pool(pairAddresses[maxIndex]).token0();
            info.token1 = IUniswapV3Pool(pairAddresses[maxIndex]).token1();
            info.reserves0 = uint112(SafeTransferLib.balanceOf(info.token0, pairAddresses[maxIndex]));
            info.reserves1  = uint112(SafeTransferLib.balanceOf(info.token1, pairAddresses[maxIndex]));
            (uint160 sqrtPriceX96,,,,,,) = IUniswapV3Pool(pairAddresses[maxIndex]).slot0();
            info.sqrtPriceX96 = sqrtPriceX96;
            info.version = 1;
            info.fee = fees[maxIndex];
        }
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
        - sqrtPriceX96: The current state of the pair if v3
        - version: The pair's version 0=v2, 1=v3
        - fee The pools fee if v3
        - decimals: The token's decimals
        - totalSupply: The token's totalSupply
    */
    function fetchTokensInfo(address[] calldata tokens) external view returns (GeneralInfo[] memory info) {
        uint256 len = tokens.length;
        info = new GeneralInfo[](len);
        for(uint i =0; i<len; i++){
            address pairAddress;
            uint256 maxEthBalance = type(uint256).max;
            uint24 fee;
            uint256 maxIndex;
            info[i].totalSupply = IERC20INFO(tokens[i]).totalSupply();
            info[i].decimals = IERC20INFO(tokens[i]).decimals();
            address[6] memory pairAddresses = [
                V2_FACTORY.getPair(tokens[i], address (WETH_WRAPPER)),
                V2_1_FACTORY.getPair(tokens[i], address (WETH_WRAPPER)),
                V3_FACTORY.getPool(tokens[i], address(WETH_WRAPPER), 100),
                V3_FACTORY.getPool(tokens[i], address(WETH_WRAPPER), 500),
                V3_FACTORY.getPool(tokens[i], address(WETH_WRAPPER), 3000),
                V3_FACTORY.getPool(tokens[i], address(WETH_WRAPPER), 10000)
            ];
            uint24[6] memory fees = [uint24(3000), uint24(10000), uint24(100), uint24(500), uint24(3000), uint24(10000)];
            for (uint j=0; j<6; j++) {
                if (pairAddresses[j] != address(0)) {
                    uint256 wethBalance = _findWethBalance(pairAddresses[j], j);
                    if (maxEthBalance < wethBalance || maxEthBalance == type(uint256).max) {
                        maxEthBalance = wethBalance;
                        pairAddress = pairAddresses[j];
                        fee = fees[j];
                        maxIndex = j;
                    }
                }
            }
            if (maxIndex == 0 || maxIndex == 1) {
                info[i].pairAddress = pairAddresses[maxIndex];
                info[i].token0 = IUniswapV2Pair(pairAddresses[maxIndex]).token0();
                info[i].token1 = IUniswapV2Pair(pairAddresses[maxIndex]).token1();
                (uint112 token0R, uint112 token1R, ) = IUniswapV2Pair(pairAddresses[maxIndex]).getReserves();
                info[i].reserves0 = token0R;
                info[i].reserves1 = token1R;
                info[i].fee = fees[maxIndex];
            } else {
                info[i].pairAddress = pairAddresses[maxIndex];
                info[i].token0 = IUniswapV3Pool(pairAddresses[maxIndex]).token0();
                info[i].token1 = IUniswapV3Pool(pairAddresses[maxIndex]).token1();
                info[i].reserves0 = uint112(SafeTransferLib.balanceOf(info[i].token0, pairAddresses[maxIndex]));
                info[i].reserves1  = uint112(SafeTransferLib.balanceOf(info[i].token1, pairAddresses[maxIndex]));
                (uint160 sqrtPriceX96,,,,,,) = IUniswapV3Pool(pairAddresses[maxIndex]).slot0();
                info[i].sqrtPriceX96 = sqrtPriceX96;
                info[i].version = 1;
                info[i].fee = fees[maxIndex];
            }
        }
    }

    function fetchTokenPairs(address token) external view returns (address v2Pair, address v2_1Pair, address v3_100Pair, address v3_500Pair, address v3_3000Pair, address v3_10000Pair) {
        v2Pair = V2_FACTORY.getPair(token, address (WETH_WRAPPER));
        v2_1Pair = V2_1_FACTORY.getPair(token, address(WETH_WRAPPER));
        v3_100Pair = V3_FACTORY.getPool(token, address(WETH_WRAPPER), 100);
        v3_500Pair = V3_FACTORY.getPool(token, address(WETH_WRAPPER), 500);
        v3_3000Pair = V3_FACTORY.getPool(token, address(WETH_WRAPPER), 3000);
        v3_10000Pair = V3_FACTORY.getPool(token, address(WETH_WRAPPER), 10000);
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
        @notice Owner updates the gasSink Address
        @param gasSink_ The new gasSink address
    */
    function setGasSink(address gasSink_) external {
        require(msg.sender == owner);
        require(gasSink_ != address(0));
        gasSink = gasSink_;
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

    function withdrawMaxGasFees() external {
        require(msg.sender == owner, 'NVS');
        IBlast(YIELD_CONTRACT).claimMaxGas(address(this), gasSink);
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
        @notice Internal view function that returns the balance of weth for a given pair
        @param pairAddress The address of the pair to check
        @param index The pools index in the list
    */
    function _findWethBalance(address pairAddress, uint256 index) internal view returns(uint112 wethToken) {
        // @dev v2
        if(index == 0 || index == 1) {
            // @dev find weth token in the pair
            address token0 = IUniswapV2Pair(pairAddress).token0();
            (uint112 token0R, uint112 token1R, ) = IUniswapV2Pair(pairAddress).getReserves();
            // @dev return the weth balance only
            wethToken = token0 == address(WETH_WRAPPER) ? token0R : token1R;

        } else {
             // @dev v3
            wethToken = uint112(SafeTransferLib.balanceOf(address(WETH_WRAPPER), pairAddress));
        }
    }

    /**
        @notice Internal view function that returns amount out for a v2 pair with 0.3% fee
        @param amountIn The input amount to swap from
        @param reserveIn The input's token reserve
        @param reserveOut The output's token reserve
    */
    function _getAmountOutV2_1(uint256 amountIn, uint112 reserveIn, uint112 reserveOut) internal pure returns(uint256) {
        uint256 amountInWithFee = amountIn * 997;
        uint256 numerator = amountInWithFee * uint256(reserveOut);
        uint256 denominator = (uint256(reserveIn) * 1000) + amountInWithFee;
        return numerator/denominator;
    }

    /**
        @notice Internal view function that returns amount out for a v2 pair with 1% fee
        @param amountIn The input amount to swap from
        @param reserveIn The input's token reserve
        @param reserveOut The output's token reserve
    */
    function _getAmountOutV2(uint256 amountIn, uint112 reserveIn, uint112 reserveOut) internal pure returns(uint256) {
        uint256 amountInWithFee = amountIn * 990;
        uint256 numerator = amountInWithFee * uint256(reserveOut);
        uint256 denominator = (uint256(reserveIn) * 1000) + amountInWithFee;
        return numerator/denominator;
    }

    /**
        @notice Internal view function that returns amount out
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
        try QUOTER.quoteExactInputSingle(Quote) returns (uint256 amountOut, uint160, uint32 , uint256) {
            return amountOut;
        } catch {
            return 0;
        }
    }

    /**
        @notice Internal view function that returns amount out for v2 pair with 1% fee
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
        @notice Internal view function that returns amount out for v2 pair with 0.3% fee
        @param v2Pair The address of the pair to check
        @param amountIn The input amount to swap from
        @param amountInAfterFee The input amount to swap from after fee
        @param buyFlag 0 for sell native , 1 for sell token
    */
    function _getV2_1Quotes(address v2Pair, uint256 amountIn, uint256 amountInAfterFee, uint256 buyFlag) internal view returns(uint256 amountOutV2) {
        address token0 = IUniswapV2Pair(v2Pair).token0();
        (uint112 reserve0, uint112 reserve1,) = IUniswapV2Pair(v2Pair).getReserves();
        if(buyFlag == 0) {
            // @dev set the correct reserves according to weth token position in the pair
            if(token0 == address(WETH_WRAPPER)) {
                amountOutV2 = _getAmountOutV2_1(amountInAfterFee, reserve0, reserve1);
            } else {
                amountOutV2 = _getAmountOutV2_1(amountInAfterFee, reserve1, reserve0);
            }
        } else {
            if(token0 == address(WETH_WRAPPER)) {
                amountOutV2 = _getAmountOutV2_1(amountIn, reserve1, reserve0);
            } else {
                amountOutV2 = _getAmountOutV2_1(amountIn, reserve0, reserve1);
            }
        }
    }

    receive() external payable {}

}
