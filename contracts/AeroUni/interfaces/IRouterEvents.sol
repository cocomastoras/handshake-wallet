// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

interface IRouterEvents {
    event SwapExecuted(address indexed User, address indexed Token0, address indexed Token1, uint256 amountIn, uint256 amountOut, uint24 poolFee, uint256 version, uint256 platformFees);
}
