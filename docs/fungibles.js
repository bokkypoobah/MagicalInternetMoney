const Fungibles = {
  template: `
    <div class="m-0 p-0">
      <b-card no-body no-header class="border-0">

        <!-- :MODALFAUCETS -->
        <b-modal ref="modalfaucet" id="modal-faucets" hide-footer body-bg-variant="light" size="md">
          <template #modal-title>ERC-20 Faucets</template>
          <b-form-select size="sm" v-model="modalFaucet.selectedFaucet" :options="faucetsOptions" v-b-popover.hover="'Select faucet'"></b-form-select>
          <b-button size="sm" block :disabled="!modalFaucet.selectedFaucet" @click="drip()" variant="warning" class="mt-2">Drip {{ modalFaucet.selectedFaucet && faucets.filter(e => e.address == modalFaucet.selectedFaucet)[0] ? (faucets.filter(e => e.address == modalFaucet.selectedFaucet)[0].drip + ' Tokens') : '' }}</b-button>
        </b-modal>

        <div class="d-flex flex-wrap m-0 p-0">
          <div class="mt-0 pr-1" style="width: 200px;">
            <b-form-input type="text" size="sm" v-model.trim="settings.filter" @change="saveSettings" debounce="600" v-b-popover.hover="'Regex filter by address, symbol or name'" placeholder="🔍 addr/symb/name regex"></b-form-input>
          </div>
          <div class="mt-0 pr-1">
            <b-dropdown size="sm" variant="link" v-b-popover.hover="'Junk filter'">
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
          <div class="mt-0 pr-1">
            <b-button size="sm" :pressed.sync="settings.activeOnly" @click="saveSettings" variant="transparent" v-b-popover.hover="'Show active only'"><b-icon :icon="settings.activeOnly ? 'check-circle-fill' : 'check-circle'" font-scale="1.1" variant="primary"></b-icon></b-button>
          </div>
          <div class="mt-0 flex-grow-1">
          </div>
          <div class="mt-0 pr-1">
            <b-button size="sm" @click="viewFaucets" variant="link" v-b-popover.hover="'Drip tokens from ERC-20 and ERC-721 faucets'"><b-icon-plus shift-v="+1" font-scale="1.0"></b-icon-plus></b-button>
          </div>
          <div class="mt-0 flex-grow-1">
          </div>
          <div v-if="sync.section == null" class="mt-0 pr-1">
            <b-button size="sm" :disabled="!networkSupported" @click="viewSyncOptions" variant="link" v-b-popover.hover="'Sync data from the blockchain'"><b-icon-arrow-repeat shift-v="+1" font-scale="1.2"></b-icon-arrow-repeat></b-button>
          </div>
          <div v-if="sync.section != null" class="mt-1" style="width: 300px;">
            <b-progress height="1.5rem" :max="sync.total" show-progress :animated="sync.section != null" :variant="sync.section != null ? 'success' : 'secondary'" v-b-popover.hover="'Click the button on the right to stop. This process can be continued later'">
              <b-progress-bar :value="sync.completed">
                {{ sync.total == null ? (sync.completed + ' ' + sync.section) : (sync.completed + '/' + sync.total + ' ' + ((sync.completed / sync.total) * 100).toFixed(0) + '% ' + sync.section) }}
              </b-progress-bar>
            </b-progress>
          </div>
          <div class="ml-0 mt-1">
            <b-button v-if="sync.section != null" size="sm" @click="halt" variant="link" v-b-popover.hover="'Click to stop. This process can be continued later'"><b-icon-stop-fill shift-v="+1" font-scale="1.0"></b-icon-stop-fill></b-button>
          </div>
          <div class="mt-0 flex-grow-1">
          </div>
          <div class="mt-0 pr-1">
            <b-button size="sm" :disabled="!transferHelper" @click="newTransfer(null); " variant="link" v-b-popover.hover="'New Stealth Transfer'"><b-icon-caret-right shift-v="+1" font-scale="1.1"></b-icon-caret-right></b-button>
          </div>
          <div class="mt-0 flex-grow-1">
          </div>
          <div class="mt-0 pr-1">
            <b-form-select size="sm" v-model="settings.sortOption" @change="saveSettings" :options="sortOptions" v-b-popover.hover="'Yeah. Sort'"></b-form-select>
          </div>
          <div class="mt-0 pr-1">
            <font size="-2" v-b-popover.hover="'# token contracts'">{{ filteredSortedItems.length + '/' + totalERC20Contracts }}</font>
          </div>
          <div class="mt-0 pr-1">
            <b-pagination size="sm" v-model="settings.currentPage" @input="saveSettings" :total-rows="filteredSortedItems.length" :per-page="settings.pageSize" style="height: 0;"></b-pagination>
          </div>
          <div class="mt-0 pl-1">
            <b-form-select size="sm" v-model="settings.pageSize" @change="saveSettings" :options="pageSizes" v-b-popover.hover="'Page size'"></b-form-select>
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
          <template #cell(active)="data">
            <b-button size="sm" @click="toggleFungibleJunk(data.item);" variant="transparent" v-b-popover.hover="data.item.junk ? 'Junk' : 'Not junk'" class="m-0 ml-1 p-0">
              <b-icon :icon="data.item.junk ? 'trash-fill' : 'trash'" font-scale="1.2" :variant="data.item.junk ? 'primary' : 'secondary'">
              </b-icon>
            </b-button>
            <b-button size="sm" :disabled="data.item.junk || data.item.decimals === null || data.item.unsupported" @click="toggleFungibleActive(data.item);" variant="transparent" v-b-popover.hover="data.item.active ? 'Active' : 'Inactive'" class="m-0 ml-1 p-0">
              <b-icon :icon="(data.item.active & !data.item.junk) ? 'check-circle-fill' : 'check-circle'" font-scale="1.2" :variant="(data.item.junk || !data.item.active) ? 'secondary' : 'primary'">
              </b-icon>
            </b-button>
          </template>
          <template #cell(logo)="data">
            <b-img v-if="data.item.image" button rounded width="75px;" :src="data.item.image" />
          </template>
          <template #cell(contract)="data">
            <b-link :href="explorer + 'address/' + data.item.contract + '#code'" target="_blank">
              <font size="-1">{{ data.item.contract.substring(0, 10) + '...' + data.item.contract.slice(-8) }}</font>
            </b-link>
            <div v-if="data.item.unsupported">
              <font size="-1">
                <b-badge variant="warning" v-b-popover.hover="'Unsupported Non-Standard ERC-20'">
                  Unsupported
                </b-badge>
              </font>
            </div>
          </template>
          <template #cell(type)="data">
            <font size="-1">{{ data.item.type == "erc20" ? "ERC-20" : "ERC-721" }}</font>
          </template>
          <template #cell(symbolname)="data">
            <font size="-1">{{ data.item.symbol }}</font>
            <br />
            <font size="-1">{{ data.item.name }}</font>
          </template>
          <template #cell(decimals)="data">
            <div v-if="data.item.decimals !== null">
              <font size="-1">{{ data.item.decimals || '0' }}</font>
            </div>
            <div v-else>
              <font size="-1">
                <b-badge variant="warning" v-b-popover.hover="'Please set decimals as the fungible contract has not provided this information'">
                  To Configure
                </b-badge>
              </font>
            </div>
          </template>
          <template #head(balances)="data">
            <b-row class="m-0 p-0">
              <b-col cols="5" class="m-0 px-2">
                Address
              </b-col>
              <b-col cols="7" class="m-0 px-2 text-right">
                Balance
              </b-col>
            </b-row>
          </template>
          <template #cell(balances)="data">
            <font size="-1">
              <b-row v-for="(b, i) in data.item.balances" v-bind:key="i" class="m-0 p-0">
                <b-col cols="5" class="m-0 px-1">
                  <b-link :href="explorer + 'address/' + b.address" v-b-popover.hover="'View ' + b.address + ' in the explorer'" target="_blank">
                    {{ addresses[b.address] && addresses[b.address].name || ens[b.address] || (b.address.substring(0, 8) + '...' + b.address.slice(-6)) }}
                  </b-link>
                </b-col>
                <b-col cols="7" class="m-0 px-1 text-right">
                  <b-link :href="explorer + 'token/' + data.item.contract + '?a=' + b.address" target="_blank">
                    {{ formatERC20(b.balance, data.item.decimals) }}
                  </b-link>
                </b-col>
              </b-row>
            </font>
          </template>
          <template #cell(totalSupply)="data">
            <font size="-1">{{ data.item.type == "erc20" ? formatDecimals(data.item.totalSupply, data.item.decimals || 0) : data.item.totalSupply }}</font>
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
        { key: 'number', label: '#', sortable: false, thStyle: 'width: 4%;', tdClass: 'text-truncate' },
        { key: 'active', label: '', sortable: false, thStyle: 'width: 4%;', thClass: 'text-right', tdClass: 'text-right' },
        { key: 'contract', label: 'Contract', sortable: false, thStyle: 'width: 10%;', thClass: 'text-left', tdClass: 'text-truncate' },
        { key: 'logo', label: 'Logo', sortable: false, thStyle: 'width: 5%;', thClass: 'text-left', tdClass: 'text-truncate' },
        { key: 'symbolname', label: 'Symbol / Name', sortable: false, thStyle: 'width: 13%;', thClass: 'text-left', tdClass: 'text-truncate' },
        { key: 'decimals', label: 'Decimals', sortable: false, thStyle: 'width: 10%;', thClass: 'text-right', tdClass: 'text-right' },
        { key: 'balances', label: 'Balances', sortable: false, thStyle: 'width: 25%;', thClass: 'text-left', tdClass: 'text-left' },
        { key: 'totalSupply', label: 'Total Supply', sortable: false, thStyle: 'width: 15%;', thClass: 'text-right', tdClass: 'text-right' },
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
    tokens() {
      return store.getters['data/tokens'];
    },
    ens() {
      return store.getters['data/ens'];
    },
    sync() {
      return store.getters['data/sync'];
    },
    pageSizes() {
      return store.getters['config/pageSizes'];
    },
    faucets() {
      return FAUCETS && FAUCETS[this.chainId];
    },
    faucetsOptions() {
      const results = [];
      if (FAUCETS && FAUCETS[this.chainId]) {
        results.push({ value: null, text: '(select a faucet)' });
        for (const item of FAUCETS[this.chainId]) {
          if (item.type == "erc20") {
            results.push({
              value: item.address,
              text: item.drip + " x " + (item.type == "erc20" ? "ERC-20 " : "ERC-721 ") + item.symbol + ' ' + item.name + (item.type == "erc20" ? " (" + item.decimals + " dp)" : "") + ' @ ' + item.address.substring(0, this.ADDRESS_SEGMENT_LENGTH + 2) + '...' + item.address.slice(-this.ADDRESS_SEGMENT_LENGTH),
            });
          }
        }
      }
      return results;
    },

    totalERC20Contracts() {
      let result = (store.getters['data/forceRefresh'] % 2) == 0 ? 0 : 0;
      for (const [address, data] of Object.entries(this.balances[this.chainId] || {})) {
        if (data.type == "erc20") {
          result++;
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
      for (const [contract, contractData] of Object.entries(this.balances[this.chainId] || {})) {
        if (contractData.type == "erc20") {
          const metadata = this.tokens[this.chainId] && this.tokens[this.chainId][contract] || {};
          let include = true;
          if (this.settings.junkFilter) {
            if (this.settings.junkFilter == 'junk' && !metadata.junk) {
              include = false;
            } else if (this.settings.junkFilter == 'excludejunk' && metadata.junk) {
              include = false;
            }
          }
          if (include && this.settings.activeOnly && (!metadata.active || metadata.junk)) {
            include = false;
          }
          if (include && regex) {
            if (!(regex.test(metadata.symbol) || regex.test(metadata.name) || regex.test(contract))) {
              include = false;
            }
          }
          const unsupported = contract in UNSUPPORTED_FUNGIBLES;
          const balances = [];
          for (const [address, balance] of Object.entries(contractData.balances)) {
            balances.push({ address, balance });
          }
          if (include) {
            results.push({ chainId: this.chainId, contract, ...contractData, ...metadata, balances, unsupported });
          }
        }
      }
      return results;
    },
    filteredSortedItems() {
      const results = this.filteredItems;
      if (this.settings.sortOption == 'contractasc') {
        results.sort((a, b) => {
          return ('' + a.contract).localeCompare(b.contract);
        });
      } else if (this.settings.sortOption == 'contractdsc') {
        results.sort((a, b) => {
          return ('' + b.contract).localeCompare(a.contract);
        });
      } else if (this.settings.sortOption == 'symbolasc') {
        results.sort((a, b) => {
          if (('' + a.symbol).localeCompare(b.symbol) == 0) {
            return ('' + a.contract).localeCompare(b.contract);
          } else {
            return ('' + a.symbol).localeCompare(b.symbol);
          }
        });
      } else if (this.settings.sortOption == 'symboldsc') {
        results.sort((a, b) => {
          if (('' + a.symbol).localeCompare(b.symbol) == 0) {
            return ('' + a.contract).localeCompare(b.contract);
          } else {
            return ('' + b.symbol).localeCompare(a.symbol);
          }
        });
      } else if (this.settings.sortOption == 'nameasc') {
        results.sort((a, b) => {
          if (('' + a.name).localeCompare(b.name) == 0) {
            return ('' + a.contract).localeCompare(b.contract);
          } else {
            return ('' + a.name).localeCompare(b.name);
          }
        });
      } else if (this.settings.sortOption == 'namedsc') {
        results.sort((a, b) => {
          if (('' + a.name).localeCompare(b.name) == 0) {
            return ('' + a.contract).localeCompare(b.contract);
          } else {
            return ('' + b.name).localeCompare(a.name);
          }
        });
      }
      return results;
    },
    pagedFilteredSortedItems() {
      // console.log(moment().format("HH:mm:ss") + " INFO Fungibles:computed.pagedFilteredSortedItems - results[0..1]: " + JSON.stringify(this.filteredSortedItems.slice(0, 2), null, 2));
      return this.filteredSortedItems.slice((this.settings.currentPage - 1) * this.settings.pageSize, this.settings.currentPage * this.settings.pageSize);
    },

  },
  methods: {
    viewFaucets() {
      console.log(moment().format("HH:mm:ss") + " INFO Fungibles:methods.viewFaucets");
      this.$bvModal.show('modal-faucets');
    },
    async drip() {
      console.log(moment().format("HH:mm:ss") + " INFO Fungibles:methods.drip BEGIN: " + JSON.stringify(this.modalFaucet, null, 2));
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const faucetInfo = FAUCETS[this.chainId] && FAUCETS[this.chainId].filter(e => e.address == this.modalFaucet.selectedFaucet)[0] || null;
      if (faucetInfo) {
        console.log(moment().format("HH:mm:ss") + " INFO Fungibles:methods.drip - faucetInfo: " + JSON.stringify(faucetInfo, null, 2));
        if (faucetInfo.type == "erc20") {
          try {
            const tx = await signer.sendTransaction({ to: faucetInfo.address, value: "0" });
            console.log(moment().format("HH:mm:ss") + " INFO Fungibles:methods.drip ERC-20 - tx: " + JSON.stringify(tx));
          } catch (e) {
            console.log(moment().format("HH:mm:ss") + " ERROR Fungibles:methods.drip ERC-20: " + JSON.stringify(e));
          }
        } else {
          const testToadzContract = new ethers.Contract(faucetInfo.address, TESTTOADZABI, provider);
          const testToadzContractWithSigner = testToadzContract.connect(provider.getSigner());
          try {
            const tx = await testToadzContractWithSigner.mint(3);
            console.log(moment().format("HH:mm:ss") + " INFO Fungibles:methods.drip ERC-721 - tx: " + JSON.stringify(tx));
          } catch (e) {
            console.log(moment().format("HH:mm:ss") + " ERROR Fungibles:methods.drip ERC-721: " + JSON.stringify(e));
          }
        }
      }
    },

    toggleFungibleJunk(item) {
      console.log(moment().format("HH:mm:ss") + " INFO Fungibles:methods.toggleFungibleJunk - item: " + JSON.stringify(item));
      store.dispatch('data/toggleFungibleJunk', item);
    },
    toggleFungibleActive(item) {
      console.log(moment().format("HH:mm:ss") + " INFO Fungibles:methods.toggleFungibleActive - item: " + JSON.stringify(item));
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
      console.log(moment().format("HH:mm:ss") + " INFO Fungibles:methods.saveSettings - fungiblesSettings: " + JSON.stringify(this.settings, null, 2));
      localStorage.fungiblesSettings = JSON.stringify(this.settings);
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
      console.log(moment().format("HH:mm:ss") + " INFO Fungibles:methods.rowSelected BEGIN: " + JSON.stringify(item, null, 2));
      if (item && item.length > 0) {
        store.dispatch('viewFungible/viewFungible', { contract: item[0].contract });
        store.dispatch('data/updateFungibleTotalSupply', { chainId: this.chainId, contract: item[0].contract });
        this.$refs.tokenContractsTable.clearSelected();
      }
    },

    async timeoutCallback() {
      // console.log(moment().format("HH:mm:ss") + " DEBUG Fungibles:methods.timeoutCallback - count: " + this.count);
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
    // console.log(moment().format("HH:mm:ss") + " DEBUG Fungibles:beforeDestroy");
  },
  mounted() {
    // console.log(moment().format("HH:mm:ss") + " DEBUG Fungibles:mounted - $route: " + JSON.stringify(this.$route.params));
    store.dispatch('data/restoreState');
    if ('fungiblesSettings' in localStorage) {
      const tempSettings = JSON.parse(localStorage.fungiblesSettings);
      if ('version' in tempSettings && tempSettings.version == this.settings.version) {
        this.settings = tempSettings;
        this.settings.currentPage = 1;
      }
    }
    this.reschedule = true;
    // console.log(moment().format("HH:mm:ss") + " DEBUG Fungibles:mounted - calling timeoutCallback()");
    this.timeoutCallback();
  },
  destroyed() {
    this.reschedule = false;
  },
};

const fungiblesModule = {
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
