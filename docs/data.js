const Data = {
  template: `
  <div>
    <b-button v-b-toggle.data-module size="sm" block variant="outline-info">Data</b-button>
    <b-collapse id="data-module" visible class="my-2">
      <b-card no-body class="border-0">
        <b-row>
          <b-col cols="5" class="small px-1 text-right">Addresses:</b-col>
          <b-col class="small px-1 truncate" cols="7">{{ Object.keys(addresses).length }}</b-col>
        </b-row>
        <b-row>
          <b-col cols="5" class="small px-1 text-right">ERC-20 Contracts:</b-col>
          <b-col class="small px-1 truncate" cols="7">{{ totalERC20Contracts }}</b-col>
        </b-row>
        <b-row>
          <b-col cols="5" class="small px-1 text-right">ERC-721 Tokens:</b-col>
          <b-col class="small px-1 truncate" cols="7">{{ totalERC721Tokens }}</b-col>
        </b-row>
        <b-row>
          <b-col cols="5" class="small px-1 text-right">Registry:</b-col>
          <b-col class="small px-1 truncate" cols="7">{{ Object.keys(registry[chainId] || {}).length }}</b-col>
        </b-row>
        <b-row>
          <b-col cols="5" class="small px-1 text-right">Stealth Transfers:</b-col>
          <b-col class="small px-1 truncate" cols="7">{{ totalStealthTransfers }}</b-col>
        </b-row>
        <!-- <b-row>
          <b-col cols="5" class="small px-1">ENS Map</b-col>
          <b-col class="small px-1 truncate" cols="7">{{ Object.keys(ens).length }}</b-col>
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
    coinbase() {
      return store.getters['connection/coinbase'];
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
    stealthTransfers() {
      return store.getters['data/stealthTransfers'];
    },
    tokenContracts() {
      return store.getters['data/tokenContracts'];
    },
    totalStealthTransfers() {
      let result = (store.getters['data/forceRefresh'] % 2) == 0 ? 0 : 0;
      for (const [blockNumber, logIndexes] of Object.entries(this.stealthTransfers[this.chainId] || {})) {
        for (const [logIndex, item] of Object.entries(logIndexes)) {
          result++;
        }
      }
      return result;
    },
    totalERC20Contracts() {
      let result = (store.getters['data/forceRefresh'] % 2) == 0 ? 0 : 0;
      for (const [address, data] of Object.entries(this.tokenContracts[this.chainId] || {})) {
        if (data.type == "erc20") {
          result++;
        }
      }
      return result;
    },
    totalERC721Tokens() {
      let result = (store.getters['data/forceRefresh'] % 2) == 0 ? 0 : 0;
      for (const [address, data] of Object.entries(this.tokenContracts[this.chainId] || {})) {
        if (data.type == "erc721") {
          result += Object.keys(data.tokenIds).length;
        }
      }
      return result;
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
    // ens() {
    //   return store.getters['data/ens'];
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
    DB_PROCESSING_BATCH_SIZE: 123,
    addresses: {}, // Address => Info

    collection: {}, // chainId -> contract => { id, symbol, name, image, slug, creator, tokenCount }
    tokens: {}, // chainId -> contract -> tokenId => owner or balances
    contractMetadata: {}, // chainId -> contract => metadata
    tokenMetadata: {}, // chainId -> tokenContractAddress -> tokenId => metadata
    timestamps: {}, // chainId -> blockNumber => timestamp
    txs: {}, // txHash => tx & txReceipt

    registry: {}, // Address => StealthMetaAddress
    stealthTransfers: {}, // ChainId, blockNumber, logIndex => data
    tokenContracts: {}, // ChainId, tokenContractAddress, tokenId => data
    ens: {},
    exchangeRates: {},
    forceRefresh: 0,
    sync: {
      section: null,
      total: null,
      completed: null,
      halt: false,
    },
    db: {
      name: "magicalinternetmoneydata080a",
      version: 1,
      schemaDefinition: {
        announcements: '[chainId+blockNumber+logIndex],[blockNumber+contract],contract,confirmations,stealthAddress',
        registrations: '[chainId+blockNumber+logIndex],[blockNumber+contract],contract,confirmations',
        tokenEvents: '[chainId+blockNumber+logIndex],[blockNumber+contract],contract,confirmations',
        // tokenEvents: '[chainId+blockNumber+logIndex],[blockNumber+contract],contract,[eventType+confirmations]',
        cache: '&objectName',
      },
      updated: null,
    },
    checkOptions: [
      { value: 'ethers', text: 'Ethers' },
      { value: 'tokens', text: 'ERC-20, ERC-721 and ERC-1155 Tokens' },
    ],
  },
  getters: {
    addresses: state => state.addresses,

    collection: state => state.collection,
    tokens: state => state.tokens,
    contractMetadata: state => state.contractMetadata,
    tokenMetadata: state => state.tokenMetadata,
    timestamps: state => state.timestamps,
    txs: state => state.txs,

    registry: state => state.registry,
    stealthTransfers: state => state.stealthTransfers,
    tokenContracts: state => state.tokenContracts,
    ens: state => state.ens,
    exchangeRates: state => state.exchangeRates,
    forceRefresh: state => state.forceRefresh,
    sync: state => state.sync,
    db: state => state.db,
    checkOptions: state => state.checkOptions,
  },
  mutations: {
    setState(state, info) {
      // logInfo("dataModule", "mutations.setState - info: " + JSON.stringify(info, null, 2));
      Vue.set(state, info.name, info.data);
    },
    updateTokens(state, tokens) {
      // logInfo("dataModule", "mutations.updateTokens - tokens: " + JSON.stringify(tokens, null, 2));
      const chainId = store.getters['connection/chainId'];
      // TODO: Incremental Syncing tokens to state.tokens
      Vue.set(state.tokens, chainId, tokens);
    },
    toggleAddressField(state, info) {
      Vue.set(state.addresses[info.address], info.field, !state.addresses[info.address][info.field]);
      logInfo("dataModule", "mutations.toggleAddressField - addresses[" + info.address + "]." + info.field + " = " + state.addresses[info.address][info.field]);
    },
    setAddressField(state, info) {
      Vue.set(state.addresses[info.address], info.field, info.value);
      logInfo("dataModule", "mutations.setAddressField - addresses[" + info.address + "]." + info.field + " = " + state.addresses[info.address][info.field]);
    },
    toggleTokenContractFavourite(state, tokenContract) {
      const chainId = store.getters['connection/chainId'];
      Vue.set(state.tokenContracts[chainId][tokenContract.address], 'favourite', !state.tokenContracts[chainId][tokenContract.address].favourite);
      logInfo("dataModule", "mutations.toggleTokenContractFavourite - tokenContract: " + JSON.stringify(state.tokenContracts[chainId][tokenContract.address]));
    },
    toggleTokenContractJunk(state, tokenContract) {
      const chainId = store.getters['connection/chainId'];
      Vue.set(state.tokenContracts[chainId][tokenContract.address], 'junk', !state.tokenContracts[chainId][tokenContract.address].junk);
      logInfo("dataModule", "mutations.toggleTokenContractJunk - tokenContract: " + JSON.stringify(state.tokenContracts[chainId][tokenContract.address]));
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
        Vue.set(state.addresses[address], 'check', newAccount.check);
        Vue.set(state.addresses[address], 'name', newAccount.name);
      } else {
        if (type == "address") {
          Vue.set(state.addresses, address, {
            type,
            source,
            mine,
            junk: false,
            favourite: newAccount.favourite,
            check: newAccount.check,
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
            junk: false,
            favourite: newAccount.favourite,
            check: newAccount.check,
            name: newAccount.name,
            notes: null,
          });
        }
      }
      logInfo("dataModule", "mutations.addNewAddress AFTER - state.accounts: " + JSON.stringify(state.accounts, null, 2));
    },
    addNewStealthAddress(state, info) {
      logInfo("dataModule", "mutations.addNewStealthAddress: " + JSON.stringify(info, null, 2));
      Vue.set(state.addresses, info.stealthAddress, {
        type: info.type,
        linkedTo: info.linkedTo,
        source: info.source,
        mine: info.mine,
        junk: info.junk,
        favourite: info.favourite,
        name: info.name,
        notes: info.notes,
      });
    },
    updateToStealthAddress(state, info) {
      // logInfo("dataModule", "mutations.updateToStealthAddress: " + JSON.stringify(info, null, 2));
      Vue.set(state.addresses[info.stealthAddress], 'type', info.type);
      Vue.set(state.addresses[info.stealthAddress], 'linkedTo', info.linkedTo);
      Vue.set(state.addresses[info.stealthAddress], 'mine', info.mine);
    },
    deleteAddress(state, address) {
      Vue.delete(state.addresses, address);
    },
    addTokenContractMetadata(state, info) {
      logInfo("dataModule", "mutations.addTokenContractMetadata info: " + JSON.stringify(info, null, 2));
      if (!(info.chainId in state.contractMetadata)) {
        Vue.set(state.contractMetadata, info.chainId, {});
      }
      if (!(info.contract in state.contractMetadata[info.chainId])) {
        Vue.set(state.contractMetadata[info.chainId], info.contract, {
          type: info.type,
          symbol: info.symbol,
          name: info.name,
          decimals: info.decimals,
          totalSupply: info.totalSupply,
        });
      }
    },
    addTokenMetadata(state, info) {
      // logInfo("dataModule", "mutations.addTokenMetadata info: " + JSON.stringify(info, null, 2));
      if (!(info.chainId in state.tokenMetadata)) {
        Vue.set(state.tokenMetadata, info.chainId, {});
      }
      if (!(info.contract in state.tokenMetadata[info.chainId])) {
        Vue.set(state.tokenMetadata[info.chainId], info.contract, {});
      }
      if (!(info.tokenId in state.tokenMetadata[info.chainId][info.contract])) {
        if (info.contract == ENS_ERC721_ADDRESS || info.contract == ENS_ERC1155_ADDRESS) {
          logInfo("dataModule", "mutations.addTokenMetadata ENS info: " + JSON.stringify(info, null, 2));
          Vue.set(state.tokenMetadata[info.chainId][info.contract], info.tokenId, {
            created: info.created || null,
            registration: info.registration || null,
            expiry: info.expiry,
            name: info.name,
            description: info.description,
            image: info.image,
            attributes: info.attributes,
          });
        } else {
          logInfo("dataModule", "mutations.addTokenMetadata Non-ENS info: " + JSON.stringify(info, null, 2));
          Vue.set(state.tokenMetadata[info.chainId][info.contract], info.tokenId, {
            name: info.name,
            description: info.description,
            image: info.image,
            attributes: info.attributes,
          });
        }
      }
    },
    addStealthTransfer(state, info) {
      // logInfo("dataModule", "mutations.addStealthTransfer: " + JSON.stringify(info, null, 2));
      if (!(info.chainId in state.stealthTransfers)) {
        Vue.set(state.stealthTransfers, info.chainId, {});
      }
      if (!(info.blockNumber in state.stealthTransfers[info.chainId])) {
        Vue.set(state.stealthTransfers[info.chainId], info.blockNumber, {});
      }
      if (!(info.logIndex in state.stealthTransfers[info.chainId][info.blockNumber])) {
        Vue.set(state.stealthTransfers[info.chainId][info.blockNumber], info.logIndex, info);
      }
    },
    addTimestamp(state, info) {
      logInfo("dataModule", "mutations.addTimestamp info: " + JSON.stringify(info, null, 2));
      if (!(info.chainId in state.timestamps)) {
        Vue.set(state.timestamps, info.chainId, {});
      }
      if (!(info.blockNumber in state.timestamps[info.chainId])) {
        Vue.set(state.timestamps[info.chainId], info.blockNumber, info.timestamp);
      }
    },
    addTx(state, tx) {
      logInfo("dataModule", "mutations.addTx tx: " + JSON.stringify(tx, null, 2));
      if (!(tx.chainId in state.txs)) {
        Vue.set(state.txs, tx.chainId, {});
      }
      if (!(tx.txHash in state.txs[tx.chainId])) {
        Vue.set(state.txs[tx.chainId], tx.txHash, tx);
      }
    },

    setExchangeRates(state, exchangeRates) {
      // const dates = Object.keys(exchangeRates);
      // dates.sort();
      // for (let date of dates) {
      //   console.log(date + "\t" + exchangeRates[date]);
      // }
      Vue.set(state, 'exchangeRates', exchangeRates);
    },
    forceRefresh(state) {
      Vue.set(state, 'forceRefresh', parseInt(state.forceRefresh) + 1);
      logInfo("dataModule", "mutations.forceRefresh: " + state.forceRefresh);
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
      logInfo("dataModule", "mutations.setSyncSection info: " + JSON.stringify(info));
      state.sync.section = info.section;
      state.sync.total = info.total;
    },
    setSyncCompleted(state, completed) {
      logInfo("dataModule", "mutations.setSyncCompleted completed: " + completed + (state.sync.total ? ("/" + state.sync.total) : "") + " " + state.sync.section);
      state.sync.completed = completed;
    },
    setSyncHalt(state, halt) {
      state.sync.halt = halt;
    },
  },
  actions: {
    async restoreState(context) {
      logInfo("dataModule", "actions.restoreState");
      if (Object.keys(context.state.addresses).length == 0) {
        const db0 = new Dexie(context.state.db.name);
        db0.version(context.state.db.version).stores(context.state.db.schemaDefinition);
        for (let type of ['addresses', 'timestamps', 'txs', 'contractMetadata', 'tokenMetadata', 'tokens', 'registry', 'stealthTransfers', 'tokenContracts', 'tokenMetadata']) {
          const data = await db0.cache.where("objectName").equals(type).toArray();
          if (data.length == 1) {
            // logInfo("dataModule", "actions.restoreState " + type + " => " + JSON.stringify(data[0].object));
            context.commit('setState', { name: type, data: data[0].object });
          }
        }
      }
    },
    async saveData(context, types) {
      logInfo("dataModule", "actions.saveData - types: " + JSON.stringify(types));
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
      // logInfo("dataModule", "actions.toggleTokenContractFavourite - info: " + JSON.stringify(info));
      await context.commit('toggleTokenContractFavourite', tokenContract);
      await context.dispatch('saveData', ['tokenContracts']);
    },
    async toggleTokenContractJunk(context, tokenContract) {
      logInfo("dataModule", "actions.toggleTokenContractJunk - tokenContract: " + JSON.stringify(tokenContract));
      await context.commit('toggleTokenContractJunk', tokenContract);
      await context.dispatch('saveData', ['tokenContracts']);
    },
    async addTokenMetadata(context, info) {
      logInfo("dataModule", "actions.addTokenMetadata - info: " + JSON.stringify(info, null, 2));
      context.commit('addTokenMetadata', info);
      await context.dispatch('saveData', ['tokenMetadata']);
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
    async resetData(context) {
      logInfo("dataModule", "actions.resetData");
      const db = new Dexie(context.state.db.name);
      db.version(context.state.db.version).stores(context.state.db.schemaDefinition);
      await db.announcements.clear();
      await db.cache.clear();
      await db.registrations.clear();
      await db.tokenEvents.clear();
      db.close();
    },
    async addNewAddress(context, newAddress) {
      logInfo("dataModule", "actions.addNewAddress - newAddress: " + JSON.stringify(newAddress, null, 2) + ")");
      context.commit('addNewAddress', newAddress);
      await context.dispatch('saveData', ['addresses']);
    },
    // async restoreAccount(context, addressData) {
    //   logInfo("dataModule", "actions.restoreAccount - addressData: " + JSON.stringify(addressData));
    //   const provider = new ethers.providers.Web3Provider(window.ethereum);
    //   const ensReverseRecordsContract = new ethers.Contract(ENSREVERSERECORDSADDRESS, ENSREVERSERECORDSABI, provider);
    //   const accountInfo = await getAccountInfo(addressData.account, provider)
    //   if (accountInfo.account) {
    //     context.commit('addNewAddress', accountInfo);
    //     context.commit('addNewAccountInfo', addressData);
    //   }
    //   const names = await ensReverseRecordsContract.getNames([addressData.account]);
    //   const name = names.length == 1 ? names[0] : addressData.account;
    //   if (!(addressData.account in context.state.ensMap)) {
    //     context.commit('addENSName', { account: addressData.account, name });
    //   }
    // },
    // async restoreIntermediateData(context, info) {
    //   if (info.blocks && info.txs) {
    //     await context.commit('setState', { name: 'blocks', data: info.blocks });
    //     await context.commit('setState', { name: 'txs', data: info.txs });
    //   }
    // },
    async syncIt(context, options) {
      logInfo("dataModule", "actions.syncIt - options: " + JSON.stringify(options, null, 2));
      // const db = new Dexie(context.state.db.name);
      // db.version(context.state.db.version).stores(context.state.db.schemaDefinition);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const block = await provider.getBlock();
      const confirmations = store.getters['config/settings'].confirmations && parseInt(store.getters['config/settings'].confirmations) || 10;
      const blockNumber = block && block.number || null;
      const cryptoCompareAPIKey = store.getters['config/settings'].cryptoCompareAPIKey && store.getters['config/settings'].cryptoCompareAPIKey.length > 0 && store.getters['config/settings'].cryptoCompareAPIKey || null;
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
      if (!(coinbase in context.state.addresses) && Object.keys(context.state.addresses).length == 0) {
        context.commit('addNewAddress', { action: "addCoinbase", check: ["ethers", "tokens"] });
      }

      const parameter = { chainId, coinbase, blockNumber, confirmations, cryptoCompareAPIKey, ...options };
      if (options.stealthTransfers && chainId == 11155111 && !options.devThing) {
        await context.dispatch('syncStealthTransfers', parameter);
      }
      if (options.stealthTransfers && chainId == 11155111 && !options.devThing) {
        await context.dispatch('syncStealthTransfersData', parameter);
      }
      if (options.stealthTransfers && chainId == 11155111 && !options.devThing) {
        await context.dispatch('identifyMyStealthTransfers', parameter);
      }
      if (options.stealthTransfers && chainId == 11155111 && !options.devThing) {
        await context.dispatch('collateStealthTransfers', parameter);
      }

      if (options.stealthMetaAddressRegistry && chainId == 11155111 && !options.devThing) {
        await context.dispatch('syncRegistrations', parameter);
      }
      if (options.stealthMetaAddressRegistry && chainId == 11155111 && !options.devThing) {
        await context.dispatch('syncRegistrationsData', parameter);
      }
      if (options.stealthMetaAddressRegistry && chainId == 11155111 && !options.devThing) {
        await context.dispatch('collateRegistrations', parameter);
      }

      if (options.tokens && !options.devThing) {
        await context.dispatch('syncTokenEvents', parameter);
      }
      if (options.timestamps && !options.devThing) {
        await context.dispatch('syncTokenEventTimestamps', parameter);
      }
      if (options.txData && !options.devThing) {
        await context.dispatch('syncTokenEventTxData', parameter);
      }
      if (options.tokens && !options.devThing) {
        await context.dispatch('collateTokens', parameter);
      }
      if (options.metadata && !options.devThing) {
        await context.dispatch('syncTokenMetadata', parameter);
      }
      if (options.ens || options.devThing) {
        await context.dispatch('syncENS', parameter);
      }

      // if (options.devThing) {
      //   console.log("Dev Thing");
      // }

      context.dispatch('saveData', ['addresses', 'registry' /*, 'blocks', 'txs', 'ensMap'*/]);
      context.commit('setSyncSection', { section: null, total: null });
      context.commit('setSyncHalt', false);
      context.commit('forceRefresh');
    },

    async syncStealthTransfers(context, parameter) {
      logInfo("dataModule", "actions.syncStealthTransfers BEGIN: " + JSON.stringify(parameter));
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
        context.commit('setSyncCompleted', total);
        logInfo("dataModule", "actions.syncStealthTransfers.processLogs: " + fromBlock + " - " + toBlock + " " + logs.length + " " + total);
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
          await db.announcements.bulkAdd(records).then (function(lastKey) {
            console.log("syncStealthTransfers.bulkAdd lastKey: " + JSON.stringify(lastKey));
          }).catch(Dexie.BulkError, function(e) {
            console.log("syncStealthTransfers.bulkAdd e: " + JSON.stringify(e.failures, null, 2));
          });
        }
      }
      async function getLogs(fromBlock, toBlock, selectedContracts, selectedCallers, processLogs) {
        logInfo("dataModule", "actions.syncStealthTransfers.getLogs: " + fromBlock + " - " + toBlock);
        try {
          const filter = {
            // TODO: address: null,
            address: ERC5564ANNOUNCERADDRESS_SEPOLIA,
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
      logInfo("dataModule", "actions.syncStealthTransfers BEGIN");
      context.commit('setSyncSection', { section: 'Stealth Transfers', total: null });
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
        const startBlock = (parameter.incrementalSync && latest) ? parseInt(latest.blockNumber) + 1: 0;
        await getLogs(startBlock, parameter.blockNumber, selectedContracts, selectedCallers, processLogs);
      // }
      logInfo("dataModule", "actions.syncStealthTransfers END");
    },

    async syncStealthTransfersData(context, parameter) {
      logInfo("dataModule", "actions.syncStealthTransfersData: " + JSON.stringify(parameter));
      const db = new Dexie(context.state.db.name);
      db.version(context.state.db.version).stores(context.state.db.schemaDefinition);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      let total = 0;
      let done = false;
      do {
        let data = await db.announcements.where('[chainId+blockNumber+logIndex]').between([parameter.chainId, Dexie.minKey, Dexie.minKey],[parameter.chainId, Dexie.maxKey, Dexie.maxKey]).offset(total).limit(context.state.DB_PROCESSING_BATCH_SIZE).toArray();
        logInfo("dataModule", "actions.syncStealthTransfersData - data.length: " + data.length + ", first[0..9]: " + JSON.stringify(data.slice(0, 10).map(e => e.blockNumber + '.' + e.logIndex )));
        total = parseInt(total) + data.length;
        done = data.length < context.state.DB_PROCESSING_BATCH_SIZE;
      } while (!done);
      logInfo("dataModule", "actions.syncStealthTransfersData - total: " + total);
      context.commit('setSyncSection', { section: 'Stealth Transfer Data', total });
      let rows = 0;
      do {
        let data = await db.announcements.where('[chainId+blockNumber+logIndex]').between([parameter.chainId, Dexie.minKey, Dexie.minKey],[parameter.chainId, Dexie.maxKey, Dexie.maxKey]).offset(rows).limit(context.state.DB_PROCESSING_BATCH_SIZE).toArray();
        logInfo("dataModule", "actions.syncStealthTransfersData - data.length: " + data.length + ", first[0..9]: " + JSON.stringify(data.slice(0, 10).map(e => e.blockNumber + '.' + e.logIndex )));
        const records = [];
        for (const item of data) {
          if (item.timestamp == null) {
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
          rows++;
          context.commit('setSyncCompleted', rows);
        }
        if (records.length > 0) {
          await db.announcements.bulkPut(records).then (function() {
          }).catch(function(error) {
            console.log("syncStealthTransfersData.bulkPut error: " + error);
          });
        }
        done = data.length < context.state.DB_PROCESSING_BATCH_SIZE;
      } while (!done);

      logInfo("dataModule", "actions.syncStealthTransfersData END");
    },

    async identifyMyStealthTransfers(context, parameter) {

      function checkStealthAddress(stealthAddress, ephemeralPublicKey, viewingPrivateKey, spendingPublicKey) {
        const result = {};
        console.log(moment().format("HH:mm:ss") + " processDataOld - checkStealthAddress - stealthAddress: " + stealthAddress + ", ephemeralPublicKey: " + ephemeralPublicKey + ", viewingPrivateKey: " + viewingPrivateKey + ", spendingPublicKey: " + spendingPublicKey);
        console.log("    Check stealthAddress: " + stealthAddress + ", ephemeralPublicKey: " + ephemeralPublicKey + ", viewingPrivateKey: " + viewingPrivateKey + ", spendingPublicKey: " + spendingPublicKey);
        result.sharedSecret = nobleCurves.secp256k1.getSharedSecret(viewingPrivateKey.substring(2), ephemeralPublicKey.substring(2), false);
        result.hashedSharedSecret = ethers.utils.keccak256(result.sharedSecret.slice(1));
        result.hashedSharedSecretPoint = nobleCurves.secp256k1.ProjectivePoint.fromPrivateKey(result.hashedSharedSecret.substring(2));
        result.stealthPublicKey = nobleCurves.secp256k1.ProjectivePoint.fromHex(spendingPublicKey.substring(2)).add(result.hashedSharedSecretPoint);
        result.stealthAddress = ethers.utils.computeAddress("0x" + result.stealthPublicKey.toHex(false));
        result.match = result.stealthAddress == stealthAddress;
        return result;
      }

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
      logInfo("dataModule", "actions.identifyMyStealthTransfers - checkAddresses: " + JSON.stringify(checkAddresses.map(e => e.address)));

      let rows = 0;
      let done = false;
      do {
        let data = await db.announcements.where('[chainId+blockNumber+logIndex]').between([parameter.chainId, Dexie.minKey, Dexie.minKey],[parameter.chainId, Dexie.maxKey, Dexie.maxKey]).offset(rows).limit(context.state.DB_PROCESSING_BATCH_SIZE).toArray();
        logInfo("dataModule", "actions.identifyMyStealthTransfers - data.length: " + data.length + ", first[0..9]: " + JSON.stringify(data.slice(0, 10).map(e => e.blockNumber + '.' + e.logIndex )));
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
            const viewingPrivateKey = account.viewingPrivateKey;
            const viewingPublicKey = account.viewingPublicKey;
            const spendingPublicKey = account.spendingPublicKey;
            try {
              const status = checkStealthAddress(stealthAddress, ephemeralPublicKey, viewingPrivateKey, spendingPublicKey);
              if (status && status.match) {
                item.linkedTo = { stealthMetaAddress: account.address, address: account.linkedToAddress };
                item.iReceived = true;
                if (stealthAddress in addresses) {
                  if (addresses[stealthAddress].type != "stealthAddress") {
                    context.commit('updateToStealthAddress', {
                      stealthAddress,
                      type: "stealthAddress",
                      linkedTo: {
                        stealthMetaAddress: account.address,
                        address: account.linkedToAddress,
                      },
                      mine: true,
                    });
                  }
                } else {
                  context.commit('addNewStealthAddress', {
                    stealthAddress,
                    type: "stealthAddress",
                    linkedTo: {
                      stealthMetaAddress: account.address,
                      address: account.linkedToAddress,
                    },
                    source: "announcer",
                    mine: true,
                    junk: false,
                    favourite: false,
                    name: null,
                    notes: null,
                    check: [],
                  });
                }
                break;
              }
            } catch (e) {
              console.log("ERROR: " + e.message);
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
        done = data.length < context.state.DB_PROCESSING_BATCH_SIZE;
      } while (!done);
      logInfo("dataModule", "actions.identifyMyStealthTransfers addresses END: " + JSON.stringify(addresses, null, 2));
      context.commit('setState', { name: 'addresses', data: addresses });
      await context.dispatch('saveData', ['addresses']);

      logInfo("dataModule", "actions.identifyMyStealthTransfers END");
    },

    async collateStealthTransfers(context, parameter) {
      logInfo("dataModule", "actions.collateStealthTransfers: " + JSON.stringify(parameter));
      const db = new Dexie(context.state.db.name);
      db.version(context.state.db.version).stores(context.state.db.schemaDefinition);
      const provider = new ethers.providers.Web3Provider(window.ethereum);

      let rows = 0;
      let done = false;
      do {
        let data = await db.announcements.where('[chainId+blockNumber+logIndex]').between([parameter.chainId, Dexie.minKey, Dexie.minKey],[parameter.chainId, Dexie.maxKey, Dexie.maxKey]).offset(rows).limit(context.state.DB_PROCESSING_BATCH_SIZE).toArray();
        logInfo("dataModule", "actions.collateStealthTransfers - data.length: " + data.length + ", first[0..9]: " + JSON.stringify(data.slice(0, 10).map(e => e.blockNumber + '.' + e.logIndex )));
        for (const item of data) {
          if (item.schemeId == 0) {
            context.commit('addStealthTransfer', item);
          }
        }
        rows = parseInt(rows) + data.length;
        done = data.length < context.state.DB_PROCESSING_BATCH_SIZE;
      } while (!done);
      await context.dispatch('saveData', ['stealthTransfers']);
      logInfo("dataModule", "actions.collateStealthTransfers END");
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
        context.commit('setSyncCompleted', total);
        logInfo("dataModule", "actions.syncRegistrations.processLogs: " + fromBlock + " - " + toBlock + " " + logs.length + " " + total);
        const records = [];
        for (const log of logs) {
          if (!log.removed) {
            try {
              const logData = erc5564RegistryContract.interface.parseLog(log);
              // console.log("logData: " + JSON.stringify(logData, null, 2));
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
            } catch (e) {
              console.log("ERROR: " + e.message);
            }
          }
        }
        if (records.length) {
          // console.log("syncRegistrations.bulkAdd: " + JSON.stringify(records));
          await db.registrations.bulkAdd(records).then (function(lastKey) {
            console.log("syncRegistrations.bulkAdd lastKey: " + JSON.stringify(lastKey));
          }).catch(Dexie.BulkError, function(e) {
            console.log("syncRegistrations.bulkAdd e: " + JSON.stringify(e.failures, null, 2));
          });
        }
      }
      async function getLogs(fromBlock, toBlock, selectedContracts, processLogs) {
        logInfo("dataModule", "actions.syncRegistrations.getLogs: " + fromBlock + " - " + toBlock);
        try {
          const filter = {
            // TODO: address: null,
            address: ERC5564REGISTRYADDRESS_SEPOLIA,
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
      context.commit('setSyncSection', { section: 'Stealth Meta-Address Registry', total: null });
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
        const startBlock = (parameter.incrementalSync && latest) ? parseInt(latest.blockNumber) + 1: 0;
        await getLogs(startBlock, parameter.blockNumber, selectedContracts, processLogs);
      // }
      logInfo("dataModule", "actions.syncRegistrations END");
    },

    async syncRegistrationsData(context, parameter) {
      logInfo("dataModule", "actions.syncRegistrationsData: " + JSON.stringify(parameter));
      const db = new Dexie(context.state.db.name);
      db.version(context.state.db.version).stores(context.state.db.schemaDefinition);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      let total = 0;
      let done = false;
      do {
        let data = await db.registrations.where('[chainId+blockNumber+logIndex]').between([parameter.chainId, Dexie.minKey, Dexie.minKey],[parameter.chainId, Dexie.maxKey, Dexie.maxKey]).offset(total).limit(context.state.DB_PROCESSING_BATCH_SIZE).toArray();
        logInfo("dataModule", "actions.syncRegistrationsData - data.length: " + data.length + ", first[0..9]: " + JSON.stringify(data.slice(0, 10).map(e => e.blockNumber + '.' + e.logIndex )));
        total = parseInt(total) + data.length;
        done = data.length < context.state.DB_PROCESSING_BATCH_SIZE;
        // done = true;
      } while (!done);
      logInfo("dataModule", "actions.syncRegistrationsData - total: " + total);
      context.commit('setSyncSection', { section: 'Stealth Meta-Address Registry Data', total });
      let rows = 0;
      do {
        let data = await db.registrations.where('[chainId+blockNumber+logIndex]').between([parameter.chainId, Dexie.minKey, Dexie.minKey],[parameter.chainId, Dexie.maxKey, Dexie.maxKey]).offset(rows).limit(context.state.DB_PROCESSING_BATCH_SIZE).toArray();
        logInfo("dataModule", "actions.syncRegistrationsData - data.length: " + data.length + ", first[0..9]: " + JSON.stringify(data.slice(0, 10).map(e => e.blockNumber + '.' + e.logIndex )));
        const records = [];
        for (const item of data) {
          // console.log(moment().format("HH:mm:ss") + " syncRegistrationsData: " + JSON.stringify(item));
          if (item.timestamp == null) {
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
          // console.log("records: " + JSON.stringify(records, null, 2));
          await db.registrations.bulkPut(records).then (function() {
          }).catch(function(error) {
            console.log("syncRegistrationsData.bulkPut error: " + error);
          });
        }
        rows = parseInt(rows) + data.length;
        context.commit('setSyncCompleted', rows);
        done = data.length < context.state.DB_PROCESSING_BATCH_SIZE;
      } while (!done);
      logInfo("dataModule", "actions.syncRegistrationsData END");
    },

    async collateRegistrations(context, parameter) {
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
        let data = await db.registrations.where('[chainId+blockNumber+logIndex]').between([parameter.chainId, Dexie.minKey, Dexie.minKey],[parameter.chainId, Dexie.maxKey, Dexie.maxKey]).offset(rows).limit(context.state.DB_PROCESSING_BATCH_SIZE).toArray();
        logInfo("dataModule", "actions.collateRegistrations - data.length: " + data.length + ", first[0..9]: " + JSON.stringify(data.slice(0, 10).map(e => e.blockNumber + '.' + e.logIndex )));
        for (const item of data) {
          if (item.schemeId == 0) {
            // logInfo("dataModule", "actions.collateRegistrations - processing: " + JSON.stringify(item, null, 2));
            const stealthMetaAddress = item.stealthMetaAddress.match(/^st:eth:0x[0-9a-fA-F]{132}$/) ? item.stealthMetaAddress : STEALTHMETAADDRESS0;
            registry[parameter.chainId][item.registrant] = stealthMetaAddress;
          }
        }
        rows = parseInt(rows) + data.length;
        done = data.length < context.state.DB_PROCESSING_BATCH_SIZE;
        // done = true;
      } while (!done);
      // console.log("registry AFTER: " + JSON.stringify(registry, null, 2));
      context.commit('setState', { name: 'registry', data: registry });

      // console.log("context.state.registry: " + JSON.stringify(context.state.registry, null, 2));
      await context.dispatch('saveData', ['registry']);
      logInfo("dataModule", "actions.collateRegistrations END");
    },

    async syncTokenEvents(context, parameter) {
      logInfo("dataModule", "actions.syncTokenEvents: " + JSON.stringify(parameter));
      const db = new Dexie(context.state.db.name);
      db.version(context.state.db.version).stores(context.state.db.schemaDefinition);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const erc1155Interface = new ethers.utils.Interface(ERC1155ABI);

      // ERC-20 & ERC-721 Transfer (index_topic_1 address from, index_topic_2 address to, index_topic_3 uint256 id)
      // [ '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef', accountAs32Bytes, null ],
      // [ '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef', null, accountAs32Bytes ],

      // ERC-1155 TransferSingle (index_topic_1 address operator, index_topic_2 address from, index_topic_3 address to, uint256 id, uint256 value)
      // [ '0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62', null, accountAs32Bytes, null ],
      // [ '0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62', null, null, accountAs32Bytes ],

      // ERC-1155 TransferBatch (index_topic_1 address operator, index_topic_2 address from, index_topic_3 address to, uint256[] ids, uint256[] values)
      // [ '0x4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb', null, accountAs32Bytes, null ],
      // [ '0x4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb', null, null, accountAs32Bytes ],

      // ENS:ETH Registrar Controller NameRenewed (string name, index_topic_1 bytes32 label, uint256 cost, uint256 expires)
      // [ '0x3da24c024582931cfaf8267d8ed24d13a82a8068d5bd337d30ec45cea4e506ae', [tokenIds] ],

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
        context.commit('setSyncCompleted', total);
        logInfo("dataModule", "actions.syncTokenEvents.processLogs - fromBlock: " + fromBlock + ", toBlock: " + toBlock + ", section: " + section + ", logs.length: " + logs.length + ", total: " + total);
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
            } else {
              console.log("NOT HANDLED: " + JSON.stringify(log));
            }
            // TODO: Testing if (eventRecord && contract == "0x7439E9Bb6D8a84dd3A23fe621A30F95403F87fB9") {
            // if (eventRecord &&
            //     ((parameter.erc20 && eventRecord.eventType == "erc20") ||
            //      (parameter.erc721 && eventRecord.eventType == "erc721") ||
            //      (parameter.erc1155 && eventRecord.eventType == "erc1155"))) {
            // const testAddresses = parameter.devThing ? new Set(["0xB32979486938AA9694BFC898f35DBED459F44424","0x286E531F363768Fed5E18b468f5B76a9FFc33af5"]) : null;
            // if (eventRecord && (!testAddresses || testAddresses.has(contract)) && eventRecord.eventType == "erc1155") {
            // if (eventRecord && contract == "0xB32979486938AA9694BFC898f35DBED459F44424") {
            // if (eventRecord && (contract == "0xB32979486938AA9694BFC898f35DBED459F44424" || contract == "0x286E531F363768Fed5E18b468f5B76a9FFc33af5")) {
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
          await db.tokenEvents.bulkAdd(records).then (function(lastKey) {
            console.log("syncTokenEvents.bulkAdd lastKey: " + JSON.stringify(lastKey));
          }).catch(Dexie.BulkError, function(e) {
            console.log("syncTokenEvents.bulkAdd e: " + JSON.stringify(e.failures, null, 2));
          });
        }
      }
      async function getLogs(fromBlock, toBlock, section, selectedAddresses, processLogs) {
        logInfo("dataModule", "actions.syncTokenEvents.getLogs - fromBlock: " + fromBlock + ", toBlock: " + toBlock + ", section: " + section);
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
            const logs = await provider.getLogs({ address: null, fromBlock, toBlock, topics });
            await processLogs(fromBlock, toBlock, section, logs);
          } else if (section == 1) {
            topics = [[
                '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
              ],
              null,
              selectedAddresses
            ];
            const logs = await provider.getLogs({ address: null, fromBlock, toBlock, topics });
            await processLogs(fromBlock, toBlock, section, logs);
          } else if (section == 2) {
            topics = [[
                '0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62',
                '0x4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb',
              ],
              null,
              selectedAddresses
            ];
            logs = await provider.getLogs({ address: null, fromBlock, toBlock, topics });
            await processLogs(fromBlock, toBlock, section, logs);
          } else if (section == 3) {
            topics = [ [
                '0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62',
                '0x4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb',
              ],
              null,
              null,
              selectedAddresses
            ];
            logs = await provider.getLogs({ address: null, fromBlock, toBlock, topics });
            await processLogs(fromBlock, toBlock, section, logs);
          }
        } catch (e) {
          const mid = parseInt((fromBlock + toBlock) / 2);
          await getLogs(fromBlock, mid, section, selectedAddresses, processLogs);
          await getLogs(parseInt(mid) + 1, toBlock, section, selectedAddresses, processLogs);
        }
      }
      logInfo("dataModule", "actions.syncTokenEvents BEGIN");
      context.commit('setSyncSection', { section: 'Token Events', total: null });
      const selectedAddresses = [];
      for (const [address, addressData] of Object.entries(context.state.addresses)) {
        if (address.substring(0, 2) == "0x" && addressData.check && addressData.check.includes("tokens")) {
          selectedAddresses.push('0x000000000000000000000000' + address.substring(2, 42).toLowerCase());
        }
      }
      console.log("selectedAddresses: " + JSON.stringify(selectedAddresses));
      if (selectedAddresses.length > 0) {
        const deleteCall = await db.tokenEvents.where("confirmations").below(parameter.confirmations).delete();
        const latest = await db.tokenEvents.where('[chainId+blockNumber+logIndex]').between([parameter.chainId, Dexie.minKey, Dexie.minKey],[parameter.chainId, Dexie.maxKey, Dexie.maxKey]).last();
        // const startBlock = (parameter.incrementalSync && latest) ? parseInt(latest.blockNumber) + 1: 0;
        const startBlock = 0;
        for (let section = 0; section < 4; section++) {
          await getLogs(startBlock, parameter.blockNumber, section, selectedAddresses, processLogs);
        }
      }
      logInfo("dataModule", "actions.syncTokenEvents END");
    },

    async syncTokenEventTimestamps(context, parameter) {
      logInfo("dataModule", "actions.syncTokenEventTimestamps: " + JSON.stringify(parameter));
      const db = new Dexie(context.state.db.name);
      db.version(context.state.db.version).stores(context.state.db.schemaDefinition);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      let rows = 0;
      let done = false;
      const existingTimestamps = context.state.timestamps[parameter.chainId] || {};
      const newBlocks = {};
      do {
        let data = await db.tokenEvents.where('[chainId+blockNumber+logIndex]').between([parameter.chainId, Dexie.minKey, Dexie.minKey],[parameter.chainId, Dexie.maxKey, Dexie.maxKey]).offset(rows).limit(context.state.DB_PROCESSING_BATCH_SIZE).toArray();
        logInfo("dataModule", "actions.syncTokenEventTimestamps - data.length: " + data.length + ", first[0..9]: " + JSON.stringify(data.slice(0, 10).map(e => e.blockNumber + '.' + e.logIndex )));
        for (const item of data) {
          if (!(item.blockNumber in existingTimestamps) && !(item.blockNumber in newBlocks)) {
            newBlocks[item.blockNumber] = true;
          }
        }
        rows += data.length;
        done = data.length < context.state.DB_PROCESSING_BATCH_SIZE;
      } while (!done);
      const total = Object.keys(newBlocks).length;
      logInfo("dataModule", "actions.syncTokenEventTimestamps - total: " + total);
      context.commit('setSyncSection', { section: 'Token Event Timestamps', total });
      let completed = 0;
      for (let blockNumber of Object.keys(newBlocks)) {
        const block = await provider.getBlock(parseInt(blockNumber));
        context.commit('addTimestamp', {
          chainId: parameter.chainId,
          blockNumber,
          timestamp: block.timestamp,
        });
        completed++;
        context.commit('setSyncCompleted', completed);
        if (context.state.sync.halt) {
          break;
        }
      }
      // console.log("context.state.timestamps: " + JSON.stringify(context.state.timestamps, null, 2));
      await context.dispatch('saveData', ['timestamps']);
      logInfo("dataModule", "actions.syncTokenEventTimestamps END");
    },

    async syncTokenEventTxData(context, parameter) {
      logInfo("dataModule", "actions.syncTokenEventTxData: " + JSON.stringify(parameter));
      const db = new Dexie(context.state.db.name);
      db.version(context.state.db.version).stores(context.state.db.schemaDefinition);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      let rows = 0;
      let done = false;
      const existingTxs = context.state.txs[parameter.chainId] || {};
      const newTxs = {};
      do {
        let data = await db.tokenEvents.where('[chainId+blockNumber+logIndex]').between([parameter.chainId, Dexie.minKey, Dexie.minKey],[parameter.chainId, Dexie.maxKey, Dexie.maxKey]).offset(rows).limit(context.state.DB_PROCESSING_BATCH_SIZE).toArray();
        logInfo("dataModule", "actions.syncTokenEventTxData - data.length: " + data.length + ", first[0..9]: " + JSON.stringify(data.slice(0, 10).map(e => e.blockNumber + '.' + e.logIndex )));
        for (const item of data) {
          if (!(item.txHash in existingTxs) && !(item.txHash in newTxs)) {
            newTxs[item.txHash] = true;
          }
        }
        rows += data.length;
        done = data.length < context.state.DB_PROCESSING_BATCH_SIZE;
      } while (!done);
      const total = Object.keys(newTxs).length;
      logInfo("dataModule", "actions.syncTokenEventTxData - total: " + total);
      context.commit('setSyncSection', { section: 'Token Event Transaction Data', total });
      let completed = 0;
      for (let txHash of Object.keys(newTxs)) {
        const tx = await provider.getTransaction(txHash);
        const txReceipt = await provider.getTransactionReceipt(txHash);
        context.commit('addTx', {
          chainId: parameter.chainId,
          txHash,
          type: tx.type,
          blockHash: tx.blockHash,
          from: tx.from,
          gasPrice: ethers.BigNumber.from(tx.gasPrice).toString(),
          gasLimit: ethers.BigNumber.from(tx.gasLimit).toString(),
          to: tx.to,
          value: ethers.BigNumber.from(tx.value).toString(),
          nonce: tx.nonce,
          data: tx.to && tx.data || null, // Remove contract creation data to reduce memory footprint
          contractAddress: txReceipt.contractAddress,
          transactionIndex: txReceipt.transactionIndex,
          gasUsed: ethers.BigNumber.from(txReceipt.gasUsed).toString(),
          blockHash: txReceipt.blockHash,
          logs: txReceipt.logs,
          cumulativeGasUsed: ethers.BigNumber.from(txReceipt.cumulativeGasUsed).toString(),
          effectiveGasPrice: ethers.BigNumber.from(txReceipt.effectiveGasPrice).toString(),
          status: txReceipt.status,
          type: txReceipt.type,
        });
        completed++;
        context.commit('setSyncCompleted', completed);
        if (context.state.sync.halt) {
          break;
        }
      }
      // console.log("context.state.txs: " + JSON.stringify(context.state.txs, null, 2));
      await context.dispatch('saveData', ['txs']);
      logInfo("dataModule", "actions.syncTokenEventTxData END");
    },

    async collateTokens(context, parameter) {
      logInfo("dataModule", "actions.collateTokens: " + JSON.stringify(parameter));
      const db = new Dexie(context.state.db.name);
      db.version(context.state.db.version).stores(context.state.db.schemaDefinition);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      logInfo("dataModule", "actions.collateTokens BEGIN");
      const selectedAddressesMap = {};
      for (const [address, addressData] of Object.entries(context.state.addresses)) {
        if (address.substring(0, 2) == "0x" && addressData.check && addressData.check.includes("tokens")) {
          selectedAddressesMap[address] = true;
        }
      }
      console.log("selectedAddressesMap: " + Object.keys(selectedAddressesMap));
      let rows = 0;
      let done = false;
      const tokens = {};
      do {
        let data = await db.tokenEvents.where('[chainId+blockNumber+logIndex]').between([parameter.chainId, Dexie.minKey, Dexie.minKey],[parameter.chainId, Dexie.maxKey, Dexie.maxKey]).offset(rows).limit(context.state.DB_PROCESSING_BATCH_SIZE).toArray();
        logInfo("dataModule", "actions.collateTokens - data.length: " + data.length + ", first[0..9]: " + JSON.stringify(data.slice(0, 10).map(e => e.blockNumber + '.' + e.logIndex )));
        for (const item of data) {
          if (!(item.contract in tokens)) {
            if (item.eventType == "erc20") {
              tokens[item.contract] = {
                type: item.eventType,
                balances: {},
              };
            } else {
              tokens[item.contract] = {
                type: item.eventType,
                tokenIds: {},
              };
            }
          }
          if (item.eventType == "erc20" && item.type == "Transfer") {
            const balances = tokens[item.contract].balances || {};
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
            tokens[item.contract].balances = balances;
          } else if (item.eventType == "erc721" && item.type == "Transfer") {
            if (item.from in selectedAddressesMap || item.to in selectedAddressesMap) {
              tokens[item.contract].tokenIds[item.tokenId] = item.to;
            }
          } else if (item.eventType == "erc1155" && item.type == "TransferSingle") {
            if (item.from in selectedAddressesMap) {
              if (!(item.tokenId in tokens[item.contract].tokenIds)) {
                tokens[item.contract].tokenIds[item.tokenId] = {};
              }
              if (item.from in tokens[item.contract].tokenIds[item.tokenId]) {
                tokens[item.contract].tokenIds[item.tokenId][item.from] = ethers.BigNumber.from(tokens[item.contract].tokenIds[item.tokenId][item.from]).sub(item.value).toString();
                if (tokens[item.contract].tokenIds[item.tokenId][item.from] == "0") {
                  delete tokens[item.contract].tokenIds[item.tokenId][item.from];
                }
              }
            }
            if (item.to in selectedAddressesMap) {
              if (!(item.tokenId in tokens[item.contract].tokenIds)) {
                tokens[item.contract].tokenIds[item.tokenId] = {};
              }
              if (!(item.to in tokens[item.contract].tokenIds[item.tokenId])) {
                tokens[item.contract].tokenIds[item.tokenId][item.to] = "0";
              }
              tokens[item.contract].tokenIds[item.tokenId][item.to] = ethers.BigNumber.from(tokens[item.contract].tokenIds[item.tokenId][item.to]).add(item.value).toString();
            }
          } else if (item.eventType == "erc1155" && item.type == "TransferBatch") {
            for (const [index, tokenId] of item.tokenIds.entries()) {
              if (item.from in selectedAddressesMap) {
                if (!(tokenId in tokens[item.contract].tokenIds)) {
                  tokens[item.contract].tokenIds[tokenId] = {};
                }
                if (item.from in tokens[item.contract].tokenIds[tokenId]) {
                  tokens[item.contract].tokenIds[tokenId][item.from] = ethers.BigNumber.from(tokens[item.contract].tokenIds[tokenId][item.from]).sub(item.values[index]).toString();
                  if (tokens[item.contract].tokenIds[tokenId][item.from] == "0") {
                    delete tokens[item.contract].tokenIds[tokenId][item.from];
                  }
                }
              }
              if (item.to in selectedAddressesMap) {
                if (!(tokenId in tokens[item.contract].tokenIds)) {
                  tokens[item.contract].tokenIds[tokenId] = {};
                }
                if (!(item.to in tokens[item.contract].tokenIds[tokenId])) {
                  tokens[item.contract].tokenIds[tokenId][item.to] = "0";
                }
                tokens[item.contract].tokenIds[tokenId][item.to] = ethers.BigNumber.from(tokens[item.contract].tokenIds[tokenId][item.to]).add(item.values[index]).toString();
              }
            }
          }
        }
        rows = parseInt(rows) + data.length;
        done = data.length < context.state.DB_PROCESSING_BATCH_SIZE;
      } while (!done);
      // console.log("tokens: " + JSON.stringify(tokens, null, 2));
      context.commit('updateTokens', tokens);
      await context.dispatch('saveData', ['tokens']);
      logInfo("dataModule", "actions.collateTokens END");
    },

    async syncTokenMetadata(context, parameter) {

      logInfo("dataModule", "actions.syncTokenMetadata: " + JSON.stringify(parameter));
      const db = new Dexie(context.state.db.name);
      db.version(context.state.db.version).stores(context.state.db.schemaDefinition);
      const provider = new ethers.providers.Web3Provider(window.ethereum);

      logInfo("dataModule", "actions.syncTokenMetadata BEGIN");

      const contractsToProcess = {};
      const tokensToProcess = {};
      let totalContractsToProcess = 0;
      let totalTokensToProcess = 0;
      for (const [contract, contractData] of Object.entries(context.state.tokens[parameter.chainId] || {})) {
        if (!context.state.contractMetadata[parameter.chainId] || !context.state.contractMetadata[parameter.chainId][contract]) {
          contractsToProcess[contract] = contractData;
          totalContractsToProcess++;
        }
        if (contractData.type == "erc721" || contractData.type == "erc1155") {
          for (const [tokenId, tokenData] of Object.entries(contractData.tokenIds)) {
            if (!context.state.tokenMetadata[parameter.chainId] || !context.state.tokenMetadata[parameter.chainId][contract] || !context.state.tokenMetadata[parameter.chainId][contract][tokenId]) {
              if (!(contract in tokensToProcess)) {
                tokensToProcess[contract] = {};
              }
              tokensToProcess[contract][tokenId] = tokenData;
              totalTokensToProcess++;
            }
          }
        }
      }
      // console.log("contractsToProcess: " + JSON.stringify(contractsToProcess));
      console.log("tokensToProcess: " + JSON.stringify(tokensToProcess, null, 2));

      if (true) {
        context.commit('setSyncSection', { section: 'Token Contract Metadata', total: totalContractsToProcess });
        let completed = 0;
        for (const [contract, contractData] of Object.entries(contractsToProcess)) {
          console.log("Processing: " + contract + " => " + JSON.stringify(contractData));
          context.commit('setSyncCompleted', completed);
          const interface = new ethers.Contract(contract, ERC20ABI, provider);
          let symbol = null;
          let name = null;
          let decimals = null;
          let totalSupply = null;
          if (contract == ENS_ERC721_ADDRESS) {
            symbol = "ENS";
            name = "Ethereum Name Service";
          } else if (contract == ENS_ERC1155_ADDRESS) {
            symbol = "ENSW";
            name = "Ethereum Name Service Name Wrapper";
          } else {
            try {
              symbol = await interface.symbol();
            } catch (e) {
            }
            try {
              name = await interface.name();
            } catch (e) {
            }
          }
          if (contractData.type == "erc20") {
              try {
                decimals = await interface.decimals();
              } catch (e) {
              }
          }
          try {
            totalSupply = await interface.totalSupply();
          } catch (e) {
          }
          // console.log(contract + " " + contractData.type + " " + symbol + " " + name + " " + decimals + " " + totalSupply);
          context.commit('addTokenContractMetadata', {
            chainId: parameter.chainId,
            contract,
            symbol,
            name,
            decimals: decimals && parseInt(decimals) || null,
            totalSupply: totalSupply && totalSupply.toString() || null,
            ...contractData,
          });
          completed++;
          if ((completed % 10) == 0) {
            await context.dispatch('saveData', ['contractMetadata']);
          }
          if (context.state.sync.halt) {
            break;
          }
        }
        // console.log("context.state.metadata: " + JSON.stringify(context.state.metadata, null, 2));
        await context.dispatch('saveData', ['contractMetadata']);
      }

      completed = 0;
      context.commit('setSyncSection', { section: 'Token Metadata', total: totalTokensToProcess });
      context.commit('setSyncCompleted', 0);
      // data:application/json;base64, 0x72A94e6c51CB06453B84c049Ce1E1312f7c05e2c Wiiides
      // https:// -> ipfs://           0x31385d3520bCED94f77AaE104b406994D8F2168C BGANPUNKV2
      // data:application/json;base64, 0x1C60841b70821dcA733c9B1a26dBe1a33338bD43 GLICPIXXXVER002
      // IPFS data in another contract 0xC2C747E0F7004F9E8817Db2ca4997657a7746928 Hashmask
      // No tokenURI                   0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85 ENS
      // TODO ?                        0xd4416b13d2b3a9abae7acd5d6c2bbdbe25686401 ENS Name Wrapper
      // IPFS retrieval failure        0xbe9371326F91345777b04394448c23E2BFEaa826 OSP Gemesis

      for (const [contract, contractData] of Object.entries(tokensToProcess)) {
        const contractType = context.state.tokens[parameter.chainId][contract].type;
        // console.log(contract + " => " + contractType);
        for (const [tokenId, tokenData] of Object.entries(contractData)) {
          context.commit('setSyncCompleted', completed);
          try {
            let tokenURIResult = null;
            if (contract == ENS_ERC721_ADDRESS || contract == ENS_ERC1155_ADDRESS) {
              tokenURIResult = "https://metadata.ens.domains/mainnet/" + contract + "/" + tokenId;
            // } else if (contract == HASHMASK) {
            //   // Cannot access to server CORS configuration tokenURIResult = "https://hashmap.azurewebsites.net/getMask/" + tokenId;
            //   tokenURIResult = "https://api.reservoir.tools/tokens/v7?tokens=" + contract + "%3A" + tokenId + "&includeAttributes=true";
            } else {
              if (contractType == "erc721") {
                const interface = new ethers.Contract(contract, ERC721ABI, provider);
                tokenURIResult = await interface.tokenURI(tokenId);
              } else if (contractType == "erc1155") {
                const interface = new ethers.Contract(contract, ERC1155ABI, provider);
                tokenURIResult = await interface.uri(tokenId);
                // console.log("ERC-1155 tokenURIResult: " + tokenURIResult);
              }
            }
            console.log("FIRST: " + contract + "/" + tokenId + " => " + JSON.stringify(tokenURIResult));
            let name = null;
            let description = null;
            let attributes = null;
            let imageSource = null;
            let image = null;
            let expiry = null;
            let expired = false;
            if (tokenURIResult && tokenURIResult.substring(0, 29) == "data:application/json;base64,") {
              const decodedJSON = atob(tokenURIResult.substring(29));
              const data = JSON.parse(decodedJSON);
              name = data.name || undefined;
              description = data.description || undefined;
              attributes = data.attributes || {};
              image = data.image || undefined;
              context.commit('addTokenMetadata', {
                chainId: parameter.chainId,
                contract,
                tokenId,
                name,
                description,
                image,
                attributes,
              });
            } else if (tokenURIResult && (tokenURIResult.substring(0, 7) == "ipfs://" || tokenURIResult.substring(0, 8) == "https://")) {
              let metadataFile = null;
              if (tokenURIResult.substring(0, 12) == "ipfs://ipfs/") {
                metadataFile = "https://ipfs.io/" + tokenURIResult.substring(7)
              } else if (tokenURIResult.substring(0, 7) == "ipfs://") {
                metadataFile = "https://ipfs.io/ipfs/" + tokenURIResult.substring(7);
              } else {
                metadataFile = tokenURIResult;
              }
              // let metadataFile = tokenURIResult.substring(0, 7) == "ipfs://" ? ("https://ipfs.io/ipfs/" + tokenURIResult.substring(7)) : tokenURIResult;
              console.log("metadataFile: " + metadataFile + ", tokenURIResult: " + tokenURIResult);

              // console.log("metadataFile: " + JSON.stringify(metadataFile, null, 2));
              if (contractType == "erc1155") {
                // console.log("ERC-1155 metadataFile BEFORE: " + JSON.stringify(metadataFile, null, 2));
                metadataFile = metadataFile.replace(/0x{id}/, tokenId);
                // console.log("ERC-1155 metadataFile AFTER: " + JSON.stringify(metadataFile, null, 2));
              }
              try {
                const metadataFileContent = await fetch(metadataFile, {mode: 'cors'}).then(response => response.json());
                console.log("metadataFile: " + metadataFile + " => " + JSON.stringify(metadataFileContent, null, 2));

                if (contract == ENS_ERC721_ADDRESS || contract == ENS_ERC1155_ADDRESS) {
                  if (metadataFileContent && metadataFileContent.message) {
                    // metadataFileContent: {
                    //   "message": "'©god.eth' is already been expired at Fri, 29 Sep 2023 06:31:14 GMT."
                    // }
                    // console.log("EXPIRED: " + metadataFileContent.message);
                    let inputString;
                    [inputString, name, expiryString] = metadataFileContent.message.match(/'(.*)'.*at\s(.*)\./) || [null, null, null]
                    expiry = moment.utc(expiryString).unix();
                    console.log("EXPIRED - name: '" + name + "', expiryString: '" + expiryString + "', expiry: " + expiry);
                    expired = true;
                    context.commit('addTokenMetadata', {
                      chainId: parameter.chainId,
                      contract,
                      tokenId,
                      created: null,
                      registration: null,
                      expiry,
                      name: name,
                      description: "Expired '" + name + "'",
                      image: null,
                      attributes: [],
                    });
                  } else { // if (metadataFileContent && metadataFileContent.attributes) {
                    if (contract == ENS_ERC721_ADDRESS) {
                      const createdRecord = metadataFileContent.attributes.filter(e => e.trait_type == "Created Date");
                      created = createdRecord.length == 1 && createdRecord[0].value / 1000 || null;
                      const registrationRecord = metadataFileContent.attributes.filter(e => e.trait_type == "Registration Date");
                      registration = registrationRecord.length == 1 && registrationRecord[0].value / 1000 || null;
                      const expiryRecord = metadataFileContent.attributes.filter(e => e.trait_type == "Expiration Date");
                      expiry = expiryRecord.length == 1 && expiryRecord[0].value / 1000 || null;
                      const attributes = metadataFileContent.attributes || [];
                      attributes.sort((a, b) => {
                        return ('' + a.trait_type).localeCompare(b.trait_type);
                      });
                      context.commit('addTokenMetadata', {
                        chainId: parameter.chainId,
                        contract,
                        tokenId,
                        created,
                        registration,
                        expiry,
                        name: metadataFileContent.name || null,
                        description: metadataFileContent.name || null,
                        image: metadataFileContent.image || null,
                        attributes,
                      });
                    } else if (contract == ENS_ERC1155_ADDRESS) {
                      const createdRecord = metadataFileContent.attributes.filter(e => e.trait_type == "Created Date");
                      created = createdRecord.length == 1 && createdRecord[0].value / 1000 || null;
                      const expiryRecord = metadataFileContent.attributes.filter(e => e.trait_type == "Namewrapper Expiry Date");
                      expiry = expiryRecord.length == 1 && expiryRecord[0].value / 1000 || null;
                      const attributes = metadataFileContent.attributes || [];
                      attributes.sort((a, b) => {
                        return ('' + a.trait_type).localeCompare(b.trait_type);
                      });
                      context.commit('addTokenMetadata', {
                        chainId: parameter.chainId,
                        contract,
                        tokenId,
                        created,
                        expiry,
                        name: metadataFileContent.name || null,
                        description: metadataFileContent.name || null,
                        image: metadataFileContent.image || null,
                        attributes,
                      });
                    }
                  }
                } else {
                  console.log("NON-ENS");
                  const attributes = metadataFileContent.attributes || [];
                  attributes.sort((a, b) => {
                    return ('' + a.trait_type).localeCompare(b.trait_type);
                  });
                  const image = metadataFileContent.image || null;
                  console.log(contract + "/" + tokenId + " => " + image);
                  context.commit('addTokenMetadata', {
                    chainId: parameter.chainId,
                    contract,
                    tokenId,
                    name: metadataFileContent.name || null,
                    description: metadataFileContent.name || null,
                    image: metadataFileContent.image || null,
                    attributes,
                  });
                }
              } catch (e1) {
                console.error(e1.message);
              }
            }
          } catch (e) {
            console.error(e.message);
          }
          completed++;
          if ((completed % 10) == 0) {
            await context.dispatch('saveData', ['tokenMetadata']);
          }
          if (context.state.sync.halt) {
            break;
          }
        }
        if (context.state.sync.halt) {
          break;
        }
      }
      await context.dispatch('saveData', ['tokenMetadata']);
      logInfo("dataModule", "actions.syncTokenMetadata END");
    },

    async syncENS(context, parameter) {
      logInfo("dataModule", "actions.syncENS BEGIN: " + JSON.stringify(parameter));
      const db = new Dexie(context.state.db.name);
      db.version(context.state.db.version).stores(context.state.db.schemaDefinition);
      const provider = new ethers.providers.Web3Provider(window.ethereum);

      let rows = 0;
      let done = false;

      return;

      let collection = null;
      const tokens = {};
      const owners = {};
      do {
        let data = await db.tokens.where('[chainId+contract+tokenId]').between([parameter.chainId, context.state.selectedCollection, Dexie.minKey],[parameter.chainId, context.state.selectedCollection, Dexie.maxKey]).offset(rows).limit(context.state.DB_PROCESSING_BATCH_SIZE).toArray();
        logInfo("dataModule", "actions.syncENS - tokens - data.length: " + data.length + ", first[0..1]: " + JSON.stringify(data.slice(0, 2).map(e => e.contract + '/' + e.tokenId )));
        for (const item of data) {
          if (!(item.owner in owners)) {
            owners[item.owner] = [];
          }
          owners[item.owner].push(item.tokenId);
        }
        rows = parseInt(rows) + data.length;
        done = data.length < context.state.DB_PROCESSING_BATCH_SIZE;
      } while (!done);
      // console.log("owners: " + JSON.stringify(owners, null, 2));

      context.commit('setSyncSection', { section: "ENS", total: Object.keys(owners).length });
      let completed = 0;

      const ensReverseRecordsContract = new ethers.Contract(ENSREVERSERECORDSADDRESS, ENSREVERSERECORDSABI, provider);
      const addresses = Object.keys(owners);
      const ENSOWNERBATCHSIZE = 25; // Can do 200, but incorrectly misconfigured reverse ENS causes the whole call to fail
      for (let i = 0; i < addresses.length; i += ENSOWNERBATCHSIZE) {
        const batch = addresses.slice(i, parseInt(i) + ENSOWNERBATCHSIZE);
        try {
          const allnames = await ensReverseRecordsContract.getNames(batch);
          for (let j = 0; j < batch.length; j++) {
            const address = batch[j];
            const name = allnames[j];
            // const normalized = normalize(address);
            if (name) {
              console.log(address + " => " + name);
              context.commit('setENS', { address, name });
            }
          }
        } catch (e) {
          for (let j = 0; j < batch.length; j++) {
            try {
              const address = batch[j];
              const allnames = await ensReverseRecordsContract.getNames([address]);
              const name = allnames[0];
              if (name) {
                console.log(address + " => " + name);
                context.commit('setENS', { address, name });
              }
            } catch (e1) {
              console.log("Error - address: " + batch[j] + ", message: " + e1.message);
            }
          }
        }
        completed += batch.length;
        context.commit('setSyncCompleted', completed);
      }
      console.log("context.state.ens: " + JSON.stringify(context.state.ens, null, 2));
      context.dispatch('saveData', ['ens']);
    },

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
    // async syncRefreshENS(context, parameter) {
    //   const provider = new ethers.providers.Web3Provider(window.ethereum);
    //   const ensReverseRecordsContract = new ethers.Contract(ENSREVERSERECORDSADDRESS, ENSREVERSERECORDSABI, provider);
    //   const addresses = Object.keys(context.state.accounts);
    //   const ENSOWNERBATCHSIZE = 200; // Can do 200, but incorrectly misconfigured reverse ENS causes the whole call to fail
    //   for (let i = 0; i < addresses.length; i += ENSOWNERBATCHSIZE) {
    //     const batch = addresses.slice(i, parseInt(i) + ENSOWNERBATCHSIZE);
    //     const allnames = await ensReverseRecordsContract.getNames(batch);
    //     for (let j = 0; j < batch.length; j++) {
    //       const account = batch[j];
    //       const name = allnames[j];
    //       // const normalized = normalize(account);
    //       // console.log(account + " => " + name);
    //       context.commit('addENSName', { account, name });
    //     }
    //   }
    //   context.dispatch('saveData', ['ensMap']);
    // },
    // Called by Connection.execWeb3()
    async execWeb3({ state, commit, rootState }, { count, listenersInstalled }) {
      logInfo("dataModule", "execWeb3() start[" + count + ", " + listenersInstalled + ", " + JSON.stringify(rootState.route.params) + "]");
    },
  },
};
