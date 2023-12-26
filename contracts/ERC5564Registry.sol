pragma solidity ^0.8.19;

// ----------------------------------------------------------------------------
// ERC5564Registry v0.8.0 - Experiments in ERC-5564: Stealth Addresses
//
// From https://eips.ethereum.org/EIPS/eip-6538
//
// Deployed to Sepolia
//
// https://github.com/bokkypoobah/StealthChad
//
// SPDX-License-Identifier: MIT
//
// Enjoy. (c) BokkyPooBah / Bok Consulting Pty Ltd 2023
// ----------------------------------------------------------------------------

import "hardhat/console.sol";

/// @notice Registry to map an address or other identifier to its stealth meta-address.
contract ERC5564Registry {
  /// @dev Emitted when a registrant updates their stealth meta-address.
  event StealthMetaAddressSet(bytes indexed registrant, uint256 indexed scheme, bytes stealthMetaAddress);

  /// @notice Maps a registrant's identifier to the scheme to the stealth meta-address.
  /// @dev Registrant may be a 160 bit address or other recipient identifier, such as an ENS name.
  /// @dev Scheme is an integer identifier for the stealth address scheme.
  /// @dev MUST return zero if a registrant has not registered keys for the given inputs.
  mapping(bytes => mapping(uint256 => bytes)) public stealthMetaAddressOf;

  /// @notice Sets the caller's stealth meta-address for the given stealth address scheme.
  /// @param scheme An integer identifier for the stealth address scheme.
  /// @param stealthMetaAddress The stealth meta-address to register.
  function registerKeys(uint256 scheme, bytes memory stealthMetaAddress) external {
    console.log("msg.sender: ", msg.sender);
    // console.logBytes(abi.encode(msg.sender));
    // console.logBytes(abi.encodePacked(msg.sender));
    bytes memory registrant = abi.encode(msg.sender);
    console.logBytes(registrant);
    stealthMetaAddressOf[abi.encode(msg.sender)][scheme] = stealthMetaAddress;
    // emit StealthMetaAddressSet(abi.encode(msg.sender), scheme, stealthMetaAddress);
    emit StealthMetaAddressSet(registrant, scheme, stealthMetaAddress);

    uint i;
    uint j;
    bytes memory registrantInBytes = new bytes(32);
    bytes32 registrantInBytes32 = bytes32(uint256(uint160(msg.sender)));
    console.logBytes32(registrantInBytes32);
    for (i = 0; i < 32; i++) {
        registrantInBytes[j++] = registrantInBytes32[i];
    }
    emit StealthMetaAddressSet(registrantInBytes, scheme, stealthMetaAddress);
  }

  // function bytesToBytes32(bytes memory inputBytes) public view returns (bytes32 outputBytes32) {
  //     uint value;
  //     for (uint i = 0; i < 32; i++) {
  //         value = value + inputBytes[i] * 2
  //     }
  // }


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
