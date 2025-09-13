// SPDX-License-Identifier: MIT

pragma solidity ^0.8.10;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title WNATIVE Interface
 * @notice Required interface of Wrapped NATIVE contract
 */
interface IWNATIVE is IERC20 {
    function deposit() external payable;
    function withdraw(uint wad) external;
    function balanceOf(address) external view returns(uint);
}

