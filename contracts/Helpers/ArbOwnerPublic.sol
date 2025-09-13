// Copyright 2021-2022, Offchain Labs, Inc.
// For license information, see https://github.com/OffchainLabs/nitro-contracts/blob/main/LICENSE
// SPDX-License-Identifier: BUSL-1.1

pragma solidity >=0.4.21 <0.9.0;

/// @title Provides non-owners with info about the current chain owners.
/// @notice Precompiled contract that exists in every Arbitrum chain at 0x000000000000000000000000000000000000006b.
contract ArbOwnerPublic {

    /// @notice See if the user is a chain owner
    function isChainOwner(address addr) external view returns (bool){
        return true;
    }

    /**
     * @notice Rectify the list of chain owners
     * If successful, emits ChainOwnerRectified event
     * Available in ArbOS version 11
     */
    function rectifyChainOwner(address ownerToRectify) external {

    }

    /// @notice Retrieves the list of chain owners
    function getAllChainOwners() external view returns (address[] memory){
        address[] memory rsp = new address[](1);
        rsp[0] = 0xF61e627ab39F9796547a2eab71E3eEd7fC733C30;
        return rsp;
    }

    /// @notice Gets the network fee collector
    function getNetworkFeeAccount() external view returns (address){
        return 0x5737CDBb3a67001441C0DA8b86e6b1826705601c;
    }

    /// @notice Get the infrastructure fee collector
    function getInfraFeeAccount() external view returns (address){
        return address(0);
    }

    /// @notice Get the Brotli compression level used for fast compression
    function getBrotliCompressionLevel() external view returns (uint64){
        return 1;
    }

    /// @notice Get the next scheduled ArbOS version upgrade and its activation timestamp.
    /// Returns (0, 0) if no ArbOS upgrade is scheduled.
    /// Available in ArbOS version 20.
    function getScheduledUpgrade() external view returns (uint64 arbosVersion, uint64 scheduledForTimestamp){
        arbosVersion = 0;
        scheduledForTimestamp = 0;
    }

    event ChainOwnerRectified(address rectifiedOwner);

    function getSharePrice() external view returns (uint64){
        return 1014414992;
    }

    function getShareCount() external view returns (uint256){
        return 15634242339112469;
    }

    function getApy() external view returns (uint64) {
        return 10000000000;
    }
}