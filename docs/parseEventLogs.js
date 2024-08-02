// ENS: Old ETH Registrar Controller 1 @ 0xF0AD5cAd05e10572EfcEB849f6Ff0c68f9700455 deployed Apr-30-2019 03:54:13 AM +UTC
// ENS: Old ETH Registrar Controller 2 @ 0xB22c1C159d12461EA124b0deb4b5b93020E6Ad16 deployed Nov-04-2019 12:43:55 AM +UTC
// ENS: Old ETH Registrar Controller @ 0x283Af0B28c62C092C9727F1Ee09c02CA627EB7F5 deployed Jan-30-2020 12:56:38 AM +UTC
// ENS: ETH Registrar Controller @ 0x253553366Da8546fC250F225fe3d25d0C782303b deployed Mar-28-2023 11:44:59 AM +UTC

function parseEventLogs(logs, chainId, latestBlockNumber) {
  // console.log(now() + " INFO functions:parseEventLogs - logs: " + JSON.stringify(logs, null, 2));
  const erc721Interface = new ethers.utils.Interface(ERC721ABI);
  const erc1155Interface = new ethers.utils.Interface(ERC1155ABI);
  // const oldETHRegistarController1Interface = new ethers.utils.Interface(ENS_OLDETHREGISTRARCONTROLLER1_ABI);
  // const oldETHRegistarController2Interface = new ethers.utils.Interface(ENS_OLDETHREGISTRARCONTROLLER2_ABI);
  const ethBaseRegistarImplementationInterface = new ethers.utils.Interface(ENS_BASEREGISTRARIMPLEMENTATION_ABI);
  const oldETHRegistarControllerInterface = new ethers.utils.Interface(ENS_OLDETHREGISTRARCONTROLLER_ABI);
  // const ethRegistarControllerInterface = new ethers.utils.Interface(ENS_ETHREGISTRARCONTROLLER_ABI);
  const nameWrapperInterface = new ethers.utils.Interface(ENS_NAMEWRAPPER_ABI);
  const registryWithFallbackInterface = new ethers.utils.Interface(ENS_REGISTRYWITHFALLBACK_ABI);
  const publicResolverInterface = new ethers.utils.Interface(ENS_PUBLICRESOLVER_ABI);
  const publicResolver2Interface = new ethers.utils.Interface(ENS_PUBLICRESOLVER2_ABI);

  const records = [];
  for (const log of logs) {
    if (!log.removed) {
      const contract = log.address;
      let eventRecord = null;
      if (log.topics[0] == "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef") {
        // Transfer (index_topic_1 address from, index_topic_2 address to, index_topic_3 uint256 id)
        // const logData = ethBaseRegistarImplementationInterface.parseLog(log);
        // const [from, to, tokenId] = logData.args;
        // eventRecord = { type: "Transfer", from, to, tokenId: tokenId.toString() };
        let from = null;
        let to = null;
        let tokensOrTokenId = null;
        let tokens = null;
        let tokenId = null;
        if (log.topics.length == 4) {
          from = ethers.utils.getAddress('0x' + log.topics[1].substring(26));
          to = ethers.utils.getAddress('0x' + log.topics[2].substring(26));
          tokensOrTokenId = ethers.BigNumber.from(log.topics[3]).toString();
        } else if (log.topics.length == 3) {
          from = ethers.utils.getAddress('0x' + log.topics[1].substring(26));
          to = ethers.utils.getAddress('0x' + log.topics[2].substring(26));
          tokensOrTokenId = ethers.BigNumber.from(log.data).toString();
        // TODO: Handle 2
        } else if (log.topics.length == 1) {
          from = ethers.utils.getAddress('0x' + log.data.substring(26, 66));
          to = ethers.utils.getAddress('0x' + log.data.substring(90, 130));
          tokensOrTokenId = ethers.BigNumber.from('0x' + log.data.substring(130, 193)).toString();
        }
        if (from) {
          if (log.topics.length == 4) {
            eventRecord = { type: "Transfer", from, to, tokenId: tokensOrTokenId, eventType: "erc721" };
          } else {
            eventRecord = { type: "Transfer", from, to, tokens: tokensOrTokenId, eventType: "erc20" };
          }
        }

      } else if (log.topics[0] == "0xe1fffcc4923d04b559f4d29a8bfc6cda04eb5b0d3c460751c2402c5c5cc9109c") {
        const to = ethers.utils.getAddress('0x' + log.topics[1].substring(26));
        tokens = ethers.BigNumber.from(log.data).toString();
        eventRecord = { type: "Transfer", from: ADDRESS0, to, tokens, eventType: "erc20" };
      } else if (log.topics[0] == "0x7fcf532c15f0a6db0bd6d0e038bea71d30d808c7d98cb3bf7268a95bf5081b65") {
        const from = ethers.utils.getAddress('0x' + log.topics[1].substring(26));
        tokens = ethers.BigNumber.from(log.data).toString();
        eventRecord = { type: "Transfer", from, to: ADDRESS0, tokens, eventType: "erc20" };
      } else if (log.topics[0] == "0x8a0e37b73a0d9c82e205d4d1a3ff3d0b57ce5f4d7bccf6bac03336dc101cb7ba") {
        const to = ethers.utils.getAddress('0x' + log.topics[1].substring(26));
        // tokens = ethers.BigNumber.from(log.data).toString();
        tokens = 1;
        eventRecord = { type: "Transfer", from: ADDRESS0, to, tokens, eventType: "erc20" };
      } else if (log.topics[0] == "0x80d2c1a6c75f471130a64fd71b80dc7208f721037766fb7decf53e10f82211cd") {
        const to = ethers.utils.getAddress('0x' + log.topics[1].substring(26));
        tokens = 1;
        eventRecord = { type: "Transfer", from: ADDRESS0, to, tokens, eventType: "erc20" };
      } else if (log.topics[0] == "0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925") {
        if (log.topics.length == 4) {
          const owner = ethers.utils.getAddress('0x' + log.topics[1].substring(26));
          const approved = ethers.utils.getAddress('0x' + log.topics[2].substring(26));
          tokenId = ethers.BigNumber.from(log.topics[3]).toString();
          eventRecord = { type: "Approval", owner, approved, tokenId, eventType: "erc721" };
        } else {
          const owner = ethers.utils.getAddress('0x' + log.topics[1].substring(26));
          const spender = ethers.utils.getAddress('0x' + log.topics[2].substring(26));
          tokens = ethers.BigNumber.from(log.data).toString();
          eventRecord = { type: "Approval", owner, spender, tokens, eventType: "erc20" };
        }
      } else if (log.topics[0] == "0x17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c31") {
        const owner = ethers.utils.getAddress('0x' + log.topics[1].substring(26));
        const operator = ethers.utils.getAddress('0x' + log.topics[2].substring(26));
        approved = ethers.BigNumber.from(log.data) > 0;
        // NOTE: Both erc1155 and erc721 fall in this category, but assigning all to erc721
        eventRecord = { type: "ApprovalForAll", owner, operator, approved, eventType: "erc721" };
      } else if (log.topics[0] == "0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62") {
        // ERC-1155 TransferSingle (index_topic_1 address operator, index_topic_2 address from, index_topic_3 address to, uint256 id, uint256 value)
        const logData = erc1155Interface.parseLog(log);
        const [operator, from, to, id, value] = logData.args;
        tokenId = ethers.BigNumber.from(id).toString();
        eventRecord = { type: "TransferSingle", operator, from, to, tokenId, value: value.toString(), eventType: "erc1155" };
      } else if (log.topics[0] == "0x4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb") {
        // ERC-1155 TransferBatch (index_topic_1 address operator, index_topic_2 address from, index_topic_3 address to, uint256[] ids, uint256[] values)
        const logData = erc1155Interface.parseLog(log);
        const [operator, from, to, ids, values] = logData.args;
        const tokenIds = ids.map(e => ethers.BigNumber.from(e).toString());
        eventRecord = { type: "TransferBatch", operator, from, to, tokenIds, values: values.map(e => e.toString()), eventType: "erc1155" };
      } else if (CONTRACTS[contract] && CONTRACTS[contract].ens) {
        if (log.topics[0] == "0xb3d987963d01b2f68493b4bdb130988f157ea43070d4ad840fee0466ed9370d9") {
          // NameRegistered (index_topic_1 uint256 id, index_topic_2 address owner, uint256 expires)
          const logData = ethBaseRegistarImplementationInterface.parseLog(log);
          const [labelhash, owner, expires] = logData.args;
          eventRecord = { type: "NameRegistered", labelhash: labelhash.toHexString(), owner, expires: parseInt(expires) };
        } else if (log.topics[0] == "0xca6abbe9d7f11422cb6ca7629fbf6fe9efb1c621f71ce8f02b9f2a230097404f") {
          // ERC-721 NameRegistered (string name, index_topic_1 bytes32 label, index_topic_2 address owner, uint256 cost, uint256 expires)
          const logData = oldETHRegistarControllerInterface.parseLog(log);
          const [name, label, owner, cost, expires] = logData.args;
          eventRecord = { type: "NameRegistered", label: name, labelhash: label, owner, cost: cost.toString(), expires: parseInt(expires) };
        } else if (log.topics[0] == "0x3da24c024582931cfaf8267d8ed24d13a82a8068d5bd337d30ec45cea4e506ae") {
          // ERC-721 NameRenewed (string name, index_topic_1 bytes32 label, uint256 cost, uint256 expires)
          const logData = oldETHRegistarControllerInterface.parseLog(log);
          const [name, label, cost, expiry] = logData.args;
          if (ethers.utils.isValidName(name)) {
            eventRecord = { type: "NameRenewed", label: name, cost: cost.toString(), expiry: parseInt(expiry) };
          }
        } else if (log.topics[0] == "0x8ce7013e8abebc55c3890a68f5a27c67c3f7efa64e584de5fb22363c606fd340") {
          // ERC-1155 NameWrapped (index_topic_1 bytes32 node, bytes name, address owner, uint32 fuses, uint64 expiry)
          const logData = nameWrapperInterface.parseLog(log);
          const [node, name, owner, fuses, expiry] = logData.args;
          let parts = decodeNameWrapperBytes(name);
          let nameString = parts.join(".");
          let label = null;
          let labelhash = null;
          let labelhashDecimals = null;
          if (parts.length >= 2 && parts[parts.length - 1] == "eth" && ethers.utils.isValidName(nameString)) {
            label = parts[parts.length - 2];
            labelhash = ethers.utils.solidityKeccak256(["string"], [label]);
            labelhashDecimals = ethers.BigNumber.from(labelhash).toString();
          }
          const namehashDecimals = ethers.BigNumber.from(node).toString();
          const subdomain = parts.length >= 3 && parts[parts.length - 3] || null;
          if (ethers.utils.isValidName(label)) {
            eventRecord = { type: "NameWrapped", namehash: node, tokenId: namehashDecimals, name: nameString, label, labelhash, labelhashDecimals, subdomain, owner, fuses, expiry: parseInt(expiry), expirym90: moment.unix(parseInt(expiry)).subtract(90, 'days').unix() };
            // eventRecord = { type: "NameWrapped", label, owner, fuses, expiry: parseInt(expiry) };
            // if (subdomain) {
            //   console.log("With subdomain: " + nameString + " & " + JSON.stringify(eventRecord, null, 2));
            // }
          }
        } else if (log.topics[0] == "0xee2ba1195c65bcf218a83d874335c6bf9d9067b4c672f3c3bf16cf40de7586c4") {
          // ERC-1155 NameUnwrapped (index_topic_1 bytes32 node, address owner)
          const logData = nameWrapperInterface.parseLog(log);
          const [node, owner] = logData.args;
          eventRecord = { type: "NameUnwrapped", node, owner };

        } else if (log.topics[0] == "0x335721b01866dc23fbee8b6b2c7b1e14d6f05c28cd35a2c934239f94095602a0") {
          // NewResolver (index_topic_1 bytes32 node, address resolver)
          const logData = registryWithFallbackInterface.parseLog(log);
          const [node, resolver] = logData.args;
          eventRecord = { type: "NewResolver", node, resolver };
        } else if (log.topics[0] == "0xce0457fe73731f824cc272376169235128c118b49d344817417c6d108d155e82") {
          // NewOwner (index_topic_1 bytes32 node, index_topic_2 bytes32 label, address owner)
          const logData = registryWithFallbackInterface.parseLog(log);
          const [node, label, owner] = logData.args;
          eventRecord = { type: "NewOwner", node, label, owner };

        } else if (log.topics[0] == "0xb7d29e911041e8d9b843369e890bcb72c9388692ba48b65ac54e7214c4c348f7") {
          // NameChanged (index_topic_1 bytes32 node, string name)
          const logData = publicResolverInterface.parseLog(log);
          const [node, name] = logData.args;
          eventRecord = { type: "NameChanged", node, name };
        } else if (log.topics[0] == "0x52d7d861f09ab3d26239d492e8968629f95e9e318cf0b73bfddc441522a15fd2") {
          // AddrChanged (index_topic_1 bytes32 node, address a)
          const logData = publicResolverInterface.parseLog(log);
          const [node, a] = logData.args;
          eventRecord = { type: "AddrChanged", node, a };
        } else if (log.topics[0] == "0x65412581168e88a1e60c6459d7f44ae83ad0832e670826c05a4e2476b57af752") {
          // AddressChanged (index_topic_1 bytes32 node, uint256 coinType, bytes newAddress)
          const logData = publicResolverInterface.parseLog(log);
          const [node, coinType, newAddress] = logData.args;
          eventRecord = { type: "AddressChanged", node, coinType: coinType.toString(), newAddress };
        } else if (log.topics[0] == "0xd8c9334b1a9c2f9da342a0a2b32629c1a229b6445dad78947f674b44444a7550") {
          // TextChanged (index_topic_1 bytes32 node, index_topic_2 string indexedKey, string key)
          const logData = publicResolver2Interface.parseLog(log);
          const [node, indexedKey, key] = logData.args;
          eventRecord = { type: "TextChanged", node, indexedKey: indexedKey.hash, key };
        } else if (log.topics[0] == "0x448bc014f1536726cf8d54ff3d6481ed3cbc683c2591ca204274009afa09b1a1") {
          // TextChanged (index_topic_1 bytes32 node, index_topic_2 string indexedKey, string key, string value)
          const logData = publicResolverInterface.parseLog(log);
          const [node, indexedKey, key, value] = logData.args;
          eventRecord = { type: "TextChanged", node, indexedKey: indexedKey.hash, key, value };
        } else if (log.topics[0] == "0xe379c1624ed7e714cc0937528a32359d69d5281337765313dba4e081b72d7578") {
          // ContenthashChanged (index_topic_1 bytes32 node, bytes hash)
          const logData = publicResolverInterface.parseLog(log);
          const [node, hash] = logData.args;
          eventRecord = { type: "ContenthashChanged", node, hash };

        } else {
          console.log(now() + " INFO functions:parseEventLogs - UNHANDLED ENS log: " + JSON.stringify(log));
        }
      } else {
        console.log(now() + " INFO functions:parseEventLogs - UNHANDLED log: " + JSON.stringify(log));
      }
      if (eventRecord) {
        records.push( {
          chainId,
          blockNumber: parseInt(log.blockNumber),
          logIndex: parseInt(log.logIndex),
          txIndex: parseInt(log.transactionIndex),
          txHash: log.transactionHash,
          contract,
          ...eventRecord,
          confirmations: latestBlockNumber - log.blockNumber,
        });
      }
    }
  }
  // console.log(now() + " INFO functions:parseEventLogs - records: " + JSON.stringify(records, null, 2));
  return records;
}
