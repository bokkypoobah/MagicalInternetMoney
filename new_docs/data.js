const Data = {
  template: `
  <div>
    <b-button v-b-toggle.data-module size="sm" block variant="outline-info">Data</b-button>
    <b-collapse id="data-module" visible class="my-2">
      <b-card no-body class="border-0">
        <b-row>
          <b-col cols="4" class="small">Addresses</b-col>
          <b-col class="small truncate" cols="8">{{ Object.keys(addresses).length }}</b-col>
        </b-row>
        <b-row>
          <b-col cols="4" class="small">Registry</b-col>
          <b-col class="small truncate" cols="8">{{ Object.keys(registry[chainId] || {}).length }}</b-col>
        </b-row>
        <b-row>
          <b-col cols="4" class="small">Transfers</b-col>
          <b-col class="small truncate" cols="8">{{ transfers.length }}</b-col>
        </b-row>
        <b-row>
          <b-col cols="4" class="small">Token Contracts</b-col>
          <b-col class="small truncate" cols="8">{{ Object.keys(tokenContracts[chainId] || {}).length }}</b-col>
        </b-row>
        <!-- <b-row>
          <b-col cols="4" class="small">Assets</b-col>
          <b-col class="small truncate" cols="8">{{ Object.keys(assets).length }}</b-col>
        </b-row> -->
        <!-- <b-row>
          <b-col cols="4" class="small">ENS Map</b-col>
          <b-col class="small truncate" cols="8">{{ Object.keys(ensMap).length }}</b-col>
        </b-row> -->
      </b-card>
    </b-collapse>
  </div>
  `,
  data: function () {
    return {
      count: 0,
      reschedule: true,
    }
  },
  computed: {
    powerOn() {
      return store.getters['connection/powerOn'];
    },
    explorer () {
      return store.getters['connection/explorer'];
    },
    coinbase() {
      return store.getters['connection/coinbase'];
    },
    network() {
      return store.getters['connection/network'];
    },
    chainId() {
      return store.getters['connection/chainId'];
    },
    addresses() {
      return store.getters['data/addresses'];
    },
    registry() {
      return store.getters['data/registry'];
    },
    transfers() {
      return store.getters['data/transfers'];
    },
    tokenContracts() {
      return store.getters['data/tokenContracts'];
    },
    // mappings() {
    //   return store.getters['data/mappings'];
    // },
    // txs() {
    //   return store.getters['data/txs'];
    // },
    // assets() {
    //   return store.getters['data/assets'];
    // },
    // ensMap() {
    //   return store.getters['data/ensMap'];
    // },
  },
  methods: {
    async timeoutCallback() {
      logDebug("Data", "timeoutCallback() count: " + this.count);
      this.count++;
      var t = this;
      if (this.reschedule) {
        setTimeout(function() {
          t.timeoutCallback();
        }, 15000);
      }
    },
  },
  beforeDestroy() {
    logDebug("Data", "beforeDestroy()");
  },
  mounted() {
    logDebug("Data", "mounted() $route: " + JSON.stringify(this.$route.params));
    store.dispatch('config/restoreState');
    this.reschedule = true;
    logDebug("Data", "Calling timeoutCallback()");
    this.timeoutCallback();
  },
  destroyed() {
    this.reschedule = false;
  },
};

const dataModule = {
  namespaced: true,
  state: {
    addresses: {}, // Address => Info
    registry: {}, // Address => StealthMetaAddress
    transfers: {},
    tokenContracts: {},
    ensMap: {},
    exchangeRates: {},
    sync: {
      section: null,
      total: null,
      completed: null,
      halt: false,
    },
    db: {
      name: "magicalinternetmoneydata081b",
      version: 1,
      schemaDefinition: {
        announcements: '[chainId+blockNumber+logIndex],[blockNumber+contract],contract,confirmations,stealthAddress',
        registrations: '[chainId+blockNumber+logIndex],[blockNumber+contract],contract,confirmations',
        tokenEvents: '[chainId+blockNumber+logIndex],[blockNumber+contract],contract,confirmations',
        cache: '&objectName',
      },
      updated: null,
    },
  },
  getters: {
    addresses: state => state.addresses,
    registry: state => state.registry,
    transfers: state => state.transfers,
    tokenContracts: state => state.tokenContracts,
    ensMap: state => state.ensMap,
    exchangeRates: state => state.exchangeRates,
    sync: state => state.sync,
    db: state => state.db,
  },
  mutations: {
    setState(state, info) {
      // logInfo("dataModule", "mutations.setState - info: " + JSON.stringify(info, null, 2));
      Vue.set(state, info.name, info.data);
    },
    toggleAddressField(state, info) {
      Vue.set(state.addresses[info.account], info.field, !state.addresses[info.account][info.field]);
      logInfo("dataModule", "mutations.toggleAddressField - accounts[" + info.account + "]." + info.field + " = " + state.addresses[info.account][info.field]);
    },
    setAddressField(state, info) {
      Vue.set(state.addresses[info.account], info.field, info.value);
      logInfo("dataModule", "mutations.setAddressField - accounts[" + info.account + "]." + info.field + " = " + state.addresses[info.account][info.field]);
    },
    toggleTokenContractFavourite(state, tokenContract) {
      const chainId = store.getters['connection/chainId'];
      Vue.set(state.tokenContracts[chainId][tokenContract.address], 'favourite', !state.tokenContracts[chainId][tokenContract.address].favourite);
      logInfo("dataModule", "mutations.toggleTokenContractFavourite - tokenContract: " + JSON.stringify(state.tokenContracts[chainId][tokenContract.address]));
    },

    addNewAddress(state, newAccount) {
      logInfo("dataModule", "mutations.addNewAddress(" + JSON.stringify(newAccount, null, 2) + ")");
      let address = null;
      let linkedToAddress = null;
      let type = null;
      let mine = false;
      let source = null;
      if (newAccount.action == "addCoinbase") {
        address = store.getters['connection/coinbase'];
        type = "address";
        mine = true;
        source = "attached";
      } else if (newAccount.action == "addAddress") {
        address = ethers.utils.getAddress(newAccount.address);
        type = "address";
        mine = newAccount.mine;
        source = "manual";
      } else if (newAccount.action == "addStealthMetaAddress") {
        address = newAccount.address;
        linkedToAddress = newAccount.linkedToAddress;
        type = "stealthMetaAddress";
        mine = newAccount.mine;
        source = "manual";
      } else {
        address = newAccount.address;
        linkedToAddress = newAccount.linkedToAddress;
        type = "stealthMetaAddress";
        mine = true;
        source = "attached";
      }
      console.log("address: " + address);
      console.log("linkedToAddress: " + linkedToAddress);
      console.log("type: " + type);
      if (address in state.addresses) {
        Vue.set(state.addresses[address], 'type', type);
        if (type == "stealthMetaAddress") {
          Vue.set(state.addresses[address], 'linkedToAddress', linkedToAddress);
          Vue.set(state.addresses[address], 'phrase', newAccount.action == "generateStealthMetaAddress" ? newAccount.phrase : undefined);
          Vue.set(state.addresses[address], 'viewingPrivateKey', newAccount.action == "generateStealthMetaAddress" ? newAccount.viewingPrivateKey : undefined);
          Vue.set(state.addresses[address], 'spendingPublicKey', newAccount.action == "generateStealthMetaAddress" ? newAccount.spendingPublicKey : undefined);
          Vue.set(state.addresses[address], 'viewingPublicKey', newAccount.action == "generateStealthMetaAddress" ? newAccount.viewingPublicKey : undefined);
        }
        Vue.set(state.addresses[address], 'mine', mine);
        Vue.set(state.addresses[address], 'favourite', newAccount.favourite);
        Vue.set(state.addresses[address], 'name', newAccount.name);
      } else {
        if (type == "address") {
          Vue.set(state.addresses, address, {
            type,
            source,
            mine,
            favourite: newAccount.favourite,
            name: newAccount.name,
            notes: null,
          });
        } else {
          Vue.set(state.addresses, address, {
            type,
            linkedToAddress,
            phrase: newAccount.action == "generateStealthMetaAddress" ? newAccount.phrase : undefined,
            viewingPrivateKey: newAccount.action == "generateStealthMetaAddress" ? newAccount.viewingPrivateKey : undefined,
            spendingPublicKey: newAccount.action == "generateStealthMetaAddress" ? newAccount.spendingPublicKey : undefined,
            viewingPublicKey: newAccount.action == "generateStealthMetaAddress" ? newAccount.viewingPublicKey : undefined,
            source,
            mine,
            favourite: newAccount.favourite,
            name: newAccount.name,
            notes: null,
          });
        }
      }
      logInfo("dataModule", "mutations.addNewAddress AFTER - state.accounts: " + JSON.stringify(state.accounts, null, 2));
    },
    deleteAddress(state, address) {
      Vue.delete(state.addresses, address);
    },
    // addAccountEvent(state, info) {
    //   const [account, eventRecord] = [info.account, info.eventRecord];
    //   const addressData = state.addresses[account];
    //   if (!(eventRecord.txHash in addressData.events)) {
    //     addressData.events[eventRecord.txHash] = eventRecord.blockNumber;
    //   }
    // },
    // addAccountInternalTransactions(state, info) {
    //   const [account, results] = [info.account, info.results];
    //   const addressData = state.addresses[account];
    //   const groupByHashes = {};
    //   for (const result of results) {
    //     if (!(result.hash in addressData.internalTransactions)) {
    //       if (!(result.hash in groupByHashes)) {
    //         groupByHashes[result.hash] = [];
    //       }
    //       groupByHashes[result.hash].push(result);
    //     }
    //   }
    //   for (const [txHash, results] of Object.entries(groupByHashes)) {
    //     for (let resultIndex in results) {
    //       const result = results[resultIndex];
    //       if (!(txHash in addressData.internalTransactions)) {
    //         addressData.internalTransactions[txHash] = {};
    //       }
    //       addressData.internalTransactions[txHash][resultIndex] = { ...result, hash: undefined };
    //     }
    //   }
    // },
    // addAccountTransactions(state, info) {
    //   const [account, results] = [info.account, info.results];
    //   const addressData = state.addresses[account];
    //   for (const result of results) {
    //     if (!(result.hash in addressData.transactions)) {
    //       addressData.transactions[result.hash] = result.blockNumber;
    //     }
    //   }
    // },
    // updateAccountTimestampAndBlock(state, info) {
    //   const [account, events] = [info.account, info.events];
    //   Vue.set(state.addresses[account], 'updated', {
    //     timestamp: info.timestamp,
    //     blockNumber: info.blockNumber,
    //   });
    // },
    // addAccountToken(state, token) {
    //   const contract = ethers.utils.getAddress(token.contract);
    //   const contractData = state.addresses[contract];
    //   if (!(token.tokenId in contractData.assets)) {
    //     Vue.set(state.addresses[contract].assets, token.tokenId, {
    //       name: token.name,
    //       description: token.description,
    //       image: token.image,
    //       type: token.kind,
    //       isFlagged: token.isFlagged,
    //       events: {},
    //     });
    //   }
    // },
    // updateAccountToken(state, token) {
    //   const contract = ethers.utils.getAddress(token.contract);
    //   const contractData = state.addresses[contract] || {};
    //   if (token.tokenId in contractData.assets) {
    //     const newData = {
    //       ...state.addresses[contract].assets[token.tokenId],
    //       name: token.name,
    //       description: token.description,
    //       image: token.image,
    //       type: token.kind,
    //       isFlagged: token.isFlagged,
    //     };
    //     Vue.set(state.addresses[contract].assets, token.tokenId, newData);
    //   }
    // },
    // addAccountERC20Transfers(state, transfer) {
    //   const contract = ethers.utils.getAddress(transfer.contract);
    //   const contractData = state.addresses[contract];
    //   if (!(transfer.txHash in contractData.erc20transfers)) {
    //     Vue.set(state.addresses[contract].erc20transfers, transfer.txHash, {});
    //   }
    //   if (!(transfer.logIndex in state.addresses[contract].erc20transfers[transfer.txHash])) {
    //     const tempTransfer = { ...transfer, txHash: undefined, logIndex: undefined };
    //     Vue.set(state.addresses[contract].erc20transfers[transfer.txHash], transfer.logIndex, tempTransfer);
    //   }
    // },
    // addAccountTokenEvents(state, info) {
    //   console.log("addAccountTokenEvents: " + info.txHash + " " + JSON.stringify(info.events, null, 2));
    //   for (const [eventIndex, event] of info.events.entries()) {
    //     // console.log("  " + eventIndex + " " + event.type + " " + event.contract + " " + event.tokenId + " " + JSON.stringify(event));
    //     if (event.type == 'preerc721' || event.type == 'erc721' || event.type == 'erc1155') {
    //       const contractData = state.addresses[event.contract] || {};
    //       // console.log("contractData: " + JSON.stringify(contractData, null, 2));
    //       // console.log("contractData.assets[event.tokenId]: " + JSON.stringify(contractData.assets[event.tokenId], null, 2));
    //       if (contractData.assets[event.tokenId]) {
    //         if (!(info.txHash in contractData.assets[event.tokenId].events)) {
    //           Vue.set(state.addresses[event.contract].assets[event.tokenId].events, info.txHash, {
    //             blockNumber: info.blockNumber,
    //             transactionIndex: info.transactionIndex,
    //             timestamp: info.timestamp,
    //             logs: {},
    //           });
    //         }
    //         if (!(event.logIndex in state.addresses[event.contract].assets[event.tokenId].events[info.txHash].logs)) {
    //           Vue.set(state.addresses[event.contract].assets[event.tokenId].events[info.txHash].logs, event.logIndex, {
    //             // txHash: info.txHash,
    //             action: event.action || undefined,
    //             type: event.type || undefined,
    //             from: event.from || undefined,
    //             to: event.to || undefined,
    //             price: event.price || undefined,
    //           });
    //         }
    //         // console.log("contractData.assets[event.tokenId]: " + JSON.stringify(contractData.assets[event.tokenId], null, 2));
    //       }
    //       // console.log(txHash + " " + eventItem.type + " " + eventItem.contract + " " + (tokenContract ? tokenContract.type : '') + " " + (tokenContract ? tokenContract.name : '') + " " + (eventItem.tokenId ? eventItem.tokenId : '?'));
    //     }
    //   }
    // },
    // resetTokens(state) {
    //   for (const [account, addressData] of Object.entries(state.accounts)) {
    //     if (['preerc721', 'erc721', 'erc1155'].includes(addressData.type)) {
    //       Vue.set(state.addresses[account], 'assets', {});
    //     }
    //   }
    // },
    // addBlock(state, info) {
    //   const [blockNumber, timestamp, account, asset, balance] = [info.blockNumber, info.timestamp, info.account, info.asset, info.balance];
    //   if (!(blockNumber in state.blocks)) {
    //     Vue.set(state.blocks, blockNumber, {
    //       timestamp,
    //       balances: {},
    //     });
    //   }
    //   if (!(account in state.blocks[blockNumber].balances)) {
    //     Vue.set(state.blocks[blockNumber].balances, account, {});
    //   }
    //   if (!(asset in state.blocks[blockNumber].balances[account])) {
    //     Vue.set(state.blocks[blockNumber].balances[account], asset, balance);
    //   }
    // },
    // addNewFunctionSelectors(state, functionSelectors) {
    //   for (const [functionSelector, functionNames] of Object.entries(functionSelectors)) {
    //     if (!(functionSelector in state.functionSelectors)) {
    //       Vue.set(state.functionSelectors, functionSelector, functionNames.map(e => e.name));
    //     }
    //   }
    // },
    // addNewEventSelectors(state, eventSelectors) {
    //   for (const [eventSelector, eventNames] of Object.entries(eventSelectors)) {
    //     if (!(eventSelector in state.eventSelectors)) {
    //       Vue.set(state.eventSelectors, eventSelector, eventNames.map(e => e.name));
    //     }
    //   }
    // },
    // addENSName(state, nameInfo) {
    //   Vue.set(state.ensMap, nameInfo.account, nameInfo.name);
    // },
    // addTxs(state, info) {
    //   Vue.set(state.txs, info.txHash, info.txInfo);
    // },
    // updateTxData(state, info) {
    //   Vue.set(state.txs[info.txHash].dataImported, 'tx', {
    //     hash: info.tx.hash,
    //     type: info.tx.type,
    //     blockHash: info.tx.blockHash,
    //     blockNumber: info.tx.blockNumber,
    //     transactionIndex: info.tx.transactionIndex,
    //     from: info.tx.from,
    //     gasPrice: info.tx.gasPrice,
    //     gasLimit: info.tx.gasLimit,
    //     to: info.tx.to,
    //     value: info.tx.value,
    //     nonce: info.tx.nonce,
    //     data: info.tx.data,
    //     r: info.tx.r,
    //     s: info.tx.s,
    //     v: info.tx.v,
    //     chainId: info.tx.chainId,
    //   });
    //   Vue.set(state.txs[info.txHash].dataImported, 'txReceipt', info.txReceipt);
    //   Vue.set(state.txs[info.txHash].computed.info, 'summary', info.summary);
    // },
    setExchangeRates(state, exchangeRates) {
      // const dates = Object.keys(exchangeRates);
      // dates.sort();
      // for (let date of dates) {
      //   console.log(date + "\t" + exchangeRates[date]);
      // }
      Vue.set(state, 'exchangeRates', exchangeRates);
    },
    saveTxTags(state, info) {
      if (!(info.txHash in state.txsInfo)) {
        Vue.set(state.txsInfo, info.txHash, {
          tags: info.tags,
        });
      } else {
        Vue.set(state.txsInfo[info.txHash], 'tags', info.tags);
      }
    },
    addTagToTxs(state, info) {
      for (const txHash of Object.keys(info.txHashes)) {
        if (!(txHash in state.txsInfo)) {
          Vue.set(state.txsInfo, txHash, {
            tags: [info.tag],
          });
        } else {
          const currentTags = state.txsInfo[txHash].tags || [];
          if (!currentTags.includes(info.tag)) {
            currentTags.push(info.tag);
            Vue.set(state.txsInfo[txHash], 'tags', currentTags);
          }
        }
      }
    },
    removeTagFromTxs(state, info) {
      for (const txHash of Object.keys(info.txHashes)) {
        if (txHash in state.txsInfo) {
          const currentTags = state.txsInfo[txHash].tags || [];
          if (currentTags.includes(info.tag)) {
            const newTags = currentTags.filter(e => e != info.tag);
            if (newTags.length == 0 && Object.keys(state.txsInfo[txHash]).length == 1) {
              Vue.delete(state.txsInfo, txHash);
            } else {
              Vue.set(state.txsInfo[txHash], 'tags', newTags);
            }
          }
        }
      }
    },
    setSyncSection(state, info) {
      state.sync.section = info.section;
      state.sync.total = info.total;
    },
    setSyncCompleted(state, completed) {
      state.sync.completed = completed;
    },
    setSyncHalt(state, halt) {
      state.sync.halt = halt;
    },
  },
  actions: {
    async restoreState(context) {
      logInfo("dataModule", "actions.restoreState");
      if (Object.keys(context.state.transfers).length == 0) {
        const db0 = new Dexie(context.state.db.name);
        db0.version(context.state.db.version).stores(context.state.db.schemaDefinition);
        for (let type of ['addresses', 'registry', 'transfers', 'tokenContracts']) {
          const data = await db0.cache.where("objectName").equals(type).toArray();
          if (data.length == 1) {
            // logInfo("dataModule", "actions.restoreState " + type + " => " + JSON.stringify(data[0].object));
            context.commit('setState', { name: type, data: data[0].object });
          }
        }
      }
    },
    async saveData(context, types) {
      const db0 = new Dexie(context.state.db.name);
      db0.version(context.state.db.version).stores(context.state.db.schemaDefinition);
      for (let type of types) {
        await db0.cache.put({ objectName: type, object: context.state[type] }).then (function() {
        }).catch(function(error) {
          console.log("error: " + error);
        });
      }
      db0.close();
    },

    async toggleAddressField(context, info) {
      // logInfo("dataModule", "actions.toggleAddressField - info: " + JSON.stringify(info));
      await context.commit('toggleAddressField', info);
      await context.dispatch('saveData', ['addresses']);
    },
    async setAddressField(context, info) {
      // logInfo("dataModule", "actions.setAddressField - info: " + JSON.stringify(info));
      await context.commit('setAddressField', info);
      await context.dispatch('saveData', ['addresses']);
    },
    async toggleTokenContractFavourite(context, tokenContract) {
      // logInfo("dataModule", "actions.toggleAddressField - info: " + JSON.stringify(info));
      await context.commit('toggleTokenContractFavourite', tokenContract);
      await context.dispatch('saveData', ['tokenContracts']);
    },

    async deleteAddress(context, account) {
      await context.commit('deleteAddress', account);
      await context.dispatch('saveData', ['addresses']);
    },
    async saveTxTags(context, info) {
      await context.commit('saveTxTags', info);
      await context.dispatch('saveData', ['txsInfo']);
    },
    async addTagToTxs(context, info) {
      await context.commit('addTagToTxs', info);
      await context.dispatch('saveData', ['txsInfo']);
    },
    async removeTagFromTxs(context, info) {
      await context.commit('removeTagFromTxs', info);
      await context.dispatch('saveData', ['txsInfo']);
    },
    async refreshTokenMetadata(context, token) {
      console.log("actions.refreshTokenMetadata - token: " + JSON.stringify(token));
      const url = "https://api.reservoir.tools/tokens/v5?tokens=" + token.contract + ":" + token.tokenId;
      console.log(url);
      const data = await fetch(url).then(response => response.json());
      if (data.tokens) {
        for (let record of data.tokens) {
          context.commit('updateAccountToken', record.token);
        }
      }
      await context.dispatch('saveData', ['accounts']);
    },
    async setSyncHalt(context, halt) {
      context.commit('setSyncHalt', halt);
    },
    async resetTokens(context) {
      await context.commit('resetTokens');
      await context.dispatch('saveData', ['accounts']);
    },
    async resetData(context, section) {
      console.log("data.actions.resetData - section: " + section);
      context.commit('setState', { name: section, data: {} });
      const db0 = new Dexie(context.state.db.name);
      db0.version(context.state.db.version).stores(context.state.db.schemaDefinition);
      const status = await db0.cache.where("objectName").equals(section).delete();
      console.log("status: " + JSON.stringify(status));
      db0.close();
    },
    async addNewAddress(context, newAccount) {
      logInfo("dataModule", "actions.addNewAddress - newAccount: " + JSON.stringify(newAccount, null, 2) + ")");
      context.commit('addNewAddress', newAccount);
      await context.dispatch('saveData', ['addresses']);
    },
    async restoreAccount(context, addressData) {
      logInfo("dataModule", "actions.restoreAccount - addressData: " + JSON.stringify(addressData));
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const ensReverseRecordsContract = new ethers.Contract(ENSREVERSERECORDSADDRESS, ENSREVERSERECORDSABI, provider);
      const accountInfo = await getAccountInfo(addressData.account, provider)
      if (accountInfo.account) {
        context.commit('addNewAddress', accountInfo);
        context.commit('addNewAccountInfo', addressData);
      }
      const names = await ensReverseRecordsContract.getNames([addressData.account]);
      const name = names.length == 1 ? names[0] : addressData.account;
      if (!(addressData.account in context.state.ensMap)) {
        context.commit('addENSName', { account: addressData.account, name });
      }
    },
    async restoreIntermediateData(context, info) {
      if (info.blocks && info.txs) {
        await context.commit('setState', { name: 'blocks', data: info.blocks });
        await context.commit('setState', { name: 'txs', data: info.txs });
      }
    },
    async syncIt(context, info) {
      logInfo("dataModule", "actions.syncIt - sections: " + JSON.stringify(info.sections) + ", parameters: " + JSON.stringify(info.parameters).substring(0, 1000));
      // const db = new Dexie(context.state.db.name);
      // db.version(context.state.db.version).stores(context.state.db.schemaDefinition);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const block = await provider.getBlock();
      const confirmations = store.getters['config/settings'].confirmations && parseInt(store.getters['config/settings'].confirmations) || 10;
      const blockNumber = block && block.number || null;
      // const confirmedBlockNumber = block && block.number && (block.number - confirmations) || null;
      // const confirmedBlock = await provider.getBlock(confirmedBlockNumber);
      // const confirmedTimestamp = confirmedBlock && confirmedBlock.timestamp || null;
      // const etherscanAPIKey = store.getters['config/settings'].etherscanAPIKey && store.getters['config/settings'].etherscanAPIKey.length > 0 && store.getters['config/settings'].etherscanAPIKey || "YourApiKeyToken";
      const cryptoCompareAPIKey = store.getters['config/settings'].cryptoCompareAPIKey && store.getters['config/settings'].cryptoCompareAPIKey.length > 0 && store.getters['config/settings'].cryptoCompareAPIKey || null;
      // const etherscanBatchSize = store.getters['config/settings'].etherscanBatchSize && parseInt(store.getters['config/settings'].etherscanBatchSize) || 5_000_000;
      // const OVERLAPBLOCKS = 10000;
      const processFilters = store.getters['config/processFilters'];

      const accountsToSync = [];
      // for (const [account, addressData] of Object.entries(context.state.accounts)) {
      //   const accountsInfo = context.state.accountsInfo[account] || {};
      //   if ((info.parameters.length == 0 && accountsInfo.sync) || info.parameters.includes(account)) {
      //       accountsToSync.push(account);
      //   }
      // }
      const chainId = store.getters['connection/chainId'];
      const coinbase = store.getters['connection/coinbase'];
      if (!(coinbase in context.state.addresses)) {
        context.commit('addNewAddress', { action: "addCoinbase" });
      }

      for (const [sectionIndex, section] of info.sections.entries()) {
        logInfo("dataModule", "actions.syncIt: " + sectionIndex + "." + section);
        const parameter = { chainId, coinbase, /*accountsToSync,*/ blockNumber, confirmations, /*confirmedBlockNumber, confirmedTimestamp, etherscanAPIKey,*/ cryptoCompareAPIKey/*, etherscanBatchSize, OVERLAPBLOCKS, processFilters*/ };

        if (section == "syncAnnouncements" || section == "all") {
          await context.dispatch('syncAnnouncements', parameter);
        }
        if (section == "syncAnnouncementsData" || section == "all") {
          await context.dispatch('syncAnnouncementsData', parameter);
        }
        if (section == "identifyMyStealthTransfers" || section == "all") {
          await context.dispatch('identifyMyStealthTransfers', parameter);
        }
        if (section == "collateTransfers" || section == "all") {
          await context.dispatch('collateTransfers', parameter);
        }
        if (section == "syncRegistrations" || section == "all") {
          await context.dispatch('syncRegistrations', parameter);
        }
        if (section == "syncRegistrationsData" || section == "all") {
          await context.dispatch('syncRegistrationsData', parameter);
        }
        if (section == "collateRegistrations" || section == "all") {
          await context.dispatch('collateRegistrations', parameter);
        }
        if (section == "syncTokens" || section == "all") {
          await context.dispatch('syncTokens', parameter);
        }
        if (section == "collateTokens" || section == "all") {
          await context.dispatch('collateTokens', parameter);
        }
        if (section == "syncERC721Metadata" || section == "xall") {
          await context.dispatch('syncERC721Metadata', parameter);
        }

        // if (section == "syncTransferEvents" || section == "all") {
        //   await context.dispatch('syncTransferEvents', parameter);
        // }
        // if (section == "syncImportInternalTransactions" || section == "all") {
        //   await context.dispatch('syncImportInternalTransactions', parameter);
        // }
        // if (section == "syncImportTransactions" || section == "all") {
        //   await context.dispatch('syncImportTransactions', parameter);
        // }
        // if (section == "syncBlocksAndBalances" || section == "all") {
        //   await context.dispatch('syncBlocksAndBalances', parameter);
        // }
        // if (section == "syncTransactions" || section == "all") {
        //   await context.dispatch('syncTransactions', parameter);
        // }
        // if (section == "syncFunctionSelectors" || section == "all") {
        //   await context.dispatch('syncFunctionSelectors', parameter);
        // }
        // if (section == "syncEventSelectors" || section == "all") {
        //   await context.dispatch('syncEventSelectors', parameter);
        // }
        // if (section == "syncBuildTokenContractsAndAccounts" || section == "all") {
        //   await context.dispatch('syncBuildTokenContractsAndAccounts', parameter);
        // }
        // if (section == "syncBuildTokens" || section == "all") {
        //   await context.dispatch('syncBuildTokens', parameter);
        // }
        // if (section == "syncBuildTokenEvents" || section == "all") {
        //   await context.dispatch('syncBuildTokenEvents', parameter);
        // }

        // if (section == "syncImportExchangeRates" || section == "all") {
        //   await context.dispatch('syncImportExchangeRates', parameter);
        // }
        // if (section == "syncRefreshENS" || section == "all") {
        //   await context.dispatch('syncRefreshENS', parameter);
        // }
      }
      context.dispatch('saveData', ['addresses', 'registry' /*, 'blocks', 'txs', 'ensMap'*/]);
      context.commit('setSyncSection', { section: null, total: null });
      context.commit('setSyncHalt', false);
    },
    async syncAnnouncements(context, parameter) {
      logInfo("dataModule", "actions.syncAnnouncements BEGIN: " + JSON.stringify(parameter));
      const db = new Dexie(context.state.db.name);
      db.version(context.state.db.version).stores(context.state.db.schemaDefinition);
      const provider = new ethers.providers.Web3Provider(window.ethereum);

      // Announcement (index_topic_1 uint256 schemeId, index_topic_2 address stealthAddress, index_topic_3 address caller, bytes ephemeralPublicKey, bytes metadata)
      // 0x5f0eab8057630ba7676c49b4f21a0231414e79474595be8e4c432fbf6bf0f4e7
      const erc5564AnnouncerContract = new ethers.Contract(ERC5564ANNOUNCERADDRESS_SEPOLIA, ERC5564ANNOUNCERABI_SEPOLIA, provider);
      let total = 0;
      let t = this;
      async function processLogs(fromBlock, toBlock, selectedContracts, selectedCallers, logs) {
        total = parseInt(total) + logs.length;

        logInfo("dataModule", "actions.syncAnnouncements.processLogs: " + fromBlock + " - " + toBlock + " " + logs.length + " " + total);
        const records = [];
        for (const log of logs) {
          if (!log.removed) {
            // console.log(JSON.stringify(log, null, 2));
            const logData = erc5564AnnouncerContract.interface.parseLog(log);
            const contract = log.address;
            const caller = logData.args[2];
            // if (selectedContracts.includes(contract) && selectedCallers.includes(caller)) {
              // console.log("  Processing: " + JSON.stringify(log));
              const transfers = [];
              const metadata = logData.args[4];
              let segment = 0;
              let part;
              do {
                part = metadata.substring(4 + (segment * 112), 4 + (segment * 112) + 112);
                if (part.length == 112) {
                  const functionSelector = "0x" + part.substring(0, 8);
                  const token = ethers.utils.getAddress("0x" + part.substring(8, 48));
                  const valueString = part.substring(48, 112)
                  const value = ethers.BigNumber.from("0x" + valueString).toString();
                  transfers.push({ functionSelector, token, value });
                }
                segment++;
              } while (part.length == 112);
              records.push( {
                chainId: parameter.chainId,
                blockNumber: parseInt(log.blockNumber),
                logIndex: parseInt(log.logIndex),
                txIndex: parseInt(log.transactionIndex),
                txHash: log.transactionHash,
                contract,
                name: logData.name,
                schemeId: parseInt(logData.args[0]),
                stealthAddress: logData.args[1],
                linkedTo: {
                  stealthMetaAddress: null,
                  address: null,
                },
                caller,
                ephemeralPublicKey: logData.args[3],
                metadata: logData.args[4],
                transfers,
                confirmations: parameter.blockNumber - log.blockNumber,
                timestamp: null,
                tx: null,
              });
            // }
          }
        }
        // console.log("records: " + JSON.stringify(records, null, 2));
        if (records.length) {
          await db.announcements.bulkPut(records).then (function() {
          }).catch(function(error) {
            console.log("syncAnnouncements.bulkPut error: " + error);
          });
        }
      }
      async function getLogs(fromBlock, toBlock, selectedContracts, selectedCallers, processLogs) {
        logInfo("dataModule", "actions.syncAnnouncements.getLogs: " + fromBlock + " - " + toBlock);
        try {
          const filter = {
            address: null,
            fromBlock,
            toBlock,
            topics: [
              '0x5f0eab8057630ba7676c49b4f21a0231414e79474595be8e4c432fbf6bf0f4e7',
              null,
              null
            ]
          };
          const eventLogs = await provider.getLogs(filter);
          await processLogs(fromBlock, toBlock, selectedContracts, selectedCallers, eventLogs);
        } catch (e) {
          const mid = parseInt((fromBlock + toBlock) / 2);
          await getLogs(fromBlock, mid, selectedContracts, selectedCallers, processLogs);
          await getLogs(parseInt(mid) + 1, toBlock, selectedContracts, selectedCallers, processLogs);
        }
      }
      logInfo("dataModule", "actions.syncAnnouncements BEGIN");
      // this.sync.completed = 0;
      // this.sync.total = 0;
      // this.sync.section = 'Stealth Address Announcements';
      const selectedContracts = [];
      const selectedCallers = [];
      // for (const [chainId, chainData] of Object.entries(this.contracts)) {
      //   for (const [contract, contractData] of Object.entries(chainData)) {
      //     if (contractData.type == "announcer" && contractData.read) {
      //       selectedContracts.push(contract);
      //     }
      //     if (contractData.type == "caller" && contractData.read) {
      //       selectedCallers.push(contract);
      //     }
      //   }
      // }
      // console.log("selectedCallers: " + JSON.stringify(selectedCallers, null, 2));
      // if (selectedContracts.length > 0) {
        const deleteCall = await db.announcements.where("confirmations").below(parameter.confirmations).delete();
        const latest = await db.announcements.where('[chainId+blockNumber+logIndex]').between([parameter.chainId, Dexie.minKey, Dexie.minKey],[parameter.chainId, Dexie.maxKey, Dexie.maxKey]).last();
        // console.log("latest: " + JSON.stringify(latest, null, 2));
        const startBlock = latest ? parseInt(latest.blockNumber) + 1: 0;
        // const startBlock = 0;
        await getLogs(startBlock, parameter.blockNumber, selectedContracts, selectedCallers, processLogs);
      // }
      logInfo("dataModule", "actions.syncAnnouncements END");
    },

    async syncRegistrations(context, parameter) {
      logInfo("dataModule", "actions.syncRegistrations BEGIN: " + JSON.stringify(parameter));
      const db = new Dexie(context.state.db.name);
      db.version(context.state.db.version).stores(context.state.db.schemaDefinition);
      const provider = new ethers.providers.Web3Provider(window.ethereum);

      // Note: Following is ERC-6538: Stealth Meta-Address Registry with registrant being bytes32 instead of bytes
      // OLD StealthMetaAddressSet (index_topic_1 bytes32 registrant, index_topic_2 uint256 scheme, bytes stealthMetaAddress)
      // OLD 0x0bb4b5456abb9a4e7e0624d821e95e2fcc8a761c9227b5d761ae0da4a3fda233
      // StealthMetaAddressSet (index_topic_1 address registrant, index_topic_2 uint256 scheme, bytes stealthMetaAddress)
      // 0x4e739a47dfa4fd3cfa92f8fe760cebe125565927e5c422cb28e7aa388a067af9
      const erc5564RegistryContract = new ethers.Contract(ERC5564REGISTRYADDRESS_SEPOLIA, ERC5564REGISTRYABI_SEPOLIA, provider);
      let total = 0;
      let t = this;
      async function processLogs(fromBlock, toBlock, selectedContracts, logs) {
        total = parseInt(total) + logs.length;
        logInfo("dataModule", "actions.syncRegistrations.processLogs: " + fromBlock + " - " + toBlock + " " + logs.length + " " + total);
        const records = [];
        for (const log of logs) {
          if (!log.removed) {
            const logData = erc5564RegistryContract.interface.parseLog(log);
            const contract = log.address;
            // if (selectedContracts.includes(contract)) {
              records.push( {
                chainId: parameter.chainId,
                blockNumber: parseInt(log.blockNumber),
                logIndex: parseInt(log.logIndex),
                txIndex: parseInt(log.transactionIndex),
                txHash: log.transactionHash,
                contract,
                name: logData.name,
                registrant: ethers.utils.getAddress(logData.args[0]),
                schemeId: parseInt(logData.args[1]),
                stealthMetaAddress: ethers.utils.toUtf8String(logData.args[2]),
                mine: false,
                confirmations: parameter.blockNumber - log.blockNumber,
                timestamp: null,
                tx: null,
              });
            // }
          }
        }
        if (records.length) {
          await db.registrations.bulkPut(records).then (function() {
          }).catch(function(error) {
            console.log("syncRegistrations.bulkPut error: " + error);
          });
        }
      }
      async function getLogs(fromBlock, toBlock, selectedContracts, processLogs) {
        logInfo("dataModule", "actions.syncRegistrations.getLogs: " + fromBlock + " - " + toBlock);
        try {
          const filter = {
            address: null,
            fromBlock,
            toBlock,
            topics: [
              '0x4e739a47dfa4fd3cfa92f8fe760cebe125565927e5c422cb28e7aa388a067af9',
              null,
              null
            ]
          };
          const eventLogs = await provider.getLogs(filter);
          await processLogs(fromBlock, toBlock, selectedContracts, eventLogs);
        } catch (e) {
          const mid = parseInt((fromBlock + toBlock) / 2);
          await getLogs(fromBlock, mid, selectedContracts, processLogs);
          await getLogs(parseInt(mid) + 1, toBlock, selectedContracts, processLogs);
        }
      }
      logInfo("dataModule", "actions.syncRegistrations BEGIN");
      // this.sync.completed = 0;
      // this.sync.total = 0;
      // this.sync.section = 'Stealth Address Registry';
      const selectedContracts = [];
      // for (const [chainId, chainData] of Object.entries(this.contracts)) {
      //   for (const [contract, contractData] of Object.entries(chainData)) {
      //     if (contractData.type == "registry" && contractData.read) {
      //       selectedContracts.push(contract);
      //     }
      //   }
      // }
      // if (selectedContracts.length > 0) {
        const deleteCall = await db.registrations.where("confirmations").below(parameter.confirmations).delete();
        const latest = await db.registrations.where('[chainId+blockNumber+logIndex]').between([parameter.chainId, Dexie.minKey, Dexie.minKey],[parameter.chainId, Dexie.maxKey, Dexie.maxKey]).last();
        const startBlock = latest ? parseInt(latest.blockNumber) + 1: 0;
        // const startBlock = 0;
        await getLogs(startBlock, parameter.blockNumber, selectedContracts, processLogs);
      // }
      logInfo("dataModule", "actions.syncRegistrations END");
    },

    async syncAnnouncementsData(context, parameter) {
      const DB_PROCESSING_BATCH_SIZE = 123;
      logInfo("dataModule", "actions.syncAnnouncementsData: " + JSON.stringify(parameter));
      const db = new Dexie(context.state.db.name);
      db.version(context.state.db.version).stores(context.state.db.schemaDefinition);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      let rows = 0;
      let done = false;
      do {
        let data = await db.announcements.offset(rows).limit(DB_PROCESSING_BATCH_SIZE).toArray();
        logInfo("dataModule", "actions.syncAnnouncementsData - data.length: " + data.length + ", first[0..9]: " + JSON.stringify(data.slice(0, 10).map(e => e.blockNumber + '.' + e.logIndex )));
        rows = parseInt(rows) + data.length;
        done = data.length < DB_PROCESSING_BATCH_SIZE;
      } while (!done);
      const total = rows;
      logInfo("dataModule", "actions.syncAnnouncementsData - total: " + total);
      // this.sync.completed = 0;
      // this.sync.total = rows;
      // this.sync.section = 'Announcements Tx Data';
      rows = 0;
      do {
        let data = await db.announcements.offset(rows).limit(DB_PROCESSING_BATCH_SIZE).toArray();
        console.log(moment().format("HH:mm:ss") + " syncAnnouncementsData - data.length: " + data.length + ", first[0..9]: " + JSON.stringify(data.slice(0, 10).map(e => e.blockNumber + '.' + e.logIndex )));
        const records = [];
        for (const item of data) {
          // console.log(moment().format("HH:mm:ss") + " syncAnnouncementsData: " + JSON.stringify(item));
          if (item.timestamp == null && item.chainId == parameter.chainId) {
            const block = await provider.getBlock(item.blockNumber);
            item.timestamp = block.timestamp;
            const tx = await provider.getTransaction(item.txHash);
            const txReceipt = await provider.getTransactionReceipt(item.txHash);
            item.tx = {
              type: tx.type,
              blockHash: tx.blockHash,
              from: tx.from,
              gasPrice: ethers.BigNumber.from(tx.gasPrice).toString(),
              gasLimit: ethers.BigNumber.from(tx.gasLimit).toString(),
              to: tx.to,
              value: ethers.BigNumber.from(tx.value).toString(),
              nonce: tx.nonce,
              data: tx.to && tx.data || null, // Remove contract creation data to reduce memory footprint
              chainId: tx.chainId,
              contractAddress: txReceipt.contractAddress,
              transactionIndex: txReceipt.transactionIndex,
              gasUsed: ethers.BigNumber.from(txReceipt.gasUsed).toString(),
              blockHash: txReceipt.blockHash,
              logs: txReceipt.logs,
              cumulativeGasUsed: ethers.BigNumber.from(txReceipt.cumulativeGasUsed).toString(),
              effectiveGasPrice: ethers.BigNumber.from(txReceipt.effectiveGasPrice).toString(),
              status: txReceipt.status,
              type: txReceipt.type,
            };
            records.push(item);
          }
        }
        if (records.length > 0) {
          await db.announcements.bulkPut(records).then (function() {
          }).catch(function(error) {
            console.log("syncAnnouncementsData.bulkPut error: " + error);
          });
        }
        rows = parseInt(rows) + data.length;
        // this.sync.completed = rows;
        done = data.length < DB_PROCESSING_BATCH_SIZE;
      } while (!done);

      logInfo("dataModule", "actions.syncAnnouncementsData END");
    },

    async identifyMyStealthTransfers(context, parameter) {

      function checkStealthAddress(stealthAddress, ephemeralPublicKey, viewingPrivateKey, spendingPublicKey) {
        const result = {};
        // console.log(moment().format("HH:mm:ss") + " processDataOld - checkStealthAddress - stealthAddress: " + stealthAddress + ", ephemeralPublicKey: " + ephemeralPublicKey + ", viewingPrivateKey: " + viewingPrivateKey + ", spendingPublicKey: " + spendingPublicKey);
        // console.log("    Check stealthAddress: " + stealthAddress + ", ephemeralPublicKey: " + ephemeralPublicKey + ", viewingPrivateKey: " + viewingPrivateKey + ", spendingPublicKey: " + spendingPublicKey);
        result.sharedSecret = nobleCurves.secp256k1.getSharedSecret(viewingPrivateKey.substring(2), ephemeralPublicKey.substring(2), false);
        result.hashedSharedSecret = ethers.utils.keccak256(result.sharedSecret.slice(1));
        result.hashedSharedSecretPoint = nobleCurves.secp256k1.ProjectivePoint.fromPrivateKey(result.hashedSharedSecret.substring(2));
        result.stealthPublicKey = nobleCurves.secp256k1.ProjectivePoint.fromHex(spendingPublicKey.substring(2)).add(result.hashedSharedSecretPoint);
        result.stealthAddress = ethers.utils.computeAddress("0x" + result.stealthPublicKey.toHex(false));
        result.match = result.stealthAddress == stealthAddress;
        return result;
      }

      const DB_PROCESSING_BATCH_SIZE = 123;
      logInfo("dataModule", "actions.identifyMyStealthTransfers: " + JSON.stringify(parameter));
      const db = new Dexie(context.state.db.name);
      db.version(context.state.db.version).stores(context.state.db.schemaDefinition);
      const provider = new ethers.providers.Web3Provider(window.ethereum);

      // const accounts = store.getters['data/accounts'];
      const addresses = context.state.addresses;
      logInfo("dataModule", "actions.identifyMyStealthTransfers addresses BEFORE: " + JSON.stringify(addresses, null, 2));
      const checkAddresses = [];
      for (const [address, addressData] of Object.entries(addresses)) {
        if (addressData.type == "stealthMetaAddress" && addressData.mine && addressData.viewingPrivateKey) {
          checkAddresses.push({ address, ...addressData });
        }
      }
      console.log(moment().format("HH:mm:ss") + " processData - checkAddresses: " + JSON.stringify(checkAddresses.map(e => e.address)));

      let rows = 0;
      let done = false;
      do {
        let data = await db.announcements.offset(rows).limit(DB_PROCESSING_BATCH_SIZE).toArray();
        console.log(moment().format("HH:mm:ss") + " processData - data.length: " + data.length + ", first[0..9]: " + JSON.stringify(data.slice(0, 10).map(e => e.blockNumber + '.' + e.logIndex )));
        const writeRecords = [];
        for (const item of data) {
          const sender = item.tx && item.tx.from || null;
          const senderData = sender && addresses[sender] || {};
          console.log("sender: " + sender + " => " + JSON.stringify(senderData));
          item.iSent = senderData.mine || false;
          item.iReceived = false;
          delete item.linkedTo;
          const stealthAddress = item.stealthAddress;
          // const stealthAddressData = this.addresses[stealthAddress];
          const ephemeralPublicKey = item.ephemeralPublicKey;
          for (const account of checkAddresses) {
            console.log("Checking account: " + JSON.stringify(account));
            const viewingPrivateKey = account.viewingPrivateKey;
            const viewingPublicKey = account.viewingPublicKey;
            const spendingPublicKey = account.spendingPublicKey;
            const status = checkStealthAddress(stealthAddress, ephemeralPublicKey, viewingPrivateKey, spendingPublicKey);
            if (status && status.match) {
              item.linkedTo = { stealthMetaAddress: account.address, address: account.linkedToAddress };
              item.iReceived = true;
              if (stealthAddress in addresses) {
                if (addresses[stealthAddress].type != "stealthAddress") {
                  addresses[stealthAddress].type = "stealthAddress";
                  addresses[stealthAddress].linkedTo = {
                    stealthMetaAddress: account.address,
                    address: account.linkedToAddress,
                  };
                  addresses[stealthAddress].mine = true;
                }
              } else {
                addresses[stealthAddress] = {
                  type: "stealthAddress",
                  linkedTo: {
                    stealthMetaAddress: account.address,
                    address: account.linkedToAddress,
                  },
                  source: "announcer",
                  mine: true,
                  favourite: false,
                  name: null,
                  notes: null,
                };
              }
              // Vue.set(this.addresses[stealthAddress], 'linkedTo', { stealthMetaAddress: address.address, address: address.linkedTo.address });
              // Vue.set(this.addresses[stealthAddress], 'mine', true);
              break;
            }
          }
          writeRecords.push(item);
        }
        if (writeRecords.length > 0) {
          await db.announcements.bulkPut(writeRecords).then (function() {
          }).catch(function(error) {
            console.log("processData.bulkPut error: " + error);
          });
        }
        rows = parseInt(rows) + data.length;
        done = data.length < DB_PROCESSING_BATCH_SIZE;
      } while (!done);
      // rows = 0;
      // localStorage.magicalInternetMoneyAddresses = JSON.stringify(this.addresses);
      logInfo("dataModule", "actions.identifyMyStealthTransfers addresses END: " + JSON.stringify(addresses, null, 2));
      context.commit('setState', { name: 'addresses', data: addresses });
      await context.dispatch('saveData', ['addresses']);

      logInfo("dataModule", "actions.identifyMyStealthTransfers END");
    },

    async collateTransfers(context, parameter) {
      const DB_PROCESSING_BATCH_SIZE = 123;
      logInfo("dataModule", "actions.collateTransfers: " + JSON.stringify(parameter));
      const db = new Dexie(context.state.db.name);
      db.version(context.state.db.version).stores(context.state.db.schemaDefinition);
      const provider = new ethers.providers.Web3Provider(window.ethereum);

      const transfers = {}; // context.state.transfers;
      console.log("parameter.chainId: " + parameter.chainId);
      if (!(parameter.chainId in transfers)) {
        transfers[parameter.chainId] = {};
      }
      console.log("transfers BEFORE: " + JSON.stringify(transfers, null, 2));
      let rows = 0;
      let done = false;
      do {
        let data = await db.announcements.offset(rows).limit(DB_PROCESSING_BATCH_SIZE).toArray();
        logInfo("dataModule", "actions.collateTransfers - data.length: " + data.length + ", first[0..9]: " + JSON.stringify(data.slice(0, 10).map(e => e.blockNumber + '.' + e.logIndex )));
        for (const item of data) {
          if (item.chainId == parameter.chainId && item.schemeId == 0) {
      //       // logInfo("dataModule", "actions.collateTransfers - processing: " + JSON.stringify(item, null, 2));
      //       const stealthMetaAddress = item.stealthMetaAddress.match(/^st:eth:0x[0-9a-fA-F]{132}$/) ? item.stealthMetaAddress : STEALTHMETAADDRESS0;
      //       registry[parameter.chainId][item.registrant] = stealthMetaAddress;
            // transfers[parameter.chainId].push(item);

            if (!(item.blockNumber in transfers[parameter.chainId])) {
              transfers[parameter.chainId][item.blockNumber] = {};
            }
            if (!(item.logIndex in transfers[parameter.chainId][item.blockNumber])) {
              transfers[parameter.chainId][item.blockNumber][item.logIndex] = item;
            }


          }
        }
        rows = parseInt(rows) + data.length;
        done = data.length < DB_PROCESSING_BATCH_SIZE;
      //   done = true;
      } while (!done);
      console.log("transfers AFTER: " + JSON.stringify(transfers, null, 2));
      context.commit('setState', { name: 'transfers', data: transfers });

      // console.log("context.state.transfers: " + JSON.stringify(context.state.transfers, null, 2));
      await context.dispatch('saveData', ['transfers']);
      logInfo("dataModule", "actions.collateTransfers END");
    },

    async syncRegistrationsData(context, parameter) {
      const DB_PROCESSING_BATCH_SIZE = 123;
      logInfo("dataModule", "actions.syncRegistrationsData: " + JSON.stringify(parameter));
      const db = new Dexie(context.state.db.name);
      db.version(context.state.db.version).stores(context.state.db.schemaDefinition);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      let rows = 0;
      let done = false;
      do {
        let data = await db.registrations.offset(rows).limit(DB_PROCESSING_BATCH_SIZE).toArray();
        logInfo("dataModule", "actions.syncRegistrationsData - data.length: " + data.length + ", first[0..9]: " + JSON.stringify(data.slice(0, 10).map(e => e.blockNumber + '.' + e.logIndex )));
        rows = parseInt(rows) + data.length;
        done = data.length < DB_PROCESSING_BATCH_SIZE;
        // done = true;
      } while (!done);
      const total = rows;
      logInfo("dataModule", "actions.syncRegistrationsData - total: " + total);
      // this.sync.completed = 0;
      // this.sync.total = rows;
      // this.sync.section = 'Registrations Tx Data';
      rows = 0;
      do {
        let data = await db.registrations.offset(rows).limit(DB_PROCESSING_BATCH_SIZE).toArray();
        logInfo("dataModule", "actions.syncRegistrationsData - data.length: " + data.length + ", first[0..9]: " + JSON.stringify(data.slice(0, 10).map(e => e.blockNumber + '.' + e.logIndex )));
        const records = [];
        for (const item of data) {
          // console.log(moment().format("HH:mm:ss") + " syncRegistrationsData: " + JSON.stringify(item));
          if (item.timestamp == null && item.chainId == parameter.chainId) {
            const block = await provider.getBlock(item.blockNumber);
            item.timestamp = block.timestamp;
            const tx = await provider.getTransaction(item.txHash);
            const txReceipt = await provider.getTransactionReceipt(item.txHash);
            item.tx = {
              type: tx.type,
              blockHash: tx.blockHash,
              from: tx.from,
              gasPrice: ethers.BigNumber.from(tx.gasPrice).toString(),
              gasLimit: ethers.BigNumber.from(tx.gasLimit).toString(),
              to: tx.to,
              value: ethers.BigNumber.from(tx.value).toString(),
              nonce: tx.nonce,
              data: tx.to && tx.data || null, // Remove contract creation data to reduce memory footprint
              chainId: tx.chainId,
              contractAddress: txReceipt.contractAddress,
              transactionIndex: txReceipt.transactionIndex,
              gasUsed: ethers.BigNumber.from(txReceipt.gasUsed).toString(),
              blockHash: txReceipt.blockHash,
              logs: txReceipt.logs,
              cumulativeGasUsed: ethers.BigNumber.from(txReceipt.cumulativeGasUsed).toString(),
              effectiveGasPrice: ethers.BigNumber.from(txReceipt.effectiveGasPrice).toString(),
              status: txReceipt.status,
              type: txReceipt.type,
            };
            records.push(item);
          }
        }
        if (records.length > 0) {
          console.log("records: " + JSON.stringify(records, null, 2));
          await db.registrations.bulkPut(records).then (function() {
          }).catch(function(error) {
            console.log("syncRegistrationsData.bulkPut error: " + error);
          });
        }
        rows = parseInt(rows) + data.length;
        // this.sync.completed = rows;
        done = data.length < DB_PROCESSING_BATCH_SIZE;
      } while (!done);
      logInfo("dataModule", "actions.syncRegistrationsData END");
    },

    async collateRegistrations(context, parameter) {
      const DB_PROCESSING_BATCH_SIZE = 123;
      logInfo("dataModule", "actions.collateRegistrations: " + JSON.stringify(parameter));
      const db = new Dexie(context.state.db.name);
      db.version(context.state.db.version).stores(context.state.db.schemaDefinition);
      const provider = new ethers.providers.Web3Provider(window.ethereum);

      const registry = context.state.registry;
      if (!(parameter.chainId in registry)) {
        registry[parameter.chainId] = {};
      }
      // console.log("registry BEFORE: " + JSON.stringify(registry, null, 2));
      let rows = 0;
      let done = false;
      do {
        let data = await db.registrations.offset(rows).limit(DB_PROCESSING_BATCH_SIZE).toArray();
        logInfo("dataModule", "actions.collateRegistrations - data.length: " + data.length + ", first[0..9]: " + JSON.stringify(data.slice(0, 10).map(e => e.blockNumber + '.' + e.logIndex )));
        for (const item of data) {
          if (item.chainId == parameter.chainId && item.schemeId == 0) {
            // logInfo("dataModule", "actions.collateRegistrations - processing: " + JSON.stringify(item, null, 2));
            const stealthMetaAddress = item.stealthMetaAddress.match(/^st:eth:0x[0-9a-fA-F]{132}$/) ? item.stealthMetaAddress : STEALTHMETAADDRESS0;
            registry[parameter.chainId][item.registrant] = stealthMetaAddress;
          }
        }
        rows = parseInt(rows) + data.length;
        done = data.length < DB_PROCESSING_BATCH_SIZE;
        // done = true;
      } while (!done);
      // console.log("registry AFTER: " + JSON.stringify(registry, null, 2));
      context.commit('setState', { name: 'registry', data: registry });

      // console.log("context.state.registry: " + JSON.stringify(context.state.registry, null, 2));
      await context.dispatch('saveData', ['registry']);
      logInfo("dataModule", "actions.collateRegistrations END");
    },

    async syncTokens(context, parameter) {
      logInfo("dataModule", "actions.syncTokens: " + JSON.stringify(parameter));
      const db = new Dexie(context.state.db.name);
      db.version(context.state.db.version).stores(context.state.db.schemaDefinition);
      const provider = new ethers.providers.Web3Provider(window.ethereum);

      // ERC-20 & ERC-721 Transfer (index_topic_1 address from, index_topic_2 address to, index_topic_3 uint256 id)
      // [ '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef', accountAs32Bytes, null ],
      // [ '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef', null, accountAs32Bytes ],

      // WETH Deposit (index_topic_1 address dst, uint256 wad)
      // 0xe1fffcc4923d04b559f4d29a8bfc6cda04eb5b0d3c460751c2402c5c5cc9109c
      // WETH Withdrawal (index_topic_1 address src, uint256 wad)
      // 0x7fcf532c15f0a6db0bd6d0e038bea71d30d808c7d98cb3bf7268a95bf5081b65

      // // ERC-20 Approval (index_topic_1 address owner, index_topic_2 address spender, uint256 value)
      // // 0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925
      // // ERC-721 Approval (index_topic_1 address owner, index_topic_2 address approved, index_topic_3 uint256 tokenId)
      // // 0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925
      // // ERC-721 ApprovalForAll (index_topic_1 address owner, index_topic_2 address operator, bool approved)
      // // 0x17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c31
      let total = 0;
      let t = this;
      async function processLogs(fromBlock, toBlock, section, logs) {
        total = parseInt(total) + logs.length;
        logInfo("dataModule", "actions.syncTokens.processLogs: " + fromBlock + " - " + toBlock + " " + section + " " + logs.length + " " + total);
        const records = [];
        for (const log of logs) {
          if (!log.removed) {
            const contract = log.address;
            let eventRecord = null;
            if (log.topics[0] == "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef") {
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
              approved = ethers.BigNumber.from(log.data).toString();
              eventRecord = { type: "ApprovalForAll", owner, operator, approved, eventType: "erc721" };
            } else {
              console.log("NOT HANDLED: " + JSON.stringify(log));
            }
            // TODO: Testing if (eventRecord && contract == "0x7439E9Bb6D8a84dd3A23fe621A30F95403F87fB9") {
            if (eventRecord) {
              records.push( {
                chainId: parameter.chainId,
                blockNumber: parseInt(log.blockNumber),
                logIndex: parseInt(log.logIndex),
                txIndex: parseInt(log.transactionIndex),
                txHash: log.transactionHash,
                contract,
                ...eventRecord,
                confirmations: parameter.blockNumber - log.blockNumber,
              });
            }
          }
        }
        if (records.length) {
          await db.tokenEvents.bulkPut(records).then (function() {
          }).catch(function(error) {
            console.log("syncTokens.bulkPut error: " + error);
          });
        }
      }
      async function getLogs(fromBlock, toBlock, section, selectedAddresses, processLogs) {
        logInfo("dataModule", "actions.syncTokens.getLogs: " + fromBlock + " - " + toBlock + " " + section);
        try {
          let topics = null;
          if (section == 0) {
            topics = [[
                '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
                '0xe1fffcc4923d04b559f4d29a8bfc6cda04eb5b0d3c460751c2402c5c5cc9109c',
                '0x7fcf532c15f0a6db0bd6d0e038bea71d30d808c7d98cb3bf7268a95bf5081b65',
                '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925',
                '0x17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c31',
              ],
              selectedAddresses,
              null
            ];
          } else if (section == 1) {
            topics = [ ['0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'], null, selectedAddresses ];
          }
          const logs = await provider.getLogs({ address: null, fromBlock, toBlock, topics });
          await processLogs(fromBlock, toBlock, section, logs);
        } catch (e) {
          const mid = parseInt((fromBlock + toBlock) / 2);
          await getLogs(fromBlock, mid, section, selectedAddresses, processLogs);
          await getLogs(parseInt(mid) + 1, toBlock, section, selectedAddresses, processLogs);
        }
      }
      logInfo("dataModule", "actions.syncTokens BEGIN");

      // this.sync.completed = 0;
      // this.sync.total = 0;
      // this.sync.section = 'ERC-20 & ERC-721 Tokens';
      const selectedAddresses = ['0x000000000000000000000000' + parameter.coinbase.substring(2, 42).toLowerCase()];
      // console.log(selectedAddresses);
      // const selectedAddresses = [];
      // for (const [address, addressData] of Object.entries(this.addresses)) {
      //   if (address.substring(0, 2) == "0x" && addressData.mine) {
      //     selectedAddresses.push('0x000000000000000000000000' + address.substring(2, 42).toLowerCase());
      //   }
      // }
      if (selectedAddresses.length > 0) {
        const deleteCall = await db.tokenEvents.where("confirmations").below(parameter.confirmations).delete();
        const latest = await db.tokenEvents.where('[chainId+blockNumber+logIndex]').between([parameter.chainId, Dexie.minKey, Dexie.minKey],[parameter.chainId, Dexie.maxKey, Dexie.maxKey]).last();
        // TODO Dev const startBlock = latest ? parseInt(latest.blockNumber) + 1: 0;
        const startBlock = latest ? parseInt(latest.blockNumber) + 1: 0;
        // TODO Need to rescan when address set changed
        // const startBlock = 0;
        // const startBlock = this.settings.sync.rescanTokens ? 0 : (latest ? parseInt(latest.blockNumber) + 1: 0);
        for (let section = 0; section < 2; section++) {
          await getLogs(startBlock, parameter.blockNumber, section, selectedAddresses, processLogs);
        }
      }

      logInfo("dataModule", "actions.syncTokens END");
    },

    async collateTokens(context, parameter) {
      const DB_PROCESSING_BATCH_SIZE = 123;
      logInfo("dataModule", "actions.collateTokens: " + JSON.stringify(parameter));
      const db = new Dexie(context.state.db.name);
      db.version(context.state.db.version).stores(context.state.db.schemaDefinition);
      const provider = new ethers.providers.Web3Provider(window.ethereum);

      // const registry = context.state.registry;
      //
      logInfo("dataModule", "actions.collateTokens BEGIN");
      const selectedAddressesMap = {};
      for (const [address, addressData] of Object.entries(context.state.addresses)) {
        if (address.substring(0, 2) == "0x" && addressData.mine) {
          selectedAddressesMap[address] = true;
        }
      }
      console.log("selectedAddressesMap: " + Object.keys(selectedAddressesMap));

      const tokenContracts = context.state.tokenContracts;
      // const tokenContracts = {};
      if (!(parameter.chainId in tokenContracts)) {
        tokenContracts[parameter.chainId] = {};
      }
      console.log("tokenContracts: " + JSON.stringify(tokenContracts));

      // TODO: Incremental Sync. Resetting balance in the meantime
      for (const [contract, contractData] of Object.entries(tokenContracts[parameter.chainId])) {
        tokenContracts[parameter.chainId][contract].balances = {};
        tokenContracts[parameter.chainId][contract].tokenIds = {};
      }
      console.log("tokenContracts: " + JSON.stringify(tokenContracts));

      let rows = 0;
      let done = false;
      const newTokenContractsMap = {};
      do {
        let data = await db.tokenEvents.offset(rows).limit(DB_PROCESSING_BATCH_SIZE).toArray();
        logInfo("dataModule", "actions.collateTokens - data.length: " + data.length + ", first[0..9]: " + JSON.stringify(data.slice(0, 10).map(e => e.blockNumber + '.' + e.logIndex )));
        for (const item of data) {
          if (item.chainId == parameter.chainId) {
            if (!(item.contract in tokenContracts[item.chainId]) && !(item.contract in newTokenContractsMap)) {
              newTokenContractsMap[item.contract] = true;
            }
          }
        }
        rows = parseInt(rows) + data.length;
        done = data.length < DB_PROCESSING_BATCH_SIZE;
      } while (!done);
      // this.sync.completed = 0;
      const total = Object.keys(newTokenContractsMap).length;
      console.log("total: " + total);
      // this.sync.section = 'Token Contracts';
      rows = 0;
      done = false;
      do {
        let data = await db.tokenEvents.offset(rows).limit(DB_PROCESSING_BATCH_SIZE).toArray();
        logInfo("dataModule", "actions.collateTokens - data.length: " + data.length + ", first[0..9]: " + JSON.stringify(data.slice(0, 10).map(e => e.blockNumber + '.' + e.logIndex )));
        for (const item of data) {
          if (item.chainId == parameter.chainId) {
            if (!(item.contract in tokenContracts[parameter.chainId])) {
              const contract = new ethers.Contract(item.contract, ERC20ABI, provider);
              let symbol = null;
              let name = null;
              let decimals = null;
              let totalSupply = null;
              try {
                symbol = await contract.symbol();
              } catch (e) {
              }
              try {
                name = await contract.name();
              } catch (e) {
              }
              if (item.eventType == "erc20") {
                try {
                  decimals = await contract.decimals();
                } catch (e) {
                }
              }
              try {
                totalSupply = await contract.totalSupply();
              } catch (e) {
              }
              tokenContracts[item.chainId][item.contract] = {
                favourite: false,
                symbol: item.contract == "0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85" ? "ENS": (symbol && symbol.trim() || null),
                name: item.contract == "0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85" ? "Ethereum Name Service": (name && name.trim() || null),
                decimals: parseInt(decimals || 0),
                totalSupply: totalSupply && totalSupply.toString() || null,
                type: item.eventType,
                firstEventBlockNumber: item.blockNumber,
                lastEventBlockNumber: item.blockNumber,
                events: {},
                balances: {},
                tokenIds: {},
              };
              // this.sync.completed++;
            }
            const lastEventBlockNumber = tokenContracts[item.chainId][item.contract].lastEventBlockNumber || 0;
            if (item.eventType == "erc20" && item.type == "Transfer") {
              const balances = tokenContracts[item.chainId][item.contract].balances || 0;
              if (item.from in selectedAddressesMap) {
                if (!(item.from in balances)) {
                  balances[item.from] = "0";
                }
                balances[item.from] = ethers.BigNumber.from(balances[item.from]).sub(item.tokens).toString();
              }
              if (item.to in selectedAddressesMap) {
                if (!(item.to in balances)) {
                  balances[item.to] = "0";
                }
                balances[item.to] = ethers.BigNumber.from(balances[item.to]).add(item.tokens).toString();
              }
              tokenContracts[item.chainId][item.contract].balances = balances;
              tokenContracts[item.chainId][item.contract].lastEventBlockNumber = item.blockNumber;
            } else if (item.eventType == "erc721" && item.type == "Transfer") {
              console.log("item: " + JSON.stringify(item));
              const tokenIds = tokenContracts[item.chainId][item.contract].tokenIds || {};
              if (item.from in selectedAddressesMap) {
                if (!(item.from in tokenIds)) {
                  delete tokenIds[item.tokenId];
                }
              }
              if (item.to in selectedAddressesMap) {
                console.log("item in to: " + JSON.stringify(item));
                if (!(item.to in tokenIds)) {
                  tokenIds[item.tokenId] = { owner: item.to, blockNumber: item.blockNumber, logIndex: item.logIndex };
                }
              }
              tokenContracts[item.chainId][item.contract].tokenIds = tokenIds;
              tokenContracts[item.chainId][item.contract].lastEventBlockNumber = item.blockNumber;
            }
          }
        }
        rows = parseInt(rows) + data.length;
        done = data.length < DB_PROCESSING_BATCH_SIZE;
      } while (!done);
      rows = 0;
      console.log("tokenContracts: " + JSON.stringify(tokenContracts, null, 2));
      context.commit('setState', { name: 'tokenContracts', data: tokenContracts });
      await context.dispatch('saveData', ['tokenContracts']);
      logInfo("dataModule", "actions.collateTokens END");
    },

    async syncERC721Metadata(context, parameter) {

      const imageUrlToBase64 = async url => {
        const response = await fetch(url);
        const blob = await response.blob();
        return new Promise((onSuccess, onError) => {
          try {
            const reader = new FileReader() ;
            reader.onload = function(){ onSuccess(this.result) } ;
            reader.readAsDataURL(blob) ;
          } catch(e) {
            onError(e);
          }
        });
      };

      const DB_PROCESSING_BATCH_SIZE = 123;
      logInfo("dataModule", "actions.syncERC721Metadata: " + JSON.stringify(parameter));
      const db = new Dexie(context.state.db.name);
      db.version(context.state.db.version).stores(context.state.db.schemaDefinition);
      const provider = new ethers.providers.Web3Provider(window.ethereum);

      logInfo("dataModule", "actions.syncERC721Metadata BEGIN");

      let total = 0;
      let completed = 0;
      for (const [address, data] of Object.entries(context.state.tokenContracts[parameter.chainId] || {})) {
        if (data.type == "erc721") {
          for (const [tokenId, tokenData] of Object.entries(data.tokenIds)) {
            const metadata = tokenData.metadata || null;
            console.log(address + "/" + tokenId + " => " + JSON.stringify(metadata));
            if (!metadata || !metadata.name) {
              completed++;
            }
            total++;
          }
        }
      }
      console.log("total: " + total);
      context.commit('setSyncSection', { section: 'ERC-721 Metadata', total });

      // data:application/json;base64, 0x72A94e6c51CB06453B84c049Ce1E1312f7c05e2c Wiiides
      // https:// -> ipfs://           0x31385d3520bCED94f77AaE104b406994D8F2168C BGANPUNKV2
      // data:application/json;base64, 0x1C60841b70821dcA733c9B1a26dBe1a33338bD43 GLICPIXXXVER002
      // IPFS data in another contract 0xC2C747E0F7004F9E8817Db2ca4997657a7746928 Hashmask
      // No tokenURI                   0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85 ENS
      // TODO ?                        0xd4416b13d2b3a9abae7acd5d6c2bbdbe25686401 ENS Name Wrapper
      // IPFS retrieval failure        0xbe9371326F91345777b04394448c23E2BFEaa826 OSP Gemesis

      for (const [address, data] of Object.entries(context.state.tokenContracts[parameter.chainId] || {})) {
        if (data.type == "erc721" && !context.state.sync.halt /*&& ["0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85", "x 0x8FA600364B93C53e0c71C7A33d2adE21f4351da3", "x 0x680384A5F9e64192994E73B9034Da27A5F48e785", "x 0x8b73448426797099b6b9a96c4343f528bbAfc55e"].includes(address)*/) {
          // console.log(address + " => " + JSON.stringify(data, null, 2));
          for (const [tokenId, tokenData] of Object.entries(data.tokenIds)) {
            if ((!tokenData.metadata || !tokenData.metadata.name) && !context.state.sync.halt) {
              console.log(address + "/" + tokenId + " => " + JSON.stringify(tokenData, null, 2));
              const contract = new ethers.Contract(address, ERC721ABI, provider);
              const metadata = tokenData.metadata || {};
              try {
                let tokenURIResult;
                if (address == "0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85") {
                  tokenURIResult = "https://metadata.ens.domains/mainnet/" + address + "/" + tokenId;
                } else {
                  tokenURIResult = await contract.tokenURI(tokenId);
                }
                console.log("tokenURIResult: " + JSON.stringify(tokenURIResult));
                if (tokenURIResult.substring(0, 29) == "data:application/json;base64,") {
                  const decodedJSON = atob(tokenURIResult.substring(29));
                  const data = JSON.parse(decodedJSON);
                  metadata.name = data.name || undefined;
                  metadata.description = data.description || undefined;
                  metadata.attributes = data.attributes || {};
                  metadata.imageSource = "(onchain)";
                  metadata.image = data.image || undefined;
                  console.log("metadata: " + JSON.stringify(metadata, null, 2));
                }
                if (tokenURIResult.substring(0, 7) == "ipfs://" || tokenURIResult.substring(0, 8) == "https://") {
                  const metadataFile = tokenURIResult.substring(0, 7) == "ipfs://" ? ("https://ipfs.io/ipfs/" + tokenURIResult.substring(7)) : tokenURIResult;
                  console.log("metadataFile: " + metadataFile);
                  try {
                    const metadataFileContent = await fetch(metadataFile).then(response => response.json());
                    console.log("metadataFileContent: " + JSON.stringify(metadataFileContent, null, 2));
                    // metadataFileContent: {
                    //   "message": "'©god.eth' is already been expired at Fri, 29 Sep 2023 06:31:14 GMT."
                    // }
                    metadata.name = metadataFileContent.name || undefined;
                    metadata.description = metadataFileContent.description || undefined;
                    metadata.attributes = metadataFileContent.attributes || {};
                    metadata.imageSource = metadataFileContent.image;
                    const imageFile = metadataFileContent.image.substring(0, 7) == "ipfs://" ? "https://ipfs.io/ipfs/" + metadataFileContent.image.substring(7) : metadataFileContent.image;
                    const base64 = await imageUrlToBase64(imageFile);
                    console.log("base64: " + JSON.stringify(base64));
                    metadata.image = base64 || undefined;
                    Vue.set(context.state.tokenContracts[parameter.chainId][address].tokenIds[tokenId], 'metadata', metadata);
                    console.log("metadata: " + JSON.stringify(metadata, null, 2));
                  } catch (e1) {
                    console.error(e1.message);
                  }
                }
              } catch (e) {
                console.error(e.message);
              }
              completed++;
              if (completed % 10 == 0) {
                await context.dispatch('saveData', ['tokenContracts']);
              }
              context.commit('setSyncCompleted', completed);
            }
          }
        }
      }

      console.log("tokenContracts[chainId]: " + JSON.stringify(context.state.tokenContracts[parameter.chainId], null, 2));
      await context.dispatch('saveData', ['tokenContracts']);
      logInfo("dataModule", "actions.syncERC721Metadata END");
    },


    // async syncTransferEvents(context, parameter) {
    //   logInfo("dataModule", "actions.syncTransferEvents: " + JSON.stringify(parameter));
    //   const provider = new ethers.providers.Web3Provider(window.ethereum);
    //   const interfaces = getInterfaces();
    //   const preERC721s = store.getters['config/settings'].preERC721s;
    //   const BATCHSIZE = parameter.etherscanBatchSize;
    //   // const BATCHSIZE = 50000000;
    //   for (const [accountIndex, account] of parameter.accountsToSync.entries()) {
    //     console.log("actions.syncTransferEvents: " + accountIndex + " " + account);
    //     context.commit('setSyncSection', { section: 'Import', total: parameter.accountsToSync.length });
    //     context.commit('setSyncCompleted', parseInt(accountIndex) + 1);
    //     const addressData = context.state.addresses[account] || {};
    //     const startBlock = addressData && addressData.updated && addressData.updated.blockNumber && (parseInt(addressData.updated.blockNumber) - parameter.OVERLAPBLOCKS) || 0;
    //
    //     context.commit('setSyncSection', { section: 'Transfer Events', total: parameter.accountsToSync.length });
    //     const accountAs32Bytes = '0x000000000000000000000000' + account.substring(2, 42).toLowerCase();
    //     for (let startBatch = startBlock; startBatch < parameter.blockNumber; startBatch += BATCHSIZE) {
    //       const endBatch = (parseInt(startBatch) + BATCHSIZE < parameter.blockNumber) ? (parseInt(startBatch) + BATCHSIZE) : parameter.blockNumber;
    //       const topicsList = [
    //         // Transfer (index_topic_1 address from, index_topic_2 address to, index_topic_3 uint256 id)
    //         [ '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef', accountAs32Bytes, null ],
    //         [ '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef', null, accountAs32Bytes ],
    //         // ERC-1155 TransferSingle (index_topic_1 address _operator, index_topic_2 address _from, index_topic_3 address _to, uint256 _id, uint256 _value)
    //         [ '0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62', null, accountAs32Bytes, null ],
    //         [ '0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62', null, null, accountAs32Bytes ],
    //         // ERC-1155 TransferBatch (index_topic_1 address operator, index_topic_2 address from, index_topic_3 address to, uint256[] ids, uint256[] values)
    //         [ '0x4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb', null, accountAs32Bytes, null ],
    //         [ '0x4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb', null, null, accountAs32Bytes ],
    //         // CryptoPunks V1 & V2 - Assign (index_topic_1 address to, uint256 punkIndex)
    //         [ '0x8a0e37b73a0d9c82e205d4d1a3ff3d0b57ce5f4d7bccf6bac03336dc101cb7ba', accountAs32Bytes ],
    //         // TODO: Delete as Transfer events will be picked up
    //         // // CryptoPunks V1 & V2 - PunkTransfer (index_topic_1 address from, index_topic_2 address to, uint256 punkIndex)
    //         // [ '0x05af636b70da6819000c49f85b21fa82081c632069bb626f30932034099107d8', accountAs32Bytes, null ],
    //         // [ '0x05af636b70da6819000c49f85b21fa82081c632069bb626f30932034099107d8', null, accountAs32Bytes ],
    //         // // CryptoPunks V1 & V2 - Too many topics to filter by my accounts PunkBought (index_topic_1 uint256 punkIndex, uint256 value, index_topic_2 address fromAddress, index_topic_3 address toAddress)
    //         // [ '0x58e5d5a525e3b40bc15abaa38b5882678db1ee68befd2f60bafe3a7fd06db9e3', null, null, null ],
    //       ];
    //       for (let topics of topicsList) {
    //         console.log("Web3 event filter #" + startBatch + "-#" + endBatch + ": " + JSON.stringify(topics));
    //         const logs = await provider.getLogs({ address: null, fromBlock: startBatch, toBlock: endBatch, topics });
    //         for (const event of logs) {
    //           if (!event.removed) {
    //             let eventRecord = null;
    //             const [txHash, blockNumber, logIndex, contract]  = [event.transactionHash, event.blockNumber, event.logIndex, event.address];
    //             if (event.topics[0] == "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef") {
    //               let from;
    //               let to;
    //               let tokensOrTokenId;
    //               if (event.topics.length == 4) {
    //                 from = ethers.utils.getAddress('0x' + event.topics[1].substring(26));
    //                 to = ethers.utils.getAddress('0x' + event.topics[2].substring(26));
    //                 tokensOrTokenId = ethers.BigNumber.from(event.topics[3]).toString();
    //               } else if (event.topics.length == 3) {
    //                 from = ethers.utils.getAddress('0x' + event.topics[1].substring(26));
    //                 to = ethers.utils.getAddress('0x' + event.topics[2].substring(26));
    //                 tokensOrTokenId = ethers.BigNumber.from(event.data).toString();
    //               } else if (event.topics.length == 1) {
    //                 from = ethers.utils.getAddress('0x' + event.data.substring(26, 66));
    //                 to = ethers.utils.getAddress('0x' + event.data.substring(90, 130));
    //                 tokensOrTokenId = ethers.BigNumber.from('0x' + event.data.substring(130, 193)).toString();
    //               }
    //               if ((from == account || to == account)) {
    //                 // ERC-721 Transfer, including pre-ERC721s like CryptoPunks, MoonCatRescue, CryptoCats, CryptoVoxels & CryptoKitties
    //                 if (event.topics.length == 4 || event.address in preERC721s) {
    //                   if (event.address in preERC721s) {
    //                     eventRecord = { txHash, blockNumber, logIndex, contract, from, to, type: "preerc721", tokenId: null, tokens: tokensOrTokenId };
    //                   } else {
    //                     eventRecord = { txHash, blockNumber, logIndex, contract, from, to, type: "erc721", tokenId: tokensOrTokenId, tokens: null };
    //                   }
    //                 } else {
    //                   eventRecord = { txHash, blockNumber, logIndex, contract, from, to, type: "erc20", tokenId: null, tokens:tokensOrTokenId };
    //                 }
    //               }
    //               // ERC-1155 TransferSingle (index_topic_1 address _operator, index_topic_2 address _from, index_topic_3 address _to, uint256 _id, uint256 _value)
    //             } else if (event.topics[0] == "0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62") {
    //               const log = interfaces.erc1155.parseLog(event);
    //               const [operator, from, to, tokenId, tokens] = log.args;
    //               eventRecord = { txHash, blockNumber, logIndex, contract, from, to, type: "erc1155", tokenIds: [ethers.BigNumber.from(tokenId).toString()], tokens: [ethers.BigNumber.from(tokens).toString()] };
    //               // ERC-1155 TransferBatch (index_topic_1 address operator, index_topic_2 address from, index_topic_3 address to, uint256[] ids, uint256[] values)
    //             } else if (event.topics[0] == "0x4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb") {
    //               const log = interfaces.erc1155.parseLog(event);
    //               const [operator, from, to, tokenIds, tokens] = log.args;
    //               const formattedTokenIds = tokenIds.map(e => ethers.BigNumber.from(e).toString());
    //               const formattedTokens = tokens.map(e => ethers.BigNumber.from(e).toString());
    //               eventRecord = { txHash, blockNumber, logIndex, contract, from, to, type: "erc1155", tokenIds: formattedTokenIds, tokens: formattedTokens };
    //             // CryptoPunks V1 & V2 - Assign (index_topic_1 address to, uint256 punkIndex)
    //             } else if (event.topics[0] == "0x8a0e37b73a0d9c82e205d4d1a3ff3d0b57ce5f4d7bccf6bac03336dc101cb7ba") {
    //               const log = interfaces.cryptoPunks.parseLog(event);
    //               const [to, tokenId] = log.args;
    //               eventRecord = { txHash, blockNumber, logIndex, contract, from: ADDRESS0, to, type: "preerc721", tokenId: tokenId.toString() };
    //             // CryptoPunks V1 & V2 - PunkTransfer (index_topic_1 address from, index_topic_2 address to, uint256 punkIndex)
    //             } else if (event.topics[0] == "0x05af636b70da6819000c49f85b21fa82081c632069bb626f30932034099107d8") {
    //               const log = interfaces.cryptoPunks.parseLog(event);
    //               const [from, to, tokenId] = log.args;
    //               eventRecord = { txHash, blockNumber, logIndex, contract, from, to, type: "preerc721", tokenId: tokenId.toString() };
    //             // // CryptoPunks V1 & V2 - PunkTransfer (index_topic_1 address from, index_topic_2 address to, uint256 punkIndex)
    //             // } else if (event.topics[0] == "0x05af636b70da6819000c49f85b21fa82081c632069bb626f30932034099107d8") {
    //             //   const log = interfaces.cryptoPunks.parseLog(event);
    //             //   const [from, to, tokenId] = log.args;
    //             //   eventRecord = { txHash, blockNumber, logIndex, contract, from, to, type: "preerc721", tokenId: tokenId.toString() };
    //             // // CryptoPunks V1 & V2 - PunkBought (index_topic_1 uint256 punkIndex, uint256 value, index_topic_2 address fromAddress, index_topic_3 address toAddress)
    //             // } else if (event.topics[0] == "0x58e5d5a525e3b40bc15abaa38b5882678db1ee68befd2f60bafe3a7fd06db9e3") {
    //             //   const log = interfaces.cryptoPunks.parseLog(event);
    //             //   const [tokenId, value, from, to] = log.args;
    //             //   if (from == account || to == account) {
    //             //     eventRecord = { txHash, blockNumber, logIndex, contract, from, to, type: "preerc721", tokenId: tokenId.toString() };
    //             //   }
    //             }
    //             if (eventRecord) {
    //               context.commit('addAccountEvent', { account, eventRecord });
    //             }
    //           }
    //         }
    //       }
    //     }
    //   }
    // },
    // async syncImportInternalTransactions(context, parameter) {
    //   logInfo("dataModule", "actions.syncImportInternalTransactions: " + JSON.stringify(parameter));
    //   let sleepUntil = null;
    //   for (const [accountIndex, account] of parameter.accountsToSync.entries()) {
    //     console.log("actions.syncImportInternalTransactions: " + accountIndex + " " + account);
    //     context.commit('setSyncSection', { section: 'Etherscan Internal Txs', total: parameter.accountsToSync.length });
    //     context.commit('setSyncCompleted', parseInt(accountIndex) + 1);
    //     const addressData = context.state.addresses[account] || {};
    //     const startBlock = addressData && addressData.updated && addressData.updated.blockNumber && (parseInt(addressData.updated.blockNumber) - parameter.OVERLAPBLOCKS) || 0;
    //     for (let startBatch = startBlock; startBatch < parameter.blockNumber; startBatch += parameter.etherscanBatchSize) {
    //       const endBatch = (parseInt(startBatch) + parameter.etherscanBatchSize < parameter.blockNumber) ? (parseInt(startBatch) + parameter.etherscanBatchSize) : parameter.blockNumber;
    //       console.log("batch: " + startBatch + " to " + endBatch + ", sleepUntil: " + (sleepUntil ? moment.unix(sleepUntil).toString() : 'null'));
    //       do {
    //       } while (sleepUntil && sleepUntil > moment().unix());
    //       let importUrl = "https://api.etherscan.io/api?module=account&action=txlistinternal&address=" + account + "&startblock=" + startBatch + "&endblock=" + endBatch + "&page=1&offset=10000&sort=asc&apikey=" + parameter.etherscanAPIKey;
    //       console.log("importUrl: " + importUrl);
    //       const importData = await fetch(importUrl)
    //         .then(handleErrors)
    //         .then(response => response.json())
    //         .catch(function(error) {
    //            console.log("ERROR - processIt: " + error);
    //            // Want to work around API data unavailablity - state.sync.error = true;
    //            return [];
    //         });
    //       if (importData.status == 1) {
    //         context.commit('addAccountInternalTransactions', { account, results: importData.result });
    //         if (importData.message && importData.message.includes("Missing")) {
    //           sleepUntil = parseInt(moment().unix()) + 6;
    //         }
    //         if (context.state.sync.halt) {
    //           break;
    //         }
    //       }
    //     }
    //   }
    // },
    // async syncImportTransactions(context, parameter) {
    //   logInfo("dataModule", "actions.syncImportTransactions: " + JSON.stringify(parameter));
    //   let sleepUntil = null;
    //   for (const [accountIndex, account] of parameter.accountsToSync.entries()) {
    //     console.log("actions.syncImportTransactions: " + accountIndex + " " + account);
    //     context.commit('setSyncSection', { section: 'Etherscan Transactions', total: parameter.accountsToSync.length });
    //     context.commit('setSyncCompleted', parseInt(accountIndex) + 1);
    //     const addressData = context.state.addresses[account] || {};
    //     const startBlock = addressData && addressData.updated && addressData.updated.blockNumber && (parseInt(addressData.updated.blockNumber) - parameter.OVERLAPBLOCKS) || 0;
    //     for (let startBatch = startBlock; startBatch < parameter.blockNumber; startBatch += parameter.etherscanBatchSize) {
    //       const endBatch = (parseInt(startBatch) + parameter.etherscanBatchSize < parameter.blockNumber) ? (parseInt(startBatch) + parameter.etherscanBatchSize) : parameter.blockNumber;
    //       console.log("batch: " + startBatch + " to " + endBatch + ", sleepUntil: " + (sleepUntil ? moment.unix(sleepUntil).toString() : 'null'));
    //       do {
    //       } while (sleepUntil && sleepUntil > moment().unix());
    //       let importUrl = "https://api.etherscan.io/api?module=account&action=txlist&address=" + account + "&startblock=" + startBatch + "&endblock=" + endBatch + "&page=1&offset=10000&sort=asc&apikey=" + parameter.etherscanAPIKey;
    //       console.log("importUrl: " + importUrl);
    //       const importData = await fetch(importUrl)
    //         .then(handleErrors)
    //         .then(response => response.json())
    //         .catch(function(error) {
    //            console.log("ERROR - processIt: " + error);
    //            // Want to work around API data unavailablity - state.sync.error = true;
    //            return [];
    //         });
    //       if (importData.status == 1) {
    //         context.commit('addAccountTransactions', { account, results: importData.result });
    //         if (importData.message && importData.message.includes("Missing")) {
    //           sleepUntil = parseInt(moment().unix()) + 6;
    //         }
    //         if (context.state.sync.halt) {
    //           break;
    //         }
    //       }
    //     }
    //     // TODO Move elsewhere
    //     context.commit('updateAccountTimestampAndBlock', { account, timestamp: parameter.confirmedTimestamp, blockNumber: parameter.blockNumber });
    //   }
    // },
    // async syncBlocksAndBalances(context, parameter) {
    //   logInfo("dataModule", "actions.syncBlocksAndBalances: " + JSON.stringify(parameter));
    //   const provider = new ethers.providers.Web3Provider(window.ethereum);
    //   const weth = new ethers.Contract(WETHADDRESS, WETHABI, provider);
    //   for (const [accountIndex, account] of parameter.accountsToSync.entries()) {
    //     console.log("actions.syncBlocksAndBalances: " + accountIndex + " " + account);
    //     const addressData = context.state.addresses[account] || {};
    //     const txHashesByBlocks = getTxHashesByBlocks(account, context.state.accounts, context.state.accountsInfo, parameter.processFilters);
    //     if (!context.state.sync.halt) {
    //       const blockNumbers = [];
    //       for (const [blockNumber, txHashes] of Object.entries(txHashesByBlocks)) {
    //         const existing = context.state.blocks[blockNumber] && context.state.blocks[blockNumber].balances[account] && context.state.blocks[blockNumber].balances[account].eth && (blockNumber < 4719568 || context.state.blocks[blockNumber].balances[account][WETHADDRESS]) || null;
    //         // const existing = context.state.blocks[blockNumber] && context.state.blocks[blockNumber].balances[account] || null;
    //         if (!existing) {
    //           blockNumbers.push(blockNumber);
    //         }
    //       }
    //       context.commit('setSyncSection', { section: 'Blocks & Balances', total: blockNumbers.length });
    //       let getBalances = true;
    //       for (const [index, blockNumber] of blockNumbers.entries()) {
    //         const block = await provider.getBlock(parseInt(blockNumber));
    //         const timestamp = block.timestamp;
    //         console.log((parseInt(index) + 1) + "/" + blockNumbers.length + " Timestamp & Balance: " + blockNumber + " " + moment.unix(timestamp).format("YYYY-MM-DD HH:mm:ss"));
    //         let ethBalance = null;
    //         let wethBalance = null;
    //         // Jan 21 2022 - Metamask returning inpage.js:1 MetaMask - RPC Error: RetryOnEmptyMiddleware - retries exhausted {code: -32603, message: 'RetryOnEmptyMiddleware - retries exhausted', data: {…}}
    //         if (getBalances) {
    //           try {
    //             ethBalance = ethers.BigNumber.from(await provider.getBalance(account, parseInt(blockNumber))).toString();
    //           } catch (e) {
    //             console.log("ERROR: " + e.message.toString());
    //             getBalances = false;
    //           }
    //         }
    //         if (getBalances) {
    //           try {
    //             wethBalance = (parseInt(blockNumber) < 4719568) ? 0 : ethers.BigNumber.from(await weth.balanceOf(account, { blockTag: parseInt(blockNumber) })).toString();
    //           } catch (e) {
    //             console.log("ERROR: " + e.message.toString());
    //             getBalances = false;
    //           }
    //         }
    //         context.commit('addBlock', { blockNumber, timestamp, account, asset: 'eth', balance: ethBalance });
    //         context.commit('addBlock', { blockNumber, timestamp, account, asset: WETHADDRESS, balance: wethBalance });
    //         context.commit('setSyncCompleted', parseInt(index) + 1);
    //         if ((index + 1) % 100 == 0) {
    //           console.log("Saving blocks");
    //           context.dispatch('saveData', ['blocks']);
    //         }
    //         if (context.state.sync.halt) {
    //           break;
    //         }
    //       }
    //       // context.dispatch('saveData', ['blocks']);
    //       // context.commit('setSyncSection', { section: null, total: null });
    //     }
    //   }
    // },
    // async syncTransactions(context, parameter) {
    //   logInfo("dataModule", "actions.syncTransactions: " + JSON.stringify(parameter));
    //   const provider = new ethers.providers.Web3Provider(window.ethereum);
    //   for (const [accountIndex, account] of parameter.accountsToSync.entries()) {
    //     console.log("actions.syncBlocksAndBalances: " + accountIndex + " " + account);
    //     const addressData = context.state.addresses[account] || {};
    //     const blocks = context.state.blocks;
    //     const txHashesByBlocks = getTxHashesByBlocks(account, context.state.accounts, context.state.accountsInfo, parameter.processFilters);
    //     const txHashesToProcess = {};
    //     if (!context.state.sync.halt) {
    //       for (const [blockNumber, txHashes] of Object.entries(txHashesByBlocks)) {
    //         for (const [index, txHash] of Object.keys(txHashes).entries()) {
    //           if (!(txHash in context.state.txs) && !(txHash in txHashesToProcess)) {
    //             txHashesToProcess[txHash] = blockNumber;
    //           }
    //         }
    //       }
    //       let txHashList = Object.keys(txHashesToProcess);
    //       context.commit('setSyncSection', { section: 'Tx & TxReceipts', total: txHashList.length });
    //       let processed = 1;
    //
    //       for (const [blockNumber, txHashes] of Object.entries(txHashesByBlocks)) {
    //         const block = blocks[blockNumber] || null;
    //         for (const [index, txHash] of Object.keys(txHashes).entries()) {
    //           if (txHash in txHashesToProcess) {
    //             context.commit('setSyncCompleted', processed);
    //             console.log(processed + "/" + txHashList.length + " Retrieving " + txHash + " @ " + blockNumber + " " + moment.unix(block.timestamp).format("YYYY-MM-DD HH:mm:ss"));
    //             const currentInfo = context.state.txs[txHash] || {};
    //             const info = await getTxInfo(txHash, currentInfo, account, provider);
    //             context.commit('addTxs', { txHash, txInfo: info});
    //             if (processed % 50 == 0) {
    //               console.log("Saving txs");
    //               context.dispatch('saveData', ['txs']);
    //             }
    //             if (context.state.sync.halt) {
    //               break;
    //             }
    //             processed++;
    //           }
    //         }
    //         if (context.state.sync.halt) {
    //           break;
    //         }
    //       }
    //     }
    //   }
    // },
    // async syncFunctionSelectors(context, parameter) {
    //   logInfo("dataModule", "actions.syncFunctionSelectors: " + JSON.stringify(parameter));
    //   for (const [accountIndex, account] of parameter.accountsToSync.entries()) {
    //     console.log("actions.syncFunctionSelectors: " + accountIndex + " " + account);
    //     const addressData = context.state.addresses[account] || {};
    //     const txHashesByBlocks = getTxHashesByBlocks(account, context.state.accounts, context.state.accountsInfo, parameter.processFilters);
    //     if (!context.state.sync.halt) {
    //       const missingFunctionSelectorsMap = {};
    //       const functionSelectors = context.state.functionSelectors || {};
    //       for (const [blockNumber, txHashes] of Object.entries(txHashesByBlocks)) {
    //         const block = context.state.blocks[blockNumber] || null;
    //         for (const [index, txHash] of Object.keys(txHashes).entries()) {
    //           const txInfo = context.state.txs[txHash] || {};
    //           if (txInfo.tx && txInfo.tx.to != null && txInfo.tx.data.length >= 10) {
    //             const selector = txInfo.tx.data.substring(0, 10);
    //             if (!(selector in functionSelectors) && !(selector in missingFunctionSelectorsMap)) {
    //               missingFunctionSelectorsMap[selector] = true;
    //             }
    //           }
    //         }
    //       }
    //       console.log("missingFunctionSelectorsMap: " + JSON.stringify(missingFunctionSelectorsMap));
    //       const missingFunctionSelectors = Object.keys(missingFunctionSelectorsMap);
    //       const BATCHSIZE = 50;
    //       for (let i = 0; i < missingFunctionSelectors.length; i += BATCHSIZE) {
    //         const batch = missingFunctionSelectors.slice(i, parseInt(i) + BATCHSIZE);
    //         let url = "https://sig.eth.samczsun.com/api/v1/signatures?" + batch.map(e => ("function=" + e)).join("&");
    //         console.log(url);
    //         const data = await fetch(url)
    //           .then(response => response.json())
    //           .catch(function(e) {
    //             console.log("error: " + e);
    //           });
    //         if (data.ok && Object.keys(data.result.function).length > 0) {
    //           context.commit('addNewFunctionSelectors', data.result.function);
    //         }
    //       }
    //       context.dispatch('saveData', ['functionSelectors']);
    //     }
    //   }
    // },
    // async syncEventSelectors(context, parameter) {
    //   logInfo("dataModule", "actions.syncEventSelectors: " + JSON.stringify(parameter));
    //   for (const [accountIndex, account] of parameter.accountsToSync.entries()) {
    //     console.log("actions.syncEventSelectors: " + accountIndex + " " + account);
    //     const addressData = context.state.addresses[account] || {};
    //     const txHashesByBlocks = getTxHashesByBlocks(account, context.state.accounts, context.state.accountsInfo, parameter.processFilters);
    //     if (!context.state.sync.halt) {
    //       const missingEventSelectorsMap = {};
    //       const eventSelectors = context.state.eventSelectors || {};
    //       for (const [blockNumber, txHashes] of Object.entries(txHashesByBlocks)) {
    //         const block = context.state.blocks[blockNumber] || null;
    //         for (const [index, txHash] of Object.keys(txHashes).entries()) {
    //           const txInfo = context.state.txs[txHash] || {};
    //           if ('txReceipt' in txInfo) {
    //             for (const event of txInfo.txReceipt.logs) {
    //               if (!(event.topics[0] in eventSelectors) && !(event.topics[0] in missingEventSelectorsMap)) {
    //                 missingEventSelectorsMap[event.topics[0]] = true;
    //               }
    //             }
    //           }
    //         }
    //       }
    //       console.log("missingEventSelectorsMap: " + JSON.stringify(missingEventSelectorsMap));
    //       const missingEventSelectors = Object.keys(missingEventSelectorsMap);
    //       const BATCHSIZE = 50;
    //       for (let i = 0; i < missingEventSelectors.length; i += BATCHSIZE) {
    //         const batch = missingEventSelectors.slice(i, parseInt(i) + BATCHSIZE);
    //         let url = "https://sig.eth.samczsun.com/api/v1/signatures?" + batch.map(e => ("event=" + e)).join("&");
    //         console.log(url);
    //         const data = await fetch(url)
    //           .then(response => response.json())
    //           .catch(function(e) {
    //             console.log("error: " + e);
    //           });
    //         if (data.ok && Object.keys(data.result.event).length > 0) {
    //           context.commit('addNewEventSelectors', data.result.event);
    //         }
    //       }
    //       context.dispatch('saveData', ['eventSelectors']);
    //     }
    //   }
    // },
    // async syncBuildTokenContractsAndAccounts(context, parameter) {
    //   logInfo("dataModule", "actions.syncBuildTokenContractsAndAccounts: " + JSON.stringify(parameter));
    //   const provider = new ethers.providers.Web3Provider(window.ethereum);
    //   const ensReverseRecordsContract = new ethers.Contract(ENSREVERSERECORDSADDRESS, ENSREVERSERECORDSABI, provider);
    //   const preERC721s = store.getters['config/settings'].preERC721s;
    //   for (const [accountIndex, account] of parameter.accountsToSync.entries()) {
    //     console.log("actions.syncBuildTokenContractsAndAccounts: " + accountIndex + " " + account);
    //     const addressData = context.state.addresses[account] || {};
    //     const txHashesByBlocks = getTxHashesByBlocks(account, context.state.accounts, context.state.accountsInfo, parameter.processFilters);
    //     if (!context.state.sync.halt) {
    //       const missingAccountsMap = {};
    //       const eventSelectors = context.state.eventSelectors || {};
    //       for (const [blockNumber, txHashes] of Object.entries(txHashesByBlocks)) {
    //         for (const [index, txHash] of Object.keys(txHashes).entries()) {
    //           const txData = context.state.txs[txHash] || null;
    //           if (txData != null) {
    //             if (!(txData.tx.from in context.state.accounts) && !(txData.tx.from in missingAccountsMap)) {
    //               missingAccountsMap[txData.tx.from] = true;
    //             }
    //             if (txData.tx.to != null && (!(txData.tx.to in context.state.accounts) && !(txData.tx.to in missingAccountsMap))) {
    //               missingAccountsMap[txData.tx.to] = true;
    //             }
    //             const events = getEvents(account, context.state.accounts, context.state.eventSelectors, preERC721s, txData);
    //             // console.log(blockNumber + " " + txHash + ": " + JSON.stringify(events.myEvents));
    //             // const results = parseTx(chainId, account, accounts, functionSelectors, preERC721s, tx);
    //             for (const [eventIndex, eventItem] of events.myEvents.entries()) {
    //               for (let a of [eventItem.contract, eventItem.from, eventItem.to]) {
    //                 if (!(a in context.state.accounts) && !(a in missingAccountsMap)) {
    //                   missingAccountsMap[a] = true;
    //                 }
    //               }
    //             }
    //           }
    //         }
    //       }
    //       const missingAccounts = Object.keys(missingAccountsMap);
    //       console.log("missingAccounts: " + JSON.stringify(missingAccounts));
    //       context.commit('setSyncSection', { section: 'Token Contract & Accts', total: missingAccounts.length });
    //       for (const [accountItemIndex, accountItem] of missingAccounts.entries()) {
    //         context.commit('setSyncCompleted', parseInt(accountItemIndex) + 1);
    //         console.log((parseInt(accountItemIndex) + 1) + "/" + missingAccounts.length + " Processing " + accountItem);
    //         const addressDataInfo = await getAccountInfo(accountItem, provider);
    //         if (addressDataInfo.account) {
    //           context.commit('addNewAccount', addressDataInfo);
    //           context.commit('addNewAccountInfo', { account: addressDataInfo.account });
    //         }
    //         const names = await ensReverseRecordsContract.getNames([accountItem]);
    //         const name = names.length == 1 ? names[0] : accountItem;
    //         if (!(accountItem in context.state.ensMap)) {
    //           context.commit('addENSName', { account: accountItem, name });
    //         }
    //         if ((accountItemIndex + 1) % 25 == 0) {
    //           console.log("Saving accounts");
    //           context.dispatch('saveData', ['accountsInfo', 'accounts', 'ensMap']);
    //         }
    //         if (context.state.sync.halt) {
    //           break;
    //         }
    //       }
    //     }
    //   }
    // },
    // async syncBuildTokens(context, parameter) {
    //   logInfo("dataModule", "actions.syncBuildTokens: " + JSON.stringify(parameter));
    //   const provider = new ethers.providers.Web3Provider(window.ethereum);
    //   const ensReverseRecordsContract = new ethers.Contract(ENSREVERSERECORDSADDRESS, ENSREVERSERECORDSABI, provider);
    //   const preERC721s = store.getters['config/settings'].preERC721s;
    //   for (const [accountIndex, account] of parameter.accountsToSync.entries()) {
    //     console.log("actions.syncBuildTokens: " + accountIndex + " " + account);
    //     const addressData = context.state.addresses[account] || {};
    //     const txHashesByBlocks = getTxHashesByBlocks(account, context.state.accounts, context.state.accountsInfo, parameter.processFilters);
    //     if (!context.state.sync.halt) {
    //       const missingTokensMap = {};
    //       for (const [blockNumber, txHashes] of Object.entries(txHashesByBlocks)) {
    //         for (const [index, txHash] of Object.keys(txHashes).entries()) {
    //           const txData = context.state.txs[txHash] || null;
    //           if (txData != null) {
    //             // const events = getEvents(account, context.state.accounts, context.state.eventSelectors, preERC721s, txData);
    //             const results = parseTx(account, context.state.accounts, context.state.functionSelectors, context.state.eventSelectors, preERC721s, txData);
    //             for (const [eventIndex, eventItem] of results.myEvents.entries()) {
    //               // TODO: CryptoPunks Transfer tokens -> tokenId
    //               if (eventItem.type == 'preerc721' || eventItem.type == 'erc721' || eventItem.type == 'erc1155') {
    //                 const tokenContract = context.state.addresses[eventItem.contract] || {};
    //                 console.log(blockNumber + " " + txHash + " " + eventItem.type + " " + eventItem.contract + " " + (tokenContract ? tokenContract.type : '') + " " + (tokenContract ? tokenContract.name : '') + " " + (eventItem.tokenId ? eventItem.tokenId : '?'));
    //                 if (tokenContract.assets) {
    //                   if (!(eventItem.tokenId in tokenContract.assets)) {
    //                     if (!(eventItem.contract in missingTokensMap)) {
    //                       missingTokensMap[eventItem.contract] = {};
    //                     }
    //                     if (!(eventItem.tokenId in missingTokensMap[eventItem.contract])) {
    //                       missingTokensMap[eventItem.contract][eventItem.tokenId] = true;
    //                     }
    //                   }
    //                 } else {
    //                   console.log("token contract not found");
    //                 }
    //               }
    //             }
    //           }
    //         }
    //       }
    //       let totalItems = 0;
    //       const missingCryptoPunksV1TokensList = [];
    //       const missingMoonCatRescueTokensList = [];
    //       const missingCryptoCatsTokensList = [];
    //       const missingTokensList = [];
    //       for (const [tokenContract, tokenIds] of Object.entries(missingTokensMap)) {
    //         totalItems += Object.keys(tokenIds).length;
    //         for (let tokenId of Object.keys(tokenIds)) {
    //           // CryptoPunksV1
    //           if (tokenContract == "0x6Ba6f2207e343923BA692e5Cae646Fb0F566DB8D") {
    //             missingCryptoPunksV1TokensList.push({ tokenContract, tokenId });
    //             // MoonCatRescue
    //           } else if (tokenContract == "0x60cd862c9C687A9dE49aecdC3A99b74A4fc54aB6") {
    //             missingMoonCatRescueTokensList.push({ tokenContract, tokenId });
    //             // CryptoCats
    //           } else if (tokenContract == "0x088C6Ad962812b5Aa905BA6F3c5c145f9D4C079f") {
    //             missingCryptoCatsTokensList.push({ tokenContract, tokenId });
    //             // Lunar
    //           } else if (tokenContract == "0x43fb95c7afA1Ac1E721F33C695b2A0A94C7ddAb2") {
    //             const tokenData = {
    //               contract: tokenContract,
    //               tokenId: tokenId,
    //               name: "LunarToken #" + tokenId,
    //               description: "LunarToken #" + tokenId,
    //               image: "https://wrapped-lunars.netlify.app/previews/" + tokenId + ".png",
    //               type: "preerc721",
    //               isFlagged: null,
    //               events: {},
    //             }
    //             context.commit('addAccountToken', tokenData);
    //           } else {
    //             missingTokensList.push({ tokenContract, tokenId });
    //           }
    //         }
    //       }
    //       console.log("missingCryptoPunksV1TokensList: " + JSON.stringify(missingCryptoPunksV1TokensList));
    //       for (const [tokenIndex, token] of missingCryptoPunksV1TokensList.entries()) {
    //         console.log("Processing " + tokenIndex + " " + token.tokenContract + "/" + token.tokenId);
    //         const tokenData = {
    //           contract: token.tokenContract,
    //           tokenId: token.tokenId,
    //           name: "CryptoPunkV1 #" + token.tokenId,
    //           description: "CryptoPunkV1 #" + token.tokenId,
    //           image: "https://cryptopunks.app/public/images/cryptopunks/punk" + token.tokenId + ".png",
    //           type: "preerc721",
    //           isFlagged: null,
    //           events: {},
    //         }
    //         context.commit('addAccountToken', tokenData);
    //       }
    //       console.log("missingMoonCatRescueTokensList: " + JSON.stringify(missingMoonCatRescueTokensList));
    //       for (const [tokenIndex, token] of missingMoonCatRescueTokensList.entries()) {
    //         console.log("Processing " + tokenIndex + " " + token.tokenContract + "/" + token.tokenId);
    //         const tokenData = {
    //           contract: token.tokenContract,
    //           tokenId: token.tokenId,
    //           name: "MoonCat #" + token.tokenId,
    //           description: "MoonCat #" + token.tokenId,
    //           image: "https://api.mooncat.community/image/" + token.tokenId,
    //           type: "preerc721",
    //           isFlagged: null,
    //           events: {},
    //         }
    //         context.commit('addAccountToken', tokenData);
    //       }
    //       console.log("missingCryptoCatsTokensList: " + JSON.stringify(missingCryptoCatsTokensList));
    //       for (const [tokenIndex, token] of missingCryptoCatsTokensList.entries()) {
    //         console.log("Processing " + tokenIndex + " " + token.tokenContract + "/" + token.tokenId);
    //         const tokenData = {
    //           contract: token.tokenContract,
    //           tokenId: token.tokenId,
    //           name: "CryptoCat #" + token.tokenId,
    //           description: "CryptoCat #" + token.tokenId,
    //           image: "https://cryptocats.thetwentysix.io/contents/images/cats/" + token.tokenId + ".png",
    //           type: "preerc721",
    //           isFlagged: null,
    //           events: {},
    //         }
    //         context.commit('addAccountToken', tokenData);
    //       }
    //       // console.log("missingTokensList: " + JSON.stringify(missingTokensList));
    //       context.commit('setSyncSection', { section: 'Build Tokens', total: missingTokensList.length });
    //       const GETTOKENINFOBATCHSIZE = 40; // 50 causes the Reservoir API to fail for some fetches
    //       const info = {};
    //       const DELAYINMILLIS = 2500;
    //       for (let i = 0; i < missingTokensList.length && !context.state.sync.halt; i += GETTOKENINFOBATCHSIZE) {
    //         const batch = missingTokensList.slice(i, parseInt(i) + GETTOKENINFOBATCHSIZE);
    //         let continuation = null;
    //         do {
    //           let url = "https://api.reservoir.tools/tokens/v5?" + batch.map(e => 'tokens=' + e.tokenContract + ':' + e.tokenId).join("&");
    //           url = url + (continuation != null ? "&continuation=" + continuation : '');
    //           url = url + "&limit=50";
    //           console.log(url);
    //           const data = await fetch(url).then(response => response.json());
    //           context.commit('setSyncCompleted', parseInt(i) + batch.length);
    //           continuation = data.continuation;
    //           if (data.tokens) {
    //             for (let record of data.tokens) {
    //               context.commit('addAccountToken', record.token);
    //             }
    //           }
    //           await delay(DELAYINMILLIS);
    //         } while (continuation != null);
    //       }
    //     }
    //   }
    // },
    // async syncBuildTokenEvents(context, parameter) {
    //   logInfo("dataModule", "actions.syncBuildTokenEvents: " + JSON.stringify(parameter));
    //   const provider = new ethers.providers.Web3Provider(window.ethereum);
    //   const ensReverseRecordsContract = new ethers.Contract(ENSREVERSERECORDSADDRESS, ENSREVERSERECORDSABI, provider);
    //   const preERC721s = store.getters['config/settings'].preERC721s;
    //   for (const [accountIndex, account] of parameter.accountsToSync.entries()) {
    //     console.log("actions.syncBuildTokenEvents: " + accountIndex + " " + account);
    //     const addressData = context.state.addresses[account] || {};
    //     const txHashesByBlocks = getTxHashesByBlocks(account, context.state.accounts, context.state.accountsInfo, parameter.processFilters);
    //     if (!context.state.sync.halt) {
    //       const missingTokenEventsMap = {};
    //       for (const [blockNumber, txHashes] of Object.entries(txHashesByBlocks)) {
    //         const block = context.state.blocks[blockNumber] || null;
    //         const timestamp = block && block.timestamp || null;
    //         for (const [index, txHash] of Object.keys(txHashes).entries()) {
    //           const txData = context.state.txs[txHash] || null;
    //           if (txData != null) {
    //             const results = parseTx(account, context.state.accounts, context.state.functionSelectors, context.state.eventSelectors, preERC721s, txData);
    //             context.commit('addAccountTokenEvents', { txHash, blockNumber, transactionIndex: txData.txReceipt.transactionIndex, timestamp, events: results.myEvents });
    //           }
    //         }
    //       }
    //       let totalItems = 0;
    //       const missingTokensList = [];
    //       console.log("missingTokenEventsMap: " + JSON.stringify(missingTokenEventsMap, null, 2));
    //     }
    //   }
    // },
    async syncImportExchangeRates(context, parameter) {
      const reportingCurrency = store.getters['config/settings'].reportingCurrency;
      logInfo("dataModule", "actions.syncImportExchangeRates - reportingCurrency: " + reportingCurrency);
      const MAXDAYS = 2000;
      const MINDATE = moment("2015-07-30");
      let toTs = moment();
      const results = {};
      while (toTs.year() >= 2015) {
        let days = toTs.diff(MINDATE, 'days');
        if (days > MAXDAYS) {
          days = MAXDAYS;
        }
        let url = "https://min-api.cryptocompare.com/data/v2/histoday?fsym=ETH&tsym=" + reportingCurrency + "&toTs=" + toTs.unix() + "&limit=" + days;
        if (parameter.cryptoCompareAPIKey) {
          url = url + "&api_key=" + parameter.cryptoCompareAPIKey;
        }
        console.log(url);
        const data = await fetch(url)
          .then(response => response.json())
          .catch(function(e) {
            console.log("error: " + e);
          });
        for (day of data.Data.Data) {
          results[moment.unix(day.time).format("YYYYMMDD")] = day.close;
        }
        toTs = moment(toTs).subtract(MAXDAYS, 'days');
      }
      context.commit('setExchangeRates', results);
      context.dispatch('saveData', ['exchangeRates']);
    },
    async syncRefreshENS(context, parameter) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const ensReverseRecordsContract = new ethers.Contract(ENSREVERSERECORDSADDRESS, ENSREVERSERECORDSABI, provider);
      const addresses = Object.keys(context.state.accounts);
      const ENSOWNERBATCHSIZE = 200; // Can do 200, but incorrectly misconfigured reverse ENS causes the whole call to fail
      for (let i = 0; i < addresses.length; i += ENSOWNERBATCHSIZE) {
        const batch = addresses.slice(i, parseInt(i) + ENSOWNERBATCHSIZE);
        const allnames = await ensReverseRecordsContract.getNames(batch);
        for (let j = 0; j < batch.length; j++) {
          const account = batch[j];
          const name = allnames[j];
          // const normalized = normalize(account);
          // console.log(account + " => " + name);
          context.commit('addENSName', { account, name });
        }
      }
      context.dispatch('saveData', ['ensMap']);
    },
    // Called by Connection.execWeb3()
    async execWeb3({ state, commit, rootState }, { count, listenersInstalled }) {
      logInfo("dataModule", "execWeb3() start[" + count + ", " + listenersInstalled + ", " + JSON.stringify(rootState.route.params) + "]");
    },
  },
};
