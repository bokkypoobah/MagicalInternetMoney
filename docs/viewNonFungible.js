const ViewNonFungible = {
  template: `
    <div>
      <b-modal ref="viewtoken" v-model="show" hide-footer header-class="m-0 px-3 py-2" body-bg-variant="light" size="xl">
        <template #modal-title>
          <div v-if="contract == '0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85'">
            ERC-721 ENS Name
          </div>
          <div v-else-if="contract == '0xD4416b13d2b3a9aBae7AcD5D6C2BbDBE25686401'">
            ERC-1155 Wrapped ENS Name
          </div>
          <div v-else>
            {{ type == "erc721" ? 'ERC-721' : 'ERC-1155'}} Non-Fungible Token
          </div>
        </template>

        <b-row>
          <b-col>
            <b-form-group label="Contract:" label-for="token-contract" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
              <b-input-group size="sm" class="w-100">
                <b-form-input size="sm" plaintext id="token-contract" v-model.trim="contract" class="px-2"></b-form-input>
                <b-input-group-append>
                  <div>
                    <b-button v-if="networkSupported" size="sm" :href="explorer + 'token/' + contract" variant="link" v-b-popover.hover="'View in explorer'" target="_blank" class="m-0 ml-1 p-0"><b-icon-link45deg shift-v="+1" font-scale="0.95"></b-icon-link45deg></b-button>
                  </div>
                </b-input-group-append>
              </b-input-group>
            </b-form-group>

            <b-form-group label="Token Id:" label-for="token-tokenid" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
              <b-input-group size="sm" class="w-100">
                <component size="sm" plaintext :is="tokenId && tokenId.length > 30 ? 'b-form-textarea' : 'b-form-input'" v-model="tokenId" rows="2" max-rows="3" class="px-2" />
                <b-input-group-append>
                  <div>
                    <b-button v-if="networkSupported" size="sm" :href="nonFungibleViewerURL(contract, tokenId)" variant="link" v-b-popover.hover="'View in NFT explorer'" target="_blank" class="m-0 ml-1 p-0"><b-icon-link45deg shift-v="+1" font-scale="0.95"></b-icon-link45deg></b-button>
                  </div>
                </b-input-group-append>
              </b-input-group>
            </b-form-group>

            <b-form-group v-if="expiry" label="Expiry:" label-for="token-expiry" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
              <b-form-input size="sm" plaintext id="token-expiry" :value="formatTimestamp(expiry)" class="px-2 w-100"></b-form-input>
            </b-form-group>
          </b-col>
          <b-col>
            <b-form-group label="Name:" label-for="token-name" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
              <b-form-input size="sm" plaintext id="token-name" :value="name" class="px-2 w-100"></b-form-input>
            </b-form-group>

            <b-form-group label="Description:" label-for="token-description" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
              <component size="sm" plaintext :is="description && description.length > 60 ? 'b-form-textarea' : 'b-form-input'" :value="description" rows="3" max-rows="10" class="px-2" />
            </b-form-group>

            <b-form-group label="" label-for="token-refreshnonfungiblemetadata" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
              <b-button size="sm" :disabled="sync.section != null" @click="refreshNonFungibleMetadata();" variant="link" v-b-popover.hover.top="'Refresh Non-Fungible token metadata from Reservoir'"><b-icon-cloud-download shift-v="+1" font-scale="1.1" variant="primary"></b-icon-cloud-download></b-button>
              <b-button size="sm" :disabled="sync.section != null" @click="requestReservoirMetadataRefresh();" variant="link" v-b-popover.hover.top="'Request Reservoir API to refresh their metadata. Use this if Reservoir does not have the correct metadata. Wait a few minutes then repeat refresh to the left'"><b-icon-cloud-fill shift-v="+1" font-scale="1.1" variant="primary"></b-icon-cloud-fill></b-button>
            </b-form-group>
          </b-col>
        </b-row>
        <b-row>
          <b-col>
            <b-form-group label="Image:" label-for="token-image" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
              <!-- <b-avatar v-if="image" button rounded size="15rem" :src="image" class="m-2"> -->
                <!-- <template v-if="selectedTraits[layer] && selectedTraits[layer][trait.value]" #badge><b-icon icon="check"></b-icon></template> -->
              <!-- </b-avatar> -->

              <b-img v-if="image" button rounded fluid size="15rem" :src="image" class="m-2" style="width: 300px;">
                <!-- <template v-if="selectedTraits[layer] && selectedTraits[layer][trait.value]" #badge><b-icon icon="check"></b-icon></template> -->
              </b-img>


              <!-- <b-img v-if="data.item.image" button rounded fluid size="7rem" :src="data.item.image">
              </b-img> -->

            </b-form-group>
          </b-col>
          <b-col>
          <b-form-group label="Attributes:" label-for="token-image" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
            <b-row v-for="(attribute, i) in attributes" v-bind:key="i" class="m-0 p-0">
              <b-col cols="3" class="m-0 px-2 text-right"><font size="-3">{{ attribute.trait_type }}</font></b-col>
              <b-col cols="9" class="m-0 px-2"><b><font size="-2">{{ ["Created Date", "Registration Date", "Expiration Date"].includes(attribute.trait_type) ? formatTimestamp(attribute.value) : attribute.value }}</font></b></b-col>
            </b-row>
          </b-form-group>
          </b-col>
        </b-row>






        <b-form-group v-if="false" label="" label-for="token-delete" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-button size="sm" @click="deleteAddress(contract);" variant="link" v-b-popover.hover.top="'Delete address ' + contract.substring(0, 8) + '...' + contract.slice(-6) + '?'"><b-icon-trash shift-v="+1" font-scale="1.1" variant="danger"></b-icon-trash></b-button>
        </b-form-group>

        <font size="-2">
          <b-table small fixed striped responsive hover :fields="eventFields" :items="filteredSortedEvents" show-empty head-variant="light" class="m-0 mt-1">
            <template #cell(number)="data">
              {{ parseInt(data.index) + 1 }}
            </template>
            <template #cell(when)="data">
              <span v-if="data.item.timestamp">
                <b-link v-if="networkSupported" :href="explorer + 'tx/' + data.item.txHash" target="_blank">
                  {{ formatTimestamp(data.item.timestamp) }}
                </b-link>
              </span>
              <span v-else>
                <b-link v-if="networkSupported" :href="explorer + 'tx/' + data.item.txHash" target="_blank">
                  {{ data.item.blockNumber + ':' + data.item.txIndex + ':' + data.item.logIndex }}
                </b-link>
              </span>
            </template>
            <template #cell(contract)="data">
              <b-link v-if="networkSupported" :href="explorer + 'address/' + data.item.contract" v-b-popover.hover.top="data.item.contract" target="_blank">
                {{ names[data.item.contract] || (data.item.contract.substring(0, 8) + '...' + data.item.contract.slice(-6)) }}
              </b-link>
            </template>
            <template #cell(info)="data">
              <span v-if="data.item.type == 'Transfer'">
                <b-link v-if="networkSupported" :href="explorer + 'address/' + data.item.from" target="_blank">
                  {{ names[data.item.from] || (data.item.from.substring(0, 8) + '...' + data.item.from.slice(-6)) }}
                </b-link>
                to
                <b-link v-if="networkSupported" :href="explorer + 'address/' + data.item.to" target="_blank">
                  {{ names[data.item.to] || (data.item.to.substring(0, 8) + '...' + data.item.to.slice(-6)) }}
                </b-link>
              </span>
              <span v-else-if="data.item.type == 'TransferSingle'">
                <b-link v-if="networkSupported" :href="explorer + 'address/' + data.item.from" target="_blank">
                  {{ names[data.item.from] || (data.item.from.substring(0, 8) + '...' + data.item.from.slice(-6)) }}
                </b-link>
                to
                <b-link v-if="networkSupported" :href="explorer + 'address/' + data.item.to" target="_blank">
                  {{ names[data.item.to] || (data.item.to.substring(0, 8) + '...' + data.item.to.slice(-6)) }}
                </b-link>
              </span>
              <span v-else-if="data.item.type == 'NewOwner'">
                <b-link v-if="networkSupported" :href="explorer + 'address/' + data.item.owner" target="_blank">
                  {{ names[data.item.owner] || (data.item.owner.substring(0, 8) + '...' + data.item.owner.slice(-6)) }}
                </b-link>
              </span>
              <span v-else-if="data.item.type == 'NewResolver'">
                <b-link v-if="networkSupported" :href="explorer + 'address/' + data.item.resolver" target="_blank">
                  {{ names[data.item.resolver] || (data.item.resolver.substring(0, 8) + '...' + data.item.resolver.slice(-6)) }}
                </b-link>
              </span>
              <span v-else-if="data.item.type == 'NameRegistered'">
                <span v-if="data.item.label">
                  Label: {{ data.item.label }}
                </span>
                <span v-if="data.item.label">
                  Cost: {{ formatETH(data.item.cost) + ' ETH' }}
                </span>
                Expiry: {{ formatTimestamp(data.item.expires) }}
              </span>
              <span v-else-if="data.item.type == 'NameRenewed'">
                Label: {{ data.item.label }} Cost: {{ formatETH(data.item.cost) + ' ETH' }} Expiry: {{ formatTimestamp(data.item.expiry) }}
              </span>
              <span v-else-if="data.item.type == 'TextChanged'">
                "{{ data.item.key }}":
                <span v-if="data.item.key == 'avatar'">
                  <span v-if="data.item.value">
                    "<b-link :href="data.item.value" target="_blank">{{ data.item.value }}</b-link>"
                  </span>
                  <span v-else>
                    ?
                  </span>
                </span>
                <span v-else>
                  <span v-if="data.item.value">
                    Value: {{ data.item.value }}
                  </span>
                </span>
              </span>
              <span v-else-if="data.item.type == 'AddrChanged'">
                <b-link v-if="networkSupported" :href="explorer + 'address/' + data.item.a" target="_blank">
                  {{ names[data.item.a] || (data.item.a.substring(0, 8) + '...' + data.item.a.slice(-6)) }}
                </b-link>
              </span>
              <span v-else-if="data.item.type == 'AddressChanged'">
                coinType: {{ data.item.coinType }}
                <span v-if="data.item.coinType == '60'">
                  <b-link v-if="networkSupported" :href="explorer + 'address/' + data.item.newAddress" target="_blank">
                    {{ names[data.item.newAddress] || (data.item.newAddress.substring(0, 8) + '...' + data.item.newAddress.slice(-6)) }}
                  </b-link>
                </span>
                <span v-else>
                  {{ data.item.newAddress }}
                </span>
              </span>
              <span v-else-if="data.item.type == 'ContenthashChanged'">
                {{ data.item.hash }}
              </span>
              <span v-else-if="data.item.type == 'NameWrapped'">
                label: {{ data.item.label }}
                owner:
                  <b-link v-if="networkSupported" :href="explorer + 'address/' + data.item.owner" target="_blank">
                    {{ names[data.item.owner] || (data.item.owner.substring(0, 8) + '...' + data.item.owner.slice(-6)) }}
                  </b-link>
                fuses: {{ data.item.fuses }}
                expiry: {{ formatTimestamp(data.item.expiry) }}
              </span>
              <span v-else-if="data.item.type == 'NameUnwrapped'">
                owner:
                  <b-link v-if="networkSupported" :href="explorer + 'address/' + data.item.owner" target="_blank">
                    {{ names[data.item.owner] || (data.item.owner.substring(0, 8) + '...' + data.item.owner.slice(-6)) }}
                  </b-link>
              </span>
              <span v-else>
                {{ data.item }}
              </span>
            </template>
          </b-table>
        </font>
      </b-modal>
    </div>
  `,
  data: function () {
    return {
      eventFields: [
        { key: 'number', label: '#', sortable: false, thStyle: 'width: 5%;', tdClass: 'text-truncate' },
        { key: 'when', label: 'When', sortable: false, thStyle: 'width: 15%;', tdClass: 'text-truncate' },
        { key: 'logIndex', label: 'LogIndex', sortable: false, thStyle: 'width: 5%;', tdClass: 'text-truncate' },
        { key: 'contract', label: 'Contract', sortable: false, thStyle: 'width: 20%;', tdClass: 'text-truncate' },
        { key: 'type', label: 'Type', sortable: false, thStyle: 'width: 10%;', tdClass: 'text-truncate' },
        { key: 'info', label: 'Info', sortable: false, thStyle: 'width: 55%;' /*, tdClass: 'text-truncate' */ },
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
    explorer() {
      return store.getters['connection/explorer'];
    },
    nonFungibleViewer() {
      return store.getters['connection/nonFungibleViewer'];
    },
    sync() {
      return store.getters['data/sync'];
    },
    addresses() {
      return store.getters['data/addresses'];
    },
    contract() {
      return store.getters['viewNonFungible/contract'];
    },
    tokenId() {
      return store.getters['viewNonFungible/tokenId'];
    },
    events() {
      return store.getters['viewNonFungible/events'];
    },
    tokens() {
      return store.getters['data/tokens'];
    },
    expiries() {
      return store.getters['data/expiries'];
    },
    timestamps() {
      return store.getters['data/timestamps'];
    },
    names() {
      return store.getters['data/names'];
    },
    token() {
      return this.contract && this.tokenId && this.tokens[this.chainId] && this.tokens[this.chainId][this.contract] && this.tokens[this.chainId][this.contract].tokens[this.tokenId] || {};
    },
    type() {
      return this.contract && this.tokens[this.chainId] && this.tokens[this.chainId][this.contract] && this.tokens[this.chainId][this.contract].type || null;
    },
    expiry() {
      return this.contract && this.expiries[this.chainId] && this.expiries[this.chainId][this.contract] && this.expiries[this.chainId][this.contract][this.tokenId] || null;
    },
    name() {
      return this.token && this.token.name || null;
    },
    description() {
      return this.token && this.token.description || null;
    },
    image() {
      let result = null;
      if (this.token.image) {
        if (this.token.image.substring(0, 12) == "ipfs://ipfs/") {
          result = "https://ipfs.io/" + this.token.image.substring(7)
        } else if (this.token.image.substring(0, 7) == "ipfs://") {
          result = "https://ipfs.io/ipfs/" + this.token.image.substring(7);
        } else {
          result = this.token.image;
        }
      }
      return result;
    },
    attributes() {
      return this.token && this.token.attributes || [];
    },

    linkedTo() {
      return store.getters['viewNonFungible/linkedTo'];
    },
    mine: {
      get: function () {
        return store.getters['viewNonFungible/mine'];
      },
      set: function (mine) {
        store.dispatch('data/setAddressField', { address: store.getters['viewNonFungible/address'], field: 'mine', value: mine });
        store.dispatch('viewNonFungible/setMine', mine);
      },
    },
    favourite: {
      get: function () {
        return store.getters['viewNonFungible/favourite'];
      },
      set: function (favourite) {
        store.dispatch('data/setAddressField', { address: store.getters['viewNonFungible/address'], field: 'favourite', value: favourite });
        store.dispatch('viewNonFungible/setFavourite', favourite);
      },
    },
    notes: {
      get: function () {
        return store.getters['viewNonFungible/notes'];
      },
      set: function (notes) {
        store.dispatch('data/setAddressField', { address: store.getters['viewNonFungible/address'], field: 'notes', value: notes });
        store.dispatch('viewNonFungible/setNotes', notes);
      },
    },
    source() {
      return store.getters['viewNonFungible/source'];
    },
    stealthTransfers() {
      return store.getters['viewNonFungible/stealthTransfers'];
    },
    show: {
      get: function () {
        return store.getters['viewNonFungible/show'];
      },
      set: function (show) {
        store.dispatch('viewNonFungible/setShow', show);
      },
    },
    filteredEvents() {
      const timestamps = this.timestamps[this.chainId] || {};
      const results = (store.getters['viewName/forceRefresh'] % 2) == 0 ? [] : [];
      for (const [blockNumber, blockData] of Object.entries(this.events)) {
        for (const [txIndex, txData] of Object.entries(blockData)) {
          for (const [logIndex, event] of Object.entries(txData)) {
            const timestamp = timestamps[blockNumber] || null;
            // console.log(blockNumber + "/" + txIndex + "/" + logIndex + " => " + JSON.stringify(event, null, 2));
            results.push({
              ...event,
              blockNumber,
              txIndex,
              logIndex,
              timestamp,
            });
          }
        }
      }
      // console.log(now() + " DEBUG ViewNonFungible.computed.filteredEvents - results[0..9]: " + JSON.stringify(results.slice(0, 10), null, 2));
      return results;
    },
    filteredSortedEvents() {
      const results = this.filteredEvents;
      results.sort((a, b) => {
        if (a.blockNumber == b.blockNumber) {
          return b.logIndex - a.logIndex;
        } else {
          return b.blockNumber - a.blockNumber;
        }
      });
      // console.log(now() + " DEBUG ViewNonFungible.computed.filteredSortedEvents - results[0..9]: " + JSON.stringify(results.slice(0, 10), null, 2));
      return results;
    },
  },
  methods: {
    nonFungibleViewerURL(contract, tokenId) {
      return this.nonFungibleViewer.replace(/\${contract}/, contract).replace(/\${tokenId}/, tokenId);
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
    setShow(show) {
      store.dispatch('viewNonFungible/setShow', show);
    },

    refreshNonFungibleMetadata() {
      store.dispatch('data/refreshNonFungibleMetadata', [ { contract: this.contract, tokenId: this.tokenId } ]);
    },

    requestReservoirMetadataRefresh() {
      store.dispatch('data/requestReservoirMetadataRefresh', [ { contract: this.contract, tokenId: this.tokenId } ]);
    },

    async deleteAddress(account) {
      this.$bvModal.msgBoxConfirm('Are you sure?')
        .then(value => {
          if (value) {
            store.dispatch('data/deleteAddress', account);
            this.$refs['viewtoken'].hide();
          }
        })
        .catch(err => {
          // An error occurred
        })
    },
  },
  beforeDestroy() {
    // console.log(now() + " DEBUG ViewNonFungible:beforeDestroy");
  },
  mounted() {
    // console.log(now() + " DEBUG ViewNonFungible:mounted - $route: " + JSON.stringify(this.$route.params));
    // if ('transfersSettings' in localStorage) {
    //   const tempSettings = JSON.parse(localStorage.transfersSettings);
    //   if ('version' in tempSettings && tempSettings.version == 0) {
    //     this.settings = tempSettings;
    //   }
    // }
  },
};

const viewNonFungibleModule = {
  namespaced: true,
  state: {
    contract: null,
    tokenId: null,
    name: null,
    events: {},
    show: false,
  },
  getters: {
    contract: state => state.contract,
    tokenId: state => state.tokenId,
    name: state => state.name,
    events: state => state.events,
    show: state => state.show,
  },
  mutations: {
    viewNonFungible(state, info) {
      console.log(now() + " INFO viewNonFungibleModule:mutations.viewNonFungible - info: " + JSON.stringify(info));
      state.contract = info.contract;
      state.tokenId = info.tokenId;
      state.name = info.name;
      state.events = {};
      state.show = true;
    },
    addEvents(state, events) {
      console.log(now() + " INFO viewNonFungibleModule:mutations.addEvents - events: " + JSON.stringify(events));
      for (const event of events) {
        if (!(event.blockNumber in state.events)) {
          Vue.set(state.events, event.blockNumber, {});
        }
        if (!(event.txIndex in state.events[event.blockNumber])) {
          Vue.set(state.events[event.blockNumber], event.txIndex, {});
        }
        Vue.set(state.events[event.blockNumber][event.txIndex], event.logIndex, {
          ...event,
          blockNumber: undefined,
          txIndex: undefined,
          logIndex: undefined,
        });
      }
      // console.log(now() + " INFO viewNonFungibleModule:mutations.addEvents - state.events: " + JSON.stringify(state.events, null, 2));
    },
    setTextValue(state, info) {
      // console.log(now() + " INFO viewNonFungibleModule:mutations.setTextValue - info: " + JSON.stringify(info, null, 2));
      if (state.events[info.blockNumber] && state.events[info.blockNumber][info.txIndex]) {
        for (const [logIndex, data] of Object.entries(state.events[info.blockNumber][info.txIndex])) {
          if (info.labelhash == data.node) {
            Vue.set(state.events[info.blockNumber][info.txIndex][logIndex], 'value', info.value);
          }
        }
      }
    },
    setShow(state, show) {
      state.show = show;
    },
  },
  actions: {
    async viewNonFungible(context, info) {
      // console.log(now() + " INFO viewNonFungibleModule:actions.viewNonFungible - info: " + JSON.stringify(info));
      await context.commit('viewNonFungible', info);
      await context.dispatch('loadENSEvents', info);
      await context.dispatch('loadTimestamps', info);
    },
    async loadENSEvents(context, info) {
      console.log(now() + " INFO viewNonFungibleModule:actions.loadENSEvents - info: " + JSON.stringify(info));
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const block = await provider.getBlock();
      const toBlock = block && block.number || null;
      const fromBlock = 0;
      const [ chainId, contract, tokenId ] = [ store.getters['connection/chainId'], context.state.contract, context.state.tokenId ];
      // console.log(now() + " INFO viewNonFungibleModule:actions.loadENSEvents - contract: " + contract);
      // console.log(now() + " INFO viewNonFungibleModule:actions.loadENSEvents - tokenId: " + tokenId);
      const tokenContract = store.getters['data/tokens'][chainId] && store.getters['data/tokens'][chainId][info.contract] || {};
      // console.log(now() + " INFO viewNonFungibleModule:actions.viewNonFungible - tokenContract: " + JSON.stringify(tokenContract));
      const token = store.getters['data/tokens'][chainId] && store.getters['data/tokens'][chainId][info.contract] && store.getters['data/tokens'][chainId][info.contract].tokens[info.tokenId] || {};
      // console.log(now() + " INFO viewNonFungibleModule:actions.viewNonFungible - token: " + JSON.stringify(token));
      const type = tokenContract.type || null;
      // console.log(now() + " INFO viewNonFungibleModule:actions.viewNonFungible - type: " + type);

      // const tokenIds = [ ethers.BigNumber.from(tokenId).toHexString() ];
      const tokenIds = [ ethers.BigNumber.from(tokenId).toHexString() ];
      let erc721TokenId = type == "erc721" ? tokenId : null;
      let erc1155TokenId = type == "erc1155" ? tokenId : null;
      // console.log(now() + " INFO viewNonFungibleModule:actions.viewNonFungible - erc721TokenId: " + erc721TokenId);
      // console.log(now() + " INFO viewNonFungibleModule:actions.viewNonFungible - erc1155TokenId: " + erc1155TokenId);

      if (contract == ENS_ERC721_ADDRESS) {
        try {
          const topics = [[
              '0xca6abbe9d7f11422cb6ca7629fbf6fe9efb1c621f71ce8f02b9f2a230097404f', // NameRegistered (string name, index_topic_1 bytes32 label, index_topic_2 address owner, uint256 cost, uint256 expires)
            ],
            [ ethers.BigNumber.from(tokenId).toHexString() ],
            null
          ];
          const logs = await provider.getLogs({ address: ENS_OLDETHREGISTRARCONTROLLER_ADDRESS, fromBlock, toBlock, topics });
          const events = processENSEventLogs(logs);
          // console.log(now() + " INFO viewNonFungibleModule:actions.loadENSEvents - events: " + JSON.stringify(events, null, 2));
          if (events.length > 0) {
            const label = events[0].label;
            // console.log(now() + " INFO viewNonFungibleModule:actions.loadENSEvents - label: " + label);
            erc1155TokenId = ethers.BigNumber.from(ethers.utils.namehash(label + ".eth")).toString();
            // console.log(now() + " INFO viewNonFungibleModule:actions.loadENSEvents - erc1155TokenId: " + erc1155TokenId);
            tokenIds.push(ethers.BigNumber.from(erc1155TokenId).toHexString());
          } else if (context.state.name != null && context.state.name.length > 4) {
            erc1155TokenId = ethers.BigNumber.from(ethers.utils.namehash(context.state.name)).toString();
            // console.log(now() + " INFO viewNonFungibleModule:actions.loadENSEvents - erc1155TokenId: " + erc1155TokenId);
            tokenIds.push(ethers.BigNumber.from(erc1155TokenId).toHexString());
          }
        } catch (e) {
          console.log(now() + " INFO viewNonFungibleModule:actions.loadENSEvents.getLogs - ERROR fromBlock: " + fromBlock + ", toBlock: " + toBlock + " " + e.message);
        }
      } else if (contract == ENS_ERC1155_ADDRESS) {
        try {
          const topics = [[
              '0x8ce7013e8abebc55c3890a68f5a27c67c3f7efa64e584de5fb22363c606fd340', // NameWrapped (index_topic_1 bytes32 node, bytes name, address owner, uint32 fuses, uint64 expiry)
            ],
            [ ethers.BigNumber.from(tokenId).toHexString() ],
            null
          ];
          const logs = await provider.getLogs({ address: ENS_ERC1155_ADDRESS, fromBlock, toBlock, topics });
          const events = processENSEventLogs(logs);
          // console.log(now() + " INFO viewNonFungibleModule:actions.loadENSEvents - events: " + JSON.stringify(events, null, 2));
          if (events.length > 0 && events[0].subdomain == null) {
            tokenIds.push(events[0].labelhash);
            erc721TokenId = events[0].labelhashDecimals;
          }
        } catch (e) {
          console.log(now() + " INFO viewNonFungibleModule:actions.loadENSEvents.getLogs - ERROR fromBlock: " + fromBlock + ", toBlock: " + toBlock + " " + e.message);
        }
      }
      console.log(now() + " INFO viewNonFungibleModule:actions.viewNonFungible - erc721TokenId: " + erc721TokenId);
      console.log(now() + " INFO viewNonFungibleModule:actions.viewNonFungible - erc1155TokenId: " + erc1155TokenId);
      // console.log(now() + " INFO viewNonFungibleModule:actions.viewNonFungible - tokenIds: " + JSON.stringify(tokenIds));

      // ENS: Old ETH Registrar Controller 1 @ 0xF0AD5cAd05e10572EfcEB849f6Ff0c68f9700455 deployed Apr-30-2019 03:54:13 AM +UTC
      // ENS: Old ETH Registrar Controller 2 @ 0xB22c1C159d12461EA124b0deb4b5b93020E6Ad16 deployed Nov-04-2019 12:43:55 AM +UTC
      // ENS: Old ETH Registrar Controller @ 0x283Af0B28c62C092C9727F1Ee09c02CA627EB7F5 deployed Jan-30-2020 12:56:38 AM +UTC
      // ENS: ETH Registrar Controller @ 0x253553366Da8546fC250F225fe3d25d0C782303b deployed Mar-28-2023 11:44:59 AM +UTC

      // ENS: Base Registrar Implementation 0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85
      // NameRegistered (index_topic_1 uint256 id, index_topic_2 address owner, uint256 expires) 0xb3d987963d01b2f68493b4bdb130988f157ea43070d4ad840fee0466ed9370d9

      // 925.eth ERC-721 0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85:53835211818918528779359817553631021141919078878710948845228773628660104698081
      // - ENS: Old ETH Registrar Controller 0x283Af0B28c62C092C9727F1Ee09c02CA627EB7F5 NameRegistered (string name, index_topic_1 bytes32 label, index_topic_2 address owner, uint256 cost, uint256 expires) 0xca6abbe9d7f11422cb6ca7629fbf6fe9efb1c621f71ce8f02b9f2a230097404f
      //   [ '0xca6abbe9d7f11422cb6ca7629fbf6fe9efb1c621f71ce8f02b9f2a230097404f', namehash, null ],
      // - ENS: Old ETH Registrar Controller 0x283Af0B28c62C092C9727F1Ee09c02CA627EB7F5 NameRenewed (string name, index_topic_1 bytes32 label, uint256 cost, uint256 expires) 0x3da24c024582931cfaf8267d8ed24d13a82a8068d5bd337d30ec45cea4e506ae
      //   [ '0x3da24c024582931cfaf8267d8ed24d13a82a8068d5bd337d30ec45cea4e506ae', namehash, null ],

      // ERC-1155 portraits.eth 27727362303445643037535452095569739813950020376856883309402147522300287323280
      // ERC-1155 yourmum.lovesyou.eth 57229065116737680790555199455465332171886850449809000367294662727325932836690
      // - ENS: Name Wrapper 0xD4416b13d2b3a9aBae7AcD5D6C2BbDBE25686401 NameWrapped (index_topic_1 bytes32 node, bytes name, address owner, uint32 fuses, uint64 expiry) 0x8ce7013e8abebc55c3890a68f5a27c67c3f7efa64e584de5fb22363c606fd340
      //   [ '0x8ce7013e8abebc55c3890a68f5a27c67c3f7efa64e584de5fb22363c606fd340', namehash, null ],
      // NameUnwrapped (index_topic_1 bytes32 node, address owner) 0xee2ba1195c65bcf218a83d874335c6bf9d9067b4c672f3c3bf16cf40de7586c4

      // ENS_REGISTRYWITHFALLBACK 0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e
      // NewResolver (index_topic_1 bytes32 node, address resolver) 0x335721b01866dc23fbee8b6b2c7b1e14d6f05c28cd35a2c934239f94095602a0
      // NewOwner (index_topic_1 bytes32 node, index_topic_2 bytes32 label, address owner) 0xce0457fe73731f824cc272376169235128c118b49d344817417c6d108d155e82

      if (contract == ENS_ERC721_ADDRESS || contract == ENS_ERC1155_ADDRESS) {
        // ENS Events
        try {
          const topics = [[
              '0xb3d987963d01b2f68493b4bdb130988f157ea43070d4ad840fee0466ed9370d9', // NameRegistered (index_topic_1 uint256 id, index_topic_2 address owner, uint256 expires)
              '0xca6abbe9d7f11422cb6ca7629fbf6fe9efb1c621f71ce8f02b9f2a230097404f', // NameRegistered (string name, index_topic_1 bytes32 label, index_topic_2 address owner, uint256 cost, uint256 expires)
              '0x3da24c024582931cfaf8267d8ed24d13a82a8068d5bd337d30ec45cea4e506ae', // NameRenewed (string name, index_topic_1 bytes32 label, uint256 cost, uint256 expires)
              '0x8ce7013e8abebc55c3890a68f5a27c67c3f7efa64e584de5fb22363c606fd340', // NameWrapped (index_topic_1 bytes32 node, bytes name, address owner, uint32 fuses, uint64 expiry)
              '0xee2ba1195c65bcf218a83d874335c6bf9d9067b4c672f3c3bf16cf40de7586c4', // NameUnwrapped (index_topic_1 bytes32 node, address owner)

              // Implementation
              '0x335721b01866dc23fbee8b6b2c7b1e14d6f05c28cd35a2c934239f94095602a0', // NewResolver (index_topic_1 bytes32 node, address resolver)
              '0xce0457fe73731f824cc272376169235128c118b49d344817417c6d108d155e82', // NewOwner (index_topic_1 bytes32 node, index_topic_2 bytes32 label, address owner)

              // Public Resolver, Public Resolver 1, Public Resolver 2
              '0xb7d29e911041e8d9b843369e890bcb72c9388692ba48b65ac54e7214c4c348f7', // NameChanged (index_topic_1 bytes32 node, string name)
              '0x52d7d861f09ab3d26239d492e8968629f95e9e318cf0b73bfddc441522a15fd2', // AddrChanged (index_topic_1 bytes32 node, address a)
              '0x65412581168e88a1e60c6459d7f44ae83ad0832e670826c05a4e2476b57af752', // AddressChanged (index_topic_1 bytes32 node, uint256 coinType, bytes newAddress)
              '0xd8c9334b1a9c2f9da342a0a2b32629c1a229b6445dad78947f674b44444a7550', // TextChanged (index_topic_1 bytes32 node, index_topic_2 string indexedKey, string key)
              '0x448bc014f1536726cf8d54ff3d6481ed3cbc683c2591ca204274009afa09b1a1', // TextChanged (index_topic_1 bytes32 node, index_topic_2 string indexedKey, string key, string value)
              '0xe379c1624ed7e714cc0937528a32359d69d5281337765313dba4e081b72d7578', // ContenthashChanged (index_topic_1 bytes32 node, bytes hash)
            ],
            tokenIds,
            null
          ];
          // console.log(now() + " INFO viewNonFungibleModule:actions.loadENSEvents - topics: " + JSON.stringify(topics, null, 2));
          const logs = await provider.getLogs({ address: null, fromBlock, toBlock, topics });
          // console.log(now() + " INFO viewNonFungibleModule:actions.loadENSEvents - logs: " + JSON.stringify(logs, null, 2));
          const events = processENSEventLogs(logs);
          // console.log(now() + " INFO viewNonFungibleModule:actions.loadENSEvents - events: " + JSON.stringify(events, null, 2));
          await context.commit('addEvents', events);
        } catch (e) {
          console.log(now() + " INFO viewNonFungibleModule:actions.loadENSEvents.getLogs - ERROR fromBlock: " + fromBlock + ", toBlock: " + toBlock + " " + e.message);
        }
      }

      if (erc721TokenId) {
        // console.log(now() + " INFO viewNonFungibleModule:actions.viewNonFungible - erc721TokenId: " + erc721TokenId);
        // ERC-721 Transfers
        try {
          const topics = [[
              '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef', // Transfer (index_topic_1 address from, index_topic_2 address to, index_topic_3 uint256 id)
            ],
            null,
            null,
            "0x" + ethers.BigNumber.from(erc721TokenId).toHexString().substring(2).padStart(64, '0'),
          ];
          // console.log(now() + " INFO viewNonFungibleModule:actions.viewNonFungible - topics: " + JSON.stringify(topics));
          const logs = await provider.getLogs({ address: info.contract == ENS_ERC1155_ADDRESS ? ENS_ERC721_ADDRESS : info.contract, fromBlock, toBlock, topics });
          const events = processENSEventLogs(logs);
          // console.log(now() + " INFO viewNonFungibleModule:actions.loadENSEvents - ERC-721 transfer events: " + JSON.stringify(events, null, 2));
          await context.commit('addEvents', events);
        } catch (e) {
          console.log(now() + " INFO viewNonFungibleModule:actions.loadENSEvents.getLogs - ERROR fromBlock: " + fromBlock + ", toBlock: " + toBlock + " " + e.message);
        }
      }

      if (erc1155TokenId) {
        // ERC-1155 TransferSingle (index_topic_1 address operator, index_topic_2 address from, index_topic_3 address to, uint256 id, uint256 value)
        // [ '0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62', null, accountAs32Bytes, null ],
        // [ '0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62', null, null, accountAs32Bytes ],

        // ERC-1155 TransferBatch (index_topic_1 address operator, index_topic_2 address from, index_topic_3 address to, uint256[] ids, uint256[] values)
        // [ '0x4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb', null, accountAs32Bytes, null ],
        // [ '0x4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb', null, null, accountAs32Bytes ],

        const selectedAddresses = [];
        for (const [address, addressData] of Object.entries(store.getters['data/addresses'] || {})) {
          if (address.substring(0, 2) == "0x" && !addressData.junk && addressData.watch) {
            selectedAddresses.push('0x000000000000000000000000' + address.substring(2, 42).toLowerCase());
          }
        }
        // console.log("selectedAddresses: " + JSON.stringify(selectedAddresses));

        // const erc721TokenIdDecimals = ethers.BigNumber.from(erc721TokenId).toString();
        const erc1155TokenIdDecimals = ethers.BigNumber.from(erc1155TokenId).toString();

        // ERC-1155 Transfers To My Account
        try {
          const topics = [[
              '0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62', // TransferSingle (index_topic_1 address operator, index_topic_2 address from, index_topic_3 address to, uint256 id, uint256 value)
              '0x4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb', // TransferBatch (index_topic_1 address operator, index_topic_2 address from, index_topic_3 address to, uint256[] ids, uint256[] values)
            ],
            null,
            null,
            selectedAddresses,
          ];
          const logs = await provider.getLogs({ address: info.contract, fromBlock, toBlock, topics });
          const events = processENSEventLogs(logs);
          const selectedEvents = [];
          for (const event of events) {
            // console.log("event: " + JSON.stringify(event, null, 2));
            if (event.type == "TransferSingle" && event.tokenId == erc1155TokenId) {
              // console.log("event: " + JSON.stringify(event, null, 2));
              selectedEvents.push(event);
            } else if (event.type == "TransferBatch") {
              // TODO: Handle this
            }
          }
          // console.log(now() + " INFO viewNonFungibleModule:actions.loadENSEvents - ERC-1155 transfer to events: " + JSON.stringify(selectedEvents, null, 2));
          await context.commit('addEvents', selectedEvents);
        } catch (e) {
          console.log(now() + " INFO viewNonFungibleModule:actions.loadENSEvents.getLogs - ERROR fromBlock: " + fromBlock + ", toBlock: " + toBlock + " " + e.message);
        }

        // ERC-1155 Transfers From My Account
        try {
          const topics = [[
              '0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62', // TransferSingle (index_topic_1 address operator, index_topic_2 address from, index_topic_3 address to, uint256 id, uint256 value)
              '0x4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb', // TransferBatch (index_topic_1 address operator, index_topic_2 address from, index_topic_3 address to, uint256[] ids, uint256[] values)
            ],
            null,
            selectedAddresses,
          ];
          const logs = await provider.getLogs({ address: info.contract, fromBlock, toBlock, topics });
          const events = processENSEventLogs(logs);
          const selectedEvents = [];
          for (const event of events) {
            // console.log("event.tokenId: " + event.tokenId + " vs " + erc1155TokenIdDecimals);
            if (event.type == "TransferSingle" && event.tokenId == erc1155TokenId) {
              // console.log("event: " + JSON.stringify(event, null, 2));
              selectedEvents.push(event);
            } else if (event.type == "TransferBatch") {
              // TODO: Handle this
            }
          }
          // console.log(now() + " INFO viewNonFungibleModule:actions.loadENSEvents - ERC-1155 transfer from events: " + JSON.stringify(selectedEvents, null, 2));
          await context.commit('addEvents', selectedEvents);
        } catch (e) {
          console.log(now() + " INFO viewNonFungibleModule:actions.loadENSEvents.getLogs - ERROR fromBlock: " + fromBlock + ", toBlock: " + toBlock + " " + e.message);
        }
      }
      // console.log(now() + " INFO viewNonFungibleModule:actions.loadENSEvents - context.state.events: " + JSON.stringify(context.state.events, null, 2));

      const eventList = [];
      for (const [blockNumber, blockData] of Object.entries(context.state.events)) {
        // console.log(blockNumber + " => " + JSON.stringify(blockData));
        for (const [txIndex, txData] of Object.entries(blockData)) {
          for (const [logIndex, event] of Object.entries(txData)) {
            eventList.push({
              ...event,
              blockNumber,
              txIndex,
              logIndex,
            });
          }
        }
      }
      eventList.sort((a, b) => {
        if (a.blockNumber == b.blockNumber) {
          return b.logIndex - a.logIndex;
        } else {
          return b.blockNumber - a.blockNumber;
        }
      });
      // console.log(now() + " INFO viewNonFungibleModule:actions.loadENSEvents - eventList: " + JSON.stringify(eventList, null, 2));
      const publicResolver2Interface = new ethers.utils.Interface(ENS_PUBLICRESOLVER2_ABI);
      for (const event of eventList) {
        if (event.contract == ENS_PUBLICRESOLVER2_ADDRESS && event.type == "TextChanged") {
          const tx = await provider.getTransaction(event.txHash);
          const decodedData = publicResolver2Interface.parseTransaction({ data: tx.data, value: tx.value });
          if (decodedData.functionFragment.name == "setText") {
            // console.log("setText - event: " + JSON.stringify(event, null, 2));
            const decodedFunctionArgs = publicResolver2Interface.decodeFunctionData("setText", tx.data);
            console.log("decodedFunctionArgs: " + JSON.stringify(decodedFunctionArgs, null, 2));
            await context.commit('setTextValue', {
              chainId,
              blockNumber: event.blockNumber,
              txIndex: event.txIndex,
              txHash: event.txHash,
              labelhash: decodedFunctionArgs[0],
              key: decodedFunctionArgs[1],
              value: decodedFunctionArgs[2],
            });
          } else if (decodedData.functionFragment.name == "multicall") {
            // console.log("multicall - event: " + JSON.stringify(event, null, 2));
            const decodedFunctionArgs = publicResolver2Interface.decodeFunctionData("multicall", tx.data);
            // console.log("multicall - decodedFunctionArgs: " + JSON.stringify(decodedFunctionArgs, null, 2));
            for (const data1 of decodedFunctionArgs) {
              for (const data2 of data1) {
                const decodedArrayData = publicResolver2Interface.parseTransaction({ data: data2, value: tx.value });
                // console.log("multicall - decodedArrayData: " + JSON.stringify(decodedArrayData, null, 2));
                if (decodedArrayData.functionFragment.name == "setText") {
                  const decodedFunctionArgs1 = publicResolver2Interface.decodeFunctionData("setText", data2);
                  console.log("multicall - setText - decodedFunctionArgs1: " + JSON.stringify(decodedFunctionArgs1, null, 2));
                  await context.commit('setTextValue', {
                    chainId,
                    blockNumber: event.blockNumber,
                    txIndex: event.txIndex,
                    txHash: event.txHash,
                    labelhash: decodedFunctionArgs1[0],
                    key: decodedFunctionArgs1[1],
                    value: decodedFunctionArgs1[2],
                  });
                }
              }
            }
          }
        }
      }

      if (false) {
        const erc721Transfers = eventList.filter(e => e.type == "Transfer");
        const erc721Owner = erc721Transfers.length > 0 ? erc721Transfers[0].to : null;
        const wrapped = erc721Owner == ENS_NAMEWRAPPER_ADDRESS;
        const erc1155Transfers = wrapped ? eventList.filter(e => e.type == "TransferSingle" || e.type == "TransferBatch") : [];
        // TODO: Handle TransferBatch
        const erc1155Owner = erc1155Transfers.length > 0 ? erc1155Transfers[0].to : null;
        const image = "https://metadata.ens.domains/mainnet/" + (wrapped ? ENS_NAMEWRAPPER_ADDRESS + "/" + erc1155TokenIdDecimals : ENS_BASEREGISTRARIMPLEMENTATION_ADDRESS + "/" + erc721TokenIdDecimals) + "/image";
        await context.commit('setInfo', {
          wrapped,
          owner: wrapped ? erc1155Owner : erc721Owner,
          erc721Owner,
          erc1155Owner,
          erc721TokenId: erc721TokenIdDecimals,
          erc1155TokenId: erc1155TokenIdDecimals,
          image,
        });

        // // 2nd parameter with tokenId
        //
        // const erc721TokenIdDecimals = ethers.BigNumber.from(erc721TokenId).toString();
        // console.log("erc721TokenIdDecimals: " + erc721TokenIdDecimals + " " + erc721TokenId);
        // const erc1155TokenIdDecimals = ethers.BigNumber.from(erc1155TokenId).toString();
        // console.log("erc1155TokenIdDecimals: " + erc1155TokenIdDecimals + " " + erc1155TokenId);
        //
        // try {
        //   const topics = [
        //     '0x6ada868dd3058cf77a48a74489fd7963688e5464b2b0fa957ace976243270e92', // ReverseClaimed (index_topic_1 address addr, index_topic_2 bytes32 node)
        //     "0x000000000000000000000000A2113f1E9A66c3B0A75BB466bbBfeEeC987ac92e",
        //     // [ erc721TokenId, erc1155TokenId ],
        //     // erc1155TokenId,
        //   ];
        //   console.log("topics: " + JSON.stringify(topics, null, 2));
        //   const logs = await provider.getLogs({ address: null, fromBlock, toBlock, topics });
        //   console.log("logs: " + JSON.stringify(logs, null, 2));
        //   // await processLogs(fromBlock, toBlock, logs);
        //   const results = processENSEventLogs(logs);
        // } catch (e) {
        //   console.log(now() + " INFO viewNonFungibleModule:actions.loadENSEvents.getLogs - ERROR fromBlock: " + fromBlock + ", toBlock: " + toBlock + " " + e.message);
        // }
        //
        // // 0x13c293ab26f380f6555b301eecbae5dc67ce5ce322670655f3396abf2983a145
        // const reverseAddress = "a2113f1e9a66c3b0a75bb466bbbfeeec987ac92e.addr.reverse";
        // const namehash = ethers.utils.namehash(reverseAddress);
        // console.log("reverseAddress: " + reverseAddress + ", namehash: " + namehash);
        // // reverseAddress: a2113f1e9a66c3b0a75bb466bbbfeeec987ac92e.addr.reverse, namehash: 0x7d75f26ebf4147fc33aef5d5d6ae97e7a8e0f8985a40d73bb2ddacdd1e5e3ce0

      }
      // context.commit('forceRefresh');
      // await context.commit('updateTransfers', info);
    },
    async loadTimestamps(context, info) {
      console.log(now() + " INFO viewNonFungibleModule:actions.loadTimestamps - info: " + JSON.stringify(info));
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const timestamps = store.getters['data/timestamps'][store.getters['connection/chainId']] || {};
      const blockNumbers = Object.keys(context.state.events);
      let modified = false;
      for (const blockNumber of blockNumbers) {
        if (!(blockNumber in timestamps)) {
          const block = await provider.getBlock(parseInt(blockNumber));
          store.dispatch('data/addTimestamp', {
            chainId: store.getters['connection/chainId'],
            blockNumber,
            timestamp: block.timestamp,
          });
          modified = true;
        }
      }
      if (modified) {
        store.dispatch('data/saveTimestamps');
      }
    },
    async setShow(context, show) {
      await context.commit('setShow', show);
    },
  },
};
