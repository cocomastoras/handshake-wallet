// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

interface IAlgebraFactory {
    function poolByPair(address tokenA, address tokenB) external view returns(address);
}

interface ICamelotFactory {
    function getPair(address tokenA, address tokenB) external view returns(address);
}

interface IAlegraPool {
    function token0() external view returns(address);
    function token1() external view returns(address);
    function globalState() external view returns(uint160, int24, uint16, uint16, uint16, uint8, uint8,bool);
}

interface ICamelotPool {
    function getReserves() external view returns(uint112,uint112,uint16,uint16);
    function token0() external view returns(address);
    function token1() external view returns(address);
}

interface IQuoter {
    function quoteExactInputSingle(address tokenIn, address tokenOut, uint256 amountIn, uint160 limitSqrtPrice) external returns(uint256 amountOut, uint16 fee);
}

interface ISwapRouter {

    struct ExactInputSingleParams {
        address tokenIn;
        address tokenOut;
        address recipient;
        uint256 deadline;
        uint256 amountIn;
        uint256 amountOutMinimum;
        uint160 limitSqrtPrice;
    }

    function exactInputSingleSupportingFeeOnTransferTokens(ExactInputSingleParams calldata params) external returns (uint256 amountOut);
}

interface ICamelotRouter {
    function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts);
    function swapExactETHForTokensSupportingFeeOnTransferTokens(uint amountOutMin, address[] calldata path, address to, address referrer, uint deadline) external payable;
    function swapExactTokensForTokensSupportingFeeOnTransferTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, address referrer, uint deadline) external;
}