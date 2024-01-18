async function getAccountInfo(address, provider) {
  // console.log("getAccountInfo(" + address + ")");
  const results = {};

  let account = null;
  try {
    account = ethers.utils.getAddress(address);
    // console.log("checksummed account: " + account);
  } catch (e) {
    console.log(e.toString());
  }

  if (account) {
    results.account = account;
    if (account in _CUSTOMACCOUNTS) {
      results.mask = _CUSTOMACCOUNTS[account].mask;
      results.symbol = _CUSTOMACCOUNTS[account].symbol;
      results.name = _CUSTOMACCOUNTS[account].name;
      results.decimals = _CUSTOMACCOUNTS[account].decimals;
    } else {
      const erc721Helper = new ethers.Contract(ERC721HELPERADDRESS, ERC721HELPERABI, provider); // network.erc721HelperAddress
      try {
        const tokenInfos = await erc721Helper.tokenInfo([account], { gasLimit: 1000000 });
        for (let i = 0; i < tokenInfos[0].length; i++) {
          results.mask = tokenInfos[0][i].toNumber();
          results.symbol = tokenInfos[1][i];
          results.name = tokenInfos[2][i];
        }
      } catch (e) {
        console.log("getAccountInfo ERROR - account: " + account + ", message: " + e.message);
        results.mask = 0;
        results.symbol = null;
        results.name = null;
      }
      results.decimals = null;
      if ((results.mask & MASK_ISERC20) == MASK_ISERC20) {
        const erc20 = new ethers.Contract(account, ERC20ABI, provider);
        try {
          results.decimals = ethers.BigNumber.from(await erc20.decimals()).toString();
        } catch (e) {
          console.log("getAccountInfo ERROR - decimals - account: " + account + ", message: " + e.message);
        }
      }
    }
    if ((results.mask & MASK_ISERC721) == MASK_ISERC721 || (results.mask & MASK_ISCONTRACT) == MASK_ISCONTRACT) {
      if (account == "0x6Ba6f2207e343923BA692e5Cae646Fb0F566DB8D") {
        results.name = "CryptoPunksV1";
        results.slug = "cryptopunksv1";
        results.image = "https://i.seadn.io/gae/_-UU9HXutEr8rZy9X9KlJT2YFwMa___lXYgIeUPKkjRv3KDbBKtbo3E3isAc2QIEEJmEfSf0Ni8U8tudLkJy6dwqIqNO3E5zG3T4EQ?auto=format&w=1000";
      } else {
        let url = "https://api.reservoir.tools/collections/v5?contract=" + account;
        // console.log("url: " + url);
        const data = await fetch(url)
          .then(handleErrors)
          .then(response => response.json())
          .catch(function(error) {
             console.log("ERROR - updateCollection: " + error);
             // state.sync.error = true;
             return [];
          });
        if (data && data.collections && data.collections.length == 1) {
          const collectionInfo = data.collections[0];
          results.name = collectionInfo.name;
          results.slug = collectionInfo.slug;
          results.image = collectionInfo.image;
        }
      }
    }
    if ((results.mask & MASK_ISEOA) == MASK_ISEOA) {
      results.type = "eoa";
    } else if ((results.mask & MASK_ISERC721) == MASK_ISERC721) {
      results.type = "erc721";
    } else if ((results.mask & MASK_ISERC20) == MASK_ISERC20) {
      results.type = "erc20";
    } else if ((results.mask & MASK_ISCONTRACT) == MASK_ISCONTRACT) {
      // CryptoPunks V1 & CryptoPunks - Exclude Transfer and replace with Assign, PunkTransfer & PunkBought
      if (account == "0x6Ba6f2207e343923BA692e5Cae646Fb0F566DB8D" || account == "0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB") {
        results.type = "preerc721";
      } else {
        if (results.collection) {
          results.type = "erc1155";
        } else {
          results.type = "contract";
        }
      }
    } else {
      results.type = null;
    }
    // const ethBalance = await provider.getBalance(account);
    // const weth = new ethers.Contract(WETHADDRESS, WETHABI, provider); // network.wethAddress
    // const wethBalance = await weth.balanceOf(account);
    // results.balances = {
    //   "eth": ethers.BigNumber.from(ethBalance).toString(),
    //   "weth": ethers.BigNumber.from(wethBalance).toString(),
    // };
  }
  // console.log("results: " + JSON.stringify(results, null, 2));
  return results;
}
