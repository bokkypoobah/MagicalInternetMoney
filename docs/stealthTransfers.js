const StealthTransfers = {
  template: `
    <div class="m-0 p-0">
      <b-card no-body no-header class="border-0">

        <b-modal ref="modaltransfer" id="modal-transfer" hide-footer header-class="m-0 px-3 py-2" body-bg-variant="light" size="lg">
          <template #modal-title>Stealth Transfer</template>
          <b-form-group v-if="transfer.item" label="Tx Hash:" label-for="transfer-txhash" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
            <b-input-group size="sm" class="w-100">
              <b-form-input size="sm" plaintext id="transfer-txhash" v-model.trim="transfer.item.txHash" class="px-2"></b-form-input>
              <b-input-group-append>
                <div>
                  <b-button v-if="transfer.item.txHash" size="sm" :href="explorer + 'tx/' + transfer.item.txHash" variant="link" v-b-popover.hover.ds500="'View in explorer'" target="_blank" class="m-0 ml-1 p-0"><b-icon-link45deg shift-v="+1" font-scale="0.95"></b-icon-link45deg></b-button>
                </div>
              </b-input-group-append>
            </b-input-group>
          </b-form-group>
          <b-form-group v-if="transfer.item" label="Timestamp:" label-for="transfer-timestamp" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
            <b-form-input size="sm" plaintext id="transfer-timestamp" v-b-popover.hover.ds500="'Block #' + commify0(transfer.item.blockNumber)" :value="formatTimestamp(transfer.item.timestamp)" class="px-2"></b-form-input>
          </b-form-group>
          <b-form-group v-if="transfer.item && transfer.item.tx" label="Sender:" label-for="transfer-sender" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
            <b-input-group size="sm" class="w-100">
              <b-form-input size="sm" plaintext id="transfer-sender" v-model.trim="transfer.item.tx.from" class="px-2"></b-form-input>
              <b-input-group-append>
                <div>
                  <b-button size="sm" :href="explorer + 'address/' + transfer.item.tx.from" variant="link" v-b-popover.hover.ds500="'View in explorer'" target="_blank" class="m-0 ml-1 p-0"><b-icon-link45deg shift-v="+1" font-scale="0.95"></b-icon-link45deg></b-button>
                </div>
              </b-input-group-append>
            </b-input-group>
          </b-form-group>
          <b-form-group v-if="transfer.item" label="Receiver:" label-for="transfer-receiver" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
            <b-input-group size="sm" class="w-100">
              <b-form-input size="sm" plaintext id="transfer-receiver" v-model.trim="transfer.item.stealthAddress" class="px-2"></b-form-input>
              <b-input-group-append>
                <div>
                  <b-button size="sm" :href="explorer + 'address/' + transfer.item.stealthAddress" variant="link" v-b-popover.hover.ds500="'View in explorer'" target="_blank" class="m-0 ml-1 p-0"><b-icon-link45deg shift-v="+1" font-scale="0.95"></b-icon-link45deg></b-button>
                </div>
              </b-input-group-append>
            </b-input-group>
          </b-form-group>
          <b-form-group v-if="transfer.item && transfer.item.linkedTo && transfer.item.linkedTo.stealthMetaAddress" label="Receiver Private Key:" label-for="transfer-spendingprivatekey" label-size="sm" label-cols-sm="3" label-align-sm="right" description="Sign message to reveal the private key" class="mx-0 my-1 p-0">
            <b-input-group size="sm" class="w-100">
              <b-form-input :type="transfer.stealthPrivateKey ? 'text' : 'password'" size="sm" plaintext id="transfer-spendingprivatekey" :value="transfer.stealthPrivateKey ? transfer.stealthPrivateKey : 'A'.repeat(66)" class="px-2"></b-form-input>
              <b-input-group-append>
                <b-button v-if="!transfer.stealthPrivateKey" :disabled="transfer.item.linkedTo.address != coinbase" @click="revealTransferSpendingPrivateKey();" variant="link" class="m-0 ml-2 p-0"><b-icon-eye shift-v="+1" font-scale="1.1"></b-icon-eye></b-button>
                <b-button v-if="transfer.stealthPrivateKey" @click="copyToClipboard(transfer.stealthPrivateKey ? transfer.stealthPrivateKey : '*'.repeat(66));" variant="link" class="m-0 ml-2 p-0"><b-icon-clipboard shift-v="+1" font-scale="1.1"></b-icon-clipboard></b-button>
              </b-input-group-append>
            </b-input-group>
          </b-form-group>
          <b-form-group v-if="transfer.item && transfer.item.linkedTo" label="Linked To Address:" label-for="transfer-linkedtoaddress" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
            <b-input-group size="sm" class="w-100">
              <b-form-input size="sm" plaintext id="transfer-linkedtoaddress" v-model.trim="transfer.item.linkedTo.address" class="px-2"></b-form-input>
              <b-input-group-append>
                <div>
                  <b-button size="sm" :href="explorer + 'address/' + transfer.item.linkedTo.address" variant="link" v-b-popover.hover.ds500="'View in explorer'" target="_blank" class="m-0 ml-1 p-0"><b-icon-link45deg shift-v="+1" font-scale="0.95"></b-icon-link45deg></b-button>
                </div>
              </b-input-group-append>
            </b-input-group>
          </b-form-group>
          <b-form-group v-if="transfer.item && transfer.item.linkedTo" label="Via Stealth Meta-Address:" label-for="transfer-linkedtostealthmetaaddress" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
            <b-form-textarea size="sm" plaintext id="transfer-linkedtostealthmetaaddress" v-model.trim="transfer.item.linkedTo.stealthMetaAddress" rows="3" max-rows="4" class="px-2"></b-form-textarea>
          </b-form-group>
          <b-form-group v-if="transfer.item" label="Scheme Id:" label-for="transfer-schemeid" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
            <b-form-input size="sm" plaintext id="transfer-schemeid" v-model.trim="transfer.item.schemeId" class="px-2"></b-form-input>
          </b-form-group>
          <b-form-group v-if="transfer.item" label="Ephemeral Public Key:" label-for="transfer-ephemeralpublickey" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
            <b-form-input size="sm" plaintext id="transfer-ephemeralpublickey" v-model.trim="transfer.item.ephemeralPublicKey" class="px-2"></b-form-input>
          </b-form-group>
          <b-form-group v-if="transfer.item" label="Caller:" label-for="transfer-caller" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
            <b-input-group size="sm" class="w-100">
              <b-form-input size="sm" plaintext id="transfer-caller" v-model.trim="transfer.item.caller" class="px-2"></b-form-input>
              <b-input-group-append>
                <div>
                  <b-button size="sm" :href="explorer + 'address/' + transfer.item.caller" variant="link" v-b-popover.hover.ds500="'View in explorer'" target="_blank" class="m-0 ml-1 p-0"><b-icon-link45deg shift-v="+1" font-scale="0.95"></b-icon-link45deg></b-button>
                </div>
              </b-input-group-append>
            </b-input-group>
          </b-form-group>

          <b-form-group v-if="transfer.item && transfer.item.transfers" label="Transfers:" label-for="transfer-transfers" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
            <font size="-1">
              <b-row v-for="(item, index) of transfer.item.transfers" v-bind:key="item.token">
                <b-col cols="12" class="text-right px-0 mt-1">
                  <span v-if="getTokenType(item.token) == 'eth'">
                    <font size="-1">{{ formatETH(item.value) }}</font>
                  </span>
                  <span v-else>
                    xx {{ item.value + ' ' + item.token }}
                  </span>
                  <!-- <span v-if="getTokenType(item.token) == 'eth'">
                    <font size="-1">{{ formatETH(item.value) }}</font>
                  </span> -->
                  <!-- <span v-else-if="getTokenType(item.token) == 'erc20'">
                    <font size="-1">{{ formatETH(item.value) }}</font>
                  </span> -->
                  <!-- <span v-else> -->
                    <!-- <b-button size="sm" :href="chainInfo.nftTokenPrefix + item.token + '/' + item.value" variant="link" v-b-popover.hover.ds500="item.value" class="m-0 ml-2 p-0" target="_blank">{{ item.value.toString().length > 20 ? (item.value.toString().substring(0, 8) + '...' + item.value.toString().slice(-8)) : item.value.toString() }}</b-button> -->
                  <!-- </span> -->
                </b-col>
                <!-- <b-col cols="3" class="px-0 mt-1"> -->
                  <!-- <span v-if="isEthereums(item.token)">
                    <b-button size="sm" disabled variant="transparent" class="m-0 ml-2 p-0">ETH</b-button>
                  </span> -->
                  <!-- <span v-else> -->
                    <!-- <b-button size="sm" :href="chainInfo.explorerTokenPrefix + item.token" variant="link" v-b-popover.hover.ds500="item.tokenId" class="m-0 ml-2 p-0" target="_blank">{{ getTokenSymbol(item.token) }}</b-button> -->
                  <!-- </span> -->
                <!-- </b-col> -->
              </b-row>
            </font>
          </b-form-group>
          <!-- <b-form-group label="Address:" label-for="transfer-address" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
            <b-input-group size="sm" class="w-100">
              <b-form-input size="sm" plaintext id="transfer-address" v-model.trim="account.account" class="px-2"></b-form-input>
              <b-input-group-append>
                <div>
                  <b-button size="sm" :href="'https://sepolia.etherscan.io/address/' + account.account" variant="link" v-b-popover.hover.ds500="'View in explorer'" target="_blank" class="m-0 ml-1 p-0"><b-icon-link45deg shift-v="+1" font-scale="0.95"></b-icon-link45deg></b-button>
                </div>
              </b-input-group-append>
            </b-input-group>
          </b-form-group> -->
          <!-- <b-form-group v-if="false" label="ENS Name:" label-for="transfer-ensname" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
            <b-form-input size="sm" plaintext id="transfer-ensname" v-model.trim="account.ensName" class="px-2 w-75"></b-form-input>
          </b-form-group> -->
          <!-- <b-form-group label="" label-for="transfer-delete" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
            <b-button size="sm" @click="deleteAddress(account.account, 'modaladdress');" variant="link" v-b-popover.hover.ds500="'Delete account?'"><b-icon-trash shift-v="+1" font-scale="1.1" variant="danger"></b-icon-trash></b-button>
          </b-form-group> -->
          <font size="-1">
            <pre>
{{ transfer }}
            </pre>
          </font>
        </b-modal>

        <div class="d-flex flex-wrap m-0 p-0">
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
            <font size="-2" v-b-popover.hover.ds500="'# registry entries'">{{ filteredSortedTransfers.length + '/' + totalTransfers }}</font>
          </div>
          <div class="mt-0 pr-1">
            <b-pagination size="sm" v-model="settings.currentPage" @input="saveSettings" :total-rows="filteredSortedTransfers.length" :per-page="settings.pageSize" style="height: 0;"></b-pagination>
          </div>
          <div class="mt-0 pl-1">
            <b-form-select size="sm" v-model="settings.pageSize" @change="saveSettings" :options="pageSizes" v-b-popover.hover.ds500="'Page size'"></b-form-select>
          </div>
        </div>

        <b-table ref="transfersTable" small fixed striped responsive hover selectable select-mode="single" @row-selected='rowSelected' :fields="fields" :items="pagedFilteredSortedTransfers" show-empty head-variant="light" class="m-0 mt-1">
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
          <template #cell(timestamp)="data">
            <!-- TODO <b-link :href="explorer + 'atx/' + data.item.txHash" v-b-popover.hover.ds500="'Block #' + commify0(data.item.blockNumber) + ', txIndex: ' + data.item.txIndex + ', logIndex: ' + data.item.logIndex" target="_blank"> -->
            <b-link :href="explorer + 'tx/' + data.item.txHash" target="_blank">
              <span v-if="data.item.timestamp">
                {{ formatTimestamp(data.item.timestamp) }}
              </span>
              <span v-else>
                {{ '#' + commify0(data.item.blockNumber) }}
              </span>
            </b-link>
            <br />
          </template>
          <template #cell(sender)="data">
            <div v-if="data.item.tx && data.item.tx.from">
              <b-link :href="explorer + 'address/' + data.item.tx.from" v-b-popover.hover.ds500="'View in etherscan.io'" target="_blank">
                {{ data.item.tx.from }}
              </b-link>
            </div>
          </template>
          <template #cell(receiver)="data">
            <div v-if="data.item.stealthAddress">
              <b-link :href="explorer + 'address/' + data.item.stealthAddress" v-b-popover.hover.ds500="'View in etherscan.io'" target="_blank">
                {{ data.item.stealthAddress }}
              </b-link>
            </div>
          </template>
          <template #cell(tokens)="data">
            <!-- TODO -->
            <b-row v-for="(item, index) of data.item.transfers" v-bind:key="item.token">
              <b-col>
                <span v-if="getTokenType(item.token) == 'eth'">
                  <font size="-1">{{ formatETH(item.value) + ' ETH'}}</font>
                </span>
                <span v-else-if="getTokenType(item.token) == 'erc20'">
                  <font size="-1">
                    {{ formatETH(item.value) }}
                    <b-link :href="explorer + 'token/' + item.token" v-b-popover.hover.ds500="item.tokenId" target="_blank">{{ getTokenSymbol(item.token) }}</b-link>
                  </font>
                </span>
                <span v-else>
                  <!-- TODO -->
                  <font size="-1">
                    <b-link :href="'https://testnets.opensea.io/assets/sepolia/' + item.token + '/' + item.value" v-b-popover.hover.ds500="item.value" target="_blank">{{ item.value.toString().length > 20 ? (item.value.toString().substring(0, 8) + '...' + item.value.toString().slice(-8)) : item.value.toString() }}</b-link>
                    <b-link :href="'https://sepolia.etherscan.io/token/' + item.token" v-b-popover.hover.ds500="item.tokenId" target="_blank">{{ item.token.substring(0, 10) + '...' + item.token.slice(-8) /*getTokenSymbol(item.token)*/ }}</b-link>
                  </font>
                </span>
              </b-col>
            </b-row>
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
        currentPage: 1,
        pageSize: 50,
        sortOption: 'txorderdsc',
        version: 0,
      },
      transfer: {
        item: null,
        stealthPrivateKey: null,
      },
      sortOptions: [
        { value: 'txorderasc', text: '▲ TxOrder' },
        { value: 'txorderdsc', text: '▼ TxOrder' },
      ],
      fields: [
        { key: 'number', label: '#', sortable: false, thStyle: 'width: 5%;', tdClass: 'text-truncate' },
        { key: 'timestamp', label: 'When', sortable: false, thStyle: 'width: 10%;', tdClass: 'text-truncate' },
        { key: 'sender', label: 'Sender', sortable: false, thStyle: 'width: 15%;', thClass: 'text-left', tdClass: 'text-truncate' },
        { key: 'receiver', label: 'Receiver', sortable: false, thStyle: 'width: 15%;', thClass: 'text-left', tdClass: 'text-truncate' },
        // { key: 'linkedToAddress', label: 'Linked To Address', sortable: false, thStyle: 'width: 15%;', thClass: 'text-left', tdClass: 'text-truncate' },
        // { key: 'viaStealthMetaAddress', label: 'Via Stealth Meta-Address', sortable: false, thStyle: 'width: 15%;', thClass: 'text-left', tdClass: 'text-truncate' },
        { key: 'tokens', label: 'Tokens', sortable: false, thStyle: 'width: 20%;', thClass: 'text-left', tdClass: 'text-truncate' },
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
    coinbase() {
      return store.getters['connection/coinbase'];
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
    registry() {
      return store.getters['data/registry'];
    },
    stealthTransfers() {
      return store.getters['data/stealthTransfers'];
    },

    totalTransfers() {
      let result = (store.getters['data/forceRefresh'] % 2) == 0 ? 0 : 0;
      for (const [blockNumber, logIndexes] of Object.entries(this.stealthTransfers[this.chainId] || {})) {
        for (const [logIndex, item] of Object.entries(logIndexes)) {
          result++;
        }
      }
      return result;
    },
    filteredTransfers() {
      const results = (store.getters['data/forceRefresh'] % 2) == 0 ? [] : [];
      for (const [blockNumber, logIndexes] of Object.entries(this.stealthTransfers[this.chainId] || {})) {
        for (const [logIndex, item] of Object.entries(logIndexes)) {
          if (item.schemeId == ONLY_SUPPORTED_SCHEME_ID) {
            results.push(item);
          }
        }
      }
      return results;
    },
    filteredSortedTransfers() {
      const results = this.filteredTransfers;
      if (this.settings.sortOption == 'txorderasc') {
        results.sort((a, b) => {
          if (a.blockNumber == b.blockNumber) {
            return a.logIndex - b.logIndex;
          } else {
            return a.blockNumber - b.blockNumber;
          }
        });
      } else if (this.settings.sortOption == 'txorderdsc') {
        results.sort((a, b) => {
          if (a.blockNumber == b.blockNumber) {
            return b.logIndex - a.logIndex;
          } else {
            return b.blockNumber - a.blockNumber;
          }
        });
      }
      return results;
    },
    pagedFilteredSortedTransfers() {
      // console.log(now() + " INFO StealthTransfers:computed.pagedFilteredSortedTransfers - results[0..1]: " + JSON.stringify(this.filteredSortedTransfers.slice(0, 2), null, 2));
      return this.filteredSortedTransfers.slice((this.settings.currentPage - 1) * this.settings.pageSize, this.settings.currentPage * this.settings.pageSize);
    },

  },
  methods: {
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
    saveSettings() {
      console.log(now() + " INFO StealthTransfers:methods.saveSettings - stealthTransfersSettings: " + JSON.stringify(this.settings, null, 2));
      localStorage.stealthTransfersSettings = JSON.stringify(this.settings);
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
      console.log(now() + " INFO StealthTransfers:methods.rowSelected BEGIN: " + JSON.stringify(item, null, 2));
      if (item && item.length > 0) {
        this.transfer.item = item[0];
        this.transfer.stealthPrivateKey = null;
        this.$bvModal.show('modal-transfer');
        this.$refs.transfersTable.clearSelected();
      }
    },

    async revealTransferSpendingPrivateKey() {
      function computeStealthKey(ephemeralPublicKey, viewingPrivateKey, spendingPrivateKey) {
        const result = {};
        result.sharedSecret = nobleCurves.secp256k1.getSharedSecret(viewingPrivateKey.substring(2), ephemeralPublicKey.substring(2), false);
        result.hashedSharedSecret = ethers.utils.keccak256(result.sharedSecret.slice(1));
        const stealthPrivateKeyNumber = (BigInt(spendingPrivateKey) + BigInt(result.hashedSharedSecret)) % BigInt(SECP256K1_N);
        const stealthPrivateKeyString = stealthPrivateKeyNumber.toString(16);
        result.stealthPrivateKey = "0x" + stealthPrivateKeyString.padStart(64, '0');
        result.stealthPublicKey = "0x" +  nobleCurves.secp256k1.ProjectivePoint.fromPrivateKey(stealthPrivateKeyNumber).toHex(false);
        result.stealthAddress = ethers.utils.computeAddress(result.stealthPublicKey);
        return result;
      }

      console.log(now() + " revealTransferSpendingPrivateKey - transfer: " + JSON.stringify(this.transfer, null, 2));
      const stealthMetaAddressData = this.addresses[this.transfer.item.linkedTo.stealthMetaAddress];
      console.log(now() + " revealTransferSpendingPrivateKey - stealthMetaAddressData: " + JSON.stringify(stealthMetaAddressData, null, 2));
      const phraseInHex = ethers.utils.hexlify(ethers.utils.toUtf8Bytes(stealthMetaAddressData.phrase));
      const signature = await ethereum.request({
        method: 'personal_sign',
        params: [phraseInHex, this.coinbase],
      });
      const signature1 = signature.slice(2, 66);
      const signature2 = signature.slice(66, 130);
      // Hash "v" and "r" values using SHA-256
      const hashedV = ethers.utils.sha256("0x" + signature1);
      const hashedR = ethers.utils.sha256("0x" + signature2);
      const n = ethers.BigNumber.from(SECP256K1_N);
      // Calculate the private keys by taking the hash values modulo the curve order
      const privateKey1 = ethers.BigNumber.from(hashedV).mod(n);
      const privateKey2 = ethers.BigNumber.from(hashedR).mod(n);
      const keyPair1 = new ethers.Wallet(privateKey1.toHexString());
      const keyPair2 = new ethers.Wallet(privateKey2.toHexString());
      const spendingPrivateKey = keyPair1.privateKey;
      const viewingPrivateKey = keyPair2.privateKey;
      const spendingPublicKey = ethers.utils.computePublicKey(keyPair1.privateKey, true);
      const viewingPublicKey = ethers.utils.computePublicKey(keyPair2.privateKey, true);
      // const stealthMetaAddress = "st:eth:" + spendingPublicKey + viewingPublicKey.substring(2);
      console.log(now() + " revealTransferSpendingPrivateKey - spendingPrivateKey: " + spendingPrivateKey);
      const computedStealthKey = computeStealthKey(this.transfer.item.ephemeralPublicKey, viewingPrivateKey, spendingPrivateKey);
      const stealthPrivateKey = computedStealthKey.stealthPrivateKey;
      // Vue.set(this.transfer, 'stealthPrivateKey', stealthPrivateKey);
      this.transfer.stealthPrivateKey = stealthPrivateKey;
      console.log("this.transfer: " + JSON.stringify(this.transfer, null, 2));
    },

    async timeoutCallback() {
      // console.log(now() + " DEBUG StealthTransfers:methods.timeoutCallback - count: " + this.count);
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
    // console.log(now() + " DEBUG StealthTransfers:beforeDestroy");
  },
  mounted() {
    // console.log(now() + " DEBUG StealthTransfers:mounted - $route: " + JSON.stringify(this.$route.params));
    store.dispatch('data/restoreState');
    if ('stealthTransfersSettings' in localStorage) {
      const tempSettings = JSON.parse(localStorage.stealthTransfersSettings);
      if ('version' in tempSettings && tempSettings.version == 0) {
        this.settings = tempSettings;
        this.settings.currentPage = 1;
      }
    }
    this.reschedule = true;
    // console.log(now() + " DEBUG StealthTransfers:mounted - calling timeoutCallback()");
    this.timeoutCallback();
  },
  destroyed() {
    this.reschedule = false;
  },
};

const stealthTransfersModule = {
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
