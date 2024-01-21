const Registry = {
  template: `
    <div class="m-0 p-0">

      <b-card no-body no-header class="border-0">


        <!-- :TOOLBAR -->
        <div class="d-flex flex-wrap m-0 p-0">
          <div class="mt-0 flex-grow-1">
          </div>

          <!-- <div v-if="sync.section == null" class="mt-0 pr-1"> -->
          <div class="mt-0 pr-1">
            <b-button size="sm" @click="syncIt({ sections: ['syncAnnouncements', 'syncRegistrations', 'syncRegistrationsData', 'collateRegistrations', 'syncTokens'], parameters: [] })" variant="link" v-b-popover.hover.top="'Sync data from the blockchain'"><b-icon-cloud-download shift-v="+1" font-scale="1.2"></b-icon-cloud-download></b-button>
          </div>
          <div class="mt-0 pr-1">
            <b-button size="sm" @click="syncIt({ sections: ['syncRegistrationsData', 'collateRegistrations'], parameters: [] })" variant="link" v-b-popover.hover.top="'Sync some'"><b-icon-cloud-download shift-v="+1" font-scale="1.2"></b-icon-cloud-download></b-button>
          </div>

          <div class="mt-0 flex-grow-1">
          </div>
          <div class="mt-0 pr-1">
            <font size="-2" v-b-popover.hover.top="'# registry entries'">{{ filteredSortedRegistryEntries.length + '/' + totalRegistryEntries }}</font>
          </div>
          <div class="mt-0 pr-1">
            <b-pagination size="sm" v-model="settings.currentPage" @input="saveSettings" :total-rows="filteredSortedRegistryEntries.length" :per-page="settings.pageSize" style="height: 0;"></b-pagination>
          </div>
          <div class="mt-0 pl-1">
            <b-form-select size="sm" v-model="settings.pageSize" @change="saveSettings" :options="pageSizes" v-b-popover.hover.top="'Page size'"></b-form-select>
          </div>
        </div>

        <b-card v-if="false" no-body class="border-0 m-0 mt-2">

          <b-card-body class="p-0">
            <b-card class="mb-2 border-0">

              <b-card-text>
                <h5>Registry</h5>

                <!-- Magical Internet Money is an implementation of <b-link href="https://eips.ethereum.org/EIPS/eip-5564" target="_blank">ERC-5564: Stealth Addresses</b-link> and <b-link href="https://eips.ethereum.org/EIPS/eip-6538" target="_blank">ERC-6538: Stealth Meta-Address Registry</b-link> (using <i>address</i> instead of <i>bytes</i>). Status: <b>WIP</b> -->

                <!-- <br />
                <br />

                Sync All: <b-button size="sm" @click="syncIt({ sections: ['syncAnnouncements', 'syncRegistrations', 'syncTokens'], parameters: [] })" variant="link" v-b-popover.hover.top="'Sync data from the blockchain'"><b-icon-cloud-download shift-v="+1" font-scale="1.2"></b-icon-cloud-download></b-button>
                Tokens: <b-button size="sm" @click="syncIt({ sections: ['syncTokens'], parameters: [] })" variant="link" v-b-popover.hover.top="'Sync data from the blockchain'"><b-icon-cloud-download shift-v="+1" font-scale="1.2"></b-icon-cloud-download></b-button> -->

              </b-card-text>

              <b-card-text v-if="false" class="mt-3 mb-2">
                <strike>
                  <h6>Usage</h6>
                  <ul>
                    <li>
                      Click <b-button size="sm" variant="link" class="m-0 p-0"><b-icon-pencil shift-v="+1" font-scale="1.0"></b-icon-pencil></b-button> in the Accounts tab to enter your account(s)
                    </li>
                    <li>
                      Click <b-button size="sm" variant="link" class="m-0 p-0"><b-icon-cloud-download shift-v="+1" font-scale="1.2"></b-icon-cloud-download></b-button> to incrementally:
                      <ul>
                        <li>
                          Retrieve all ERC-20, ERC-721 and ERC-1155 events related to your accounts via your web3 connection
                        </li>
                        <li>
                          Retrieve all transactions and internal transactions related to your accounts via the Etherscan API
                        </li>
                        <li>
                          Retrieve all transaction and transaction receipt information via your web3 connection, for the transaction hashes of the data imported above
                        </li>
                        <li>
                          Retrieve collection and token metadata via the Reservoir API, for the contracts and assets resulting from the above processing
                        </li>
                        <li>
                          Compute a simpler representation of your transactions
                        </li>
                      </ul>
                    </li>
                    <!--
                    <li>
                      View your transactions by accounts in the Account tab
                    </li>
                    -->
                    <li>
                      Click on the Generate Report icon <b-button size="sm" variant="link" class="m-0 p-0"><b-icon-newspaper shift-v="+1" font-scale="1.0"></b-icon-newspaper></b-button> in the Report tab for the results to be displayed
                    </li>
                    <li>
                      Enter your Etherscan API key in the Config tab to avoid your API data retrieval being throttled to 1 request per 6 seconds
                    </li>
                    <li>
                      <b>WIP</b> You may have to re-enter your accounts and resync as this dapp still requires some data structure changes
                    </li>
                  </ul>
                </strike>
              </b-card-text>

              <b-card-text v-if="false" class="mt-3 mb-2">
                <strike>
                  <h6>Your Data</h6>
                  <ul>
                    <li>
                      Your personal information (e.g., accounts, Etherscan API key) is stored in your web browser local storage (LocalStorage and IndexedDB)
                    </li>
                    <li>
                      Your accounts will be used when querying data via the web3 connection
                    </li>
                    <li>
                      Your Etherscan API key and your accounts will be used when querying data via the Etherscan API
                    </li>
                    <li>
                      Your collections and tokens will be used when querying data via the Reservoir API
                    </li>
                  </ul>
                </strike>
              </b-card-text>

            </b-card>
          </b-card-body>
        </b-card>
      </b-card>
    </div>
  `,
  data: function () {
    return {
      count: 0,
      reschedule: true,
      settings: {
        filter: null,
        currentPage: 1,
        pageSize: 10,
        sortOption: 'nameaddressasc',
        version: 0,
      },
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
    pageSizes() {
      return store.getters['config/pageSizes'];
    },
    registry() {
      return store.getters['data/registry'];
    },

    totalRegistryEntries() {
      return Object.keys(this.registry).length;
    },
    filteredRegistryEntries() {
      const results = [];
      // const filterLower = this.settings.filter && this.settings.filter.toLowerCase() || null;
      // for (const [account, accountData] of Object.entries(this.accounts)) {
      //   // const accountInfo = this.accountsInfo[account] || {};
      //   // const ensName = this.ensMap[account] || null;
      //   const accountName = accountData.name || null;
      //   let include = filterLower == null ||
      //     (account.toLowerCase().includes(filterLower)) ||
      //     (accountName && accountName.toLowerCase().includes(filterLower)); // ||
      //     // (accountInfo.group && accountInfo.group.toLowerCase().includes(filterLower)) ||
      //     // (accountInfo.notes && accountInfo.notes.toLowerCase().includes(filterLower)) ||
      //     // (ensName != null && ensName.toLowerCase().includes(filterLower));
      //   if (include && this.settings.myAccountsFilter != null) {
      //     if (this.settings.myAccountsFilter == 'mine' && accountData.mine) {
      //     } else if (this.settings.myAccountsFilter == 'notmine' && !accountData.mine) {
      //     } else {
      //       include = false;
      //     }
      //   }
      //   // if (include && this.settings.accountTypeFilter != null) {
      //   //   const accountType = accountInfo.type || accountData.type || null;
      //   //   if (this.settings.accountTypeFilter == 'unknown' && accountInfo.type == null) {
      //   //   } else if (this.settings.accountTypeFilter == accountType) {
      //   //   } else {
      //   //     include = false;
      //   //   }
      //   // }
      //   // if (include && this.settings.junkFilter) {
      //   //   if (this.settings.junkFilter == 'junk' && !accountInfo.junk) {
      //   //     include = false;
      //   //   } else if (this.settings.junkFilter == 'excludejunk' && accountInfo.junk) {
      //   //     include = false;
      //   //   }
      //   // }
      //   if (include) {
      //     results.push({
      //       account,
      //       ...accountData,
      //       // // group: accountInfo.group,
      //       // name: accountName,
      //       // type: accountData.type,
      //       // // slug: accountInfo.slug || accountData.slug,
      //       // // image: accountInfo.image || accountData.image,
      //       // mine: accountData.mine,
      //       // // sync: accountInfo.sync,
      //       // // report: accountInfo.report,
      //       // // junk: accountInfo.junk,
      //       // // tags: accountInfo.tags,
      //       // notes: accountData.notes,
      //       // // created: accountData.created,
      //       // // updated: accountData.updated,
      //     });
      //   }
      // }
      return results;
    },
    filteredSortedRegistryEntries() {
      const results = this.filteredRegistryEntries;

      // sortOptions: [
      //   { value: 'typenameasc', text: '▲ Type, ▲ Name' },
      //   { value: 'typenamedsc', text: '▼ Type, ▲ Name' },
      //   { value: 'nameasc', text: '▲ Name, ▲ Address' },
      //   { value: 'namedsc', text: '▼ Name, ▲ Address' },
      //   { value: 'addressasc', text: '▲ Address' },
      //   { value: 'addressdsc', text: '▼ Address' },
      // ],

      if (this.settings.sortOption == 'typenameasc') {
        results.sort((a, b) => {
          if (('' + a.type).localeCompare(b.type) == 0) {
            if (('' + a.name).localeCompare(b.name) == 0) {
              return ('' + a.account).localeCompare(b.account);
            } else {
              return ('' + a.name).localeCompare(b.name);
            }
          } else {
            return ('' + b.type).localeCompare(a.type);
          }
        });
      } else if (this.settings.sortOption == 'typenamedsc') {
        results.sort((a, b) => {
          if (('' + a.type).localeCompare(b.type) == 0) {
            if (('' + a.name).localeCompare(b.name) == 0) {
              return ('' + a.account).localeCompare(b.account);
            } else {
              return ('' + a.name).localeCompare(b.name);
            }
          } else {
            return ('' + a.type).localeCompare(b.type);
          }
        });
      } else if (this.settings.sortOption == 'nameaddressasc') {
        results.sort((a, b) => {
          if (('' + a.name).localeCompare(b.name) == 0) {
            return ('' + a.account).localeCompare(b.account);
          } else {
            return ('' + a.name).localeCompare(b.name);
          }
        });
      } else if (this.settings.sortOption == 'nameaddressdsc') {
        results.sort((a, b) => {
          if (('' + a.name).localeCompare(b.name) == 0) {
            return ('' + b.account).localeCompare(a.account);
          } else {
            return ('' + b.name).localeCompare(a.name);
          }
        });
      } else if (this.settings.sortOption == 'addressasc') {
        results.sort((a, b) => {
          return ('' + a.account).localeCompare(b.account);
        });
      } else if (this.settings.sortOption == 'addressdsc') {
        results.sort((a, b) => {
          return ('' + b.account).localeCompare(a.account);
        });
      }
      return results;
    },
    pagedFilteredSortedRegistryEntries() {
      console.log(JSON.stringify(this.filteredSortedRegistryEntries, null, 2));
      return this.filteredSortedRegistryEntries.slice((this.settings.currentPage - 1) * this.settings.pageSize, this.settings.currentPage * this.settings.pageSize);
    },

  },
  methods: {
    saveSettings() {
      logInfo("Registry", "methods.saveSettings - registrySettings: " + JSON.stringify(this.settings, null, 2));
      localStorage.registrySettings = JSON.stringify(this.settings);
    },
    async syncIt(info) {
      store.dispatch('data/syncIt', info);
    },
    async timeoutCallback() {
      logDebug("Registry", "timeoutCallback() count: " + this.count);

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
    logDebug("Registry", "beforeDestroy()");
  },
  mounted() {
    logDebug("Registry", "mounted() $route: " + JSON.stringify(this.$route.params));
    store.dispatch('data/restoreState');
    if ('registrySettings' in localStorage) {
      const tempSettings = JSON.parse(localStorage.registrySettings);
      if ('version' in tempSettings && tempSettings.version == 0) {
        this.settings = tempSettings;
        this.settings.currentPage = 1;
      }
    }
    this.reschedule = true;
    logDebug("Registry", "Calling timeoutCallback()");
    this.timeoutCallback();
  },
  destroyed() {
    this.reschedule = false;
  },
};

const registryModule = {
  namespaced: true,
  state: {
    params: null,
    executing: false,
    executionQueue: [],
  },
  getters: {
    params: state => state.params,
    executionQueue: state => state.executionQueue,
  },
  mutations: {
    deQueue(state) {
      logDebug("registryModule", "deQueue(" + JSON.stringify(state.executionQueue) + ")");
      state.executionQueue.shift();
    },
    updateParams(state, params) {
      state.params = params;
      logDebug("registryModule", "updateParams('" + params + "')")
    },
    updateExecuting(state, executing) {
      state.executing = executing;
      logDebug("registryModule", "updateExecuting(" + executing + ")")
    },
  },
  actions: {
  },
};
