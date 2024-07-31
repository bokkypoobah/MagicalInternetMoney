const Approvals = {
  template: `
    <div class="m-0 p-0">
      <b-card no-body no-header class="border-0">

        <div class="d-flex flex-wrap m-0 p-0">
          <div v-if="false" class="mt-0 pr-1" style="width: 200px;">
            <b-form-input type="text" size="sm" v-model.trim="settings.filter" @change="saveSettings" debounce="600" v-b-popover.hover.ds500="'Regex filter by address, symbol or name'" placeholder="🔍 addr/symb/name regex"></b-form-input>
          </div>
          <div v-if="false" class="mt-0 pr-1">
            <b-dropdown size="sm" variant="link" v-b-popover.hover.ds500="'Junk filter'">
              <template #button-content>
                <span v-if="settings.junkFilter == 'excludejunk'">
                  <b-iconstack font-scale="1">
                    <b-icon stacked icon="trash" variant="info" scale="0.75"></b-icon>
                    <b-icon stacked icon="slash-circle" variant="danger"></b-icon>
                  </b-iconstack>
                </span>
                <span v-else-if="settings.junkFilter == null">
                  <b-iconstack font-scale="1">
                    <b-icon stacked icon="circle-fill" variant="warning"></b-icon>
                    <b-icon stacked icon="trash" variant="info" scale="0.75"></b-icon>
                  </b-iconstack>
                </span>
                <span v-else>
                  <b-iconstack font-scale="1">
                    <b-icon stacked icon="trash" variant="info" scale="0.75"></b-icon>
                  </b-iconstack>
                </span>
              </template>
              <b-dropdown-item href="#" @click="settings.junkFilter = 'excludejunk'; saveSettings()">
                <b-iconstack font-scale="1">
                  <b-icon stacked icon="trash" variant="info" scale="0.75"></b-icon>
                  <b-icon stacked icon="slash-circle" variant="danger"></b-icon>
                </b-iconstack>
                Exclude Junk
              </b-dropdown-item>
              <b-dropdown-item href="#" @click="settings.junkFilter = null; saveSettings()">
                <b-iconstack font-scale="1">
                  <b-icon stacked icon="circle-fill" variant="warning"></b-icon>
                  <b-icon stacked icon="trash" variant="info" scale="0.75"></b-icon>
                </b-iconstack>
                Include Junk
              </b-dropdown-item>
              <b-dropdown-item href="#" @click="settings.junkFilter = 'junk'; saveSettings()">
                <b-iconstack font-scale="1">
                  <b-icon stacked icon="trash" variant="info" scale="0.75"></b-icon>
                </b-iconstack>
                Junk
              </b-dropdown-item>
            </b-dropdown>
          </div>
          <div v-if="false" class="mt-0 pr-1">
            <b-button size="sm" :pressed.sync="settings.activeOnly" @click="saveSettings" variant="transparent" v-b-popover.hover.ds500="'Show active only'"><b-icon :icon="settings.activeOnly ? 'check-circle-fill' : 'check-circle'" font-scale="1.1" variant="primary"></b-icon></b-button>
          </div>
          <div class="mt-0 flex-grow-1">
          </div>
          <div class="mt-0 flex-grow-1">
          </div>
          <div v-if="sync.section == null" class="mt-0 pr-1">
            <b-button size="sm" :disabled="!networkSupported" @click="viewSyncOptions" variant="link" v-b-popover.hover.ds500="'Sync data from the blockchain'"><b-icon-arrow-repeat shift-v="+1" font-scale="1.2"></b-icon-arrow-repeat></b-button>
          </div>
          <div v-if="sync.section != null" class="mt-1" style="width: 300px;">
            <b-progress height="1.5rem" :max="sync.total" show-progress :animated="sync.section != null" :variant="sync.section != null ? 'success' : 'secondary'" v-b-popover.hover.ds500="'Click the button on the right to stop. This process can be continued later'">
              <b-progress-bar :value="sync.completed">
                {{ sync.total == null ? (sync.completed + ' ' + sync.section) : (sync.completed + '/' + sync.total + ' ' + ((sync.completed / sync.total) * 100).toFixed(0) + '% ' + sync.section) }}
              </b-progress-bar>
            </b-progress>
          </div>
          <div class="ml-0 mt-1">
            <b-button v-if="sync.section != null" size="sm" @click="halt" variant="link" v-b-popover.hover.ds500="'Click to stop. This process can be continued later'"><b-icon-stop-fill shift-v="+1" font-scale="1.0"></b-icon-stop-fill></b-button>
          </div>
          <div class="mt-0 flex-grow-1">
          </div>
          <div class="mt-0 pr-1">
            <b-button size="sm" :disabled="!transferHelper" @click="newTransfer(null); " variant="link" v-b-popover.hover.ds500="'New Stealth Transfer'"><b-icon-caret-right shift-v="+1" font-scale="1.1"></b-icon-caret-right></b-button>
          </div>
          <div class="mt-0 flex-grow-1">
          </div>
          <div class="mt-0 pr-1">
            <b-form-select size="sm" v-model="settings.sortOption" @change="saveSettings" :options="sortOptions" v-b-popover.hover.ds500="'Yeah. Sort'"></b-form-select>
          </div>
          <div class="mt-0 pr-1">
            <font size="-2" v-b-popover.hover.ds500="'# token contracts'">{{ filteredSortedItems.length + '/' + totalApprovals }}</font>
          </div>
          <div class="mt-0 pr-1">
            <b-pagination size="sm" v-model="settings.currentPage" @input="saveSettings" :total-rows="filteredSortedItems.length" :per-page="settings.pageSize" style="height: 0;"></b-pagination>
          </div>
          <div class="mt-0 pl-1">
            <b-form-select size="sm" v-model="settings.pageSize" @change="saveSettings" :options="pageSizes" v-b-popover.hover.ds500="'Page size'"></b-form-select>
          </div>
        </div>

        <b-table ref="tokenContractsTable" small fixed striped responsive hover selectable select-mode="single" @row-selected='rowSelected' :fields="fields" :items="pagedFilteredSortedItems" show-empty head-variant="light" class="m-0 mt-1">
          <template #empty="scope">
            <h6>{{ scope.emptyText }}</h6>
            <div>
              <ul>
                <li>
                  Check you are connected to one of the <b-link href="https://stealthaddress.dev/contracts/deployments" target="_blank">supported networks</b-link> (TODO: Only Sepolia currently)
                </li>
                <li>
                  Click <b-button size="sm" variant="link" class="m-0 p-0"><b-icon-arrow-repeat shift-v="+1" font-scale="1.2"></b-icon-arrow-repeat></b-button> above to sync this app to the blockchain
                </li>
              </ul>
            </div>
          </template>
          <template #cell(number)="data">
            {{ parseInt(data.index) + ((settings.currentPage - 1) * settings.pageSize) + 1 }}
          </template>
          <template #cell(contract)="data">
            <b-link :href="explorer + 'address/' + data.item.contract + '#code'" v-b-popover.hover.ds500="data.item.contract" target="_blank">
              <font size="-1">{{ data.item.contract.substring(0, 10) + '...' + data.item.contract.slice(-8) }}</font>
            </b-link>
            <div v-if="data.item.unsupported">
              <font size="-1">
                <b-badge variant="warning" v-b-popover.hover.ds500="'Unsupported Non-Standard ERC-20'">
                  Unsupported
                </b-badge>
              </font>
            </div>
          </template>
          <template #cell(type)="data">
            <font size="-1">{{ data.item.type.replace(/erc/, 'ERC-') }}</font>
          </template>
          <template #cell(symbol)="data">
            <font size="-1">{{ data.item.symbol }}</font>
          </template>
          <template #cell(name)="data">
            <font size="-1">{{ data.item.name }}</font>
          </template>
          <template #cell(eventType)="data">
            <font size="-1">{{ data.item.eventType }}</font>
          </template>
          <template #cell(owner)="data">
            <font size="-1">
              <b-link :href="explorer + 'address/' + data.item.owner" v-b-popover.hover.ds500="data.item.owner" target="_blank">
                {{ names[data.item.owner] || (data.item.owner.substring(0, 8) + '...' + data.item.owner.slice(-6)) }}
              </b-link>
            </font>
          </template>
          <template #cell(spender)="data">
            <font size="-1">
              <b-link :href="explorer + 'address/' + data.item.spender + '#code'" v-b-popover.hover.ds500="data.item.spender" target="_blank">
                {{ names[data.item.spender] || (data.item.spender.substring(0, 8) + '...' + data.item.spender.slice(-6)) }}
              </b-link>
            </font>
          </template>
          <template #cell(value)="data">
            <font size="-1">
              <div v-if="data.item.type == 'erc20'">
                <span v-if="data.item.value.toString().length > 30">
                  <b-badge pill variant="transparent" v-b-popover.hover.ds500="formatDecimals(data.item.value, data.item.decimals)" class="px-0">&infin;</b-badge>
                </span>
                <span v-else>
                  {{ formatDecimals(data.item.value, data.item.decimals || 0) }}
                </span>
              </div>
              <div v-else>
                {{ data.item.value }}
              </div>
            </font>
          </template>
        </b-table>
      </b-card>
    </div>
  `,
  data: function () {
    return {
      count: 0,
      reschedule: true,
      settings: {
        filter: null,
        junkFilter: null,
        activeOnly: false,
        currentPage: 1,
        pageSize: 10,
        sortOption: 'symbolasc',
        version: 1,
      },
      transfer: {
        item: null,
        stealthPrivateKey: null,
      },
      modalFaucet: {
        selectedFaucet: null,
      },
      sortOptions: [
        { value: 'contractasc', text: '▲ Contract' },
        { value: 'contractdsc', text: '▼ Contract' },
        { value: 'symbolasc', text: '▲ Symbol, ▲ Contract' },
        { value: 'symboldsc', text: '▼ Symbol, ▲ Contract' },
        { value: 'nameasc', text: '▲ Name, ▲ Contract' },
        { value: 'namedsc', text: '▼ Name, ▲ Contract' },
      ],
      fields: [
        { key: 'number', label: '#', sortable: false, thStyle: 'width: 5%;', tdClass: 'text-truncate' },
        { key: 'contract', label: 'Contract', sortable: false, thStyle: 'width: 13%;', thClass: 'text-left', tdClass: 'text-truncate' },
        { key: 'type', label: 'Type', sortable: false, thStyle: 'width: 7%;', thClass: 'text-left', tdClass: 'text-truncate' },
        { key: 'symbol', label: 'Symbol', sortable: false, thStyle: 'width: 10%;', thClass: 'text-left', tdClass: 'text-truncate' },
        { key: 'name', label: 'Name', sortable: false, thStyle: 'width: 15%;', thClass: 'text-left', tdClass: 'text-truncate' },
        { key: 'eventType', label: 'Event Type', sortable: false, thStyle: 'width: 10%;', thClass: 'text-left', tdClass: 'text-left' },
        { key: 'owner', label: 'Owner', sortable: false, thStyle: 'width: 15%;', thClass: 'text-left', tdClass: 'text-left' },
        { key: 'spender', label: 'Spender', sortable: false, thStyle: 'width: 15%;', thClass: 'text-left', tdClass: 'text-left' },
        { key: 'value', label: 'Value', sortable: false, thStyle: 'width: 15%;', thClass: 'text-right', tdClass: 'text-right' },
      ],
    }
  },
  computed: {
    chainId() {
      return store.getters['connection/chainId'];
    },
    networkSupported() {
      return store.getters['connection/networkSupported'];
    },
    transferHelper() {
      return store.getters['connection/transferHelper'];
    },
    explorer() {
      return store.getters['connection/explorer'];
    },
    addresses() {
      return store.getters['data/addresses'];
    },
    balances() {
      return store.getters['data/balances'];
    },
    approvals() {
      return store.getters['data/approvals'];
    },
    tokens() {
      return store.getters['data/tokens'];
    },
    names() {
      return store.getters['data/names'];
    },
    sync() {
      return store.getters['data/sync'];
    },
    pageSizes() {
      return store.getters['config/pageSizes'];
    },

    totalApprovals() {
      let result = (store.getters['data/forceRefresh'] % 2) == 0 ? 0 : 0;
      for (const [owner, ownerData] of Object.entries(this.approvals[this.chainId] || {})) {
        for (const [contract, contractData] of Object.entries(ownerData)) {
          const type = this.tokens[this.chainId] && this.tokens[this.chainId][contract] && this.tokens[this.chainId][contract].type || null;
          if (type == "erc20") {
            for (const [spender, value] of Object.entries(contractData)) {
              result++
            }
          } else if (type == "erc721" || type == "erc1155") {
            for (const [tokenId, spender] of Object.entries(contractData.tokens)) {
              result++
            }
            for (const [spender, approved] of Object.entries(contractData.approvalForAll)) {
              result++
            }
          }
        }
      }
      return result;
    },
    filteredItems() {
      const results = (store.getters['data/forceRefresh'] % 2) == 0 ? [] : [];
      let regex = null;
      if (this.settings.filter != null && this.settings.filter.length > 0) {
        try {
          regex = new RegExp(this.settings.filter, 'i');
        } catch (e) {
          console.log("filteredItems - regex error: " + e.message);
          regex = new RegExp(/thequickbrowndogjumpsoverthelazyfox/, 'i');
        }
      }
      for (const [owner, ownerData] of Object.entries(this.approvals[this.chainId] || {})) {
        for (const [contract, contractData] of Object.entries(ownerData)) {
          const token = this.tokens[this.chainId] && this.tokens[this.chainId][contract] || null;
          const type = token && token.type || null;
          const symbol = token && token.symbol || null;
          const name = token && token.name || null;
          if (type == "erc20") {
            const decimals = token && token.decimals || null;
            for (const [spender, value] of Object.entries(contractData)) {
              results.push({ chainId: this.chainId, contract, type, symbol, name, decimals, eventType: "Approval", owner, spender, value });
            }
          } else if (type == "erc721" || type == "erc1155") {
            for (const [tokenId, spender] of Object.entries(contractData.tokens || {})) {
              results.push({ chainId: this.chainId, contract, type, symbol, name, eventType: "Approval", owner, spender, value: tokenId });
            }
            for (const [spender, approved] of Object.entries(contractData.approvalForAll || {})) {
              results.push({ chainId: this.chainId, contract, type, symbol, name, eventType: "SetApprovalForAll", owner, spender, value: approved });
            }
          }
        }
      }
      // for (const [contract, contractData] of Object.entries(this.balances[this.chainId] || {})) {
      //   if (contractData.type == "erc20") {
      //     const metadata = this.tokens[this.chainId] && this.tokens[this.chainId][contract] || {};
      //     let include = true;
      //     if (this.settings.junkFilter) {
      //       if (this.settings.junkFilter == 'junk' && !metadata.junk) {
      //         include = false;
      //       } else if (this.settings.junkFilter == 'excludejunk' && metadata.junk) {
      //         include = false;
      //       }
      //     }
      //     if (include && this.settings.activeOnly && (!metadata.active || metadata.junk)) {
      //       include = false;
      //     }
      //     if (include && regex) {
      //       if (!(regex.test(metadata.symbol) || regex.test(metadata.name) || regex.test(contract))) {
      //         include = false;
      //       }
      //     }
      //     const unsupported = contract in UNSUPPORTED_FUNGIBLES;
      //     const balances = [];
      //     for (const [address, balance] of Object.entries(contractData.balances)) {
      //       balances.push({ address, balance });
      //     }
      //     if (include) {
      //       // results.push({ chainId: this.chainId, contract, ...contractData, ...metadata, balances, unsupported });
      //     }
      //   }
      // }
      return results;
    },
    filteredSortedItems() {
      const results = this.filteredItems;
      // if (this.settings.sortOption == 'contractasc') {
      //   results.sort((a, b) => {
      //     return ('' + a.contract).localeCompare(b.contract);
      //   });
      // } else if (this.settings.sortOption == 'contractdsc') {
      //   results.sort((a, b) => {
      //     return ('' + b.contract).localeCompare(a.contract);
      //   });
      // } else if (this.settings.sortOption == 'symbolasc') {
      //   results.sort((a, b) => {
      //     if (('' + a.symbol).localeCompare(b.symbol) == 0) {
      //       return ('' + a.contract).localeCompare(b.contract);
      //     } else {
      //       return ('' + a.symbol).localeCompare(b.symbol);
      //     }
      //   });
      // } else if (this.settings.sortOption == 'symboldsc') {
      //   results.sort((a, b) => {
      //     if (('' + a.symbol).localeCompare(b.symbol) == 0) {
      //       return ('' + a.contract).localeCompare(b.contract);
      //     } else {
      //       return ('' + b.symbol).localeCompare(a.symbol);
      //     }
      //   });
      // } else if (this.settings.sortOption == 'nameasc') {
      //   results.sort((a, b) => {
      //     if (('' + a.name).localeCompare(b.name) == 0) {
      //       return ('' + a.contract).localeCompare(b.contract);
      //     } else {
      //       return ('' + a.name).localeCompare(b.name);
      //     }
      //   });
      // } else if (this.settings.sortOption == 'namedsc') {
      //   results.sort((a, b) => {
      //     if (('' + a.name).localeCompare(b.name) == 0) {
      //       return ('' + a.contract).localeCompare(b.contract);
      //     } else {
      //       return ('' + b.name).localeCompare(a.name);
      //     }
      //   });
      // }
      return results;
    },
    pagedFilteredSortedItems() {
      // console.log(now() + " INFO Approvals:computed.pagedFilteredSortedItems - results[0..9]: " + JSON.stringify(this.filteredSortedItems.slice(0, 10), null, 2));
      return this.filteredSortedItems.slice((this.settings.currentPage - 1) * this.settings.pageSize, this.settings.currentPage * this.settings.pageSize);
    },

  },
  methods: {
    toggleFungibleJunk(item) {
      console.log(now() + " INFO Approvals:methods.toggleFungibleJunk - item: " + JSON.stringify(item));
      store.dispatch('data/toggleFungibleJunk', item);
    },
    toggleFungibleActive(item) {
      console.log(now() + " INFO Approvals:methods.toggleFungibleActive - item: " + JSON.stringify(item));
      store.dispatch('data/toggleFungibleActive', item);
    },
    copyToClipboard(str) {
      navigator.clipboard.writeText(str);
    },
    formatETH(e, precision = 0) {
      try {
        if (precision == 0) {
          return e ? ethers.utils.formatEther(e).replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",") : null;
        } else {
          return e ? parseFloat(parseFloat(ethers.utils.formatEther(e)).toFixed(precision)) : null;
        }
      } catch (err) {
      }
      return e.toFixed(precision);
    },
    formatDecimals(e, decimals = 18) {
      return e ? ethers.utils.formatUnits(e, decimals).replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",") : null;
    },
    saveSettings() {
      console.log(now() + " INFO Approvals:methods.saveSettings - approvalsSettings: " + JSON.stringify(this.settings, null, 2));
      localStorage.approvalsSettings = JSON.stringify(this.settings);
    },
    async viewSyncOptions() {
      store.dispatch('syncOptions/viewSyncOptions');
    },
    async halt() {
      store.dispatch('data/setSyncHalt', true);
    },
    newTransfer(stealthMetaAddress = null) {
      store.dispatch('newTransfer/newTransfer', stealthMetaAddress);
    },
    getTokenType(address) {
      if (address == ADDRESS_ETHEREUMS) {
        return "eth";
      } else {
        // TODO: ERC-20 & ERC-721
        return address.substring(0, 10) + '...' + address.slice(-8);
      }
    },
    formatERC20(e, decimals = 18) {
      try {
        return e ? ethers.utils.formatUnits(e, decimals).replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",") : null;
      } catch (err) {
      }
      return e.toString();
    },
    formatTimestamp(ts) {
      if (ts != null) {
        if (ts > 1000000000000n) {
          ts = ts / 1000;
        }
        if (store.getters['config/settings'].reportingDateTime) {
          return moment.unix(ts).utc().format("YYYY-MM-DD HH:mm:ss");
        } else {
          return moment.unix(ts).format("YYYY-MM-DD HH:mm:ss");
        }
      }
      return null;
    },
    commify0(n) {
      if (n != null) {
        return Number(n).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
      }
      return null;
    },
    rowSelected(item) {
      console.log(now() + " INFO Approvals:methods.rowSelected BEGIN: " + JSON.stringify(item, null, 2));
      if (item && item.length > 0) {
        store.dispatch('viewTokenContract/viewTokenContract', { contract: item[0].contract });
        store.dispatch('data/updateFungibleTotalSupply', { chainId: this.chainId, contract: item[0].contract });
        this.$refs.tokenContractsTable.clearSelected();
      }
    },

    async timeoutCallback() {
      // console.log(now() + " DEBUG Approvals:methods.timeoutCallback - count: " + this.count);
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
    // console.log(now() + " DEBUG Approvals:beforeDestroy");
  },
  mounted() {
    // console.log(now() + " DEBUG Approvals:mounted - $route: " + JSON.stringify(this.$route.params));
    store.dispatch('data/restoreState');
    if ('approvalsSettings' in localStorage) {
      const tempSettings = JSON.parse(localStorage.approvalsSettings);
      if ('version' in tempSettings && tempSettings.version == this.settings.version) {
        this.settings = tempSettings;
        this.settings.currentPage = 1;
      }
    }
    this.reschedule = true;
    // console.log(now() + " DEBUG Approvals:mounted - calling timeoutCallback()");
    this.timeoutCallback();
  },
  destroyed() {
    this.reschedule = false;
  },
};

const approvalsModule = {
  namespaced: true,
  state: {
  },
  getters: {
  },
  mutations: {
  },
  actions: {
  },
};
