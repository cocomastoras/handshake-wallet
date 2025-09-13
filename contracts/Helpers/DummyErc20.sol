// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract DummyErc20 is ERC20{

    constructor()ERC20("Dummy Token", "DT"){
    }

    function mint(uint256 _value) external {
        _mint(msg.sender, _value*10**18);
    }
}
