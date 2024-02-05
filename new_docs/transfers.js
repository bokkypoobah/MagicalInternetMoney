const Transfers = {
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
                <b-button size="sm" :href="'https://sepolia.etherscan.io/tx/' + (transfer.item && transfer.item.txHash || '')" variant="link" v-b-popover.hover="'View in explorer'" target="_blank" class="m-0 ml-1 p-0"><b-icon-link45deg shift-v="+1" font-scale="0.95"></b-icon-link45deg></b-button>
              </div>
            </b-input-group-append>
          </b-input-group>
        </b-form-group>
        <b-form-group v-if="transfer.item" label="Timestamp:" label-for="transfer-timestamp" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-form-input size="sm" plaintext id="transfer-timestamp" v-b-popover.hover.bottom="'Block #' + commify0(transfer.item.blockNumber)" :value="formatTimestamp(transfer.item.timestamp)" class="px-2"></b-form-input>
        </b-form-group>
        <b-form-group v-if="transfer.item && transfer.item.tx" label="Sender:" label-for="transfer-sender" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-input-group size="sm" class="w-100">
            <b-form-input size="sm" plaintext id="transfer-sender" v-model.trim="transfer.item.tx.from" class="px-2"></b-form-input>
            <b-input-group-append>
              <div>
                <b-button size="sm" :href="'https://sepolia.etherscan.io/address/' + transfer.item.tx.from" variant="link" v-b-popover.hover="'View in explorer'" target="_blank" class="m-0 ml-1 p-0"><b-icon-link45deg shift-v="+1" font-scale="0.95"></b-icon-link45deg></b-button>
              </div>
            </b-input-group-append>
          </b-input-group>
        </b-form-group>
        <b-form-group v-if="transfer.item" label="Receiver:" label-for="transfer-receiver" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-input-group size="sm" class="w-100">
            <b-form-input size="sm" plaintext id="transfer-receiver" v-model.trim="transfer.item.stealthAddress" class="px-2"></b-form-input>
            <b-input-group-append>
              <div>
                <b-button size="sm" :href="'https://sepolia.etherscan.io/address/' + transfer.item.stealthAddress" variant="link" v-b-popover.hover="'View in explorer'" target="_blank" class="m-0 ml-1 p-0"><b-icon-link45deg shift-v="+1" font-scale="0.95"></b-icon-link45deg></b-button>
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
                <b-button size="sm" :href="'https://sepolia.etherscan.io/address/' + transfer.item.linkedTo.address" variant="link" v-b-popover.hover="'View in explorer'" target="_blank" class="m-0 ml-1 p-0"><b-icon-link45deg shift-v="+1" font-scale="0.95"></b-icon-link45deg></b-button>
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
                <b-button size="sm" :href="'https://sepolia.etherscan.io/address/' + transfer.item.caller" variant="link" v-b-popover.hover="'View in explorer'" target="_blank" class="m-0 ml-1 p-0"><b-icon-link45deg shift-v="+1" font-scale="0.95"></b-icon-link45deg></b-button>
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
                </span>
                <span v-else-if="getTokenType(item.token) == 'erc20'">
                  <font size="-1">{{ formatETH(item.value) }}</font>
                </span>
                <span v-else>
                  <b-button size="sm" :href="chainInfo.nftTokenPrefix + item.token + '/' + item.value" variant="link" v-b-popover.hover.bottom="item.value" class="m-0 ml-2 p-0" target="_blank">{{ item.value.toString().length > 20 ? (item.value.toString().substring(0, 8) + '...' + item.value.toString().slice(-8)) : item.value.toString() }}</b-button>
                </span> -->
              </b-col>
              <!-- <b-col cols="3" class="px-0 mt-1"> -->
                <!-- <span v-if="isEthereums(item.token)">
                  <b-button size="sm" disabled variant="transparent" class="m-0 ml-2 p-0">ETH</b-button>
                </span>
                <span v-else>
                  <b-button size="sm" :href="chainInfo.explorerTokenPrefix + item.token" variant="link" v-b-popover.hover.bottom="item.tokenId" class="m-0 ml-2 p-0" target="_blank">{{ getTokenSymbol(item.token) }}</b-button>
                </span> -->
              <!-- </b-col> -->
            </b-row>
          </font>
        </b-form-group>



        <!-- <b-form-group label="Address:" label-for="transfer-address" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-input-group size="sm" class="w-100">
            <b-form-input size="sm" plaintext id="transfer-address" v-model.trim="account.account" class="px-2"></b-form-input>
            <b-input-group-append>
              <div>
                <b-button size="sm" :href="'https://sepolia.etherscan.io/address/' + account.account" variant="link" v-b-popover.hover="'View in explorer'" target="_blank" class="m-0 ml-1 p-0"><b-icon-link45deg shift-v="+1" font-scale="0.95"></b-icon-link45deg></b-button>
              </div>
            </b-input-group-append>
          </b-input-group>
        </b-form-group> -->
        <!-- <b-form-group v-if="false" label="ENS Name:" label-for="transfer-ensname" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-form-input size="sm" plaintext id="transfer-ensname" v-model.trim="account.ensName" class="px-2 w-75"></b-form-input>
        </b-form-group> -->
        <!-- <b-form-group label="Name:" label-for="transfer-name" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-input-group size="sm" class="w-75">
            <b-form-input size="sm" type="text" id="transfer-name" v-model.trim="account.name" @update="setAddressField(account.account, 'name', account.name)" debounce="600" placeholder="optional"></b-form-input>
            <b-input-group-append>
              <div>
                <b-button size="sm" :pressed.sync="account.mine" @click="toggleAddressField(account.account, 'mine')" variant="transparent" v-b-popover.hover="addressTypeInfo[account.type || 'address'].name" class="m-0 ml-5 p-0"><b-icon :icon="account.mine ? 'star-fill' : 'star'" shift-v="+1" font-scale="0.95" :variant="addressTypeInfo[account.type || 'address'].variant"></b-icon></b-button>
                <b-button size="sm" :pressed.sync="account.favourite" @click="toggleAddressField(account.account, 'favourite')" variant="transparent" v-b-popover.hover="'Favourite?'" class="m-0 ml-1 p-0"><b-icon :icon="account.favourite ? 'heart-fill' : 'heart'" shift-v="+1" font-scale="0.95" variant="danger"></b-icon></b-button>
              </div>
            </b-input-group-append>
          </b-input-group>
        </b-form-group> -->
        <!-- <b-form-group label="Notes:" label-for="transfer-notes" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-form-textarea size="sm" id="transfer-notes" v-model.trim="account.notes" @update="setAddressField(account.account, 'notes', account.notes)" debounce="600" placeholder="..." class="w-100"></b-form-textarea>
        </b-form-group> -->
        <!-- <b-form-group label="Source:" label-for="transfer-source" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-form-input size="sm" plaintext id="transfer-source" :value="account.source && (account.source.substring(0, 1).toUpperCase() + account.source.slice(1))" class="px-2 w-25"></b-form-input>
        </b-form-group> -->
        <!-- <b-form-group label="" label-for="transfer-delete" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-button size="sm" @click="deleteAddress(account.account, 'modaladdress');" variant="link" v-b-popover.hover.top="'Delete account?'"><b-icon-trash shift-v="+1" font-scale="1.1" variant="danger"></b-icon-trash></b-button>
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
          <div class="mt-0 pr-1">
            <b-button size="sm" :disabled="!coinbase" @click="syncIt({ sections: ['all'], parameters: [] })" variant="link" v-b-popover.hover.top="'Sync data from the blockchain'"><b-icon-cloud-download shift-v="+1" font-scale="1.2"></b-icon-cloud-download></b-button>
          </div>
          <div class="mt-0 pr-1">
            <b-button size="sm" :disabled="!coinbase" @click="syncIt({ sections: ['collateTransfers'], parameters: [] })" variant="link" v-b-popover.hover.top="'Dev button'"><b-icon-cloud-download shift-v="+1" font-scale="1.2" variant="info"></b-icon-cloud-download></b-button>
          </div>
          <div class="mt-0 flex-grow-1">
          </div>
          <div class="mt-0 pr-1">
            <b-button size="sm" :disabled="!coinbase" @click="newTransfer(null); " variant="link" v-b-popover.hover.top="'New Stealth Transfer'"><b-icon-caret-right shift-v="+1" font-scale="1.1"></b-icon-caret-right></b-button>
          </div>
          <div class="mt-0 flex-grow-1">
          </div>
          <div class="mt-0 pr-1">
            <b-form-select size="sm" v-model="settings.sortOption" @change="saveSettings" :options="sortOptions" v-b-popover.hover.top="'Yeah. Sort'"></b-form-select>
          </div>
          <div class="mt-0 pr-1">
            <font size="-2" v-b-popover.hover.top="'# registry entries'">{{ filteredSortedTransfers.length + '/' + totalRegistryEntries }}</font>
          </div>
          <div class="mt-0 pr-1">
            <b-pagination size="sm" v-model="settings.currentPage" @input="saveSettings" :total-rows="filteredSortedTransfers.length" :per-page="settings.pageSize" style="height: 0;"></b-pagination>
          </div>
          <div class="mt-0 pl-1">
            <b-form-select size="sm" v-model="settings.pageSize" @change="saveSettings" :options="pageSizes" v-b-popover.hover.top="'Page size'"></b-form-select>
          </div>
        </div>

        <b-table ref="transfersTable" small fixed striped responsive hover selectable select-mode="single" @row-selected='rowSelected' :fields="fields" :items="pagedFilteredSortedTransfers" show-empty head-variant="light" class="m-0 mt-1">
          <template #empty="scope">
            <h6>{{ scope.emptyText }}</h6>
            <div>
              <ul>
                <li>
                  Check you are correctly connected to the Sepolia testnet
                </li>
                <li>
                  Click <b-button size="sm" variant="link" class="m-0 p-0"><b-icon-cloud-download shift-v="+1" font-scale="1.2"></b-icon-cloud-download></b-button> above to sync this app to the blockchain
                </li>
              </ul>
            </div>
          </template>
          <template #cell(number)="data">
            {{ parseInt(data.index) + ((settings.currentPage - 1) * settings.pageSize) + 1 }}
          </template>
          <template #cell(timestamp)="data">
            <b-link :href="'https://sepolia.etherscan.io/tx/' + data.item.txHash" v-b-popover.hover.bottom="'Block #' + commify0(data.item.blockNumber) + ', txIndex: ' + data.item.txIndex + ', logIndex: ' + data.item.logIndex" target="_blank">
              <span v-if="data.item.timestamp">
                {{ formatTimestamp(data.item.timestamp) }}
              </span>
              <span v-else>
                {{ '#' + commify0(data.item.blockNumber) }}
              </span>
            </b-link>
          </template>
          <template #cell(sender)="data">
            <div v-if="data.item.tx && data.item.tx.from">
              <b-link :href="'https://sepolia.etherscan.io/address/' + data.item.tx.from" v-b-popover.hover.bottom="'View in etherscan.io'" target="_blank">
                {{ data.item.tx.from }}
              </b-link>
            </div>
          </template>
          <template #cell(receiver)="data">
            <div v-if="data.item.stealthAddress">
              <b-link :href="'https://sepolia.etherscan.io/address/' + data.item.stealthAddress" v-b-popover.hover.bottom="'View in etherscan.io'" target="_blank">
                {{ data.item.stealthAddress }}
              </b-link>
            </div>
          </template>
          <template #cell(tokens)="data">
            <b-row v-for="(item, index) of data.item.transfers" v-bind:key="item.token">
              <b-col>
                <span v-if="getTokenType(item.token) == 'eth'">
                  <font size="-1">{{ formatETH(item.value) + ' ETH'}}</font>
                </span>
                <span v-else-if="getTokenType(item.token) == 'erc20'">
                  <font size="-1">
                    {{ formatETH(item.value) }}
                    <b-link :href="chainInfo.explorerTokenPrefix + item.token" v-b-popover.hover.bottom="item.tokenId" target="_blank">{{ getTokenSymbol(item.token) }}</b-link>
                  </font>
                </span>
                <span v-else>
                  <font size="-1">
                    <b-link :href="'https://testnets.opensea.io/assets/sepolia/' + item.token + '/' + item.value" v-b-popover.hover.bottom="item.value" target="_blank">{{ item.value.toString().length > 20 ? (item.value.toString().substring(0, 8) + '...' + item.value.toString().slice(-8)) : item.value.toString() }}</b-link>
                    <b-link :href="'https://sepolia.etherscan.io/token/' + item.token" v-b-popover.hover.bottom="item.tokenId" target="_blank">{{ item.token.substring(0, 10) + '...' + item.token.slice(-8) /*getTokenSymbol(item.token)*/ }}</b-link>
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
        pageSize: 10,
        sortOption: 'registrantasc',
        version: 0,
      },
      transfer: {
        item: null,
        stealthPrivateKey: null,
      },
      sortOptions: [
        // { value: 'nameregistrantasc', text: '▲ Name, ▲ Registrant' },
        // { value: 'nameregistrantdsc', text: '▼ Name, ▲ Registrant' },
        { value: 'registrantasc', text: '▲ Registrant' },
        { value: 'registrantdsc', text: '▼ Registrant' },
      ],
      fields: [
        { key: 'number', label: '#', sortable: false, thStyle: 'width: 5%;', tdClass: 'text-truncate' },
        { key: 'timestamp', label: 'When', sortable: false, thStyle: 'width: 10%;', tdClass: 'text-truncate' },
        { key: 'sender', label: 'Sender', sortable: false, thStyle: 'width: 15%;', thClass: 'text-left', tdClass: 'text-truncate' },
        { key: 'receiver', label: 'Receiver', sortable: false, thStyle: 'width: 15%;', thClass: 'text-left', tdClass: 'text-truncate' },
        <!-- { key: 'linkedToAddress', label: 'Linked To Address', sortable: false, thStyle: 'width: 15%;', thClass: 'text-left', tdClass: 'text-truncate' }, -->
        <!-- { key: 'viaStealthMetaAddress', label: 'Via Stealth Meta-Address', sortable: false, thStyle: 'width: 15%;', thClass: 'text-left', tdClass: 'text-truncate' }, -->
        { key: 'tokens', label: 'Tokens', sortable: false, thStyle: 'width: 20%;', thClass: 'text-left', tdClass: 'text-truncate' },
      ],
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
    chainId() {
      return store.getters['connection/chainId'];
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
    transfers() {
      return store.getters['data/transfers'];
    },

    totalRegistryEntries() {
      let result = 0;
      for (const [blockNumber, logIndexes] of Object.entries(this.transfers[this.chainId] || {})) {
        for (const [logIndex, item] of Object.entries(logIndexes)) {
          result++;
        }
      }
      return result;
    },
    filteredTransfers() {
      const results = [];
      for (const [blockNumber, logIndexes] of Object.entries(this.transfers[this.chainId] || {})) {
        for (const [logIndex, item] of Object.entries(logIndexes)) {
          // console.log(blockNumber + "." + logIndex + " => " + JSON.stringify(item, null, 2));
          if (item.schemeId == 0) {
            results.push(item);
          }
        }
      }
      return results;
    },
    filteredSortedTransfers() {
      const results = this.filteredTransfers;
      if (this.settings.sortOption == 'registrantasc') {
        results.sort((a, b) => {
          return ('' + a.registrant).localeCompare(b.registrant);
        });
      } else if (this.settings.sortOption == 'registrantdsc') {
        results.sort((a, b) => {
          return ('' + b.registrant).localeCompare(a.registrant);
        });
      }
      return results;
    },
    pagedFilteredSortedTransfers() {
      logInfo("Addresses", "pagedFilteredSortedTransfers - results[0..1]: " + JSON.stringify(this.filteredSortedTransfers.slice(0, 2), null, 2));
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
      logInfo("Transfers", "methods.saveSettings - transfersSettings: " + JSON.stringify(this.settings, null, 2));
      localStorage.transfersSettings = JSON.stringify(this.settings);
    },
    async syncIt(info) {
      store.dispatch('data/syncIt', info);
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
        // if (this.settings.reportingDateTime == 1) {
          return moment.unix(ts).utc().format("YYYY-MM-DD HH:mm:ss");
        // } else {
        //   return moment.unix(ts).format("YYYY-MM-DD HH:mm:ss");
        // }
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
      logInfo("Transfers", "methods.rowSelected BEGIN: " + JSON.stringify(item, null, 2));
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

      console.log(moment().format("HH:mm:ss") + " revealTransferSpendingPrivateKey - transfer: " + JSON.stringify(this.transfer, null, 2));
      const stealthMetaAddressData = this.addresses[this.transfer.item.linkedTo.stealthMetaAddress];
      console.log(moment().format("HH:mm:ss") + " revealTransferSpendingPrivateKey - stealthMetaAddressData: " + JSON.stringify(stealthMetaAddressData, null, 2));
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
      console.log(moment().format("HH:mm:ss") + " revealTransferSpendingPrivateKey - spendingPrivateKey: " + spendingPrivateKey);
      const computedStealthKey = computeStealthKey(this.transfer.item.ephemeralPublicKey, viewingPrivateKey, spendingPrivateKey);
      const stealthPrivateKey = computedStealthKey.stealthPrivateKey;
      // Vue.set(this.transfer, 'stealthPrivateKey', stealthPrivateKey);
      this.transfer.stealthPrivateKey = stealthPrivateKey;
      console.log("this.transfer: " + JSON.stringify(this.transfer, null, 2));
    },

    async timeoutCallback() {
      logDebug("Transfers", "timeoutCallback() count: " + this.count);

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
    logDebug("Transfers", "beforeDestroy()");
  },
  mounted() {
    logDebug("Transfers", "mounted() $route: " + JSON.stringify(this.$route.params));
    store.dispatch('data/restoreState');
    if ('transfersSettings' in localStorage) {
      const tempSettings = JSON.parse(localStorage.transfersSettings);
      if ('version' in tempSettings && tempSettings.version == 0) {
        this.settings = tempSettings;
        this.settings.currentPage = 1;
      }
    }
    this.reschedule = true;
    logDebug("Transfers", "Calling timeoutCallback()");
    this.timeoutCallback();
  },
  destroyed() {
    this.reschedule = false;
  },
};

const transfersModule = {
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
      logDebug("transfersModule", "deQueue(" + JSON.stringify(state.executionQueue) + ")");
      state.executionQueue.shift();
    },
    updateParams(state, params) {
      state.params = params;
      logDebug("transfersModule", "updateParams('" + params + "')")
    },
    updateExecuting(state, executing) {
      state.executing = executing;
      logDebug("transfersModule", "updateExecuting(" + executing + ")")
    },
  },
  actions: {
  },
};
