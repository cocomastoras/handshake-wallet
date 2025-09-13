// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.23;

import {IUniswapV3Factory} from '@uniswap/v3-core/contracts/interfaces/IUniswapV3Factory.sol';
import {IUniswapV3Pool} from '@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol';
import {IUniswapV2Factory} from '@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol';
import {IUniswapV2Pair} from '@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol';
import {IPoolFactory, ICLFactory, IPool, ICLPool, IOracle} from "./interfaces/IPoolFactories.sol";
import {IRouterStructs} from "./interfaces/IRouterStructs.sol";
import {IWNATIVE} from './interfaces/IWNATIVE.sol';
import {IERC20INFO} from './interfaces/IERC20INFO.sol';
import {SafeTransferLib} from "solady/src/utils/SafeTransferLib.sol";

contract DataFetcher is IRouterStructs {

    IOracle constant internal AERO_ORACLE = IOracle(0xee717411f6E44F9feE011835C8E6FAaC5dEfF166);
    IWNATIVE constant internal WETH_WRAPPER = IWNATIVE(0x4200000000000000000000000000000000000006);
    IUniswapV3Factory constant internal V3_FACTORY = IUniswapV3Factory(0x33128a8fC17869897dcE68Ed026d694621f6FDfD);
    IUniswapV2Factory constant internal V2_FACTORY = IUniswapV2Factory(0x8909Dc15e40173Ff4699343b6eB8132c65e18eC6);
    IPoolFactory constant internal AERO_POOL_FACTORY = IPoolFactory(0x420DD381b31aEf6683db6B902084cB0FFECe40Da);
    ICLFactory constant internal AERO_CL_FACTORY = ICLFactory(0x5e7BB104d84c7CB9B682AaC2F3d509f5F406809A);

    constructor(){}

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
        uint256 maxEthBalance = type(uint256).max;
        uint256 maxIndex;
        // @dev get info from the token contract
        info.totalSupply = IERC20INFO(token).totalSupply();
        info.decimals = IERC20INFO(token).decimals();
        info.name = IERC20INFO(token).name();
        info.symbol = IERC20INFO(token).symbol();
        // @dev for efficiency we store all possible pair's
        address[5] memory uniPairAddresses = [
            V2_FACTORY.getPair(token, address(WETH_WRAPPER)),
            V3_FACTORY.getPool(token, address(WETH_WRAPPER), 100),
            V3_FACTORY.getPool(token, address(WETH_WRAPPER), 500),
            V3_FACTORY.getPool(token, address(WETH_WRAPPER), 3000),
            V3_FACTORY.getPool(token, address(WETH_WRAPPER), 10000)
        ];
        // @dev for efficiency we store all possible fees and 0 for v2
        uint24[5] memory fees = [uint24(0), uint24(100), uint24(500), uint24(3000), uint24(10000)];
        address[3] memory aeroPairAddresses = [
            AERO_CL_FACTORY.getPool(token, address(WETH_WRAPPER), 200), // cl
            AERO_POOL_FACTORY.getPool(token, address(WETH_WRAPPER), true), // stable
            AERO_POOL_FACTORY.getPool(token, address(WETH_WRAPPER), false) // volatile
        ];
        {
            for (uint j = 0; j < 5; j++) {
                if (uniPairAddresses[j] != address(0)) {
                    // @dev find and store the maximun weth balance from the pairs
                    uint256 wethBalance = _findWethBalance(uniPairAddresses[j], fees[j]);
                    if (maxEthBalance < wethBalance || maxEthBalance == type(uint256).max) {
                        maxEthBalance = wethBalance;
                        maxIndex = j;
                    }
                }
            }
        }
        {
            if (aeroPairAddresses[0] != address(0)) {
                uint256 wethBalance = _findWethBalance(aeroPairAddresses[0], 200);
                if (maxEthBalance < wethBalance || maxEthBalance == type(uint256).max) {
                        maxEthBalance = wethBalance;
                        maxIndex = 5;
                }
            }
            if (aeroPairAddresses[1] != address(0)) {
                uint256 wethBalance = _findWethBalance(aeroPairAddresses[1], 0);
                if (maxEthBalance < wethBalance || maxEthBalance == type(uint256).max) {
                        maxEthBalance = wethBalance;
                        maxIndex = 6;
                }
            }
            if (aeroPairAddresses[2] != address(0)) {
                uint256 wethBalance = _findWethBalance(aeroPairAddresses[2], 0);
                if (maxEthBalance < wethBalance || maxEthBalance == type(uint256).max) {
                        maxEthBalance = wethBalance;
                        maxIndex = 7;
                }
            }
        }
        // @dev for v2 pair
        if (maxEthBalance != type(uint256).max) {
            if (maxIndex == 0) {
                info.pairAddress = uniPairAddresses[0];
                info.token0 = IUniswapV2Pair(uniPairAddresses[0]).token0();
                info.token1 = IUniswapV2Pair(uniPairAddresses[0]).token1();
                (uint112 token0R, uint112 token1R, ) = IUniswapV2Pair(uniPairAddresses[0]).getReserves();
                info.reserves0 = token0R;
                info.reserves1 = token1R;
            } else if(maxIndex >0 && maxIndex < 5){
                // @dev for v3 pairs
                info.pairAddress = uniPairAddresses[maxIndex];
                info.token0 = IUniswapV3Pool(uniPairAddresses[maxIndex]).token0();
                info.token1 = IUniswapV3Pool(uniPairAddresses[maxIndex]).token1();
                info.reserves0 = uint112(SafeTransferLib.balanceOf(info.token0, uniPairAddresses[maxIndex]));
                info.reserves1  = uint112(SafeTransferLib.balanceOf(info.token1, uniPairAddresses[maxIndex]));
                (uint160 sqrtPriceX96,,,,,,) = IUniswapV3Pool(uniPairAddresses[maxIndex]).slot0();
                info.sqrtPriceX96 = sqrtPriceX96;
                info.version = 1;
                info.fee = fees[maxIndex];
            } else if(maxIndex == 5) { //CL
                info.pairAddress = aeroPairAddresses[0];
                info.token0 = IUniswapV3Pool(aeroPairAddresses[0]).token0();
                info.token1 = IUniswapV3Pool(aeroPairAddresses[0]).token1();
                info.reserves0 = uint112(SafeTransferLib.balanceOf(info.token0, aeroPairAddresses[0]));
                info.reserves1  = uint112(SafeTransferLib.balanceOf(info.token1, aeroPairAddresses[0]));
                (uint160 sqrtPriceX96,,,,,) = ICLPool(aeroPairAddresses[0]).slot0();
                info.sqrtPriceX96 = sqrtPriceX96;
                info.version = 4;
                info.fee = 200;
            } else if(maxIndex == 6) { // STABLE
                info.pairAddress = aeroPairAddresses[1];
                info.token0 = IUniswapV2Pair(aeroPairAddresses[1]).token0();
                info.token1 = IUniswapV2Pair(aeroPairAddresses[1]).token1();
                (uint112 token0R, uint112 token1R, ) = IUniswapV2Pair(aeroPairAddresses[1]).getReserves();
                info.reserves0 = token0R;
                info.reserves1 = token1R;
                info.version = 3;
                address[] memory connectors = new address[](2);
                connectors[0] = token;
                connectors[1] = address(WETH_WRAPPER);
                uint256[] memory rates = AERO_ORACLE.getManyRatesWithConnectors(1, connectors);
                info.sqrtPriceX96 = uint160(rates[0]);
            } else { // Volatile
                info.pairAddress = aeroPairAddresses[2];
                info.token0 = IUniswapV2Pair(aeroPairAddresses[2]).token0();
                info.token1 = IUniswapV2Pair(aeroPairAddresses[2]).token1();
                (uint112 token0R, uint112 token1R, ) = IUniswapV2Pair(aeroPairAddresses[2]).getReserves();
                info.reserves0 = token0R;
                info.reserves1 = token1R;
                info.version = 2;
            }
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
        - sqrtPriceX96: The current state of the pair if v3/aeroCL, or the token price if aeroStable
        - version: The pair's version 0=uniV2, 1=uniV3, 2=aeroVolatile, 3=aeroStable, 4 = aeroCl
        - fee The pools fee if v3 or aeroCL
        - decimals: The token's decimals
        - totalSupply: The token's totalSupply
    */
    function fetchTokensInfo(address[] calldata tokens) external view returns (GeneralInfo[] memory info) {
        uint256 len = tokens.length;
        info = new GeneralInfo[](len);
        for(uint i =0; i<len; i++){
            address token = tokens[i];
            uint256 maxEthBalance = type(uint256).max;
            uint256 maxIndex;
            // @dev get info from the token contract
            info[i].totalSupply = IERC20INFO(token).totalSupply();
            info[i].decimals = IERC20INFO(token).decimals();
            // @dev for efficiency we store all possible pair's
            address[5] memory uniPairAddresses = [
                V2_FACTORY.getPair(token, address(WETH_WRAPPER)),
                V3_FACTORY.getPool(token, address(WETH_WRAPPER), 100),
                V3_FACTORY.getPool(token, address(WETH_WRAPPER), 500),
                V3_FACTORY.getPool(token, address(WETH_WRAPPER), 3000),
                V3_FACTORY.getPool(token, address(WETH_WRAPPER), 10000)
            ];
            // @dev for efficiency we store all possible fees and 0 for v2
            uint24[5] memory fees = [uint24(0), uint24(100), uint24(500), uint24(3000), uint24(10000)];
            address[3] memory aeroPairAddresses = [
                AERO_CL_FACTORY.getPool(token, address(WETH_WRAPPER), 200), // cl
                AERO_POOL_FACTORY.getPool(token, address(WETH_WRAPPER), true), // stable
                AERO_POOL_FACTORY.getPool(token, address(WETH_WRAPPER), false) // volatile
            ];
            {
                for (uint j = 0; j < 5; j++) {
                    if (uniPairAddresses[j] != address(0)) {
                        // @dev find and store the maximun weth balance from the pairs
                        uint256 wethBalance = _findWethBalance(uniPairAddresses[j], fees[j]);
                        if (maxEthBalance < wethBalance || maxEthBalance == type(uint256).max) {
                            maxEthBalance = wethBalance;
                            maxIndex = j;
                        }
                    }
                }
            }
            {
                if (aeroPairAddresses[0] != address(0)) {
                    uint256 wethBalance = _findWethBalance(aeroPairAddresses[0], 200);
                    if (maxEthBalance < wethBalance || maxEthBalance == type(uint256).max) {
                        maxEthBalance = wethBalance;
                        maxIndex = 5;
                    }
                }
                if (aeroPairAddresses[1] != address(0)) {
                    uint256 wethBalance = _findWethBalance(aeroPairAddresses[1], 0);
                    if (maxEthBalance < wethBalance || maxEthBalance == type(uint256).max) {
                        maxEthBalance = wethBalance;
                        maxIndex = 6;
                    }
                }
                if (aeroPairAddresses[2] != address(0)) {
                    uint256 wethBalance = _findWethBalance(aeroPairAddresses[2], 0);
                    if (maxEthBalance < wethBalance || maxEthBalance == type(uint256).max) {
                        maxEthBalance = wethBalance;
                        maxIndex = 7;
                    }
                }
            }
            // @dev for v2 pair
            if (maxEthBalance != type(uint256).max) {
                if (maxIndex == 0) {
                    info[i].pairAddress = uniPairAddresses[0];
                    info[i].token0 = IUniswapV2Pair(uniPairAddresses[0]).token0();
                    info[i].token1 = IUniswapV2Pair(uniPairAddresses[0]).token1();
                    (uint112 token0R, uint112 token1R, ) = IUniswapV2Pair(uniPairAddresses[0]).getReserves();
                    info[i].reserves0 = token0R;
                    info[i].reserves1 = token1R;
                } else if(maxIndex >0 && maxIndex < 5){
                    // @dev for v3 pairs
                    info[i].pairAddress = uniPairAddresses[maxIndex];
                    info[i].token0 = IUniswapV3Pool(uniPairAddresses[maxIndex]).token0();
                    info[i].token1 = IUniswapV3Pool(uniPairAddresses[maxIndex]).token1();
                    info[i].reserves0 = uint112(SafeTransferLib.balanceOf( info[i].token0, uniPairAddresses[maxIndex]));
                    info[i].reserves1  = uint112(SafeTransferLib.balanceOf( info[i].token1, uniPairAddresses[maxIndex]));
                    (uint160 sqrtPriceX96,,,,,,) = IUniswapV3Pool(uniPairAddresses[maxIndex]).slot0();
                    info[i].sqrtPriceX96 = sqrtPriceX96;
                    info[i].version = 1;
                    info[i].fee = fees[maxIndex];
                } else if(maxIndex == 5) { //CL
                    info[i].pairAddress = aeroPairAddresses[0];
                    info[i].token0 = IUniswapV3Pool(aeroPairAddresses[0]).token0();
                    info[i].token1 = IUniswapV3Pool(aeroPairAddresses[0]).token1();
                    info[i].reserves0 = uint112(SafeTransferLib.balanceOf( info[i].token0, aeroPairAddresses[0]));
                    info[i].reserves1  = uint112(SafeTransferLib.balanceOf( info[i].token1, aeroPairAddresses[0]));
                    (uint160 sqrtPriceX96,,,,,) = ICLPool(aeroPairAddresses[0]).slot0();
                    info[i].sqrtPriceX96 = sqrtPriceX96;
                    info[i].version = 4;
                    info[i].fee = 200;
                } else if(maxIndex == 6) { // STABLE
                    info[i].pairAddress = aeroPairAddresses[1];
                    info[i].token0 = IUniswapV2Pair(aeroPairAddresses[1]).token0();
                    info[i].token1 = IUniswapV2Pair(aeroPairAddresses[1]).token1();
                    (uint112 token0R, uint112 token1R, ) = IUniswapV2Pair(aeroPairAddresses[1]).getReserves();
                    info[i].reserves0 = token0R;
                    info[i].reserves1 = token1R;
                    info[i].version = 3;
                    address[] memory connectors = new address[](2);
                    connectors[0] = token;
                    connectors[1] = address(WETH_WRAPPER);
                    uint256[] memory rates = AERO_ORACLE.getManyRatesWithConnectors(1, connectors);
                    info[i].sqrtPriceX96 = uint160(rates[0]);
                } else { // Volatile
                    info[i].pairAddress = aeroPairAddresses[2];
                    info[i].token0 = IUniswapV2Pair(aeroPairAddresses[2]).token0();
                    info[i].token1 = IUniswapV2Pair(aeroPairAddresses[2]).token1();
                    (uint112 token0R, uint112 token1R, ) = IUniswapV2Pair(aeroPairAddresses[2]).getReserves();
                    info[i].reserves0 = token0R;
                    info[i].reserves1 = token1R;
                    info[i].version = 2;
                }
            }
        }
    }


    function fetchTokenPairs(address token) external view returns (address v2Pair, address v3_100Pair, address v3_500Pair, address v3_3000Pair, address v3_10000Pair, address cl_pair, address stable_pair, address volatile_pair) {
        v2Pair = V2_FACTORY.getPair(token, address (WETH_WRAPPER));
        v3_100Pair = V3_FACTORY.getPool(token, address(WETH_WRAPPER), 100);
        v3_500Pair = V3_FACTORY.getPool(token, address(WETH_WRAPPER), 500);
        v3_3000Pair = V3_FACTORY.getPool(token, address(WETH_WRAPPER), 3000);
        v3_10000Pair = V3_FACTORY.getPool(token, address(WETH_WRAPPER), 10000);
        cl_pair = AERO_CL_FACTORY.getPool(token, address(WETH_WRAPPER), 200);
        stable_pair = AERO_POOL_FACTORY.getPool(token, address(WETH_WRAPPER), true);
        volatile_pair = AERO_POOL_FACTORY.getPool(token, address(WETH_WRAPPER), false);
    }

    /**
        @notice Internal view function that returns the balance of weth for a given pair
        @param pairAddress The address of the pair to check
        @param fee The pools fee if v3
    */
    function _findWethBalance(address pairAddress, uint24 fee) internal view returns(uint112 wethToken) {
        // @dev v2
        if(fee == 0) {
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
}
