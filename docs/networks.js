// https://stealthaddress.dev/contracts/deployments
const NETWORKS = {
  1: {
    name: "Ethereum Mainnet",
    explorer: "https://etherscan.io/",
    nonFungibleViewer: "https://opensea.io/assets/ethereum/${contract}/${tokenId}",
    erc20Logos: [
        "https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/ethereum/assets/${contract}/logo.png",
        "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${contract}/logo.png",
    ],
  },
  42161: {
    name: "Arbitrum",
    explorer: "https://arbiscan.io/",
    nonFungibleViewer: "https://opensea.io/assets/arbitrum/${contract}/${tokenId}",
    erc20Logos: [
        "https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/arbitrum/assets/${contract}/logo.png",
        "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/arbitrum/assets/${contract}/logo.png",
    ],
  },
  8453: {
    name: "Base",
    explorer: "https://basescan.org/",
    nonFungibleViewer: "https://opensea.io/assets/base/${contract}/${tokenId}",
    erc20Logos: [
        "https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/base/assets/${contract}/logo.png",
        "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/base/assets/${contract}/logo.png",
    ],
    maxLogScrapingSize: 10_000, // TODO: Base RPC server fails for > 10k blocks for ERC-20 event log scraping
  },
  100: {
    name: "Gnosis Chain",
    explorer: "https://gnosisscan.io/",
  },
  10: {
    name: "Optimism",
    explorer: "https://optimistic.etherscan.io/",
    nonFungibleViewer: "https://opensea.io/assets/optimism/${contract}/${tokenId}",
    erc20Logos: [
        "https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/optimism/assets/${contract}/logo.png",
        "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/optimism/assets/${contract}/logo.png",
    ],
  },
  137: {
    name: "Polygon Matic",
    explorer: "https://polygonscan.com/",
    nonFungibleViewer: "https://opensea.io/assets/matic/${contract}/${tokenId}",
    erc20Logos: [
        "https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/polygon/assets/${contract}/logo.png",
        "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/assets/${contract}/logo.png",
    ],
  },
  534352: {
    name: "Scroll",
    explorer: "https://scrollscan.com/",
    erc20Logos: [
        "https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/scroll/assets/${contract}/logo.png",
        "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/scroll/assets/${contract}/logo.png",
    ],
  },
  11155111: {
    name: "Sepolia Testnet",
    transferHelper: {
      // TODO: ABI & versions
      name: "MagicalInternetMoney-0.8.3",
      address: "0xAd4EFaB0A1c32184c6254e07eb6D26A3AaEB0Ae2",
    },
    explorer: "https://sepolia.etherscan.io/",
    nonFungibleViewer: "https://testnets.opensea.io/assets/sepolia/${contract}/${tokenId}",
    erc20Logos: [
        "https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/sepolia/assets/${contract}/logo.png",
        "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/sepolia/assets/${contract}/logo.png",
    ],
  },
  17000: {
    name: "Holešky Testnet",
    explorer: "https://holesky.etherscan.io/",
  },
  421614: {
    name: "Arbitrum Sepolia Testnet",
    explorer: "https://sepolia.arbiscan.io/",
    nonFungibleViewer: "https://testnets.opensea.io/assets/arbitrum-sepolia/${contract}/${tokenId}",
  },
  84532: {
    name: "Base Sepolia Testnet",
    explorer: "https://sepolia.basescan.org/",
    nonFungibleViewer: "https://testnets.opensea.io/assets/base-sepolia/${contract}/${tokenId}",
  },
  11155420: {
    name: "Optimism Sepolia Testnet",
    explorer: "https://sepolia-optimism.etherscan.io/",
  },
};
