// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./IERC5564Announcer.sol";

// From https://eips.ethereum.org/EIPS/eip-5564

/// @notice Announcing when something is sent to a stealth address.
contract ERC5564Announcer is IERC5564Announcer {
  function announce (
    uint256 schemeId,
    address stealthAddress,
    bytes memory ephemeralPubKey,
    bytes memory metadata
  )
    external
  {
    emit Announcement(schemeId, stealthAddress, msg.sender, ephemeralPubKey, metadata);
  }
}
