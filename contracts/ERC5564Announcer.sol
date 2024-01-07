pragma solidity ^0.8.19;

// ----------------------------------------------------------------------------
// ERC5564Announcer v0.8.1 - Experiments in ERC-5564: Stealth Addresses
//
// From https://eips.ethereum.org/EIPS/eip-5564
//
// Deployed to Sepolia
//
// https://github.com/bokkypoobah/StealthChad
//
// SPDX-License-Identifier: MIT
//
// Enjoy. (c) BokkyPooBah / Bok Consulting Pty Ltd 2024
// ----------------------------------------------------------------------------

import "./IERC5564Announcer.sol";

// From https://eips.ethereum.org/EIPS/eip-5564

/// @notice Announcing when something is sent to a stealth address.
contract ERC5564Announcer is IERC5564Announcer {
  function announce(uint256 schemeId, address stealthAddress, bytes memory ephemeralPubKey, bytes memory metadata) external {
    emit Announcement(schemeId, stealthAddress, msg.sender, ephemeralPubKey, metadata);
  }
}
