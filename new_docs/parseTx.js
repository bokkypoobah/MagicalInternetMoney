function getTokenContractInfo(contract, accounts) {
  // console.log("getTokenContractInfo - contract: " + contract);
  let name = null;
  let symbol = null;
  let decimals = 18;
  if (contract in accounts) {
    const account = accounts[contract];
    name = account.contract && account.contract.name || null;
    symbol = account.contract && account.contract.symbol || null;
    decimals = account.contract && account.contract.decimals || 18;
  }
  if (name == null || name.length == 0) {
    name = contract;
  }
  if (symbol == null || symbol.length == 0) {
    symbol = "???";
  }
  return { name, symbol, decimals };
}


let _interfaces = null;
function getInterfaces() {
  if (!_interfaces) {
    _interfaces = {
      erc721: new ethers.utils.Interface(ERC721ABI),
      erc1155: new ethers.utils.Interface(ERC1155ABI),
      weth: new ethers.utils.Interface(_CUSTOMACCOUNTS["0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"].abi),
      seaport: new ethers.utils.Interface(_CUSTOMACCOUNTS["0x00000000006c3852cbEf3e08E8dF289169EdE581"].abi),
      blur: new ethers.utils.Interface(_CUSTOMACCOUNTS["0x000000000000Ad05Ccc4F10045630fb830B95127"].abi),
      wyvern: new ethers.utils.Interface(_CUSTOMACCOUNTS["0x7Be8076f4EA4A4AD08075C2508e481d6C946D12b"].abi),
      looksRare: new ethers.utils.Interface(_CUSTOMACCOUNTS["0x59728544B08AB483533076417FbBB2fD0B17CE3a"].abi),
      x2y2: new ethers.utils.Interface(_CUSTOMACCOUNTS["0x74312363e45DCaBA76c59ec49a7Aa8A65a67EeD3"].abi),
      nftx: new ethers.utils.Interface(_CUSTOMACCOUNTS["0x0fc584529a2AEfA997697FAfAcbA5831faC0c22d"].abi),
      ensRegistrarController: new ethers.utils.Interface(_CUSTOMACCOUNTS["0x283Af0B28c62C092C9727F1Ee09c02CA627EB7F5"].abi),
      cryptoPunks: new ethers.utils.Interface(_CUSTOMACCOUNTS["0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB"].abi),
      moonCatRescue: new ethers.utils.Interface(_CUSTOMACCOUNTS["0x60cd862c9C687A9dE49aecdC3A99b74A4fc54aB6"].abi),
    };
  }
  return _interfaces;
}


function getEvents(account, accounts, eventSelectors, preERC721s, txData) {
  const interfaces = getInterfaces();

  const myEvents = [];
  const receivedNFTEvents = [];
  const sentNFTEvents = [];
  const receivedERC20Events = [];
  const sentERC20Events = [];


  const erc20Events = [];
  const wethDepositEvents = [];
  const wethWithdrawalEvents = [];
  const erc721Events = [];
  const erc1155Events = [];
  const erc1155BatchEvents = [];
  const nftExchangeEvents = [];
  const ensEvents = [];
  const sentInternalEvents = [];
  const receivedInternalEvents = [];
  const erc20FromMap = {};
  const erc20ToMap = {};
  for (const [eventIndex, event] of txData.txReceipt.logs.entries()) {

    const topic = eventSelectors[event.topics[0]] || null;
    // console.log(event.topics[0] + " => " + topic);

    // if (event.address in preERC721s) {
    //   console.log("preERC721s[" + event.address + "] => " + preERC721s[event.address]);
    // }
    // console.log(topic + " " + JSON.stringify(event));
    // ERC-20 event Transfer(address indexed _from, address indexed _to, uint256 _value)
    // ERC-721 event Transfer(address indexed _from, address indexed _to, uint256 indexed _tokenId);
    // CryptoVoxels ERC-721 @ 0x79986aF15539de2db9A5086382daEdA917A9CF0C uses ERC-20 style
    // CryptoKitties ERC-721 @ 0x06012c8cf97BEaD5deAe237070F9587f8E7A266d has unindexed parameters

    if (topic == "Transfer(address,address,uint256)") {
      let [from, to, tokensOrTokenId] = [null, null, null];
      if (event.topics.length == 4) {
        from = ethers.utils.getAddress("0x" + event.topics[1].substring(26));
        to = ethers.utils.getAddress("0x" + event.topics[2].substring(26));
        tokensOrTokenId = ethers.BigNumber.from(event.topics[3]).toString();
      } else if (event.topics.length == 3) {
        from = ethers.utils.getAddress("0x" + event.topics[1].substring(26));
        to = ethers.utils.getAddress("0x" + event.topics[2].substring(26));
        tokensOrTokenId = ethers.BigNumber.from(event.data).toString();
      } else if (event.topics.length == 1) {
        from = ethers.utils.getAddress("0x" + event.data.substring(26, 66));
        to = ethers.utils.getAddress("0x" + event.data.substring(90, 130));
        tokensOrTokenId = ethers.BigNumber.from("0x" + event.data.substring(130, 193)).toString();
      }

      if (event.address == "0x6Ba6f2207e343923BA692e5Cae646Fb0F566DB8D" || event.address == "0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB") {
        for (const [nextEventIndex, nextEvent] of txData.txReceipt.logs.slice(eventIndex).entries()) {
          if (nextEvent.address == "0x6Ba6f2207e343923BA692e5Cae646Fb0F566DB8D" || nextEvent.address == "0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB") {
            const interface = new ethers.utils.Interface(_CUSTOMACCOUNTS[nextEvent.address].abi);
            const log = interface.parseLog(nextEvent);
            if (log.name == "PunkTransfer") {
              const [from, to, punkIndex] = log.args;
              tokensOrTokenId = punkIndex.toString();
              break;
            } else if (log.name == "PunkBought") {
              const [punkIndex, value, fromAddress, toAddress] = log.args;
              tokensOrTokenId = punkIndex.toString();
              break;
            }
          }
        }
      } else if (event.address == "0x60cd862c9C687A9dE49aecdC3A99b74A4fc54aB6") {
        // console.log("MoonCatRescue.Transfer");
        for (const [nextEventIndex, nextEvent] of txData.txReceipt.logs.slice(eventIndex).entries()) {
          if (nextEvent.address == "0x60cd862c9C687A9dE49aecdC3A99b74A4fc54aB6") {
            const interface = new ethers.utils.Interface(_CUSTOMACCOUNTS[nextEvent.address].abi);
            const log = interface.parseLog(nextEvent);
            // console.log("log: " + JSON.stringify(log));
            //   event CatAdopted(bytes5 indexed catId, uint price, address indexed from, address indexed to);
            if (log.name == "CatAdopted") {
              const [catId, price, from, to] = log.args;
              const rescueIndex = getMoonCatRescueLookup()[catId] || "?";
              // console.log("MoonCatRescue.Transfer: " + catId + " => " + rescueIndex);
              tokensOrTokenId = rescueIndex.toString();
              break;
            }
          }
        }
      }

      // console.log("from: " + from + ", to: " + to + ", tokensOrTokenId: " + tokensOrTokenId);
      // ERC-721 Transfer, including pre-ERC721s like CryptoPunks, MoonCatRescue, CryptoCats, CryptoVoxels & CryptoKitties
      if (event.topics.length == 4 || (event.address in preERC721s)) {
        const nftType = (event.address in preERC721s) ? "preerc721" : "erc721";
        if (to == account) {
          const record = { type: nftType, logIndex: event.logIndex, contract: event.address, from, to, tokenId: tokensOrTokenId };
          receivedNFTEvents.push(record);
          myEvents.push(record);
        } else if (from == account) {
          const record = { type: nftType, logIndex: event.logIndex, contract: event.address, from, to, tokenId: tokensOrTokenId };
          sentNFTEvents.push(record);
          myEvents.push(record);
        }
        // TODO: Remove below
        erc721Events.push({ logIndex: event.logIndex, contract: event.address, from, to, tokenId: tokensOrTokenId });
        // ERC-20 Transfer
      } else {
        if (to == account) {
          const record = { type: "erc20", logIndex: event.logIndex, contract: event.address, from, to, tokens: tokensOrTokenId };
          receivedERC20Events.push(record);
          myEvents.push(record);
        } else if (from == account) {
          const record = { type: "erc20", logIndex: event.logIndex, contract: event.address, from, to, tokens: tokensOrTokenId };
          sentERC20Events.push(record);
          myEvents.push(record);
        }
        erc20Events.push({ logIndex: event.logIndex, contract: event.address, from, to, tokens: tokensOrTokenId });
        if (!(from in erc20FromMap)) {
          erc20FromMap[from] = 1;
        } else {
          erc20FromMap[from] = parseInt(erc20FromMap[from]) + 1;
        }
        if (!(to in erc20ToMap)) {
          erc20ToMap[to] = 1;
        } else {
          erc20ToMap[to] = parseInt(erc20ToMap[to]) + 1;
        }
      }

    } else if (topic == "Assign(address,uint256)") {
      if (event.address == "0x6Ba6f2207e343923BA692e5Cae646Fb0F566DB8D" || event.address == "0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB") {
        const interface = new ethers.utils.Interface(_CUSTOMACCOUNTS[event.address].abi);
        const log = interface.parseLog(event);
        const [to, tokenId] = log.args;
        if (to == account) {
          myEvents.push({ type: "preerc721", logIndex: event.logIndex, contract: event.address, from: ADDRESS0, to, tokenId: tokenId.toString() });
        }
      } else {
        // TODO - CryptoCats
        // console.log(txData.tx.hash + " Unhandled " + topic + " for " + event.address + " - " + JSON.stringify(event));
        // stop.here();
      }

    // } else if (topic == "PunkTransfer(address,address,uint256)") {
    //   const interface = new ethers.utils.Interface(_CUSTOMACCOUNTS[event.address].abi);
    //   const log = interface.parseLog(event);
    //   const [from, to, tokenId] = log.args;
    //   if (from == account || to == account) {
    //     myEvents.push({ type: "preerc721", logIndex: event.logIndex, contract: event.address, from, to, tokenId: tokenId.toString() });
    //   }
    //
    // } else if (topic == "PunkBought(uint256,uint256,address,address)") {
    //   const interface = new ethers.utils.Interface(_CUSTOMACCOUNTS[event.address].abi);
    //   const log = interface.parseLog(event);
    //   const [tokenId, value, from, to] = log.args;
    //   if (from == account || to == account) {
    //     myEvents.push({ type: "preerc721", logIndex: event.logIndex, contract: event.address, from, to, tokenId: tokenId.toString() });
    //   }

    } else if (topic == "CatRescued(address,bytes5)") {
      const interface = new ethers.utils.Interface(_CUSTOMACCOUNTS[event.address].abi);
      const log = interface.parseLog(event);
      // console.log("CatRescued: " + JSON.stringify(log));
      const [to, catId] = log.args;
      const rescueIndex = getMoonCatRescueLookup()[catId] || "?";
      // console.log(catId + " => " + rescueIndex);
      if (to == account) {
        myEvents.push({ type: "preerc721", logIndex: event.logIndex, contract: event.address, from: ADDRESS0, to, tokenId: rescueIndex, catId: catId.toString() });
      }
      // console.log("CatRescued: " + JSON.stringify(myEvents));

      // ERC-1155 TransferSingle (index_topic_1 address _operator, index_topic_2 address _from, index_topic_3 address _to, uint256 _id, uint256 _value)
    } else if (event.topics[0] == "0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62") {
      const operator = ethers.utils.getAddress("0x" + event.topics[1].substring(26));
      const from = ethers.utils.getAddress("0x" + event.topics[2].substring(26));
      const to = ethers.utils.getAddress("0x" + event.topics[3].substring(26));
      const tokenId = ethers.BigNumber.from(event.data.substring(0, 66)).toString();
      const tokens = ethers.BigNumber.from("0x" + event.data.substring(67, 130)).toString();

      if (to == account) {
        const record = { type: "erc1155", logIndex: event.logIndex, contract: event.address, operator, from, to, tokenId, tokens };
        receivedNFTEvents.push(record);
        myEvents.push(record);
      } else if (from == account) {
        const record = { type: "erc1155", logIndex: event.logIndex, contract: event.address, operator, from, to, tokenId, tokens };
        sentNFTEvents.push(record);
        myEvents.push(record);
      }

      // TODO: Remove below
      erc1155Events.push({ logIndex: event.logIndex, contract: event.address, operator, from, to, tokenId, tokens });

      // ERC-1155 TransferBatch (index_topic_1 address operator, index_topic_2 address from, index_topic_3 address to, uint256[] ids, uint256[] values)
    } else if (event.topics[0] == "0x4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb") {
      const log = interfaces.erc1155.parseLog(event);
      const [operator, from, to, tokenIds, tokens] = log.args;
      const tokenIdsToString = tokenIds.map(e => ethers.BigNumber.from(e).toString());
      const tokensToString = tokens.map(e => ethers.BigNumber.from(e).toString());

      if (to == account) {
        const record = { type: "erc1155batch", logIndex: event.logIndex, contract: event.address, operator, from, to, tokenIds: tokenIdsToString, tokens: tokensToString };
        receivedNFTEvents.push(record);
        myEvents.push(record);
      } else if (from == account) {
        const record = { type: "erc1155batch", logIndex: event.logIndex, contract: event.address, operator, from, to, tokenIds: tokenIdsToString, tokens: tokensToString };
        sentNFTEvents.push(record);
        myEvents.push(record);
      }

      // TODO: Remove below
      erc1155BatchEvents.push({ logIndex: event.logIndex, contract: event.address, operator, from, to, tokenIds: tokenIdsToString, tokens: tokensToString });

    //   // CryptoPunks V1 & CryptoPunks - Exclude Transfer and replace with PunkTransfer
    // } else if (event.address == "0x6Ba6f2207e343923BA692e5Cae646Fb0F566DB8D" || event.address == "0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB") {
    //   console.log("PunkTransfer & *")

      // ENS ETHRegistrarController
    } else if (event.address == "0x283Af0B28c62C092C9727F1Ee09c02CA627EB7F5") {
      const log = interfaces.ensRegistrarController.parseLog(event);
      if (log.name == "NameRegistered") {
        const [name, label, owner, cost, expires] = log.args;
        const tokenId = ethers.BigNumber.from(label).toString();
        // console.log("Registered: 0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85/" + tokenId);
        ensEvents.push({ logIndex: event.logIndex, contract: "0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85", tokenId, type: log.name, name, label, owner, cost: ethers.BigNumber.from(cost).toString(), expires: ethers.BigNumber.from(expires).toString() });
      } else if (log.name == "NameRenewed") {
        const [name, label, cost, expires] = log.args;
        ensEvents.push({ logIndex: event.logIndex, contract: event.address, type: log.name, name, label, cost: ethers.BigNumber.from(cost).toString(), expires: ethers.BigNumber.from(expires).toString() });
      }
      // WETH
    } else if (event.address == "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2") {
      const log = interfaces.weth.parseLog(event);
      // Deposit (index_topic_1 address dst, uint256 wad)
      if (event.topics[0] == "0xe1fffcc4923d04b559f4d29a8bfc6cda04eb5b0d3c460751c2402c5c5cc9109c") {
        const [to, tokens] = log.args;
        wethDepositEvents.push({ logIndex: event.logIndex, contract: event.address, to, tokens: ethers.BigNumber.from(tokens).toString() });
      // Withdrawal (index_topic_1 address src, uint256 wad)
      } else if (event.topics[0] == "0x7fcf532c15f0a6db0bd6d0e038bea71d30d808c7d98cb3bf7268a95bf5081b65") {
        const [from, tokens] = log.args;
        wethWithdrawalEvents.push({ logIndex: event.logIndex, contract: event.address, from, tokens: ethers.BigNumber.from(tokens).toString() });
      }
      // ERC-20 Exchange Events
    // } else if (event.address == "0x00000000006c3852cbEf3e08E8dF289169EdE581") {
      // Seaport
    } else if (event.address == "0x00000000006c3852cbEf3e08E8dF289169EdE581") {
      const log = interfaces.seaport.parseLog(event);
      if (log.name == "OrderFulfilled") {
        const [orderHash, offerer, zone, recipient, offer, consideration] = log.args;
        const offers = [];
        const considerations = [];
        for (let i = 0; i < offer.length; i++) {
          const [itemType, token, identifier, amount] = offer[i];
          offers.push({ itemType, token, identifier: ethers.BigNumber.from(identifier).toString(), amount: ethers.BigNumber.from(amount).toString() });
        }
        for (let i = 0; i < consideration.length; i++) {
          const [itemType, token, identifier, amount, recipient] = consideration[i];
          considerations.push({ itemType, token, identifier: ethers.BigNumber.from(identifier).toString(), amount: ethers.BigNumber.from(amount).toString(), recipient });
        }
        nftExchangeEvents.push({ logIndex: event.logIndex, contract: event.address, exchange: "Seaport", name: "OrderFulfilled", orderHash, offerer, zone, offers, considerations });
      }
      // Blur
    } else if (event.address == "0x000000000000Ad05Ccc4F10045630fb830B95127") {
      const log = interfaces.blur.parseLog(event);
      // event OrdersMatched(
      //     address indexed maker,
      //     address indexed taker,
      //     Order sell,
      //     bytes32 sellHash,
      //     Order buy,
      //     bytes32 buyHash
      // );
      // struct Order {
      //     address trader;
      //     Side side;
      //     address matchingPolicy;
      //     address collection;
      //     uint256 tokenId;
      //     uint256 amount;
      //     address paymentToken;
      //     uint256 price;
      //     uint256 listingTime;
      //     /* Order expiration timestamp - 0 for oracle cancellations. */
      //     uint256 expirationTime;
      //     Fee[] fees;
      //     uint256 salt;
      //     bytes extraParams;
      // }
      // struct Fee {
      //     uint16 rate;
      //     address payable recipient;
      // }
      if (log.name == "OrdersMatched") {
        const [maker, taker, sell, sellHash, buy, buyHash] = log.args;
        let [trader, side, matchingPolicy, collection, tokenId, amount, paymentToken, price, listingTime, expirationTime, fees, salt, extraParams] = sell;
        const sellData = {
          trader,
          side,
          matchingPolicy,
          collection,
          tokenId: ethers.BigNumber.from(tokenId).toString(),
          amount: ethers.BigNumber.from(amount).toString(),
          paymentToken,
          price: ethers.BigNumber.from(price).toString(),
          listingTime: ethers.BigNumber.from(listingTime).toString(),
          expirationTime: ethers.BigNumber.from(expirationTime).toString(),
          fees, // TODO
          salt: ethers.BigNumber.from(salt).toString(),
          extraParams,
        };
        [trader, side, matchingPolicy, collection, tokenId, amount, paymentToken, price, listingTime, expirationTime, fees, salt, extraParams] = buy;
        const buyData = {
          trader,
          side,
          matchingPolicy,
          collection,
          tokenId: ethers.BigNumber.from(tokenId).toString(),
          amount: ethers.BigNumber.from(amount).toString(),
          paymentToken,
          price: ethers.BigNumber.from(price).toString(),
          listingTime: ethers.BigNumber.from(listingTime).toString(),
          expirationTime: ethers.BigNumber.from(expirationTime).toString(),
          fees, // TODO
          salt: ethers.BigNumber.from(salt).toString(),
          extraParams,
        };
        nftExchangeEvents.push({ logIndex: event.logIndex, contract: event.address, exchange: "Blur", name: "OrdersMatched", maker, taker, sell: sellData, sellHash, buy: buyData, buyHash });
      }
      // WyvernExchange - 2018 version
    } else if (event.address == "0x7Be8076f4EA4A4AD08075C2508e481d6C946D12b") {
      const log = interfaces.wyvern.parseLog(event);
      if (log.name == "OrdersMatched") {
        const [buyHash, sellHash, maker, taker, price, metadata] = log.args;
        nftExchangeEvents.push({ logIndex: event.logIndex, contract: event.address, exchange: "WyvernExchange", name: "OrdersMatched", maker, taker, price: ethers.BigNumber.from(price).toString(), metadata });
      }
      // WyvernExchange - 2022 version
    } else if (event.address == "0x7f268357A8c2552623316e2562D90e642bB538E5") {
      const log = interfaces.wyvern.parseLog(event);
      if (log.name == "OrdersMatched") {
        const [buyHash, sellHash, maker, taker, price, metadata] = log.args;
        nftExchangeEvents.push({ logIndex: event.logIndex, contract: event.address, exchange: "WyvernExchange", name: "OrdersMatched", maker, taker, price: ethers.BigNumber.from(price).toString(), metadata });
      }
      // LooksRareExchange
    } else if (event.address == "0x59728544B08AB483533076417FbBB2fD0B17CE3a") {
      const log = interfaces.looksRare.parseLog(event);
      if (log.name == "TakerAsk") {
        const [orderHash, orderNonce, taker, maker, strategy, currency, collection, tokenId, amount, price] = log.args;
        nftExchangeEvents.push({
          logIndex: event.logIndex,
          contract: event.address,
          exchange: "LooksRareExchange",
          name: "TakerAsk",
          orderHash,
          orderNonce: ethers.BigNumber.from(orderNonce).toString(),
          taker,
          maker,
          strategy,
          currency,
          collection,
          tokenId: ethers.BigNumber.from(tokenId).toString(),
          amount: ethers.BigNumber.from(amount).toString(),
          price: ethers.BigNumber.from(price).toString(),
        });
        // TODO: RoyaltyPayment & TakerBid?
      } else if (log.name != "RoyaltyPayment") {
        console.log("LooksRareExchange: " + JSON.stringify(log));
      }
      // X2Y2_r1
    } else if (event.address == "0x74312363e45DCaBA76c59ec49a7Aa8A65a67EeD3") {
      const log = interfaces.x2y2.parseLog(event);
      if (log.name == "EvProfit") {
        const [itemHash, currency, to, amount] = log.args;
        nftExchangeEvents.push({
          logIndex: event.logIndex,
          contract: event.address,
          exchange: "X2Y2_r1",
          name: "EvProfit",
          itemHash,
          currency,
          to,
          amount: ethers.BigNumber.from(amount).toString(),
        });
      } else if (log.name == "EvInventory") {
        const [itemHash, maker, taker, orderSalt, settleSalt, intent, delegateType, deadline, currency, dataMask, item, detail] = log.args;
        const [price, data] = item;
        const [op, orderIdx, itemIdx, price1, itemHash1, executionDelegate, dataReplacement, bidIncentivePct, aucMinIncrementPct, aucIncDurationSecs, fees] = detail;
        const feesData = [];
        for (let i = 0; i < fees.length; i++) {
          const [percentage, to] = fees[i];
          feesData.push({ percentage: ethers.BigNumber.from(percentage).toString(), to });
        }
        nftExchangeEvents.push({
          logIndex: event.logIndex,
          contract: event.address,
          exchange: "X2Y2_r1",
          name: "EvInventory",
          itemHash,
          maker,
          taker,
          orderSalt: ethers.BigNumber.from(orderSalt).toString(),
          settleSalt: ethers.BigNumber.from(settleSalt).toString(),
          intent: ethers.BigNumber.from(intent).toString(),
          delegateType: ethers.BigNumber.from(delegateType).toString(),
          delegateType: ethers.BigNumber.from(delegateType).toString(),
          currency,
          dataMask,
          item: {
            price: ethers.BigNumber.from(price).toString(),
            data,
          },
          detail: {
            op,
            orderIdx: ethers.BigNumber.from(orderIdx).toString(),
            itemIdx: ethers.BigNumber.from(itemIdx).toString(),
            price: ethers.BigNumber.from(price1).toString(),
            itemHash,
            executionDelegate,
            dataReplacement,
            bidIncentivePct: ethers.BigNumber.from(bidIncentivePct).toString(),
            aucMinIncrementPct: ethers.BigNumber.from(aucMinIncrementPct).toString(),
            aucIncDurationSecs: ethers.BigNumber.from(aucIncDurationSecs).toString(),
            fees: feesData,
          },
        });
      }
      // NFTX
    } else if (event.address == "0x0fc584529a2AEfA997697FAfAcbA5831faC0c22d") {
      const log = interfaces.nftx.parseLog(event);
      if (log.name == "Buy") {
        const [count, ethSpent, to] = log.args;
        nftExchangeEvents.push({
          logIndex: event.logIndex,
          contract: event.address,
          exchange: "NFTXMarketplaceZap",
          name: "Buy",
          count: ethers.BigNumber.from(count).toString(),
          ethSpent: ethers.BigNumber.from(ethSpent).toString(),
          to,
        });
      } else if (log.name == "Sell") {
        const [count, ethReceived, to] = log.args;
        nftExchangeEvents.push({
          logIndex: event.logIndex,
          contract: event.address,
          exchange: "NFTXMarketplaceZap",
          name: "Sell",
          count: ethers.BigNumber.from(count).toString(),
          ethReceived: ethers.BigNumber.from(ethReceived).toString(),
          to,
        });
      } else if (log.name == "Swap") {
        const [count, ethSpent, to] = log.args;
        nftExchangeEvents.push({
          logIndex: event.logIndex,
          contract: event.address,
          exchange: "NFTXMarketplaceZap",
          name: "Swap",
          count: ethers.BigNumber.from(count).toString(),
          ethSpent: ethers.BigNumber.from(ethSpent).toString(),
          to,
        });
      }
    }
  }

  for (const [txHash, traceData] of Object.entries(accounts[account].internalTransactions)) {
    if (txHash == txData.tx.hash) {
      for (const [traceId, internalTransaction] of Object.entries(traceData)) {
        const from = ethers.utils.getAddress(internalTransaction.from);
        const to = ethers.utils.getAddress(internalTransaction.to);
        if (from == account) {
          sentInternalEvents.push({ from, to, value: ethers.BigNumber.from(internalTransaction.value).toString() });
        } else if (to == account) {
          receivedInternalEvents.push({ from, to, value: ethers.BigNumber.from(internalTransaction.value).toString() });
        }
      }
    }
  }
  return { myEvents, receivedNFTEvents, sentNFTEvents, receivedERC20Events, sentERC20Events, erc20Events, wethDepositEvents, wethWithdrawalEvents, erc721Events, erc1155Events, erc1155BatchEvents, erc20FromMap, erc20ToMap, nftExchangeEvents, ensEvents, sentInternalEvents, receivedInternalEvents };
}


// async function accumulateTxResults(provider, account, accumulatedData, txData, block, results) {
//   if (!('ethBalance' in accumulatedData)) {
//     accumulatedData.ethBalance = ethers.BigNumber.from(0);
//   }
//   accumulatedData.ethBalancePrev = accumulatedData.ethBalance;
//   accumulatedData.ethBalance = accumulatedData.ethBalance.add(results.ethReceived).sub(results.ethPaid).sub(results.txFee);
//
//   const DEBUG = false;
//   if (results.info) {
//     if (!DEBUG) {
//       console.log(moment.unix(block.timestamp).format("YYYY-MM-DD HH:mm:ss") + " " + results.info);
//     }
//   } else {
//     console.log(moment.unix(block.timestamp).format("YYYY-MM-DD HH:mm:ss") + " TODO " + txData.tx.from.substring(0, 12) + (txData.tx.to && (" -> " + txData.tx.to) || ''));
//   }
//   if (!DEBUG || !results.info) {
//     console.log("  " + txData.tx.blockNumber + " " + txData.tx.transactionIndex + " " + txData.tx.hash +
//       " " + ethers.utils.formatEther(accumulatedData.ethBalance) +
//       "Ξ = " + ethers.utils.formatEther(accumulatedData.ethBalancePrev) +
//       "Ξ+" + ethers.utils.formatEther(results.ethReceived) +
//       "Ξ-" + ethers.utils.formatEther(results.ethPaid) +
//       "Ξ-" + ethers.utils.formatEther(results.txFee) +
//       "Ξ");
//   }
//
//   // if (txData.txReceipt.blockNumber > 15345896) { // } && txData.txReceipt.blockNumber < 14379871) {
//     // const balance = ethers.BigNumber.from(txData.ethBalance);
//     const balance = ethers.BigNumber.from(block.balances[account] || 0);
//     // console.log("balance: " + balance);
//     // const balance = await provider.getBalance(account, txData.txReceipt.blockNumber);
//     const diff = balance.sub(accumulatedData.ethBalance);
//     if (diff != 0) {
//       console.log("balance - actual: " + ethers.utils.formatEther(balance) + " vs computed: " + ethers.utils.formatEther(accumulatedData.ethBalance) + " diff: " + ethers.utils.formatEther(diff));
//     }
//   // }
// }


function parseTx(account, accounts, functionSelectors, eventSelectors, preERC721s, txData) {
  // console.log("parseTx - account: " + JSON.stringify(account));
  // console.log("parseTx - txData: " + JSON.stringify(txData));
  const results = {};
  const msgValue = ethers.BigNumber.from(txData.tx.value).toString();
  const gasUsed = ethers.BigNumber.from(txData.txReceipt.gasUsed);
  const txFee = gasUsed.mul(txData.txReceipt.effectiveGasPrice);
  results.gasUsed = gasUsed;
  results.txFee = txData.tx.from == account ? txFee.toString() : 0;
  results.ethReceived = 0;
  results.ethPaid = 0;
  const events = getEvents(account, accounts, eventSelectors, preERC721s, txData);
  const totalReceivedInternally = events.receivedInternalEvents.reduce((acc, e) => ethers.BigNumber.from(acc).add(e.value), 0);
  // console.log("totalReceivedInternally: " + totalReceivedInternally);
  // if (events.myEvents.length > 0) {
  //   console.log("myEvents: " + JSON.stringify(events.myEvents, null, 2));
  // }

  // if (events.receivedNFTEvents.length > 0) {
  //   console.log("receivedNFTEvents: " + JSON.stringify(events.receivedNFTEvents, null, 2));
  // }
  // if (events.sentNFTEvents.length > 0) {
  //   console.log("sentNFTEvents: " + JSON.stringify(events.sentNFTEvents, null, 2));
  // }
  // if (events.receivedERC20Events.length > 0) {
  //   console.log("receivedERC20Events: " + JSON.stringify(events.receivedERC20Events, null, 2));
  // }
  // if (events.sentERC20Events.length > 0) {
  //   console.log("sentERC20Events: " + JSON.stringify(events.sentERC20Events, null, 2));
  // }
  // console.log(txData.tx.hash + " - " + JSON.stringify([...events.receivedNFTEvents, ...events.sentNFTEvents, ...events.receivedERC20Events, ...events.sentERC20Events], null, 2));

  // if (events.nftExchangeEvents.length > 0) {
  //   console.log("nftExchangeEvents: " + JSON.stringify(events.nftExchangeEvents, null, 2));
  // }
  // if (events.ensEvents.length > 0) {
  //   console.log("ensEvents: " + JSON.stringify(events.ensEvents, null, 2));
  // }
  // if (events.erc20Events.length > 0) {
  //   console.log("erc20Events: " + JSON.stringify(events.erc20Events, null, 2));
  // }
  // if (events.erc721Events.length > 0) {
  //   console.log("erc721Events: " + JSON.stringify(events.erc721Events, null, 2));
  // }
  // if (events.sentInternalEvents.length > 0) {
  //   console.log("sentInternalEvents: " + JSON.stringify(events.sentInternalEvents, null, 2));
  // }
  // if (events.receivedInternalEvents.length > 0) {
  //   console.log("receivedInternalEvents: " + txData.tx.hash + " " + JSON.stringify(events.receivedInternalEvents, null, 2));
  // }

  if (txData.tx.to == null) {
    results.functionSelector = "(contract creation)";
    results.functionCall = "(contract creation)";
  } else if (txData.tx.data.length >= 10) {
    results.functionSelector = txData.tx.data.substring(0, 10);
    results.functionCall = functionSelectors[results.functionSelector] && functionSelectors[results.functionSelector].length > 0 && functionSelectors[results.functionSelector][0] || results.functionSelector;
  } else if (txData.tx.data.length > 2) {
    results.functionSelector = txData.tx.data;
    results.functionCall = "(unknown '" + txData.tx.data + "')";
  } else {
    results.functionSelector = "(none)";
    results.functionCall = "(none)";
  }

  // console.log("  " + results.functionSelector + " " + results.functionCall);
  results.contract = null;
  if (txData.tx.to != null) {
    const toAccount = accounts[txData.tx.to] || null;
    // console.log(txData.tx.hash + " - to: " + txData.tx.to + ", type: " + toAccount.type);
    if (toAccount.type != 'eoa') {
      results.contract = txData.tx.to;
    }
  } else {
    results.contract = txData.txReceipt.contractAddress;
  }
  // if (txData.tx.to != null && txData.tx.data.length >= 10) {
  //   results.functionSelector = txData.tx.data.substring(0, 10);
  //   results.functionCall = functionSelectors[results.functionSelector] && functionSelectors[results.functionSelector].length > 0 && functionSelectors[results.functionSelector][0] || results.functionSelector;
  // } else {
  //   results.functionSelector = "(none)";
  //   results.functionCall = "(none)";
  // }

  // if (results.functionCall != "") {
  //   console.log("functionSelector: " + results.functionSelector + " => " + results.functionCall);
  //   // console.log("txData.tx.data: " + txData.tx.data);
  // }

  if (txData.txReceipt.status == 0) {
    results.info = {
      type: "contract",
      action: "errored",
    };
  }

  // TODO: Identify internal transfers?

  // Contract deployment
  if (txData.tx.from == account && txData.tx.to == null) {
    // console.log(JSON.stringify(txData.tx, null, 2));
    // console.log(JSON.stringify(accounts[account].transactions[txData.tx.hash], null, 2));
    // results.info = "Contract deployment"; // to " + txData.tx.contractAddress;
    results.info = {
      type: "contract",
      action: "deployed",
    };
  }

  // Multisig execute internal transfer
  if (events.receivedInternalEvents.length > 0 && results.functionSelector == "0xb61d27f6") {
    // TODO: Handle > 1 totalReceivedInternally
    if (events.receivedInternalEvents.length == txData.txReceipt.logs.length) {
      results.ethReceived = events.receivedInternalEvents[0].value;
      results.info = "Received Internal " + ethers.utils.formatEther(events.receivedInternalEvents[0].value) + "Ξ from " + events.receivedInternalEvents[0].from;
    }
  }

  // EOA to EOA ETH transfer
  if (gasUsed == 21000) {
    if (txData.tx.from == account && txData.tx.to == account) {
      results.info = { type: "eth", action: "cancelled", from: txData.tx.from, to: txData.tx.to, amount: msgValue };
    } else if (txData.tx.from == account) {
      results.ethPaid = msgValue;
      results.info = { type: "eth", action: "sent", to: txData.tx.to, amount: msgValue };
    } else if (txData.tx.to == account) {
      results.ethReceived = msgValue;
      results.info = { type: "eth", action: "received", from: txData.tx.from, amount: msgValue };
    }
  }

  if (!results.info && results.functionSelector.length >= 10) {
    for (const [index, handler] of _FUNCTIONSELECTORHANDLER.entries()) {
      if (results.functionSelector in handler.functionSelectors) {
        handler.process(txData, account, accounts, preERC721s, events, results);
      }
    }
  }

  // ENS Registrations and renewals, can be executed via ENS Batch Renewal, ENS.vision, ...
  // ENS commits when executed via ENS.vision will not be detectable
  if (!results.info && events.ensEvents.length > 0) {
    console.log("ensEvents: " + JSON.stringify(events.ensEvents, null, 2));
    console.log("myEvents: " + JSON.stringify(events.myEvents, null, 2));
    const registrationEvents = events.ensEvents.filter(e => e.type == "NameRegistered");
    const renewalEvents = events.ensEvents.filter(e => e.type == "NameRenewed");
    let totalCost = ethers.BigNumber.from(0);
    const names = [];
    if (registrationEvents.length > 0) {
      // ENS.vision does not refund, and will take leftover as fees
      if (events.receivedInternalEvents.length > 0) {
        for (const [eventIndex, event] of registrationEvents.entries()) {
          console.log(eventIndex + " " + JSON.stringify(event));
          console.log("  " + JSON.stringify(events.myEvents[eventIndex]));
          events.myEvents[eventIndex].action = "registered";
          events.myEvents[eventIndex].price = {
            token: "eth",
            tokens: event.cost,
          };
          names.push(event.name + ".eth");
          totalCost = totalCost.add(event.cost);
        }
      } else {
        totalCost = msgValue;
      }
      results.info = { type: "ens",  action: "registered", /* from: txData.tx.from, */ events: registrationEvents, totalCost: totalCost.toString() };
    } else if (renewalEvents.length > 0) {
      // if (events.receivedInternalEvents.length > 0) {
        for (const event of renewalEvents) {
          names.push(event.name + ".eth");
          totalCost = totalCost.add(event.cost);
          const tokenId = ethers.BigNumber.from(event.label).toString();
          events.myEvents.push({
            action: "renewed",
            type: "erc721",
            logIndex: event.logIndex,
            contract: event.contract,
            tokenId,
            from: txData.tx.from,
            to: undefined,
            price: {
              // type: "erc721",
              token: "eth",
              tokens: event.cost,
            },
          });
        }
      // } else {
      //   totalCost = msgValue;
      // }
      results.info = { type: "ens", action: "renewed", /* from: txData.tx.from, */ events: renewalEvents, totalCost: totalCost.toString() };
    }
    results.ethPaid = totalCost;
  }

  // We purchase NFTs
  if (!results.info && events.nftExchangeEvents.length > 0 && events.receivedNFTEvents.length > 0 && txData.tx.from == account) {
    // console.log("HERE");
    const numberOfItems = events.myEvents.length;
    const totalCost = ethers.BigNumber.from(msgValue).sub(totalReceivedInternally);
    const costPerItem = totalCost.div(numberOfItems);
    // console.log("totalCost: " + totalCost);
    // console.log("costPerItem: " + costPerItem);
    for (const [eventIndex, event] of events.myEvents.entries()) {
      // console.log(eventIndex + " " + JSON.stringify(event));
      // console.log("  " + JSON.stringify(events.myEvents[eventIndex]));
      events.myEvents[eventIndex].action = "purchased";
      events.myEvents[eventIndex].price = {
        token: "eth",
        tokens: eventIndex < (events.myEvents.length - 1) ? costPerItem.toString() : totalCost.sub(costPerItem.mul(numberOfItems - 1)).toString(),
      };
    }
    results.info = {
      type: "nft",
      action: "purchased",
      events: events.receivedNFTEvents,
      value: ethers.BigNumber.from(msgValue).sub(totalReceivedInternally).toString(),
    };
    results.ethPaid = msgValue;
  }

  // Other account purchased our NFTs
  if (!results.info && events.nftExchangeEvents.length > 0 && events.sentNFTEvents.length > 0 && txData.tx.from != account) {
    // console.log("HERE");
    const numberOfItems = events.myEvents.length;
    const totalCost = ethers.BigNumber.from(totalReceivedInternally);
    const costPerItem = totalCost.div(numberOfItems);
    // console.log("totalCost: " + totalCost);
    // console.log("costPerItem: " + costPerItem);
    for (const [eventIndex, event] of events.myEvents.entries()) {
      // console.log(eventIndex + " " + JSON.stringify(event));
      // console.log("  " + JSON.stringify(events.myEvents[eventIndex]));
      events.myEvents[eventIndex].action = "sold";
      events.myEvents[eventIndex].price = {
        token: "eth",
        tokens: eventIndex < (events.myEvents.length - 1) ? costPerItem.toString() : totalCost.sub(costPerItem.mul(numberOfItems - 1)).toString(),
      };
    }

    results.info = {
      type: "nft",
      action: "sold",
      events: events.sentNFTEvents,
      valueToken: "eth",
      value: totalReceivedInternally.toString(),
    };
    results.ethReceived = totalReceivedInternally;
  }

  // We accept WETH/USDC/ERC-20 bid to purchased our NFTs
  if (!results.info && events.nftExchangeEvents.length > 0 && events.sentNFTEvents.length > 0 && events.receivedERC20Events.length > 0 && txData.tx.from == account) {
    const totalReceived = events.receivedERC20Events.reduce((acc, e) => ethers.BigNumber.from(acc).add(e.tokens), 0);
    const totalSent = events.sentERC20Events.reduce((acc, e) => ethers.BigNumber.from(acc).add(e.tokens), 0);
    results.info = {
      type: "nft",
      action: "sold",
      events: events.sentNFTEvents,
      valueToken: events.receivedERC20Events[0].contract,
      value: totalReceived.sub(totalSent).toString(),
    };
    // results.ethReceived = totalReceivedInternally;
  }

  // We mint NFTs
  if (!results.info && events.nftExchangeEvents.length == 0 && events.receivedNFTEvents.length > 0 && txData.tx.from == account) {
    // console.log("myEvents: " + JSON.stringify(events.myEvents, null, 2));
    const numberOfItems = events.myEvents.length;
    const totalCost = ethers.BigNumber.from(msgValue).sub(totalReceivedInternally);
    const costPerItem = totalCost.div(numberOfItems);
    // console.log("totalCost: " + totalCost);
    // console.log("costPerItem: " + costPerItem);
    for (const [eventIndex, event] of events.myEvents.entries()) {
      // console.log(eventIndex + " " + JSON.stringify(event));
      // console.log("  " + JSON.stringify(events.myEvents[eventIndex]));
      events.myEvents[eventIndex].action = "minted";
      events.myEvents[eventIndex].price = {
        token: "eth",
        tokens: eventIndex < (events.myEvents.length - 1) ? costPerItem.toString() : totalCost.sub(costPerItem.mul(numberOfItems - 1)).toString(),
      };
    }
    results.info = {
      type: "nft",
      action: "minted",
      events: events.receivedNFTEvents,
      value: ethers.BigNumber.from(msgValue).sub(totalReceivedInternally).toString(),
      sentNFTEvents: events.sentNFTEvents,
      sentERC20Events: events.sentERC20Events,
    };
    results.ethPaid = msgValue;
    // console.log("myEvents AFTER: " + JSON.stringify(events.myEvents, null, 2));
  }

  // Someone else mint NFTs for us
  if (!results.info && events.nftExchangeEvents.length == 0 && events.receivedNFTEvents.length > 0 && txData.tx.from != account) {
    results.info = {
      type: "nft",
      action: "airdropped",
      events: events.receivedNFTEvents,
      value: 0,
    };
  }

  // // TODO Check remaining
  // if (!results.info && results.functionCall != "") {
  //   console.log("functionSelector: " + results.functionSelector + " => " + results.functionCall);
  //   // console.log("txData.tx.data: " + txData.tx.data);
  // }

  if (!results.info) {
    if (msgValue == 0 && (Object.keys(events.erc20FromMap).length < 3) && (Object.keys(events.erc20ToMap).length > 3) && (account in events.erc20ToMap)) {
      const receivedERC20Events = events.erc20Events.filter(e => e.to == account);
      if (receivedERC20Events.length == 1) {
        results.info = {
          type: "erc20",
          action: "airdropped",
          contract: receivedERC20Events[0].contract,
          tokens: receivedERC20Events[0].tokens,
        };
      } else {
        // TODO: Other cases?
        // console.log("  Received Airdrop: " + JSON.stringify(receivedERC20Events));
      }
    }
  }

  const CLAIMERC20AIRDROPS = {
    "0xca21b177": true, // claim(bytes32[] proof_, address claimant_, uint256 claim_) 0xed39DAFd2B2a624fE43A5BbE76e0Dae4E4E621ef
    "0xabf2ebd8": true, // claim(uint256 amountV, bytes32 r, bytes32 s) 0x3b484b82567a09e2588A13D54D032153f0c0aEe0
    "0x6ba4c138": true, // claim(uint256[] tokenIndices) 0x8A9c4dfe8b9D8962B31e4e16F8321C44d48e246E
    "0x4972a7a7": true, // claim(uint256 amount,bytes32[] merkleProof,tuple makerAsk,bool isERC721) 0xA35dce3e0E6ceb67a30b8D7f4aEe721C949B5970
  };
  if (!results.info && txData.tx.from == account && results.functionSelector in CLAIMERC20AIRDROPS) {
    const receivedERC20Events = events.erc20Events.filter(e => e.to == account);
    if (receivedERC20Events.length == 1) {
      const info = getTokenContractInfo(receivedERC20Events[0].contract, accounts);
      results.info = "Claimed Airdrop ERC-20:" + info.name + " " + ethers.utils.formatUnits(receivedERC20Events[0].tokens, info.decimals) + " tokens";
    } else {
      // TODO: Other cases?
      // console.log("  Received Airdrop: " + JSON.stringify(receivedERC20Events));
    }
  }

  const ERC721DROP = {
    "0x7884af44": true, // mintBase(address to, string uri) 0xA8121B153c77cA4dd1da3a9D7cDC4729129c8c6D
  };
  if (!results.info && txData.tx.from != account && results.functionSelector in ERC721DROP) {
    const receivedERC721Events = events.erc721Events.filter(e => e.to == account);
    if (receivedERC721Events.length == 1) {
      const info = getTokenContractInfo(receivedERC721Events[0].contract, accounts);
      results.info = "Received Drop of ERC-721:" + info.name + " x" + receivedERC721Events.length + " " + receivedERC721Events[0].tokenId;
    } else {
      // TODO: Other cases?
      // console.log("  Received Airdrop: " + JSON.stringify(receivedERC20Events));
    }
  }


  // ETH bulk transfers as internals
  const BULKINTERNALREFUNDS = {
    "0xfe132c63": true, // refundDifferenceToBidders(address[] bidderAddresses) 0xe0fA9Fb0e30ca86513642112BEE1CBbAA2A0580d
  };
  if (!results.info && txData.tx.from != account && results.functionSelector in BULKINTERNALREFUNDS) {
    const accountData = accounts[account];
    let ethBalance = ethers.BigNumber.from(0);
    for (const [txHash, traceData] of Object.entries(accountData.internalTransactions)) {
      if (txHash == txData.tx.hash) {
        for (const [traceId, internalTransaction] of Object.entries(traceData)) {
          const to = ethers.utils.getAddress(internalTransaction.to);
          if (to == account) {
            ethBalance = ethBalance.add(internalTransaction.value);
          }
        }
      }
    }
    if (ethBalance > 0) {
      results.info = "Received internal transaction refund of " + ethers.utils.formatEther(ethBalance) + "Ξ from " + txData.tx.to;
      results.ethReceived = ethers.BigNumber.from(ethBalance).toString();
    }
  }

  // ETH -> ERC-20 Swap
  if (!results.info && msgValue > 0) {
    const receivedERC20Events = events.erc20Events.filter(e => e.to == account);
    // console.log("receivedERC20Events: " + JSON.stringify(receivedERC20Events));
    // console.log("receivedInternalEvents: " + JSON.stringify(events.receivedInternalEvents));
    if (receivedERC20Events.length > 0) {
      const info = getTokenContractInfo(receivedERC20Events[0].contract, accounts);
      results.info = "Purchased " + ethers.utils.formatUnits(receivedERC20Events[0].tokens, info.decimals) + " ERC-20 " + info.symbol + " for " + ethers.utils.formatEther(msgValue) + "Ξ with " + ethers.utils.formatEther(totalReceivedInternally) + "Ξ refund";
      results.ethPaid = ethers.BigNumber.from(msgValue).sub(totalReceivedInternally);
    }
  }

  // TokenTrader.TradeListing (index_topic_1 address ownerAddress, index_topic_2 address tokenTraderAddress, index_topic_3 address asset, uint256 buyPrice, uint256 sellPrice, uint256 units, bool buysTokens, bool sellsTokens)
  if (!results.info && results.functionSelector == "0x3d6a32bd") {
    for (const event of txData.txReceipt.logs) {
      if (event.topics[0] == "0x65ff0f5aef2091ad3616436792adf51be3068c631b081ac0f30f77e3a0e6502d") {
        // let amount = ethers.BigNumber.from(event.data);
        results.info = "TokenTrader.TradeListing";
      }
    }
  }
  // TokenTrader.MakerWithdrewEther
  if (!results.info && results.functionSelector == "0x2170ebf7") {
    for (const event of txData.txReceipt.logs) {
      if (event.topics[0] == "0x8a93d70d792b644d97d7da8a5798e03bbee85be4537a860a331dbe3ee50eb982") {
        results.ethReceived = ethers.BigNumber.from(event.data);
        results.info = "TokenTrader.MakerWithdrewEther";
      }
    }
  }
  // TokenTrader.MakerWithdrewAsset
  if (!results.info && results.functionSelector == "0xcd53a3b7") {
    for (const event of txData.txReceipt.logs) {
      if (event.topics[0] == "0x1ebbc515a759c3fe8e048867aac7fe458e3a37ac3dd44ffc73a6238cf3003981") {
        let amount = ethers.BigNumber.from(event.data);
        results.info = "TokenTrader.MakerWithdrewAsset";
      }
    }
  }
  // TokenTrader.MakerTransferredAsset
  if (!results.info && results.functionSelector == "0x52954e5a") {
    for (const event of txData.txReceipt.logs) {
      if (event.topics[0] == "0x127afec6b0ab48f803536010148b79615f4a518f9b574de5b45bc74991c46d51") {
        // let amount = ethers.BigNumber.from(event.data);
        results.info = "TokenTrader.MakerTransferredAsset";
      }
    }
  }

  // Umswap swap(uint256[] inTokenIds,uint256[] outTokenIds)
  if (!results.info && results.functionSelector == "0x0a3cb72e") {
    results.info = "Umswap swap() TODO";
  }

  // Umswap newUmswap(address collection,string name,uint256[] tokenIds)
  if (!results.info && results.functionSelector == "0x8945f054") {
    results.info = "Umswap newUmswap() TODO";
  }

  // BokkyPooBahsFixedSupplyTokenFactory deployTokenContract(string symbol, string name, uint8 decimals, uint256 totalSupply)
  if (!results.info && results.functionSelector == "0xcdaca7d5") {
    results.info = "BokkyPooBahsFixedSupplyTokenFactory deployTokenContract() TODO";
  }

  // BokkyPooBahsFixedSupplyTokenFactory transferOwnership(address _newOwner)
  if (!results.info && results.functionSelector == "0xf2fde38b") {
    results.info = "BokkyPooBahsFixedSupplyTokenFactory transferOwnership() TODO";
  }

  // BokkyPooBahsFixedSupplyTokenFactory transferOwnership(address _newOwner)
  if (!results.info && results.functionSelector == "0xd0def521") {
    results.info = "CryptoVoxels Name mint() TODO";
  }

  // ExtraBalDaoWithdraw withdraw()
  if (!results.info && txData.tx.to == "0x755cdba6AE4F479f7164792B318b2a06c759833B" && results.functionSelector == "0x3ccfd60b") {
    results.info = "ExtraBalDaoWithdraw withdraw TOODO";
  }

  // Early contract testing moveToWaves(string wavesAddress, uint256 amount)
  if (!results.info && results.functionSelector == "0x7f09beca") {
    results.info = "Testing moveToWaves() TOODO";
  }

  // Parity token registry register(address _addr, string _tla, uint256 _base, string _name)
  if (!results.info && txData.tx.to == "0x5F0281910Af44bFb5fC7e86A404d0304B0e042F1" && results.functionSelector == "0x66b42dcb") {
    results.info = "Parity token registry register() TOODO";
  }

  // Parity signature registry register(string _method)
  if (!results.info && txData.tx.to == "0x44691B39d1a75dC4E0A0346CBB15E310e6ED1E86" && results.functionSelector == "0xf2c298be") {
    results.info = "Parity signature registry register() TOODO";
  }

  const GENERALCONTRACTMAINTENANCESIGS = {
    // "0xeb32e37e": true, // No contract source
    "0x6c595451": "addApp(string appName, address _feeAccount, uint256 _fee)", //
    "0x73311631": "addBrand(address brandAccount, string brandName)", //
    "0x0a40fb8c": "permissionMarker(address marker, bool permission)", //
    "0x34f14c0a": "addEntry(address token, uint8 permission)", //
    "0xddd81f82": "registerProxy()", // OpenSea 0xa5409ec958C83C3f309868babACA7c86DCB077c1
    "0x2385554c": "hatchEgg(uint256 egg)", // 0x7685376aF33104dD02be287ed857a19Bb4A24EA2
    "0x4e71d92d": "claim()", //  0xfdD7399e22918ba7234f5568cc2eF922489F7Ba6 - TODO ERC-20
    "0xfc24100b": "buyAccessories(tuple[] orders)", // 0x8d33303023723dE93b213da4EB53bE890e747C63
    "0xc39cbef1": "changeName(uint256 tokenId, string newName)", // 0xC2C747E0F7004F9E8817Db2ca4997657a7746928
  };
  if (!results.info && results.functionSelector in GENERALCONTRACTMAINTENANCESIGS) {
    results.info = "Call " + GENERALCONTRACTMAINTENANCESIGS[txData.tx.data.substring(0, 10)];
    results.ethPaid = msgValue;
  }

  if (!results.info && txData.tx.to in _CUSTOMACCOUNTS) {
    const accountInfo = _CUSTOMACCOUNTS[txData.tx.to];
    // console.log("  " + JSON.stringify(accountInfo.name));
    if (accountInfo.process) {
      accountInfo.process(txData, account, accounts, events, results);
      // if (!results.info) {
        // console.log("  TOODO: " + txData.tx.hash + " " + JSON.stringify(accountInfo.name));
      // }
    }
  }
  // if (!results.info) {
    // console.log("  TODO: " + txData.tx.hash);
  // }

  results.myEvents = [];
  if ((txData.tx.from == account || txData.tx.to == account) && msgValue > 0) {
    const record = { action: "paid", type: "eth", logIndex: "(first)", contract: "eth", from: txData.tx.from, to: txData.tx.to, tokens: msgValue.toString() };
    results.myEvents.push(record);
  }
  // console.log("events.myEvents.entries(): " + JSON.stringify(events.myEvents.entries()));
  for (const event of events.myEvents) {
    // TODO: Add token contract lookup details
    // console.log(JSON.stringify(event));
  }
  results.myEvents = [...results.myEvents, ...events.myEvents];
  for (const [eventIndex, event] of events.receivedInternalEvents.entries()) {
    // console.log(eventIndex + " => " + JSON.stringify(event));
    const record = { action: "received", type: "eth", logIndex: "(last)", contract: "eth", from: event.from, to: event.to, tokens: event.value.toString() };
    results.myEvents.push(record);
  }

  // console.log("myEvents: " + JSON.stringify(results.myEvents, null, 2));

  const collator = {};
  for (const [eventIndex, event] of results.myEvents.entries()) {
    // console.log("myEvents[" + eventIndex + "]: " + JSON.stringify(event));
    const sentOrReceived = (event.from == account) ? "sent" : "received";
    const counterparty = (event.from == account) ? event.to : event.from;
    const ftOrNFT = (event.type == 'eth' || event.type == 'erc20') ? 'ft' : 'nft';
    if (!(sentOrReceived in collator)) {
      collator[sentOrReceived] = {};
    }
    if (!(counterparty in collator[sentOrReceived])) {
      collator[sentOrReceived][counterparty] = {};
    }
    if (!(ftOrNFT in collator[sentOrReceived][counterparty])) {
      collator[sentOrReceived][counterparty][ftOrNFT] = {};
    }
    if (!(event.contract in collator[sentOrReceived][counterparty][ftOrNFT])) {
      collator[sentOrReceived][counterparty][ftOrNFT][event.contract] = ftOrNFT == 'ft' ? 0 : [];
    }
    if (ftOrNFT == 'ft') {
      collator[sentOrReceived][counterparty][ftOrNFT][event.contract] = ethers.BigNumber.from(collator[sentOrReceived][counterparty][ftOrNFT][event.contract]).add(event.tokens).toString();
    } else {
      if (event.type == 'erc1155batch') {
        for (const tokens of event.tokens) {
          collator[sentOrReceived][counterparty][ftOrNFT][event.contract].push(tokens);
        }
      } else if (event.type == 'erc1155') {
        collator[sentOrReceived][counterparty][ftOrNFT][event.contract].push(event.tokenId);
      } else {
        collator[sentOrReceived][counterparty][ftOrNFT][event.contract].push(event.tokenId);
      }
    }
  }
  // console.log("collator: " + JSON.stringify(collator, null, 2));
  const summary = {};
  for (const sentOrReceived of ['sent', 'received']) {
    if (collator[sentOrReceived]) {
      for (const [account, accountData] of Object.entries(collator[sentOrReceived])) {
        for (const ftOrNFT of ['ft', 'nft']) {
          if (accountData[ftOrNFT]) {
            for (const [tokenContract, tokens] of Object.entries(accountData[ftOrNFT])) {
              let name = undefined;
              let symbol = undefined;
              let decimals = undefined;
              const tc = accounts[tokenContract] || {};
              // const tcInfo = accounts[tokenContract];
              if (ftOrNFT == 'ft') {
                if (tokenContract == 'eth') {
                  name = 'ETH';
                  symbol = 'ETH';
                  decimals = 18;
                } else {
                  name = tc.name;
                  symbol = tc.symbol;
                  decimals = tc.decimals;
                }
              } else {
                name = tc.name || null;
                symbol = tc.symbol || null;
              }
              if (!(sentOrReceived in summary)) {
                summary[sentOrReceived] = [];
              }
              summary[sentOrReceived].push({ account, ftOrNFT, tokenContract, tokens, name, symbol, decimals });
            }
          }
        }
      }
    }
  }
  // console.log("summary: " + JSON.stringify(summary, null, 2));
  results.summary = summary;
  results.collator = collator;

  return results;
}
