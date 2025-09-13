// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {IERC20INFO} from './Uniswap/interfaces/IERC20INFO.sol';

contract FetchErrorErc20 {
    constructor(){}

    function seeError(address[] memory tokens) public view returns (address[] memory failedTokens) {
        uint len = tokens.length;
        failedTokens = new address[](len);
        uint index = 0;
        for(uint i =0; i< len; i++) {
            try IERC20INFO(tokens[i]).symbol() {
                try IERC20INFO(tokens[i]).totalSupply() {
                    try IERC20INFO(tokens[i]).name() {
                        try IERC20INFO(tokens[i]).decimals() {

                        } catch {
                            failedTokens[index] = tokens[i];
                            index += 1;
                        }
                    } catch {
                        failedTokens[index] = tokens[i];
                        index += 1;
                    }
                } catch {
                    failedTokens[index] = tokens[i];
                    index += 1;
                }
            } catch {
                failedTokens[index] = tokens[i];
                index += 1;
            }
        }
        if (len > index) {
            assembly {
                let decrease := sub(len, index)
                mstore(failedTokens, sub(mload(failedTokens), decrease))
            }
        }
    }
}
