// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

interface IPoolFactory {
    function getPool(address tokenA, address tokenB, bool stable) external view returns(address);
}

interface ICLFactory {
    function getPool(address tokenA, address tokenB, int24 fee) external view returns(address);
}

interface IPool {
    function getAmountOut(uint256 amountIn, address tokenIn) external view returns(uint256);
    function getReserves() external view returns(uint256, uint256, uint256);

}

interface ICLPool {
    function getAmountOut(uint256 amountIn, address tokenIn) external view returns(uint256);
    function slot0() external view returns(uint160, int24, uint16, uint16, uint16, bool);
}

interface IOracle {
    function getManyRatesWithConnectors(uint8 src_len, address[] memory connectors) external view returns(uint256[] memory rates);
}