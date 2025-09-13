// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

interface IRouterStructs {
    struct GeneralInfo{
        address pairAddress;
        address token0;
        address token1;
        uint112 reserves0;
        uint112 reserves1;
        uint160 sqrtPriceX96;
        uint24 version;
        uint24 fee;
        uint8 decimals;
        uint256 totalSupply;
    }

    struct AllInfo{
        address pairAddress;
        address token0;
        address token1;
        uint112 reserves0;
        uint112 reserves1;
        uint160 sqrtPriceX96;
        uint24 version;
        uint24 fee;
        uint8 decimals;
        uint256 totalSupply;
        string name;
        string symbol;
    }
}
