// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

interface ICamelotYakRouter {

    struct Query {
        address adapter;
        address recipient;
        address tokenIn;
        address tokenOut;
        uint256 amountOut;
    }

    struct FormattedOffer {
        uint256[] amounts;
        address[] adapters;
        address[] path;
        address[] recipients;
        uint256 gasEstimate;
    }

    struct Trade {
        uint256 amountIn;
        uint256 amountOut;
        address[] path;
        address[] adapters;
        address[] recipients;
    }

    function findBestPath(
        uint256 _amountIn,
        address _tokenIn,
        address _tokenOut,
        address[] memory _trustedTokens,
        uint256 _maxSteps
    ) external view returns (FormattedOffer memory);

    function swapNoSplitFromETH(
        Trade calldata _trade,
        uint256 _fee,
        address _to
    ) external payable;

    function swapNoSplit(
        Trade calldata _trade,
        uint256 _fee,
        address _to
    ) external;
}
