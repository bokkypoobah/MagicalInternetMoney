const ViewNonFungible = {
  template: `
    <div>
      <b-modal ref="viewtoken" v-model="show" hide-footer header-class="m-0 px-3 py-2" body-bg-variant="light" size="lg">
        <template #modal-title>{{ type == "erc721" ? 'ERC-721' : 'ERC-1155'}} Non-Fungible Token</template>

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

        <b-form-group label="Name:" label-for="token-name" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-form-input size="sm" plaintext id="token-name" :value="name" class="px-2 w-100"></b-form-input>
        </b-form-group>

        <b-form-group label="Description:" label-for="token-description" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <component size="sm" plaintext :is="description && description.length > 60 ? 'b-form-textarea' : 'b-form-input'" :value="description" rows="3" max-rows="10" class="px-2" />
        </b-form-group>

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
        <b-form-group label="Attributes:" label-for="token-image" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-row v-for="(attribute, i) in attributes" v-bind:key="i" class="m-0 p-0">
            <b-col cols="3" class="m-0 px-2 text-right"><font size="-3">{{ attribute.trait_type }}</font></b-col>
            <b-col cols="9" class="m-0 px-2"><b><font size="-2">{{ ["Created Date", "Registration Date", "Expiration Date"].includes(attribute.trait_type) ? formatTimestamp(attribute.value) : attribute.value }}</font></b></b-col>
          </b-row>
        </b-form-group>

        <b-form-group label="" label-for="token-refreshnonfungiblemetadata" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-button size="sm" :disabled="sync.section != null" @click="refreshNonFungibleMetadata();" variant="link" v-b-popover.hover.top="'Refresh Non-Fungible token metadata from Reservoir'"><b-icon-cloud-download shift-v="+1" font-scale="1.1" variant="primary"></b-icon-cloud-download></b-button>
          <b-button size="sm" :disabled="sync.section != null" @click="requestReservoirMetadataRefresh();" variant="link" v-b-popover.hover.top="'Request Reservoir API to refresh their metadata. Use this if Reservoir does not have the correct metadata. Wait a few minutes then repeat refresh to the left'"><b-icon-cloud-fill shift-v="+1" font-scale="1.1" variant="primary"></b-icon-cloud-fill></b-button>
        </b-form-group>

        <b-form-group v-if="false" label="" label-for="token-delete" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-button size="sm" @click="deleteAddress(contract);" variant="link" v-b-popover.hover.top="'Delete address ' + contract.substring(0, 10) + '...' + contract.slice(-8) + '?'"><b-icon-trash shift-v="+1" font-scale="1.1" variant="danger"></b-icon-trash></b-button>
        </b-form-group>
      </b-modal>
    </div>
  `,
  data: function () {
    return {
      stealthPrivateKey: null,
      addressTypeInfo: {
        "address": { variant: "warning", name: "My Address" },
        "stealthAddress": { variant: "dark", name: "My Stealth Address" },
        "stealthMetaAddress": { variant: "success", name: "My Stealth Meta-Address" },
      },
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
    tokens() {
      return store.getters['data/tokens'];
    },
    expiries() {
      return store.getters['data/expiries'];
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
    saveSettings() {
      logInfo("ViewNonFungible", "methods.saveSettings - transfersSettings: " + JSON.stringify(this.settings, null, 2));
      localStorage.transfersSettings = JSON.stringify(this.settings);
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
    logDebug("ViewNonFungible", "beforeDestroy()");
  },
  mounted() {
    logDebug("ViewNonFungible", "mounted() $route: " + JSON.stringify(this.$route.params));
    if ('transfersSettings' in localStorage) {
      const tempSettings = JSON.parse(localStorage.transfersSettings);
      if ('version' in tempSettings && tempSettings.version == 0) {
        this.settings = tempSettings;
      }
    }
  },
};

const viewNonFungibleModule = {
  namespaced: true,
  state: {
    contract: null,
    tokenId: null,
    linkedTo: {
      address: null,
      stealthMetaAddress: null,
    },
    type: null,
    mine: null,
    favourite: null,
    name: null,
    notes: null,
    source: null,
    show: false,
  },
  getters: {
    contract: state => state.contract,
    tokenId: state => state.tokenId,
    linkedTo: state => state.linkedTo,
    type: state => state.type,
    mine: state => state.mine,
    favourite: state => state.favourite,
    name: state => state.name,
    notes: state => state.notes,
    source: state => state.source,
    stealthTransfers: state => state.stealthTransfers,
    show: state => state.show,
  },
  mutations: {
    viewNonFungible(state, info) {
      logInfo("viewNonFungibleModule", "mutations.viewNonFungible - info: " + JSON.stringify(info));

      // const data = store.getters['data/addresses'][address] || {};
      state.contract = info.contract;
      state.tokenId = info.tokenId;
      // state.linkedTo = data.linkedTo || { address: null, stealthMetaAddress: null };
      // state.type = data.type;
      // state.mine = data.mine;
      // state.favourite = data.favourite;
      // state.name = data.name;
      // state.notes = data.notes;
      // state.source = data.source;
      // const stealthTransfers = [];
      // if (data.type == "stealthAddress") {
      //   const transfers = store.getters['data/transfers'][store.getters['connection/chainId']] || {};
      //   for (const [blockNumber, logIndexes] of Object.entries(transfers)) {
      //     for (const [logIndex, item] of Object.entries(logIndexes)) {
      //       if (item.schemeId == 0 && item.stealthAddress == address) {
      //         stealthTransfers.push(item);
      //       }
      //     }
      //   }
      // }
      // Vue.set(state, 'stealthTransfers', stealthTransfers);
      state.show = true;
    },
    setMine(state, mine) {
      logInfo("viewNonFungibleModule", "mutations.setMine - mine: " + mine);
      state.mine = mine;
    },
    setFavourite(state, favourite) {
      logInfo("viewNonFungibleModule", "mutations.setFavourite - favourite: " + favourite);
      state.favourite = favourite;
    },
    setName(state, name) {
      logInfo("viewNonFungibleModule", "mutations.setName - name: " + name);
      state.name = name;
    },
    setNotes(state, notes) {
      logInfo("viewNonFungibleModule", "mutations.setNotes - notes: " + notes);
      state.notes = notes;
    },
    setShow(state, show) {
      state.show = show;
    },
  },
  actions: {
    async viewNonFungible(context, info) {
      logInfo("viewNonFungibleModule", "actions.viewNonFungible - info: " + JSON.stringify(info));
      await context.commit('viewNonFungible', info);
    },
    async setMine(context, mine) {
      logInfo("viewNonFungibleModule", "actions.setMine - mine: " + mine);
      await context.commit('setMine', mine);
    },
    async setFavourite(context, favourite) {
      logInfo("viewNonFungibleModule", "actions.setFavourite - favourite: " + favourite);
      await context.commit('setFavourite', favourite);
    },
    async setName(context, name) {
      logInfo("viewNonFungibleModule", "actions.setName - name: " + name);
      await context.commit('setName', name);
    },
    async setNotes(context, notes) {
      logInfo("viewNonFungibleModule", "actions.setNotes - notes: " + notes);
      await context.commit('setNotes', notes);
    },
    async setSource(context, source) {
      logInfo("viewNonFungibleModule", "actions.setSource - source: " + source);
      await context.commit('setSource', source);
    },
    async setShow(context, show) {
      await context.commit('setShow', show);
    },
  },
};
