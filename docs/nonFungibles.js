const NonFungibles = {
  template: `
    <div class="m-0 p-0">
      <b-card no-body no-header class="border-0">
        <!-- <b-icon-eye-slash shift-v="+1" font-scale="1.0"></b-icon-eye-slash> -->
        <!-- <b-icon-eye-slash-fill shift-v="+1" font-scale="1.0"></b-icon-eye-slash-fill> -->

        <!-- :MODALFAUCETS -->
        <b-modal ref="modalfaucet" id="modal-faucets" hide-footer body-bg-variant="light" size="md">
          <template #modal-title>ERC-721 Faucets</template>
          <b-form-select size="sm" v-model="modalFaucet.selectedFaucet" :options="faucetsOptions" v-b-popover.hover="'Select faucet'"></b-form-select>
          <b-button size="sm" block :disabled="!modalFaucet.selectedFaucet" @click="drip()" variant="warning" class="mt-2">Drip {{ modalFaucet.selectedFaucet && faucets.filter(e => e.address == modalFaucet.selectedFaucet)[0] ? (faucets.filter(e => e.address == modalFaucet.selectedFaucet)[0].drip + ' Tokens') : '' }}</b-button>
        </b-modal>

        <div class="d-flex flex-wrap m-0 p-0">
          <div class="mt-0 pr-1" style="width: 200px;">
            <b-form-input type="text" size="sm" v-model.trim="settings.filter" @change="saveSettings" debounce="600" v-b-popover.hover="'Regex filter by name, description or tokenId'" placeholder="🔍 name/desc/id regex"></b-form-input>
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
            <font size="-2" v-b-popover.hover="'# tokens / total tokens transferred'">{{ filteredSortedItems.length + '/' + totalERC721Tokens }}</font>
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

          <template #head(number)="data">
            <b-dropdown size="sm" variant="link" v-b-popover.hover="'Toggle selection'">
              <template #button-content>
                <b-icon-check-square shift-v="+1" font-scale="0.9"></b-icon-check-square>
              </template>
              <b-dropdown-item href="#" @click="toggleSelected(pagedFilteredSortedItems)">Toggle selection for all tokens on this page</b-dropdown-item>
              <!-- <b-dropdown-item href="#" @click="toggleSelected(filteredSortedAccounts)">Toggle selection for all tokens on all pages</b-dropdown-item> -->
              <b-dropdown-item href="#" @click="clearSelected()">Clear selection</b-dropdown-item>
              <b-dropdown-divider></b-dropdown-divider>
              <b-dropdown-item href="#" @click="refreshSelectedNonFungibles()"><b-icon-cloud-download shift-v="+1" font-scale="1.1" variant="primary"></b-icon-cloud-download> Refresh metadata for selected tokens from Reservoir</b-dropdown-item>
              <b-dropdown-item href="#" @click="requestSelectedReservoirMetadataRefresh()" v-b-popover.hover="'Use this if Reservoir does not have the correct metadata. Wait a few minutes then repeat selection above'"><b-icon-cloud-fill shift-v="+1" font-scale="1.1" variant="primary"></b-icon-cloud-fill> Request Reservoir API to refresh their metadata for selected tokens</b-dropdown-item>
            </b-dropdown>
          </template>

          <template #cell(number)="data">
            <b-form-checkbox size="sm" :checked="settings.selected[data.item.contract] && settings.selected[data.item.contract][data.item.tokenId]" @change="toggleSelected([data.item])">
              {{ parseInt(data.index) + ((settings.currentPage - 1) * settings.pageSize) + 1 }}
            </b-form-checkbox>
          </template>

          <!-- <b-avatar button @click="toggleTrait(layer, trait.value)" rounded size="7rem" :src="getSVG(layer, trait.value)">
            <template v-if="selectedTraits[layer] && selectedTraits[layer][trait.value]" #badge><b-icon icon="check"></b-icon></template>
          </b-avatar> -->

          <template #cell(image)="data">
            <!-- <b-avatar v-if="data.item.image" button rounded fluid size="7rem" :src="data.item.image"> -->
              <!-- <template v-if="selectedTraits[layer] && selectedTraits[layer][trait.value]" #badge><b-icon icon="check"></b-icon></template> -->
            <!-- </b-avatar> -->
            <b-img v-if="data.item.image" button rounded fluid size="7rem" :src="data.item.image">
            </b-img>
          </template>

          <template #cell(info)="data">
            <b-link v-if="networkSupported" :href="nonFungibleViewerURL(data.item.contract, data.item.tokenId)" target="_blank">
              <span v-if="data.item.name">
                <font size="-1">{{ data.item.name }}</font>
              </span>
              <span v-else>
                <font size="-1">{{ '#' + (data.item.tokenId.length > 20 ? (data.item.tokenId.substring(0, 10) + '...' + data.item.tokenId.slice(-8)) : data.item.tokenId) }}</font>
              </span>
            </b-link>
            <br />
            <font size="-1">{{ data.item.description }}</font>
            <br />
            <font size="-1">
              <b-badge variant="light">
                {{ data.item.type == "erc721" ? "ERC-721" : "ERC-1155" }}
              </b-badge>
            </font>
            <b-button size="sm" @click="toggleNonFungibleJunk(data.item);" variant="transparent" v-b-popover.hover="data.item.junk ? 'Junk collection' : 'Not junk collection'" class="m-0 ml-1 p-0">
              <b-icon :icon="data.item.junk ? 'trash-fill' : 'trash'" font-scale="1.2" :variant="data.item.junk ? 'primary' : 'secondary'">
              </b-icon>
            </b-button>
            <b-button size="sm" :disabled="data.item.junk" @click="toggleNonFungibleActive(data.item);" variant="transparent" v-b-popover.hover="data.item.active ? 'Token active' : 'Token inactive'" class="m-0 ml-1 p-0">
              <b-icon :icon="data.item.active & !data.item.junk ? 'check-circle-fill' : 'check-circle'" font-scale="1.2" :variant="(data.item.junk || !data.item.active) ? 'secondary' : 'primary'">
              </b-icon>
            </b-button>
          </template>

          <template #cell(expiry)="data">
            <font size="-1">{{ formatTimestamp(data.item.expiry) }}</font>
          </template>

          <template #cell(owners)="data">
            <div v-for="(info, i) in data.item.owners"  v-bind:key="i" class="m-0 p-0">
              <b-link v-if="networkSupported" :href="explorer + 'token/' + data.item.contract + '?a=' + info.owner" target="_blank">
                <font size="-1">
                  {{ info.owner.substring(0, 10) + '...' + info.owner.slice(-8) }}
                  <span v-if="data.item.type == 'erc1155'" class="small muted">
                    {{ 'x' + info.count }}
                  </span>
                </font>
              </b-link>
            </div>
          </template>

          <template #cell(attributes)="data">
            <b-row v-for="(attribute, i) in data.item.attributes" v-bind:key="i" class="m-0 p-0">
              <b-col cols="3" class="m-0 px-2 text-right"><font size="-3">{{ attribute.trait_type }}</font></b-col>
              <b-col cols="9" class="m-0 px-2"><b><font size="-2">{{ ["Created Date", "Registration Date", "Expiration Date"].includes(attribute.trait_type) ? formatTimestamp(attribute.value) : attribute.value }}</font></b></b-col>
            </b-row>
          </template>

          <!-- <template #cell(favourite)="data"> -->
            <!-- <b-button size="sm" @click="toggleNonFungibleActive(data.item);" variant="transparent"><b-icon :icon="data.item.favourite ? 'heart-fill' : 'heart'" font-scale="0.9" variant="danger"></b-icon></b-button> -->
          <!-- </template> -->
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
        selected: {},
        currentPage: 1,
        pageSize: 10,
        sortOption: 'registrantasc',
        version: 2,
      },
      transfer: {
        item: null,
        stealthPrivateKey: null,
      },
      modalFaucet: {
        selectedFaucet: null,
      },
      sortOptions: [
        // { value: 'nameregistrantasc', text: '▲ Name, ▲ Registrant' },
        // { value: 'nameregistrantdsc', text: '▼ Name, ▲ Registrant' },
        { value: 'registrantasc', text: '▲ Registrant' },
        { value: 'registrantdsc', text: '▼ Registrant' },
      ],
      // fields: [
      //   { key: 'number', label: '#', sortable: false, thStyle: 'width: 5%;', tdClass: 'text-truncate' },
      //   { key: 'timestamp', label: 'When', sortable: false, thStyle: 'width: 10%;', tdClass: 'text-truncate' },
      //   { key: 'sender', label: 'Sender', sortable: false, thStyle: 'width: 15%;', thClass: 'text-left', tdClass: 'text-truncate' },
      //   { key: 'receiver', label: 'Receiver', sortable: false, thStyle: 'width: 15%;', thClass: 'text-left', tdClass: 'text-truncate' },
      //   { key: 'tokens', label: 'Tokens', sortable: false, thStyle: 'width: 20%;', thClass: 'text-left', tdClass: 'text-truncate' },
      // ],
      fields: [
        { key: 'number', label: '#', sortable: false, thStyle: 'width: 5%;', tdClass: 'text-truncate' },
        { key: 'image', label: 'Image', sortable: false, thStyle: 'width: 10%;', thClass: 'text-right', tdClass: 'text-right' },
        { key: 'info', label: 'Info', sortable: false, thStyle: 'width: 40%;', thClass: 'text-left', tdClass: 'text-truncate' },
        { key: 'expiry', label: 'Expiry', sortable: false, thStyle: 'width: 15%;', thClass: 'text-left', tdClass: 'text-truncate' },
        { key: 'owners', label: 'Owner(s)', sortable: false, thStyle: 'width: 15%;', thClass: 'text-left', tdClass: 'text-truncate' },
        { key: 'attributes', label: 'Attributes', sortable: false, thStyle: 'width: 30%;', thClass: 'text-left', tdClass: 'text-truncate' },
        // { key: 'favourite', label: '', sortable: false, thStyle: 'width: 3%;', thClass: 'text-right', tdClass: 'text-right' },
        // { key: 'contract', label: 'Contract', sortable: false, thStyle: 'width: 16%;', thClass: 'text-left', tdClass: 'text-truncate' },
        // { key: 'type', label: 'Type', sortable: false, thStyle: 'width: 7%;', thClass: 'text-left', tdClass: 'text-truncate' },
        // { key: 'symbol', label: 'Symbol', sortable: false, thStyle: 'width: 10%;', thClass: 'text-left', tdClass: 'text-truncate' },
        // { key: 'name', label: 'Name', sortable: false, thStyle: 'width: 20%;', thClass: 'text-left', tdClass: 'text-truncate' },
        // { key: 'firstEventBlockNumber', label: 'First Ev#', sortable: false, thStyle: 'width: 10%;', thClass: 'text-right', tdClass: 'text-right' },
        // { key: 'lastEventBlockNumber', label: 'Last Ev#', sortable: false, thStyle: 'width: 10%;', thClass: 'text-right', tdClass: 'text-right' },
        // { key: 'decimals', label: 'Decs', sortable: false, thStyle: 'width: 5%;', thClass: 'text-right', tdClass: 'text-right' },
        // { key: 'balance', label: 'Balance', sortable: false, thStyle: 'width: 20%;', thClass: 'text-right', tdClass: 'text-right' },
        // { key: 'totalSupply', label: 'Total Supply', sortable: false, thStyle: 'width: 20%;', thClass: 'text-right', tdClass: 'text-right' },
      ],
    }
  },
  computed: {
    coinbase() {
      return store.getters['connection/coinbase'];
    },
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
    nonFungibleViewer() {
      return store.getters['connection/nonFungibleViewer'];
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
          if (item.type == "erc721") {
            results.push({
              value: item.address,
              text: item.drip + " x " + (item.type == "erc20" ? "ERC-20 " : "ERC-721 ") + item.symbol + ' ' + item.name + (item.type == "erc20" ? " (" + item.decimals + " dp)" : "") + ' @ ' + item.address.substring(0, this.ADDRESS_SEGMENT_LENGTH + 2) + '...' + item.address.slice(-this.ADDRESS_SEGMENT_LENGTH),
            });
          }
        }
      }
      return results;
    },

    totalERC721Tokens() {
      let result = (store.getters['data/forceRefresh'] % 2) == 0 ? 0 : 0;
      for (const [address, data] of Object.entries(this.balances[this.chainId] || {})) {
        if (data.type == "erc721" || data.type == "erc1155") {
          result += Object.keys(data.tokens).length;
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
      const selectedAddressesMap = {};
      for (const [address, addressData] of Object.entries(this.addresses)) {
        if (address.substring(0, 2) == "0x" && addressData.type == "address" && !addressData.junk && addressData.watch) {
          selectedAddressesMap[address] = true;
        }
      }
      // console.log("selectedAddressesMap: " + Object.keys(selectedAddressesMap));

      for (const [contract, data] of Object.entries(this.balances[this.chainId] || {})) {
        // console.log(contract + " => " + JSON.stringify(data));
        // console.log("  metadata: " + JSON.stringify(metadata, null, 2));
        if (data.type == "erc721" || data.type == "erc1155") {
          // console.log(contract + " => " + JSON.stringify(data, null, 2));
          for (const [tokenId, tokenData] of Object.entries(data.tokens)) {
            // console.log(contract + "/" + tokenId + " => " + JSON.stringify(tokenData, null, 2));
            const junk = this.tokens[this.chainId] && this.tokens[this.chainId][contract] && this.tokens[this.chainId][contract].junk || false;
            const metadata = this.tokens[this.chainId] && this.tokens[this.chainId][contract] && this.tokens[this.chainId][contract].tokens[tokenId] || {};
            // console.log("  metadata: " + JSON.stringify(metadata, null, 2));

            let include = true;
            if (this.settings.junkFilter) {
              if (this.settings.junkFilter == 'junk' && !junk) {
                include = false;
              } else if (this.settings.junkFilter == 'excludejunk' && junk) {
                include = false;
              }
            }
            if (include && this.settings.activeOnly && (!metadata.active || junk)) {
              include = false;
            }
            if (include && regex) {
              const name = metadata.name || null;
              const description = metadata.description || null;
              if (!(regex.test(tokenId) || regex.test(name) || regex.test(description))) {
                include = false;
              }
            }
            if (include) {
              // console.log(contract + "/" + tokenId + " => " + JSON.stringify(tokenData));
              let image = null;
              if (metadata.image) {
                if (metadata.image.substring(0, 12) == "ipfs://ipfs/") {
                  image = "https://ipfs.io/" + metadata.image.substring(7)
                } else if (metadata.image.substring(0, 7) == "ipfs://") {
                  image = "https://ipfs.io/ipfs/" + metadata.image.substring(7);
                } else {
                  image = metadata.image;
                }
              }
              const owners = [];
              if (data.type == "erc721") {
                if (tokenData in selectedAddressesMap) {
                  owners.push({ owner: tokenData });
                }
              } else {
                for (const [owner, count] of Object.entries(tokenData)) {
                  if (owner in selectedAddressesMap) {
                    owners.push({ owner, count });
                  }
                }
              }
              if (owners.length > 0) {
                results.push({
                  chainId: this.chainId,
                  contract,
                  type: data.type,
                  junk,
                  active: metadata.active,
                  totalSupply: data.totalSupply,
                  tokenId,
                  owners,
                  name: metadata.name || null,
                  description: metadata.description || null,
                  expiry: metadata.expiry || undefined,
                  attributes: metadata.attributes || null,
                  // imageSource: metadata.imageSource || null,
                  image,
                  // blockNumber: tokenData.blockNumber,
                  // logIndex: tokenData.logIndex,
                });
              }
            }
          }
        }
      }
      return results;
    },
    filteredSortedItems() {
      const results = this.filteredItems;
      // if (this.settings.sortOption == 'registrantasc') {
      //   results.sort((a, b) => {
      //     return ('' + a.registrant).localeCompare(b.registrant);
      //   });
      // } else if (this.settings.sortOption == 'registrantdsc') {
      //   results.sort((a, b) => {
      //     return ('' + b.registrant).localeCompare(a.registrant);
      //   });
      // }
      return results;
    },
    pagedFilteredSortedItems() {
      // logInfo("NonFungibles", "pagedFilteredSortedItems - results[0..1]: " + JSON.stringify(this.filteredSortedItems.slice(0, 2), null, 2));
      return this.filteredSortedItems.slice((this.settings.currentPage - 1) * this.settings.pageSize, this.settings.currentPage * this.settings.pageSize);
    },

  },
  methods: {
    nonFungibleViewerURL(contract, tokenId) {
      return this.nonFungibleViewer.replace(/\${contract}/, contract).replace(/\${tokenId}/, tokenId);
    },
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

    toggleNonFungibleJunk(item) {
      logInfo("NonFungibles", "methods.toggleNonFungibleJunk - item: " + JSON.stringify(item, null, 2));
      store.dispatch('data/toggleNonFungibleJunk', item);
    },
    toggleNonFungibleActive(item) {
      logInfo("NonFungibles", "methods.toggleNonFungibleActive - item: " + JSON.stringify(item, null, 2));
      store.dispatch('data/toggleNonFungibleActive', item);
    },

    toggleSelected(items) {
      logInfo("NonFungibles", "methods.toggleSelected - items: " + JSON.stringify(items, null, 2));
      let someFalse = false;
      let someTrue = false;
      for (const item of items) {
        if (this.settings.selected[item.contract] && this.settings.selected[item.contract][item.tokenId]) {
          someTrue = true;
        } else {
          someFalse = true;
        }
      }
      for (const item of items) {
        if (!(someTrue && !someFalse)) {
          if (!(item.contract in this.settings.selected)) {
            Vue.set(this.settings.selected, item.contract, {});
          }
          if (!(item.tokenId in this.settings.selected[item.contract])) {
            Vue.set(this.settings.selected[item.contract], item.tokenId, true);
          }
        } else {
          Vue.delete(this.settings.selected[item.contract], item.tokenId);
          if (Object.keys(this.settings.selected[item.contract]) == 0) {
            Vue.delete(this.settings.selected, item.contract);
          }
        }
      }
      logInfo("NonFungibles", "methods.toggleSelected - this.settings.selected: " + JSON.stringify(this.settings.selected, null, 2));
      this.saveSettings();
    },
    clearSelected() {
      this.settings.selected = {};
      this.saveSettings();
    },
    refreshSelectedNonFungibles() {
      logInfo("NonFungibles", "methods.refreshSelectedNonFungibles");
      const selectedTokens = [];
      for (const token of this.pagedFilteredSortedItems) {
        console.log(JSON.stringify(token));
        if (this.settings.selected[token.contract] && this.settings.selected[token.contract][token.tokenId]) {
          selectedTokens.push(token);
        }
      }
      logInfo("NonFungibles", "methods.refreshSelectedNonFungibles - selectedTokens: " + JSON.stringify(selectedTokens));
      store.dispatch('data/refreshNonFungibleMetadata', selectedTokens);
    },
    requestSelectedReservoirMetadataRefresh() {
      logInfo("NonFungibles", "methods.requestSelectedReservoirMetadataRefresh");
      const selectedTokens = [];
      for (const token of this.pagedFilteredSortedItems) {
        console.log(JSON.stringify(token));
        if (this.settings.selected[token.contract] && this.settings.selected[token.contract][token.tokenId]) {
          selectedTokens.push(token);
        }
      }
      logInfo("NonFungibles", "methods.requestSelectedReservoirMetadataRefresh - selectedTokens: " + JSON.stringify(selectedTokens));
      store.dispatch('data/requestReservoirMetadataRefresh', selectedTokens);
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
      logInfo("NonFungibles", "methods.saveSettings - nonFungiblesSettings: " + JSON.stringify(this.settings, null, 2));
      localStorage.nonFungiblesSettings = JSON.stringify(this.settings);
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
      logInfo("NonFungibles", "methods.rowSelected BEGIN: " + JSON.stringify(item, null, 2));
      if (item && item.length > 0) {
        store.dispatch('viewNonFungible/viewNonFungible', { contract: item[0].contract, tokenId: item[0].tokenId });
        this.$refs.tokenContractsTable.clearSelected();
      }
    },


    async timeoutCallback() {
      logDebug("NonFungibles", "timeoutCallback() count: " + this.count);

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
    logDebug("NonFungibles", "beforeDestroy()");
  },
  mounted() {
    logDebug("NonFungibles", "mounted() $route: " + JSON.stringify(this.$route.params));
    store.dispatch('data/restoreState');
    if ('nonFungiblesSettings' in localStorage) {
      const tempSettings = JSON.parse(localStorage.nonFungiblesSettings);
      if ('version' in tempSettings && tempSettings.version == this.settings.version) {
        this.settings = tempSettings;
        this.settings.currentPage = 1;
      }
    }
    this.reschedule = true;
    logDebug("NonFungibles", "Calling timeoutCallback()");
    this.timeoutCallback();
  },
  destroyed() {
    this.reschedule = false;
  },
};

const nonFungiblesModule = {
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
      logDebug("nonFungiblesModule", "deQueue(" + JSON.stringify(state.executionQueue) + ")");
      state.executionQueue.shift();
    },
    updateParams(state, params) {
      state.params = params;
      logDebug("nonFungiblesModule", "updateParams('" + params + "')")
    },
    updateExecuting(state, executing) {
      state.executing = executing;
      logDebug("nonFungiblesModule", "updateExecuting(" + executing + ")")
    },
  },
  actions: {
  },
};
