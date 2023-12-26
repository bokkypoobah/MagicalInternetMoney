/**
 *Submitted for verification at Etherscan.io on 2023-12-26
*/

pragma solidity ^0.8.19;

// ----------------------------------------------------------------------------
// StealthChad v 0.8.0 - Experiments in ERC-5564: Stealth Addresses
//
// Deployed to Sepolia 0x3834bcA9093e375893D65975ad765179A149D017
//
// https://github.com/bokkypoobah/StealthChad
//
// SPDX-License-Identifier: MIT
//
// Enjoy. (c) BokkyPooBah / Bok Consulting Pty Ltd 2023
// ----------------------------------------------------------------------------

// import "hardhat/console.sol";


function onePlus(uint x) pure returns (uint) {
    unchecked { return 1 + x; }
}


/// @notice Interface for announcing when something is sent to a stealth address.
interface IERC5564Announcer {
  /// @dev Emitted when sending something to a stealth address.
  /// @dev See the `announce` method for documentation on the parameters.
  event Announcement(uint256 indexed schemeId, address indexed stealthAddress, address indexed caller, bytes ephemeralPubKey, bytes metadata);

  /// @dev Called by integrators to emit an `Announcement` event.
  /// @param schemeId The integer specifying the applied stealth address scheme.
  /// @param stealthAddress The computed stealth address for the recipient.
  /// @param ephemeralPubKey Ephemeral public key used by the sender.
  /// @param metadata An arbitrary field MUST include the view tag in the first byte.
  /// Besides the view tag, the metadata can be used by the senders however they like,
  /// but the below guidelines are recommended:
  /// The first byte of the metadata MUST be the view tag.
  /// - When sending/interacting with the native token of the blockchain (cf. ETH), the metadata SHOULD be structured as follows:
  ///     - Byte 1 MUST be the view tag, as specified above.
  ///     - Bytes 2-5 are `0xeeeeeeee`
  ///     - Bytes 6-25 are the address 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE.
  ///     - Bytes 26-57 are the amount of ETH being sent.
  /// - When interacting with ERC-20/ERC-721/etc. tokens, the metadata SHOULD be structured as follows:
  ///   - Byte 1 MUST be the view tag, as specified above.
  ///   - Bytes 2-5 are a function identifier. When a function selector (e.g.
  ///     the first (left, high-order in big-endian) four bytes of the Keccak-256
  ///     hash of the signature of the function, like Solidity and Vyper use) is
  ///     available, it MUST be used.
  ///   - Bytes 6-25 are the token contract address.
  ///   - Bytes 26-57 are the amount of tokens being sent/interacted with for fungible tokens, or
  ///     the token ID for non-fungible tokens.
  function announce(uint256 schemeId, address stealthAddress, bytes memory ephemeralPubKey, bytes memory metadata) external;
}


/// @notice Stealth Chad things
contract StealthChad {
    IERC5564Announcer announcer;

    error NoPointInSendingAZeroValue();
    error TransferFailure();

    constructor(address payable _announcer) {
        announcer = IERC5564Announcer(_announcer);
    }

    /// @dev Transfer ETH and announce
    /// @param schemeId The integer specifying the applied stealth address scheme.
    /// @param recipient The computed stealth address for the recipient.
    /// @param ephemeralPubKey Ephemeral public key used by the sender.
    /// @param viewTag The view tag derived from the shared secret.
    function transferEthAndAnnounce(uint256 schemeId, address recipient, bytes memory ephemeralPubKey, uint8 viewTag) external payable {
        if (msg.value == 0) {
            revert NoPointInSendingAZeroValue();
        }
        bytes memory metadata = new bytes(57);
        uint i;
        uint j;
        metadata[j++] = bytes1(viewTag);
        for (; i < 24; i = onePlus(i)) {
            metadata[j++] = 0xee;
        }
        bytes32 msgValueInBytes = bytes32(msg.value);
        for (i = 0; i < 32; i = onePlus(i)) {
            metadata[j++] = msgValueInBytes[i];
        }
        announcer.announce(schemeId, recipient, ephemeralPubKey, metadata);
        (bool sent, ) = recipient.call{value: msg.value}("");
        if (!sent) {
            revert TransferFailure();
        }
    }

}
