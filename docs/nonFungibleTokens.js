const NonFungibleTokens = {
  template: `
    <div class="m-0 p-0">
      <b-card no-body no-header class="border-0">

        <!-- :MODALFAUCETS -->
        <b-modal ref="modalfaucet" id="modal-faucets" hide-footer body-bg-variant="light" size="md">
          <template #modal-title>ERC-721 Faucets</template>
          <b-form-select size="sm" v-model="modalFaucet.selectedFaucet" :options="faucetsOptions" v-b-popover.hover.bottom="'Select faucet'"></b-form-select>
          <b-button size="sm" block :disabled="!modalFaucet.selectedFaucet" @click="drip()" variant="warning" class="mt-2">Drip {{ modalFaucet.selectedFaucet && faucets.filter(e => e.address == modalFaucet.selectedFaucet)[0] ? (faucets.filter(e => e.address == modalFaucet.selectedFaucet)[0].drip + ' Tokens') : '' }}</b-button>
        </b-modal>

        <div class="d-flex flex-wrap m-0 p-0">
          <div class="mt-0 pr-1" style="width: 200px;">
            <b-form-input type="text" size="sm" v-model.trim="settings.filter" @change="saveSettings" debounce="600" v-b-popover.hover.top="'Regex filter by address, symbol or name'" placeholder="🔍 addr/symb/name regex"></b-form-input>
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
            <b-button size="sm" :pressed.sync="settings.favouritesOnly" @click="saveSettings" variant="transparent" v-b-popover.hover.bottom="'Show favourited only'"><b-icon :icon="settings.favouritesOnly ? 'heart-fill' : 'heart'" font-scale="0.95" variant="danger"></b-icon></b-button>
          </div>
          <div class="mt-0 flex-grow-1">
          </div>
          <div class="mt-0 pr-1">
            <b-button size="sm" @click="viewFaucets" variant="link" v-b-popover.hover.bottom="'Drip tokens from ERC-20 and ERC-721 faucets'"><b-icon-plus shift-v="+1" font-scale="1.0"></b-icon-plus></b-button>
          </div>
          <div class="mt-0 flex-grow-1">
          </div>
          <div v-if="sync.section == null" class="mt-0 pr-1">
            <b-button size="sm" :disabled="!coinbase" @click="viewSyncOptions" variant="link" v-b-popover.hover.top="'Sync data from the blockchain'"><b-icon-arrow-repeat shift-v="+1" font-scale="1.2"></b-icon-arrow-repeat></b-button>
          </div>
          <div v-if="sync.section != null" class="mt-1" style="width: 300px;">
            <b-progress height="1.5rem" :max="sync.total" show-progress :animated="sync.section != null" :variant="sync.section != null ? 'success' : 'secondary'" v-b-popover.hover.top="'Click the button on the right to stop. This process can be continued later'">
              <b-progress-bar :value="sync.completed">
                {{ sync.total == null ? (sync.completed + ' ' + sync.section) : (sync.completed + '/' + sync.total + ' ' + ((sync.completed / sync.total) * 100).toFixed(0) + '% ' + sync.section) }}
              </b-progress-bar>
            </b-progress>
          </div>
          <div class="ml-0 mt-1">
            <b-button v-if="sync.section != null" size="sm" @click="halt" variant="link" v-b-popover.hover.top="'Click to stop. This process can be continued later'"><b-icon-stop-fill shift-v="+1" font-scale="1.0"></b-icon-stop-fill></b-button>
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
            <font size="-2" v-b-popover.hover.top="'# tokens'">{{ filteredSortedItems.length + '/' + totalERC721Tokens }}</font>
          </div>
          <div class="mt-0 pr-1">
            <b-pagination size="sm" v-model="settings.currentPage" @input="saveSettings" :total-rows="filteredSortedItems.length" :per-page="settings.pageSize" style="height: 0;"></b-pagination>
          </div>
          <div class="mt-0 pl-1">
            <b-form-select size="sm" v-model="settings.pageSize" @change="saveSettings" :options="pageSizes" v-b-popover.hover.top="'Page size'"></b-form-select>
          </div>
        </div>

        <b-table ref="tokenContractsTable" small fixed striped responsive hover selectable select-mode="single" @row-selected='rowSelected' :fields="fields" :items="pagedFilteredSortedItems" show-empty head-variant="light" class="m-0 mt-1">
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
            <b-link v-if="chainInfo[chainId]" :href="chainInfo[chainId].nftTokenPrefix + data.item.contract + '/' + data.item.tokenId" target="_blank">
              <span v-if="data.item.name">
                <font size="-1">{{ data.item.name }}</font>
              </span>
              <span v-else>
                <font size="-1">{{ '#' + (data.item.tokenId.length > 20 ? (data.item.tokenId.substring(0, 10) + '...' + data.item.tokenId.slice(-8)) : data.item.tokenId) }}</font>
              </span>
            </b-link>
            <br />

            <b-link v-if="chainInfo[chainId]" :href="chainInfo[chainId].explorerTokenPrefix + data.item.contract + '#code'" target="_blank">
              <font size="-1">{{ data.item.collectionName }}</font>
            </b-link>
            <b-button size="sm" @click="toggleTokenContractJunk(data.item);" variant="transparent"><b-icon :icon="data.item.junk ? 'trash-fill' : 'trash'" font-scale="0.9" :variant="data.item.junk ? 'info' : 'secondary'"></b-icon></b-button>
            <b-button size="sm" :disabled="data.item.junk" @click="toggleTokenContractFavourite(data.item);" variant="transparent"><b-icon :icon="data.item.favourite & !data.item.junk ? 'heart-fill' : 'heart'" font-scale="0.9" :variant="data.item.junk ? 'dark' : 'danger'"></b-icon></b-button>
          </template>

          <template #cell(expiry)="data">
            {{ formatTimestamp(data.item.expiry) }}
          </template>

          <template #cell(attributes)="data">
            <!-- {{ data.item.attributes }} -->
            <b-row v-for="(attribute, i) in data.item.attributes"  v-bind:key="i" class="m-0 p-0">
              <b-col cols="3" class="m-0 px-2 text-right"><font size="-3">{{ attribute.trait_type }}</font></b-col>
              <b-col cols="9" class="m-0 px-2"><b><font size="-2">{{ ["Created Date", "Registration Date", "Expiration Date"].includes(attribute.trait_type) ? formatTimestamp(attribute.value) : attribute.value }}</font></b></b-col>
            </b-row>
          </template>

          <template #cell(favourite)="data">
            <b-button size="sm" @click="toggleTokenContractFavourite(data.item);" variant="transparent"><b-icon :icon="data.item.favourite ? 'heart-fill' : 'heart'" font-scale="0.9" variant="danger"></b-icon></b-button>
          </template>

          <template #cell(contract)="data">
            <b-link v-if="chainInfo[chainId]" :href="chainInfo[chainId].explorerTokenPrefix + data.item.contract + '#code'" target="_blank">
              <font size="-1">{{ data.item.contract.substring(0, 10) + '...' + data.item.contract.slice(-8) }}</font>
            </b-link>
          </template>
          <template #cell(type)="data">
            <!-- <font size="-1">{{ data.item.type == "erc20" ? "ERC-20" : "ERC-721" }}</font> -->
          </template>
          <template #cell(symbol)="data">
            <!-- <font size="-1">{{ data.item.symbol }}</font> -->
          </template>
          <template #cell(name)="data">
            <!-- <font size="-1">{{ data.item.name }}</font> -->
          </template>
          <template #cell(firstEventBlockNumber)="data">
            <!-- <font size="-1">{{ commify0(data.item.firstEventBlockNumber) }}</font> -->
          </template>
          <template #cell(lastEventBlockNumber)="data">
            <!-- <font size="-1">{{ commify0(data.item.lastEventBlockNumber) }}</font> -->
          </template>
          <template #cell(decimals)="data">
            <!-- <font size="-1">{{ data.item.type == "erc20" ? parseInt(data.item.decimals) : "" }}</font> -->
          </template>
          <template #cell(balance)="data">
            <!-- <span v-if="data.item.balances[coinbase] && data.item.type == 'erc20'">
              <b-button size="sm" :href="'https://sepolia.etherscan.io/token/' + data.item.address + '?a=' + coinbase" variant="link" class="m-0 ml-2 p-0" target="_blank">{{ formatDecimals(data.item.balances[coinbase], data.item.decimals || 0) }}</b-button>
            </span>
            <span v-if="data.item.type == 'erc721'">
              <font size="-1">
                <span v-for="(tokenData, tokenId) of data.item.tokenIds">
                  <b-button v-if="chainInfo[chainId]" size="sm" :href="chainInfo[chainId].nftTokenPrefix + data.item.address + '/' + tokenId" variant="link" v-b-popover.hover.bottom="tokenId" class="m-0 ml-2 p-0" target="_blank">{{ tokenId.toString().length > 20 ? (tokenId.toString().substring(0, 8) + '...' + tokenId.toString().slice(-8)) : tokenId.toString() }}</b-button>
                </span>
              </font>
            </span> -->
          </template>

          <template #cell(totalSupply)="data">
            <font size="-1">{{ data.item.type == "erc20" ? formatDecimals(data.item.totalSupply, data.item.decimals || 0) : data.item.totalSupply }}</font>
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
        junkFilter: null,
        favouritesOnly: false,
        currentPage: 1,
        pageSize: 10,
        sortOption: 'registrantasc',
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
    powerOn() {
      return store.getters['connection/powerOn'];
    },
    coinbase() {
      return store.getters['connection/coinbase'];
    },
    chainId() {
      return store.getters['connection/chainId'];
    },
    chainInfo() {
      return store.getters['config/chainInfo'];
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
    tokens() {
      return store.getters['data/tokens'];
    },
    contractMetadata() {
      return store.getters['data/contractMetadata'];
    },
    tokenMetadata() {
      return store.getters['data/tokenMetadata'];
    },
    tokenContracts() {
      return store.getters['data/tokenContracts'];
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
      for (const [address, data] of Object.entries(this.tokens[this.chainId] || {})) {
        if (data.type == "erc721" || data.type == "erc1155") {
          result += Object.keys(data.tokenIds).length;
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
      for (const [contract, data] of Object.entries(this.tokens[this.chainId] || {})) {
        const contractMetadata = this.contractMetadata[this.chainId] && this.contractMetadata[this.chainId][contract] || {};
        // console.log(contract + " => " + JSON.stringify(contractMetadata, null, 2));
        // console.log("  metadata: " + JSON.stringify(metadata, null, 2));
        if (data.type == "erc721" || data.type == "erc1155") {
          // console.log(contract + " => " + JSON.stringify(data, null, 2));
          const collectionName = contractMetadata.name;
          for (const [tokenId, tokenData] of Object.entries(data.tokenIds)) {
            // console.log(contract + "/" + tokenId + " => " + JSON.stringify(tokenData, null, 2));
            const metadata = this.tokenMetadata[this.chainId] && this.tokenMetadata[this.chainId][contract] && this.tokenMetadata[this.chainId][contract][tokenId] || {};
            // console.log("  metadata: " + JSON.stringify(metadata, null, 2));
            // const metadata = this.contractMetadata[this.chainId] &&
            //   this.contractMetadata[this.chainId][contract] &&
            //   this.contractMetadata[this.chainId][contract][tokenId] ||
            //   {};

            let include = true;
            // if (this.settings.junkFilter) {
            //   if (this.settings.junkFilter == 'junk' && !data.junk) {
            //     include = false;
            //   } else if (this.settings.junkFilter == 'excludejunk' && data.junk) {
            //     include = false;
            //   }
            // }
            // if (include && this.settings.favouritesOnly && (!data.favourite || data.junk)) {
            //   include = false;
            // }
            if (include && regex) {
              const name = metadata.name || null;
              const description = metadata.description || null;
              if (!(regex.test(collectionName) || regex.test(name) || regex.test(description))) {
                include = false;
              }
            }
            if (include) {
              results.push({
                contract,
                junk: data.junk,
                favourite: data.favourite,
                collectionSymbol: contractMetadata.symbol,
                collectionName: contractMetadata.name,
                totalSupply: data.totalSupply,
                tokenId,
                owner: tokenData.owner,
                name: metadata.name || null,
                description: metadata.description || null,
                expiry: metadata.expiry || undefined,
                attributes: metadata.attributes || null,
                // imageSource: metadata.imageSource || null,
                image: metadata.image || null,
                // blockNumber: tokenData.blockNumber,
                // logIndex: tokenData.logIndex,
              });
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
      // logInfo("NonFungibleTokens", "pagedFilteredSortedItems - results[0..1]: " + JSON.stringify(this.filteredSortedItems.slice(0, 2), null, 2));
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

    toggleTokenContractJunk(item) {
      logInfo("NonFungibleTokens", ".methods.toggleTokenContractJunk - item: " + JSON.stringify(item, null, 2));
      store.dispatch('data/toggleTokenContractJunk', item);
    },
    toggleTokenContractFavourite(item) {
      logInfo("NonFungibleTokens", ".methods.toggleTokenContractFavourite - item: " + JSON.stringify(item, null, 2));
      store.dispatch('data/toggleTokenContractFavourite', item);
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
      logInfo("NonFungibleTokens", "methods.saveSettings - erc721sSettings: " + JSON.stringify(this.settings, null, 2));
      localStorage.erc721sSettings = JSON.stringify(this.settings);
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
      logInfo("NonFungibleTokens", "methods.rowSelected BEGIN: " + JSON.stringify(item, null, 2));
      if (item && item.length > 0) {
        store.dispatch('viewToken/viewToken', { address: item[0].address, tokenId: item[0].tokenId });
        this.$refs.tokenContractsTable.clearSelected();
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
      logDebug("NonFungibleTokens", "timeoutCallback() count: " + this.count);

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
    logDebug("NonFungibleTokens", "beforeDestroy()");
  },
  mounted() {
    logDebug("NonFungibleTokens", "mounted() $route: " + JSON.stringify(this.$route.params));
    store.dispatch('data/restoreState');
    if ('erc721sSettings' in localStorage) {
      const tempSettings = JSON.parse(localStorage.erc721sSettings);
      if ('version' in tempSettings && tempSettings.version == 0) {
        this.settings = tempSettings;
        this.settings.currentPage = 1;
      }
    }
    this.reschedule = true;
    logDebug("NonFungibleTokens", "Calling timeoutCallback()");
    this.timeoutCallback();
  },
  destroyed() {
    this.reschedule = false;
  },
};

const nonFungibleTokensModule = {
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
      logDebug("nonFungibleTokensModule", "deQueue(" + JSON.stringify(state.executionQueue) + ")");
      state.executionQueue.shift();
    },
    updateParams(state, params) {
      state.params = params;
      logDebug("nonFungibleTokensModule", "updateParams('" + params + "')")
    },
    updateExecuting(state, executing) {
      state.executing = executing;
      logDebug("nonFungibleTokensModule", "updateExecuting(" + executing + ")")
    },
  },
  actions: {
  },
};
