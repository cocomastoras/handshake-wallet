// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;
import {IRouterStructs} from "./IRouterStructs.sol";

interface IDataFetcher is IRouterStructs {
   function fetchTokenInfo(address token) external view returns (AllInfo memory info);
   function fetchTokensInfo(address[] calldata tokens) external view returns (GeneralInfo[] memory info);
   function fetchTokenPairs(address token) external view returns (address v2Pair, address v3_100Pair, address v3_500Pair, address v3_3000Pair, address v3_10000Pair, address cl_pair, address stable_pair, address volatile_pair);
}

