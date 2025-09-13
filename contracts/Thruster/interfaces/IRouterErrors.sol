// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

interface IRouterErrors {
    error V3InvalidSwap();
    error V3TooLittleReceived();
    error V3TooMuchRequested();
    error V3InvalidAmountOut();
    error V3InvalidCaller();
    error V2TooLittleReceived();
    error V2TooMuchRequested();
    error V2InvalidPath();
    error SliceOutOfBounds();
    error InvalidCommandType(uint256 commandType);
    error BalanceTooLow();
    error InvalidVersion();
    error InvalidFee();
}
