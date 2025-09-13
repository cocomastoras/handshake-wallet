// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.23;
import {SafeTransferLib} from "solady/src/utils/SafeTransferLib.sol";

interface IERC20 {
    function decimals() external view returns(uint8);
}

/// @author 0xCocomastoras
/// @custom:version 1.0
/// @title Balance Multicall
contract BalanceMultiFetcher {
    constructor(){}

     /**
        @notice Fetches the balances of a user for given tokens.
        @dev Max limit 5500 addresses
        @param owner The address of the user to check on
        @param tokens A list of token addresses to check
    */
    function fetchMultiBalances(address owner, address[] calldata tokens) external view returns (uint256[] memory balances) {
        uint256 len = tokens.length;
        balances = new uint256[](len);
        assembly {
            let offset := tokens.offset
            mstore(0x2c, shl(96, owner)) // Store the `owner` argument.
            mstore(0x0c, 0x70a08231000000000000000000000000)
            for { let i:=0 } lt(i, len) {i := add(i, 1)} {
                let token := calldataload(add(offset, mul(i, 0x20)))
                pop(staticcall(gas(), token, 0x1c, 0x24, add(balances, mul(add(i,1), 0x20)), 0x20))
            }
        }
    }

    /**
        @notice Fetches the balances of a user for given tokens plus decimals for each token.
        @dev Max limit 4000 addresses
        @param owner The address of the user to check on
        @param tokens A list of token addresses to check
    */
    function fetchMultiBalancesAndDecimals(address owner, address[] calldata tokens) external view returns (uint256[] memory balances, uint8[] memory decimals) {
        uint256 len = tokens.length;
        balances = new uint256[](len);
        decimals = new uint8[](len);
        for(uint i = 0; i<len; i++) {
            address token = tokens[i];
            decimals[i] = IERC20(token).decimals();
            balances[i] = SafeTransferLib.balanceOf(token, owner);
        }
    }
}
