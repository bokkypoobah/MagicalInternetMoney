# Magical Internet Money

An implementation of [ERC-5564: Stealth Addresses](https://eips.ethereum.org/EIPS/eip-5564) and [ERC-6538: Stealth Meta-Address Registry](https://eips.ethereum.org/EIPS/eip-6538) (using `address` instead of `bytes`).

Test it at [https://bokkypoobah.github.io/MagicalInternetMoney/](https://bokkypoobah.github.io/MagicalInternetMoney/) (WIP) connected to the Ethereum Sepolia testnet.

<br />

### How The ERC-5564: Stealth Addresses Protocol Works

* Alice wants to pay Bob in ETH/ERC-20/ERC-721 tokens
* Bob generates a *Stealth Meta-Address* and provides this to Alice
* Alice uses Bob's *Stealth Meta-Address* to compute a random *Stealth Address* that can be accessed only by Bob
* Alice transfers the tokens to this address and announces the transfers in the *ERC-5564: Stealth Address Announcer* contract
* Bob can access the private keys to their computed *Stealth Addresses*, using information included in the announcements
* The *ERC-6538: Stealth Meta-Address Registry* allows any account to publish their associated *Stealth Meta-Addresses*

<br />

### How This Dapp Works

This dapp:

* Allows Bob's web3 attached account to generate a unique Stealth Meta-Address for each unique associated phrase
* Allows Alice to compute a random Stealth Address using Bob's Stealth Meta-Address
* Allows Alice to then execute the transfer to Bob's Stealth Address and announce the transfer to the Announcer
* Retrieve all event logs published to the Announcer
* Retrieves all event logs published to the Registry

<br />

---

### Sample Screens

#### Generate And Register New Stealth Meta-Address

##### Generate New Stealth Meta-Address - Initial Addresses

Click [+] from the Addresses menu to access the Stealth Meta-Address generation screen.

<kbd><img src="images/SampleScreen_GenerateStealthMetaAddress_Initial_20240115.png" /></kbd>

##### Generate New Stealth Meta-Address - Generate And Sign

Click [Generate] to generate a new Stealth Meta-Address, then sign the phrase with your web3 attached account.

<kbd><img src="images/SampleScreen_GenerateStealthMetaAddress_GenerateAndSign_20240115.png" /></kbd>

##### Generate New Stealth Meta-Address - After Generation

Click [Add] to add your newly generated Stealth Meta-Address to your addresses.

<kbd><img src="images/SampleScreen_GenerateStealthMetaAddress_AfterGeneration_20240115.png" /></kbd>

##### Generate New Stealth Meta-Address - Add To Registry

Click [Add/Update] to add your newly generated Stealth Meta-Address to the Stealth Address Registry, then sign and send the web3 transaction.

<kbd><img src="images/SampleScreen_GenerateStealthMetaAddress_AddToRegistry_20240115.png" /></kbd>

##### Generate New Stealth Meta-Address - Addresses

<kbd><img src="images/SampleScreen_GenerateStealthMetaAddress_Addresses_20240115.png" /></kbd>

##### Generate New Stealth Meta-Address - Sync

Click [Sync] to retrieve events from the blockchains.

<kbd><img src="images/SampleScreen_GenerateStealthMetaAddress_Sync_20240115.png" /></kbd>

##### Generate New Stealth Meta-Address - Registry

The newly registered Stealth Meta-Address.

<kbd><img src="images/SampleScreen_GenerateStealthMetaAddress_Registry_20240115.png" /></kbd>




<br />

<br />

---

##### After Initial Sync - Activity - Stealth Payment

<kbd><img src="images/SampleScreen_AfterInitialSync_Activity_StealthPayment_20240107.png" /></kbd>

##### After Initial Sync - Registry

Events retrieved from the Registry contract.

<kbd><img src="images/SampleScreen_AfterInitialSync_Registry_20240107.png" /></kbd>

##### After Initial Sync - Registry - Entry

<kbd><img src="images/SampleScreen_AfterInitialSync_Registry_Entry_20240107.png" /></kbd>

##### After Initial Sync - Addresses

<kbd><img src="images/SampleScreen_AfterInitialSync_Addresses_20240107.png" /></kbd>

##### After Initial Sync - Addresses - Stealth Meta-Address Without Keys

<kbd><img src="images/SampleScreen_AfterInitialSync_Addresses_StealthMetaAddress_WithoutKeys_20240107.png" /></kbd>

##### After Initial Sync - Tokens

ERC-20 and ERC-721 token events retrieved for addresses marked "Mine". Active tokens manually clicked.

<kbd><img src="images/SampleScreen_AfterInitialSync_Tokens_20240107.png" /></kbd>

##### After Initial Sync - Config

<kbd><img src="images/SampleScreen_AfterInitialSync_Config_20240107.png" /></kbd>

<br />

---

#### Generate Stealth Meta-Address

##### Generate Stealth Meta-Address - New Address

Click [+] in the Addresses tab.

<kbd><img src="images/SampleScreen_GenerateStealthMetaAddress_NewAddress_20240107.png" /></kbd>

##### Generate Stealth Meta-Address - Web3 Signing

Click [Generate] in the Addresses tab. Sign with your web3 attached address.

<kbd><img src="images/SampleScreen_GenerateStealthMetaAddress_Web3Signing_20240107.png" /></kbd>

##### Generate Stealth Meta-Address - Web3 Signed

Click [Update] to add your stealth keys to your address in the Addresses tab.

<kbd><img src="images/SampleScreen_GenerateStealthMetaAddress_Web3Signed_20240107.png" /></kbd>

##### Generate Stealth Meta-Address - Register Stealth Meta-Address

Click [Add/Update] to add your stealth keys to the Registry.

<kbd><img src="images/SampleScreen_GenerateStealthMetaAddress_RegisterStealthMetaAddress_20240107.png" /></kbd>

<br />

---

#### Sync With Ethereum Mainnet For ENS Names

##### Sync With Ethereum Mainnet For ENS Names - Addresses

Switch to the Ethereum Mainnet network and [Sync]. Switch back to the Sepolia testnet.

<kbd><img src="images/SampleScreen_MainnetSync_Addresses_20240107.png" /></kbd>


<br />

---

#### After Sync With Generated Stealth Meta-Address

##### After Sync With Generated Stealth Meta-Address - Activity

Click [Sync]. Transfers associated with my stealth keys are identified.

<kbd><img src="images/SampleScreen_AfterSyncWithGeneratedStealthMetaAddress_Activity_20240107.png" /></kbd>

##### After Sync With Generated Stealth Meta-Address - Transfer

<kbd><img src="images/SampleScreen_AfterSyncWithGeneratedStealthMetaAddress_Transfer_20240107.png" /></kbd>

##### After Sync With Generated Stealth Meta-Address - Transfer - Web3 Sign To Reveal Spending Private Key

<kbd><img src="images/SampleScreen_AfterSyncWithGeneratedStealthMetaAddress_Transfer_Web3SignToRevealSpendingPrivateKey_20240107.png" /></kbd>

##### After Sync With Generated Stealth Meta-Address - Transfer - Spending Private Key Imported Into Web3 Wallet

<kbd><img src="images/SampleScreen_AfterSyncWithGeneratedStealthMetaAddress_Transfer_SpendingPrivateKeyImportedIntoWeb3Wallet_20240107.png" /></kbd>

<br />

---

#### Transferring Ethers To A Stealth Address

##### Transferring Ethers To A Stealth Address - Select Stealth Meta-Address

Click [>] in the Addresses tab. Using a separate account for sending in this example.

<kbd><img src="images/SampleScreen_TransferringEthersToAStealthAddress_SelectStealthMetaAddress_20240107.png" /></kbd>


##### Transferring Ethers To A Stealth Address - Select Stealth Meta-Address

Click [>] in the Addresses tab. Using a separate account for sending in this example.

<kbd><img src="images/SampleScreen_TransferringEthersToAStealthAddress_SelectStealthMetaAddress_20240107.png" /></kbd>


##### Transferring Ethers To A Stealth Address - Enter Amount

Enter amount.

<kbd><img src="images/SampleScreen_TransferringEthersToAStealthAddress_EnterAmount.png" /></kbd>

##### Transferring Ethers To A Stealth Address - Web3 Sign

Click [Transfer] and sign with your web3 account.

<kbd><img src="images/SampleScreen_TransferringEthersToAStealthAddress_Web3Sign.png" /></kbd>

##### Transferring Ethers To A Stealth Address - Activity After Transfer

Click [Sync] and new transfer will appear. They stealth transfer has been identified as it is associated with my first account.

<kbd><img src="images/SampleScreen_TransferringEthersToAStealthAddress_ActivityAfterTransfer.png" /></kbd>

##### Transferring Ethers To A Stealth Address - Revealing Stealth Private Key

Click the [eye] button and web3 sign to reveal your spending private key. The private key has been imported into my web3 wallet.

<kbd><img src="images/SampleScreen_TransferringEthersToAStealthAddress_RevealingStealthPrivateKey.png" /></kbd>





<br />

---

## References

* [ERC-5564: Stealth Addresses](https://eips.ethereum.org/EIPS/eip-5564)
* [ERC-6538: Stealth Meta-Address Registry](https://eips.ethereum.org/EIPS/eip-6538)
* https://github.com/nerolation/stealth-wallet
  * https://stealth-wallet.xyz/
  * https://nerolation.github.io/stealth-utils/ from https://github.com/nerolation/stealth-utils
  * [StealthTransactionHelper on Sepolia](https://sepolia.etherscan.io/address/0x054Aa0E0b4C92142a583fDfa9369FF3558F8dea4#code)
* https://github.com/kassandraoftroy/erc5564-contracts
* [An incomplete guide to stealth addresses](https://vitalik.eth.limo/general/2024/01/20/stealth.html)
* [ERC-5564 Stealth Addresses](https://ethereum-magicians.org/t/erc-5564-stealth-addresses/10614)
* [EIP-5564: Improving Privacy on Ethereum through Stealth Address Wallets](https://medium.com/@toni_w/eip-5564-improving-privacy-on-ethereum-through-stealth-address-wallets-fdf3250e81a1)
* [Ethereum stealth addresses (ERC-5564) library](https://github.com/jsign/zig-stealth-addresses)
* https://github.com/paulmillr/noble-curves

<br />

---

## Deployments

* [ERC5564Announcer.sol v0.8.1](deployed/ERC5564Announcer_v0.8.1_Sepolia_0xFe6335f5dc5a469e74fB6a9FDAe116bFD5346365.sol) on Sepolia [0xFe6335f5dc5a469e74fB6a9FDAe116bFD5346365](https://sepolia.etherscan.io/address/0xFe6335f5dc5a469e74fB6a9FDAe116bFD5346365#code)
* [ERC5564Registry.sol v0.8.1](deployed/ERC5564Registry_v0.8.1_Sepolia_0x5F8ac9e3B2DD28cA2c9bc7A992Ce36c3C4929Cde.sol) on Sepolia [0x5F8ac9e3B2DD28cA2c9bc7A992Ce36c3C4929Cde](https://sepolia.etherscan.io/address/0x5F8ac9e3B2DD28cA2c9bc7A992Ce36c3C4929Cde#code)
* [StealthChad.sol v0.8.1](deployed/StealthChad_v0.8.1_Sepolia_0xA745760E9f1E425215CCD7735F932FdDE3276344.sol) on Sepolia [0xA745760E9f1E425215CCD7735F932FdDE3276344](https://sepolia.etherscan.io/address/0xA745760E9f1E425215CCD7735F932FdDE3276344#code)


<br />

<br />

Enjoy!

(c) BokkyPooBah / Bok Consulting Pty Ltd 2024. The MIT Licence.
