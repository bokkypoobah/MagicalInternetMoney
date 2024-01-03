pragma solidity ^0.8.0;

// ----------------------------------------------------------------------------
// BokkyPooBah's ERC-721 Token
//
// https://github.com/bokkypoobah/StealthChad
//
// SPDX-License-Identifier: MIT
//
// Enjoy. (c) BokkyPooBah / Bok Consulting Pty Ltd 2023. The MIT Licence.
// ----------------------------------------------------------------------------

import "./openzeppelin/token/ERC721/ERC721.sol";

contract ERC721Token is ERC721 {
    constructor() ERC721("ERC-721 Token", "ERC-721") {
    }
}
