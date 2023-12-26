/**
 *Submitted for verification at Etherscan.io on 2023-12-26
*/

pragma solidity ^0.8.19;

// ----------------------------------------------------------------------------
// ERC5564Registry v0.8.0 - Experiments in ERC-5564: Stealth Addresses
//
// From https://eips.ethereum.org/EIPS/eip-6538, with `bytes` updated to `bytes32`
//
// Deployed to Sepolia 0xC5F111011acAd96860a3cd3d7C50Dd8f56a5684e
//
// https://github.com/bokkypoobah/StealthChad
//
// SPDX-License-Identifier: MIT
//
// Enjoy. (c) BokkyPooBah / Bok Consulting Pty Ltd 2023
// ----------------------------------------------------------------------------

/// @notice Registry to map an address or other identifier to its stealth meta-address.
contract ERC5564Registry {
  /// @dev Emitted when a registrant updates their stealth meta-address.
  event StealthMetaAddressSet(bytes32 indexed registrant, uint256 indexed scheme, bytes stealthMetaAddress);

  /// @notice Maps a registrant's identifier to the scheme to the stealth meta-address.
  /// @dev Registrant may be a 160 bit address or other recipient identifier, such as an ENS name.
  /// @dev Scheme is an integer identifier for the stealth address scheme.
  /// @dev MUST return zero if a registrant has not registered keys for the given inputs.
  mapping(bytes32 => mapping(uint256 => bytes)) public stealthMetaAddressOf;

  /// @notice Sets the caller's stealth meta-address for the given stealth address scheme.
  /// @param scheme An integer identifier for the stealth address scheme.
  /// @param stealthMetaAddress The stealth meta-address to register.
  function registerKeys(uint256 scheme, bytes memory stealthMetaAddress) external {
    stealthMetaAddressOf[bytes32(uint256(uint160(msg.sender)))][scheme] = stealthMetaAddress;
    emit StealthMetaAddressSet(bytes32(uint256(uint160(msg.sender))), scheme, stealthMetaAddress);
  }


  /// @notice Sets the `registrant`s stealth meta-address for the given scheme.
  /// @param registrant Recipient identifier, such as an ENS name.
  /// @param scheme An integer identifier for the stealth address scheme.
  /// @param signature A signature from the `registrant` authorizing the registration.
  /// @param stealthMetaAddress The stealth meta-address to register.
  /// @dev MUST support both EOA signatures and EIP-1271 signatures.
  /// @dev MUST revert if the signature is invalid.
  function registerKeysOnBehalf(address registrant, uint256 scheme, bytes memory signature, bytes memory stealthMetaAddress) external {
    // TODO If registrant has no code, spit signature into r, s, and v and call `ecrecover`.
    // TODO If registrant has code, call `isValidSignature` on the registrant.
  }

  /// @notice Sets the `registrant`s stealth meta-address for the given scheme.
  /// @param registrant Recipient identifier, such as an ENS name.
  /// @param scheme An integer identifier for the stealth address scheme.
  /// @param signature A signature from the `registrant` authorizing the registration.
  /// @param stealthMetaAddress The stealth meta-address to register.
  /// @dev MUST support both EOA signatures and EIP-1271 signatures.
  /// @dev MUST revert if the signature is invalid.
  function registerKeysOnBehalf(bytes memory registrant, uint256 scheme, bytes memory signature, bytes memory stealthMetaAddress) external {
    // TODO How to best generically support any registrant identifier / name
    // system without e.g. hardcoding support just for ENS?
  }
}
