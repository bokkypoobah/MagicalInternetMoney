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
            <b-button size="sm" :pressed.sync="settings.favouritesOnly" @click="saveSettings" variant="transparent" v-b-popover.hover="'Show favourited only'"><b-icon :icon="settings.favouritesOnly ? 'heart-fill' : 'heart'" font-scale="0.95" variant="danger"></b-icon></b-button>
          </div>
          <div class="mt-0 flex-grow-1">
          </div>
          <div class="mt-0 pr-1">
            <b-button size="sm" @click="viewFaucets" variant="link" v-b-popover.hover="'Drip tokens from ERC-20 and ERC-721 faucets'"><b-icon-plus shift-v="+1" font-scale="1.0"></b-icon-plus></b-button>
          </div>
          <div class="mt-0 flex-grow-1">
          </div>
          <div v-if="sync.section == null" class="mt-0 pr-1">
            <b-button size="sm" :disabled="!coinbase" @click="viewSyncOptions" variant="link" v-b-popover.hover="'Sync data from the blockchain'"><b-icon-arrow-repeat shift-v="+1" font-scale="1.2"></b-icon-arrow-repeat></b-button>
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
            <b-button size="sm" :disabled="!coinbase" @click="newTransfer(null); " variant="link" v-b-popover.hover="'New Stealth Transfer'"><b-icon-caret-right shift-v="+1" font-scale="1.1"></b-icon-caret-right></b-button>
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
          <template #cell(favourite)="data">
            <b-button size="sm" @click="toggleFungibleJunk(data.item);" variant="transparent" v-b-popover.hover="'Junk?'" class="m-0 ml-1 p-0"><b-icon :icon="data.item.junk ? 'trash-fill' : 'trash'" font-scale="0.9" :variant="data.item.junk ? 'info' : 'secondary'"></b-icon></b-button>
            <b-button size="sm" :disabled="data.item.junk" @click="toggleFungibleFavourite(data.item);" variant="transparent" v-b-popover.hover="'Favourite?'" class="m-0 ml-1 p-0"><b-icon :icon="data.item.favourite & !data.item.junk ? 'heart-fill' : 'heart'" font-scale="0.9" :variant="data.item.junk ? 'dark' : 'danger'"></b-icon></b-button>
          </template>
          <template #cell(logo)="data">
            <b-img v-if="chainId == 1" button rounded width="75px;" :src="'https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/ethereum/assets/' + data.item.contract + '/logo.png'" />
          </template>
          <template #cell(contract)="data">
            <b-link :href="explorer + 'address/' + data.item.contract + '#code'" target="_blank">
              <font size="-1">{{ data.item.contract.substring(0, 10) + '...' + data.item.contract.slice(-8) }}</font>
            </b-link>
            <!-- <br />
            <b-button size="sm" @click="toggleFungibleJunk(data.item);" variant="transparent"><b-icon :icon="data.item.junk ? 'trash-fill' : 'trash'" font-scale="0.9" :variant="data.item.junk ? 'info' : 'secondary'"></b-icon></b-button>
            <b-button size="sm" :disabled="data.item.junk" @click="toggleFungibleFavourite(data.item);" variant="transparent"><b-icon :icon="data.item.favourite & !data.item.junk ? 'heart-fill' : 'heart'" font-scale="0.9" :variant="data.item.junk ? 'dark' : 'danger'"></b-icon></b-button> -->
          </template>
          <template #cell(type)="data">
            <font size="-1">{{ data.item.type == "erc20" ? "ERC-20" : "ERC-721" }}</font>
          </template>
          <template #cell(symbol)="data">
            <font size="-1">{{ data.item.symbol }}</font>
          </template>
          <template #cell(name)="data">
            <font size="-1">{{ data.item.name }}</font>
          </template>
          <template #cell(decimals)="data">
            <font size="-1">{{ data.item.decimals || '0' }}</font>
          </template>
          <template #cell(balance)="data">
            <span v-if="data.item.balances[coinbase] && data.item.type == 'erc20'">
              <b-button size="sm" :href="explorer + 'token/' + data.item.contract + '?a=' + coinbase" variant="link" class="m-0 ml-2 p-0" target="_blank">{{ formatDecimals(data.item.balances[coinbase], data.item.decimals || 0) }}</b-button>
            </span>
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
        favouritesOnly: false,
        currentPage: 1,
        pageSize: 10,
        sortOption: 'symbolasc',
        version: 0,
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
        { key: 'favourite', label: '', sortable: false, thStyle: 'width: 5%;', thClass: 'text-right', tdClass: 'text-right' },
        { key: 'contract', label: 'Contract', sortable: false, thStyle: 'width: 15%;', thClass: 'text-left', tdClass: 'text-truncate' },
        { key: 'logo', label: 'Logo', sortable: false, thStyle: 'width: 7%;', thClass: 'text-left', tdClass: 'text-truncate' },
        { key: 'symbol', label: 'Symbol', sortable: false, thStyle: 'width: 7%;', thClass: 'text-left', tdClass: 'text-truncate' },
        { key: 'name', label: 'Name', sortable: false, thStyle: 'width: 15%;', thClass: 'text-left', tdClass: 'text-truncate' },
        { key: 'decimals', label: 'Decimals', sortable: false, thStyle: 'width: 10%;', thClass: 'text-right', tdClass: 'text-right' },
        { key: 'balance', label: 'Balance', sortable: false, thStyle: 'width: 18%;', thClass: 'text-right', tdClass: 'text-right' },
        { key: 'totalSupply', label: 'Total Supply', sortable: false, thStyle: 'width: 18%;', thClass: 'text-right', tdClass: 'text-right' },
      ],
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
    networks() {
      return Object.keys(NETWORKS);
    },
    explorer() {
      return this.chainId && NETWORKS[this.chainId] && NETWORKS[this.chainId].explorer || "https://etherscan.io/";
    },
    sync() {
      return store.getters['data/sync'];
    },
    pageSizes() {
      return store.getters['config/pageSizes'];
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
          if (include && this.settings.favouritesOnly && (!metadata.favourite || metadata.junk)) {
            include = false;
          }
          if (include && regex) {
            if (!(regex.test(metadata.symbol) || regex.test(metadata.name) || regex.test(contract))) {
              include = false;
            }
          }
          if (include) {
            results.push({ chainId: this.chainId, contract, ...contractData, ...metadata });
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
      logInfo("Fungibles", "pagedFilteredSortedItems - results[0..1]: " + JSON.stringify(this.filteredSortedItems.slice(0, 2), null, 2));
      return this.filteredSortedItems.slice((this.settings.currentPage - 1) * this.settings.pageSize, this.settings.currentPage * this.settings.pageSize);
    },

  },
  methods: {
    viewFaucets() {
      console.log(moment().format("HH:mm:ss") + " viewFaucets");
      this.$bvModal.show('modal-faucets');
    },
    async drip() {
      console.log(moment().format("HH:mm:ss") + " drip BEGIN: " + JSON.stringify(this.modalFaucet, null, 2));
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const faucetInfo = FAUCETS[this.chainId] && FAUCETS[this.chainId].filter(e => e.address == this.modalFaucet.selectedFaucet)[0] || null;
      if (faucetInfo) {
        console.log("faucetInfo: " + JSON.stringify(faucetInfo, null, 2));
        if (faucetInfo.type == "erc20") {
          try {
            const tx = await signer.sendTransaction({ to: faucetInfo.address, value: "0" });
            console.log("tx: " + JSON.stringify(tx));
          } catch (e) {
            console.log("drip ERC-20 - error: " + JSON.stringify(e));
          }
        } else {
          const testToadzContract = new ethers.Contract(faucetInfo.address, TESTTOADZABI, provider);
          const testToadzContractWithSigner = testToadzContract.connect(provider.getSigner());
          try {
            const tx = await testToadzContractWithSigner.mint(3);
            console.log("tx: " + JSON.stringify(tx));
          } catch (e) {
            console.log("drip ERC-721 - error: " + JSON.stringify(e));
          }
        }
      }
    },

    toggleFungibleJunk(item) {
      logInfo("Fungibles", ".methods.toggleFungibleJunk - item: " + JSON.stringify(item, null, 2));
      store.dispatch('data/toggleFungibleJunk', item);
    },
    toggleFungibleFavourite(item) {
      logInfo("Fungibles", ".methods.toggleFungibleFavourite - item: " + JSON.stringify(item, null, 2));
      store.dispatch('data/toggleFungibleFavourite', item);
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
      logInfo("Fungibles", "methods.saveSettings - fungiblesSettings: " + JSON.stringify(this.settings, null, 2));
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
      logInfo("Fungibles", "methods.rowSelected BEGIN: " + JSON.stringify(item, null, 2));
      if (item && item.length > 0) {
        this.transfer.item = item[0];
        this.transfer.stealthPrivateKey = null;

        // const account = item[0].account;
        // if (account.substring(0, 3) == "st:") {
        //   this.stealthMetaAccount.account = item[0].account;
        //   this.stealthMetaAccount.type = item[0].type;
        //   this.stealthMetaAccount.linkedToAddress = item[0].linkedToAddress;
        //   this.stealthMetaAccount.phrase = item[0].phrase;
        //   this.stealthMetaAccount.mine = item[0].mine;
        //   this.stealthMetaAccount.favourite = item[0].favourite;
        //   this.stealthMetaAccount.name = item[0].name;
        //   this.stealthMetaAccount.notes = item[0].notes;
        //   this.stealthMetaAccount.spendingPrivateKey = null;
        //   this.stealthMetaAccount.viewingPrivateKey = item[0].viewingPrivateKey || null;
        //   this.stealthMetaAccount.spendingPublicKey = item[0].spendingPublicKey || null;
        //   this.stealthMetaAccount.viewingPublicKey = item[0].viewingPublicKey || null;
        //   this.stealthMetaAccount.source = item[0].source;
        //   this.$bvModal.show('modal-stealthmetaccount');
        // } else {
        //   this.account.account = item[0].account;
        //   this.account.type = item[0].type;
        //   this.account.ensName = item[0].ensName;
        //   this.account.mine = item[0].mine;
        //   this.account.favourite = item[0].favourite;
        //   this.account.name = item[0].name;
        //   this.account.notes = item[0].notes;
        //   this.account.source = item[0].source;
        //   this.$bvModal.show('modal-address');
        // }
        this.$bvModal.show('modal-transfer');
        this.$refs.tokenContractsTable.clearSelected();
      }
    },

    async timeoutCallback() {
      logDebug("Fungibles", "timeoutCallback() count: " + this.count);

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
    logDebug("Fungibles", "beforeDestroy()");
  },
  mounted() {
    logDebug("Fungibles", "mounted() $route: " + JSON.stringify(this.$route.params));
    store.dispatch('data/restoreState');
    if ('fungiblesSettings' in localStorage) {
      const tempSettings = JSON.parse(localStorage.fungiblesSettings);
      if ('version' in tempSettings && tempSettings.version == this.settings.version) {
        this.settings = tempSettings;
        this.settings.currentPage = 1;
      }
    }
    this.reschedule = true;
    logDebug("Fungibles", "Calling timeoutCallback()");
    this.timeoutCallback();
  },
  destroyed() {
    this.reschedule = false;
  },
};

const fungiblesModule = {
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
      logDebug("fungiblesModule", "deQueue(" + JSON.stringify(state.executionQueue) + ")");
      state.executionQueue.shift();
    },
    updateParams(state, params) {
      state.params = params;
      logDebug("fungiblesModule", "updateParams('" + params + "')")
    },
    updateExecuting(state, executing) {
      state.executing = executing;
      logDebug("fungiblesModule", "updateExecuting(" + executing + ")")
    },
  },
  actions: {
  },
};
