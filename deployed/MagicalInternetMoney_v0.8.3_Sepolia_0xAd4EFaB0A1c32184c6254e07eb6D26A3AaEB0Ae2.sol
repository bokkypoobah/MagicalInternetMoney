/**
 *Submitted for verification at Etherscan.io on 2024-07-04
*/

pragma solidity ^0.8.23;

// ----------------------------------------------------------------------------
// MagicalInternetMoney v0.8.3 - Experiments in ERC-5564: Stealth Addresses
//
// Deployed to Sepolia 0xAd4EFaB0A1c32184c6254e07eb6D26A3AaEB0Ae2
//
// https://github.com/bokkypoobah/MagicalInternetMoney
//
// SPDX-License-Identifier: MIT
//
// Enjoy. (c) BokkyPooBah / Bok Consulting Pty Ltd 2024
// ----------------------------------------------------------------------------

// import "hardhat/console.sol";


/// @notice `ERC5564Announcer` contract to emit an `Announcement` event to broadcast information
/// about a transaction involving a stealth address. See
/// [ERC-5564](https://eips.ethereum.org/EIPS/eip-5564) to learn more.
interface IERC5564Announcer {
  /// @notice Emitted when something is sent to a stealth address.
  /// @param schemeId Identifier corresponding to the applied stealth address scheme, e.g. 1 for
  /// secp256k1, as specified in ERC-5564.
  /// @param stealthAddress The computed stealth address for the recipient.
  /// @param caller The caller of the `announce` function that emitted this event.
  /// @param ephemeralPubKey Ephemeral public key used by the sender to derive the `stealthAddress`.
  /// @param metadata Arbitrary data to emit with the event. The first byte MUST be the view tag.
  /// @dev The remaining metadata can be used by the senders however they like. See
  /// [ERC-5564](https://eips.ethereum.org/EIPS/eip-5564) for recommendations on how to structure
  /// this metadata.
  event Announcement(
    uint256 indexed schemeId,
    address indexed stealthAddress,
    address indexed caller,
    bytes ephemeralPubKey,
    bytes metadata
  );

  /// @notice Called by integrators to emit an `Announcement` event.
  /// @param schemeId Identifier corresponding to the applied stealth address scheme, e.g. 1 for
  /// secp256k1, as specified in ERC-5564.
  /// @param stealthAddress The computed stealth address for the recipient.
  /// @param ephemeralPubKey Ephemeral public key used by the sender.
  /// @param metadata Arbitrary data to emit with the event. The first byte MUST be the view tag.
  /// @dev The remaining metadata can be used by the senders however they like. See
  /// [ERC-5564](https://eips.ethereum.org/EIPS/eip-5564) for recommendations on how to structure
  /// this metadata.
  function announce(
    uint256 schemeId,
    address stealthAddress,
    bytes memory ephemeralPubKey,
    bytes memory metadata
  ) external;
}


interface ITransferFrom {
    // ERC-20 function transferFrom(address from, address to, uint tokens) external returns (bool success);
    // ERC-721 function transferFrom(address from, address to, uint256 tokenId) external;
    function transferFrom(address from, address to, uint256 tokensOrTokenId) external;
}

interface IERC20Allowance {
    function allowance(address tokenOwner, address spender) external view returns (uint remaining);
}

interface IERC721OwnerOf {
    function ownerOf(uint256 tokenId) external view returns (address owner);
}

struct TokenInfo {
    bool isERC721;
    address token;
    uint value;
}


/// @notice Magical Internet Money things
contract MagicalInternetMoney {
    // 0x23b872dd transferFrom(address,address,uint256)
    bytes4 private constant TRANSFERFROM_SELECTOR = 0x23b872dd;

    IERC5564Announcer announcer;

    error NothingToTransfer();
    error TransferFailure();
    error NotERC721TokenOwner();
    error InsufficientERC20Allowance();

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
            revert NothingToTransfer();
        }
        bytes memory metadata = new bytes(57);
        uint i;
        uint j;
        metadata[j++] = bytes1(viewTag);
        for (; i < 24; i++) {
            metadata[j++] = 0xee;
        }
        bytes32 msgValueInBytes = bytes32(msg.value);
        for (i = 0; i < 32; i++) {
            metadata[j++] = msgValueInBytes[i];
        }
        (bool sent, ) = recipient.call{value: msg.value}("");
        if (!sent) {
            revert TransferFailure();
        }
        announcer.announce(schemeId, recipient, ephemeralPubKey, metadata);
    }

    /// @dev Transfer ETH/ERC-20/ERC-721 and announce
    /// @param schemeId The integer specifying the applied stealth address scheme.
    /// @param recipient The computed stealth address for the recipient.
    /// @param ephemeralPubKey Ephemeral public key used by the sender.
    /// @param viewTag The view tag derived from the shared secret.
    /// @param tokenInfo Array of [isERC721, tokenAddress, tokenValue] to transfer
    function transferAndAnnounce(uint256 schemeId, address recipient, bytes memory ephemeralPubKey, uint8 viewTag, TokenInfo[] calldata tokenInfo) external payable {
        if (tokenInfo.length == 0 && msg.value == 0) {
            revert NothingToTransfer();
        }
        bytes memory metadata = new bytes(1 + (56 * (tokenInfo.length + (msg.value > 0 ? 1 : 0))));
        uint i;
        uint j;
        metadata[j++] = bytes1(viewTag);
        if (msg.value > 0) {
            for (; i < 24; i++) {
                metadata[j++] = 0xee;
            }
            bytes32 msgValueInBytes = bytes32(msg.value);
            for (i = 0; i < 32; i++) {
                metadata[j++] = msgValueInBytes[i];
            }
            (bool sent, ) = recipient.call{value: msg.value}("");
            if (!sent) {
                revert TransferFailure();
            }
        }
        for (i = 0; i < tokenInfo.length; i++) {
            bytes memory selectorAndTokenContractInBytes = abi.encodePacked(TRANSFERFROM_SELECTOR, tokenInfo[i].token);
            uint k;
            for (k = 0; k < 24; k++) {
                metadata[j++] = selectorAndTokenContractInBytes[k];
            }
            bytes32 valueInBytes = bytes32(tokenInfo[i].value);
            for (k = 0; k < 32; k++) {
                metadata[j++] = valueInBytes[k];
            }

            // msg.sender can only transfer their own ERC-721 tokens
            if (tokenInfo[i].isERC721) {
                address owner = IERC721OwnerOf(tokenInfo[i].token).ownerOf(tokenInfo[i].value);
                if (owner != msg.sender) {
                    revert NotERC721TokenOwner();
                }
            // Check ERC-20 allowance to prevent the ERC-721 ownership check above being bypassed
            } else {
                uint allowance = IERC20Allowance(tokenInfo[i].token).allowance(msg.sender, address(this));
                if (allowance < tokenInfo[i].value) {
                    revert InsufficientERC20Allowance();
                }
            }
            ITransferFrom(tokenInfo[i].token).transferFrom(msg.sender, recipient, tokenInfo[i].value);
        }
        announcer.announce(schemeId, recipient, ephemeralPubKey, metadata);
    }
}
