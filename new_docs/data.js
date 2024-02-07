const Data = {
  template: `
  <div>
    <b-button v-b-toggle.data-module size="sm" block variant="outline-info">Data</b-button>
    <b-collapse id="data-module" visible class="my-2">
      <b-card no-body class="border-0">
        <b-row>
          <b-col cols="5" class="small text-right">Addresses:</b-col>
          <b-col class="small truncate" cols="7">{{ Object.keys(addresses).length }}</b-col>
        </b-row>
        <b-row>
          <b-col cols="5" class="small text-right">ERC-20 Contracts:</b-col>
          <b-col class="small truncate" cols="7">{{ totalERC20Contracts }}</b-col>
        </b-row>
        <b-row>
          <b-col cols="5" class="small text-right">ERC-721 Tokens:</b-col>
          <b-col class="small truncate" cols="7">{{ totalERC721Tokens }}</b-col>
        </b-row>
        <b-row>
          <b-col cols="5" class="small text-right">Registry:</b-col>
          <b-col class="small truncate" cols="7">{{ Object.keys(registry[chainId] || {}).length }}</b-col>
        </b-row>
        <b-row>
          <b-col cols="5" class="small text-right">Stealth Transfers:</b-col>
          <b-col class="small truncate" cols="7">{{ totalTransfers }}</b-col>
        </b-row>
        <!-- <b-row>
          <b-col cols="5" class="small">ENS Map</b-col>
          <b-col class="small truncate" cols="7">{{ Object.keys(ensMap).length }}</b-col>
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
    transfers() {
      return store.getters['data/transfers'];
    },
    tokenContracts() {
      return store.getters['data/tokenContracts'];
    },
    totalTransfers() {
      let result = (store.getters['data/forceRefresh'] % 2) == 0 ? 0 : 0;
      for (const [blockNumber, logIndexes] of Object.entries(this.transfers[this.chainId] || {})) {
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
    DB_PROCESSING_BATCH_SIZE: 12,
    addresses: {}, // Address => Info
    registry: {}, // Address => StealthMetaAddress
    transfers: {}, // ChainId, blockNumber, logIndex => data
    tokenContracts: {}, // ChainId, tokenContractAddress, tokenId => data
    tokenMetadata: {}, // ChainId, tokenContractAddress, tokenId => metadata
    ensMap: {},
    exchangeRates: {},
    forceRefresh: 0,
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
    tokenMetadata: state => state.tokenMetadata,
    ensMap: state => state.ensMap,
    exchangeRates: state => state.exchangeRates,
    forceRefresh: state => state.forceRefresh,
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
        Vue.set(state.addresses[address], 'name', newAccount.name);
      } else {
        if (type == "address") {
          Vue.set(state.addresses, address, {
            type,
            source,
            mine,
            junk: false,
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
            junk: false,
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
    setTokenMetadata(state, info) {
      logInfo("dataModule", "mutations.setTokenMetadata info: " + JSON.stringify(info, null, 2));
      if (!(info.chainId in state.tokenMetadata)) {
        Vue.set(state.tokenMetadata, info.chainId, {});
      }
      if (!(info.address in state.tokenMetadata[info.chainId])) {
        Vue.set(state.tokenMetadata[info.chainId], info.address, {});
      }
      if (!(info.tokenId in state.tokenMetadata[info.chainId][info.address])) {
        Vue.set(state.tokenMetadata[info.chainId][info.address], info.tokenId, {
          name: info.name,
          description: info.description,
          attributes: info.attributes,
          imageSource: info.imageSource,
          image: info.image,
        });
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
      console.log("forceRefresh: " + state.forceRefresh);
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
        for (let type of ['addresses', 'registry', 'transfers', 'tokenContracts', 'tokenMetadata']) {
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
    async setTokenMetadata(context, info) {
      logInfo("dataModule", "actions.addNewAddress - info: " + JSON.stringify(info, null, 2));
      context.commit('setTokenMetadata', info);
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
      if (!(coinbase in context.state.addresses)) {
        context.commit('addNewAddress', { action: "addCoinbase" });
      }

      const parameter = { chainId, coinbase, blockNumber, confirmations, cryptoCompareAPIKey, ...options };
      if (options.stealthTransfers && !options.devThing) {
        await context.dispatch('syncAnnouncements', parameter);
      }
      if (options.stealthTransfers && !options.devThing) {
        await context.dispatch('syncAnnouncementsData', parameter);
      }
      if (options.stealthTransfers && !options.devThing) {
        await context.dispatch('identifyMyStealthTransfers', parameter);
      }
      if (options.stealthTransfers && !options.devThing) {
        await context.dispatch('collateTransfers', parameter);
      }

      if (options.stealthMetaAddressRegistry && !options.devThing) {
        await context.dispatch('syncRegistrations', parameter);
      }
      if (options.stealthMetaAddressRegistry && !options.devThing) {
        await context.dispatch('syncRegistrationsData', parameter);
      }
      if (options.stealthMetaAddressRegistry && !options.devThing) {
        await context.dispatch('collateRegistrations', parameter);
      }

      if (options.tokens && !options.devThing) {
        await context.dispatch('syncTokens', parameter);
      }
      if (options.tokens && !options.devThing) {
        await context.dispatch('collateTokens', parameter);
      }
      if (options.erc721Metadata && !options.devThing) {
        await context.dispatch('syncERC721Metadata', parameter);
      }

      if (options.devThing) {
        console.log("Dev Thing");
      }

      context.dispatch('saveData', ['addresses', 'registry' /*, 'blocks', 'txs', 'ensMap'*/]);
      context.commit('setSyncSection', { section: null, total: null });
      context.commit('setSyncHalt', false);
      context.commit('forceRefresh');
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
      logInfo("dataModule", "actions.syncAnnouncementsData: " + JSON.stringify(parameter));
      const db = new Dexie(context.state.db.name);
      db.version(context.state.db.version).stores(context.state.db.schemaDefinition);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      let rows = 0;
      let done = false;
      do {
        let data = await db.announcements.offset(rows).limit(context.state.DB_PROCESSING_BATCH_SIZE).toArray();
        logInfo("dataModule", "actions.syncAnnouncementsData - data.length: " + data.length + ", first[0..9]: " + JSON.stringify(data.slice(0, 10).map(e => e.blockNumber + '.' + e.logIndex )));
        rows = parseInt(rows) + data.length;
        done = data.length < context.state.DB_PROCESSING_BATCH_SIZE;
      } while (!done);
      const total = rows;
      logInfo("dataModule", "actions.syncAnnouncementsData - total: " + total);
      // this.sync.completed = 0;
      // this.sync.total = rows;
      // this.sync.section = 'Announcements Tx Data';
      rows = 0;
      do {
        let data = await db.announcements.offset(rows).limit(context.state.DB_PROCESSING_BATCH_SIZE).toArray();
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
        done = data.length < context.state.DB_PROCESSING_BATCH_SIZE;
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
        let data = await db.announcements.offset(rows).limit(context.state.DB_PROCESSING_BATCH_SIZE).toArray();
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
                  junk: false,
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
        done = data.length < context.state.DB_PROCESSING_BATCH_SIZE;
      } while (!done);
      // rows = 0;
      // localStorage.magicalInternetMoneyAddresses = JSON.stringify(this.addresses);
      logInfo("dataModule", "actions.identifyMyStealthTransfers addresses END: " + JSON.stringify(addresses, null, 2));
      context.commit('setState', { name: 'addresses', data: addresses });
      await context.dispatch('saveData', ['addresses']);

      logInfo("dataModule", "actions.identifyMyStealthTransfers END");
    },

    async collateTransfers(context, parameter) {
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
        let data = await db.announcements.offset(rows).limit(context.state.DB_PROCESSING_BATCH_SIZE).toArray();
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
        done = data.length < context.state.DB_PROCESSING_BATCH_SIZE;
      //   done = true;
      } while (!done);
      console.log("transfers AFTER: " + JSON.stringify(transfers, null, 2));
      context.commit('setState', { name: 'transfers', data: transfers });

      // console.log("context.state.transfers: " + JSON.stringify(context.state.transfers, null, 2));
      await context.dispatch('saveData', ['transfers']);
      logInfo("dataModule", "actions.collateTransfers END");
    },

    async syncRegistrationsData(context, parameter) {
      logInfo("dataModule", "actions.syncRegistrationsData: " + JSON.stringify(parameter));
      const db = new Dexie(context.state.db.name);
      db.version(context.state.db.version).stores(context.state.db.schemaDefinition);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      let rows = 0;
      let done = false;
      do {
        let data = await db.registrations.offset(rows).limit(context.state.DB_PROCESSING_BATCH_SIZE).toArray();
        logInfo("dataModule", "actions.syncRegistrationsData - data.length: " + data.length + ", first[0..9]: " + JSON.stringify(data.slice(0, 10).map(e => e.blockNumber + '.' + e.logIndex )));
        rows = parseInt(rows) + data.length;
        done = data.length < context.state.DB_PROCESSING_BATCH_SIZE;
        // done = true;
      } while (!done);
      const total = rows;
      logInfo("dataModule", "actions.syncRegistrationsData - total: " + total);
      // this.sync.completed = 0;
      // this.sync.total = rows;
      // this.sync.section = 'Registrations Tx Data';
      rows = 0;
      do {
        let data = await db.registrations.offset(rows).limit(context.state.DB_PROCESSING_BATCH_SIZE).toArray();
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
        let data = await db.registrations.offset(rows).limit(context.state.DB_PROCESSING_BATCH_SIZE).toArray();
        logInfo("dataModule", "actions.collateRegistrations - data.length: " + data.length + ", first[0..9]: " + JSON.stringify(data.slice(0, 10).map(e => e.blockNumber + '.' + e.logIndex )));
        for (const item of data) {
          if (item.chainId == parameter.chainId && item.schemeId == 0) {
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
        let data = await db.tokenEvents.offset(rows).limit(context.state.DB_PROCESSING_BATCH_SIZE).toArray();
        logInfo("dataModule", "actions.collateTokens - data.length: " + data.length + ", first[0..9]: " + JSON.stringify(data.slice(0, 10).map(e => e.blockNumber + '.' + e.logIndex )));
        for (const item of data) {
          if (item.chainId == parameter.chainId) {
            if (!(item.contract in tokenContracts[item.chainId]) && !(item.contract in newTokenContractsMap)) {
              newTokenContractsMap[item.contract] = true;
            }
          }
        }
        rows = parseInt(rows) + data.length;
        done = data.length < context.state.DB_PROCESSING_BATCH_SIZE;
      } while (!done);
      // this.sync.completed = 0;
      const total = Object.keys(newTokenContractsMap).length;
      console.log("total: " + total);
      // this.sync.section = 'Token Contracts';
      rows = 0;
      done = false;
      do {
        let data = await db.tokenEvents.offset(rows).limit(context.state.DB_PROCESSING_BATCH_SIZE).toArray();
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
                junk: false,
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
        done = data.length < context.state.DB_PROCESSING_BATCH_SIZE;
      } while (!done);
      rows = 0;
      console.log("tokenContracts: " + JSON.stringify(tokenContracts, null, 2));
      context.commit('setState', { name: 'tokenContracts', data: tokenContracts });
      await context.dispatch('saveData', ['tokenContracts']);
      logInfo("dataModule", "actions.collateTokens END");
    },

    async syncERC721Metadata(context, parameter) {

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
            const metadata = context.state.tokenMetadata[parameter.chainId] &&
              context.state.tokenMetadata[parameter.chainId][address] &&
              context.state.tokenMetadata[parameter.chainId][address][tokenId] ||
              {};
            // console.log(address + "/" + tokenId + " => " + JSON.stringify(metadata && metadata.name || null));
            if (metadata && metadata.name) {
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
        if (data.type == "erc721" && !context.state.sync.halt /*&& ["0x8FA600364B93C53e0c71C7A33d2adE21f4351da3"].includes(address)*/) {
          // console.log(address + " => " + JSON.stringify(data, null, 2));
          for (const [tokenId, tokenData] of Object.entries(data.tokenIds)) {

            let metadata = context.state.tokenMetadata[parameter.chainId] &&
              context.state.tokenMetadata[parameter.chainId][address] &&
              context.state.tokenMetadata[parameter.chainId][address][tokenId] ||
              null;
            console.log(address + "/" + tokenId + " => " + JSON.stringify(metadata && metadata.name || null));
            // console.log(address + "/" + tokenId + " => " + JSON.stringify(metadata, null, 2));

            if (!metadata && !context.state.sync.halt) {
              console.log(address + "/" + tokenId + " => " + JSON.stringify(tokenData, null, 2));
              const contract = new ethers.Contract(address, ERC721ABI, provider);
              metadata = {
                chainId: parameter.chainId,
                address,
                tokenId,
              };
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
                  // Vue.set(context.state.tokenContracts[parameter.chainId][address].tokenIds[tokenId], 'metadata', metadata);
                  // console.log("metadata: " + JSON.stringify(metadata, null, 2));

                  context.commit('setTokenMetadata', metadata);
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
                    if (address == "0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85") {
                      if (metadataFileContent && metadataFileContent.message) {
                        console.log("EXPIRED: " + metadataFileContent.message);
                      }

                      // metadataFileContent: {
                      //   "is_normalized": true,
                      //   "name": "mrfahrenheit.eth",
                      //   "description": "mrfahrenheit.eth, an ENS name.",
                      //   "attributes": [
                      //     {
                      //       "trait_type": "Created Date",
                      //       "display_type": "date",
                      //       "value": 1606865196000
                      //     },
                      //     {
                      //       "trait_type": "Length",
                      //       "display_type": "number",
                      //       "value": 12
                      //     },
                      //     {
                      //       "trait_type": "Segment Length",
                      //       "display_type": "number",
                      //       "value": 12
                      //     },
                      //     {
                      //       "trait_type": "Character Set",
                      //       "display_type": "string",
                      //       "value": "letter"
                      //     },
                      //     {
                      //       "trait_type": "Registration Date",
                      //       "display_type": "date",
                      //       "value": 1648611636000
                      //     },
                      //     {
                      //       "trait_type": "Expiration Date",
                      //       "display_type": "date",
                      //       "value": 3226459236000
                      //     }
                      //   ],
                      //   "url": "https://app.ens.domains/name/mrfahrenheit.eth",
                      //   "last_request_date": 1707286194502,
                      //   "version": 0,
                      //   "background_image": "https://metadata.ens.domains/mainnet/avatar/mrfahrenheit.eth",
                      //   "image": "https://metadata.ens.domains/mainnet/0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85/0xcedbe7c6447c2772e90473baf9da5bdc0194bcbe6855767ea929ed7fbd14708d/image",
                      //   "image_url": "https://metadata.ens.domains/mainnet/0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85/0xcedbe7c6447c2772e90473baf9da5bdc0194bcbe6855767ea929ed7fbd14708d/image"
                      // }
                    }
                    metadata.name = metadataFileContent.name || undefined;
                    metadata.description = metadataFileContent.description || undefined;
                    metadata.attributes = metadataFileContent.attributes || [];
                    metadata.attributes.sort((a, b) => {
                      return ('' + a.trait_type).localeCompare(b.trait_type);
                    });
                    metadata.imageSource = metadataFileContent.image;
                    const imageFile = metadataFileContent.image.substring(0, 7) == "ipfs://" ? "https://ipfs.io/ipfs/" + metadataFileContent.image.substring(7) : metadataFileContent.image;
                    const base64 = await imageUrlToBase64(imageFile);
                    metadata.image = base64 || undefined;
                    // Vue.set(context.state.tokenContracts[parameter.chainId][address].tokenIds[tokenId], 'metadata', metadata);
                    // console.log("metadata: " + JSON.stringify(metadata, null, 2));
                    context.commit('setTokenMetadata', metadata);
                  } catch (e1) {
                    console.error(e1.message);
                  }
                }
              } catch (e) {
                console.error(e.message);
              }
              completed++;
              if (completed % 10 == 0) {
                // context.commit('forceRefresh');
                await context.dispatch('saveData', ['tokenContracts', 'tokenMetadata']);
              }
              context.commit('setSyncCompleted', completed);
            }
          }
        }
      }

      // console.log("tokenContracts[chainId]: " + JSON.stringify(context.state.tokenContracts[parameter.chainId], null, 2));
      await context.dispatch('saveData', ['tokenContracts', 'tokenMetadata']);
      logInfo("dataModule", "actions.syncERC721Metadata END");
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
