/**
 *Submitted for verification at Etherscan.io on 2024-01-16
*/

pragma solidity ^0.8.19;

// ----------------------------------------------------------------------------
// MagicalInternetMoney v0.8.2 - Experiments in ERC-5564: Stealth Addresses
//
// Deployed to Sepolia 0x5B84e1706CD6Ae0d79486Dd6F30503B4330742E1
//
// https://github.com/bokkypoobah/MagicalInternetMoney
//
// SPDX-License-Identifier: MIT
//
// Enjoy. (c) BokkyPooBah / Bok Consulting Pty Ltd 2024
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
        for (; i < 24; i = onePlus(i)) {
            metadata[j++] = 0xee;
        }
        bytes32 msgValueInBytes = bytes32(msg.value);
        for (i = 0; i < 32; i = onePlus(i)) {
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
            for (; i < 24; i = onePlus(i)) {
                metadata[j++] = 0xee;
            }
            bytes32 msgValueInBytes = bytes32(msg.value);
            for (i = 0; i < 32; i = onePlus(i)) {
                metadata[j++] = msgValueInBytes[i];
            }
            (bool sent, ) = recipient.call{value: msg.value}("");
            if (!sent) {
                revert TransferFailure();
            }
        }
        for (i = 0; i < tokenInfo.length; i = onePlus(i)) {
            bytes memory selectorAndTokenContractInBytes = abi.encodePacked(TRANSFERFROM_SELECTOR, tokenInfo[i].token);
            uint k;
            for (k = 0; k < 24; k = onePlus(k)) {
                metadata[j++] = selectorAndTokenContractInBytes[k];
            }
            bytes32 valueInBytes = bytes32(tokenInfo[i].value);
            for (k = 0; k < 32; k = onePlus(k)) {
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
