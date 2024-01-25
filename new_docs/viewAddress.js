const ViewAddress = {
  template: `
    <div>
      <b-modal ref="viewaddress" v-model="show" id="modal-viewaddress" hide-footer header-class="m-0 px-3 py-2" body-bg-variant="light" size="lg">
        <template #modal-title>{{ type == 'stealthAddress' ? 'Stealth Address' : 'Address' }}</template>
        <b-form-group label="Address:" label-for="address-address" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-input-group size="sm" class="w-100">
            <b-form-input size="sm" plaintext id="address-address" v-model.trim="address" class="px-2"></b-form-input>
            <b-input-group-append>
              <div>
                <b-button size="sm" :href="'https://sepolia.etherscan.io/address/' + address" variant="link" v-b-popover.hover="'View in explorer'" target="_blank" class="m-0 ml-1 p-0"><b-icon-link45deg shift-v="+1" font-scale="0.95"></b-icon-link45deg></b-button>
              </div>
            </b-input-group-append>
          </b-input-group>
        </b-form-group>
        <b-form-group v-if="type == 'stealthAddress'" label="Linked To Address:" label-for="address-linkedtoaddress" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-input-group size="sm" class="w-100">
            <b-form-input size="sm" plaintext id="address-linkedtoaddress" v-model.trim="linkedTo.address" class="px-2"></b-form-input>
            <b-input-group-append>
              <div>
                <b-button size="sm" :href="'https://sepolia.etherscan.io/address/' + linkedTo.address" variant="link" v-b-popover.hover="'View in explorer'" target="_blank" class="m-0 ml-1 p-0"><b-icon-link45deg shift-v="+1" font-scale="0.95"></b-icon-link45deg></b-button>
              </div>
            </b-input-group-append>
          </b-input-group>
        </b-form-group>
        <b-form-group v-if="type == 'stealthAddress'" label="Via Stealth Meta-Address:" label-for="address-linkedtostealthmetaaddress" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-form-textarea size="sm" plaintext id="address-linkedtostealthmetaaddress" v-model.trim="linkedTo.stealthMetaAddress" rows="3" max-rows="4" class="px-2"></b-form-textarea>
        </b-form-group>
        <b-form-group v-if="false" label="ENS Name:" label-for="address-ensname" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-form-input size="sm" plaintext id="address-ensname" v-model.trim="account.ensName" class="px-2 w-75"></b-form-input>
        </b-form-group>
        <b-form-group v-if="type == 'stealthAddress'" label="Created Via Stealth Transfers:" label-for="address-stealthtransfers" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-row class="px-2">
            <b-col cols="4" class="px-2 mt-1">
              <font size="-1">When</font>
            </b-col>
            <b-col cols="4" class="px-2 mt-1">
              <font size="-1">From</font>
            </b-col>
            <b-col cols="4" class="px-0 mt-1">
              <font size="-1">Transfers</font>
            </b-col>
          </b-row>
          <b-row v-for="(item, index) of stealthTransfers" v-bind:key="item.txHash" class="px-2">
            <b-col cols="4" class="px-0 mt-1">
              <!-- {{ formatTimestamp(item.timestamp) }} -->
              <b-button size="sm" :href="'https://sepolia.etherscan.io/tx/' + item.txHash" variant="link" v-b-popover.hover="'View in explorer'" target="_blank" class="m-0 ml-1 p-0 px-2">
                {{ formatTimestamp(item.timestamp) }}
              </b-button>
            </b-col>
            <b-col cols="4" class="px-0 mt-1">
              <b-button v-if="item.tx && item.tx.from" size="sm" :href="'https://sepolia.etherscan.io/address/' + item.tx.from" variant="link" v-b-popover.hover="'View in explorer'" target="_blank" class="m-0 ml-1 p-0 px-2">
                {{ item.tx.from.substring(0, 10) + '...' + item.tx.from.slice(-8) }}
              </b-button>
            </b-col>
            <b-col cols="4" class="px-0 mt-1">
              <b-row v-for="(subitem, subindex) of item.transfers" v-bind:key="item.token">
                <b-col cols="12">
                  <span v-if="getTokenType(subitem.token) == 'eth'">
                    <font size="-1">{{ formatETH(subitem.value) + ' ETH'}}</font>
                  </span>
                  <span v-else>
                    <font size="-1">TODO: other tokens</font>
                  </span>
                </b-col>
              </b-row>
            </b-col>
          </b-row>
        </b-form-group>

        <b-form-group label="Name:" label-for="address-name" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-input-group size="sm" class="w-75">
            <b-form-input size="sm" type="text" id="address-name" v-model.trim="name" debounce="600" placeholder="optional"></b-form-input>
            <b-input-group-append>
              <div>
                <b-button size="sm" :pressed.sync="mine" variant="transparent" v-b-popover.hover="addressTypeInfo[type || 'address'].name" class="m-0 ml-5 p-0"><b-icon :icon="mine ? 'star-fill' : 'star'" shift-v="+1" font-scale="0.95" :variant="addressTypeInfo[type || 'address'].variant"></b-icon></b-button>
                <b-button size="sm" :pressed.sync="favourite" variant="transparent" v-b-popover.hover="'Favourite?'" class="m-0 ml-1 p-0"><b-icon :icon="favourite ? 'heart-fill' : 'heart'" shift-v="+1" font-scale="0.95" variant="danger"></b-icon></b-button>
              </div>
            </b-input-group-append>
          </b-input-group>
        </b-form-group>
        <b-form-group label="Notes:" label-for="address-notes" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-form-textarea size="sm" id="address-notes" v-model.trim="notes" debounce="600" placeholder="..." class="w-100"></b-form-textarea>
        </b-form-group>
        <b-form-group label="Source:" label-for="address-source" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-form-input size="sm" plaintext id="address-source" :value="source && (source.substring(0, 1).toUpperCase() + source.slice(1))" class="px-2 w-25"></b-form-input>
        </b-form-group>
        <b-form-group v-if="address" label="" label-for="address-delete" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-button size="sm" @click="deleteAddress(address);" variant="link" v-b-popover.hover.top="'Delete address ' + address.substring(0, 10) + '...' + address.slice(-8) + '?'"><b-icon-trash shift-v="+1" font-scale="1.1" variant="danger"></b-icon-trash></b-button>
        </b-form-group>
      </b-modal>
    </div>
  `,
  data: function () {
    return {
      count: 0,
      reschedule: true,
      addressTypeInfo: {
        "address": { variant: "warning", name: "My Address" },
        "stealthAddress": { variant: "dark", name: "My Stealth Address" },
        "stealthMetaAddress": { variant: "success", name: "My Stealth Meta-Address" },
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
    chainId() {
      return store.getters['connection/chainId'];
    },
    address() {
      return store.getters['viewAddress/address'];
    },
    linkedTo() {
      return store.getters['viewAddress/linkedTo'];
    },
    type() {
      return store.getters['viewAddress/type'];
    },
    mine: {
      get: function () {
        return store.getters['viewAddress/mine'];
      },
      set: function (mine) {
        store.dispatch('data/setAddressField', { account: store.getters['viewAddress/address'], field: 'mine', value: mine });
        store.dispatch('viewAddress/setMine', mine);
      },
    },
    favourite: {
      get: function () {
        return store.getters['viewAddress/favourite'];
      },
      set: function (favourite) {
        store.dispatch('data/setAddressField', { account: store.getters['viewAddress/address'], field: 'favourite', value: favourite });
        store.dispatch('viewAddress/setFavourite', favourite);
      },
    },
    name: {
      get: function () {
        return store.getters['viewAddress/name'];
      },
      set: function (name) {
        store.dispatch('data/setAddressField', { account: store.getters['viewAddress/address'], field: 'name', value: name });
        store.dispatch('viewAddress/setName', name);
      },
    },
    notes: {
      get: function () {
        return store.getters['viewAddress/notes'];
      },
      set: function (notes) {
        store.dispatch('data/setAddressField', { account: store.getters['viewAddress/address'], field: 'notes', value: notes });
        store.dispatch('viewAddress/setNotes', notes);
      },
    },
    source() {
      return store.getters['viewAddress/source'];
    },
    stealthTransfers() {
      return store.getters['viewAddress/stealthTransfers'];
    },
    show: {
      get: function () {
        return store.getters['viewAddress/show'];
      },
      set: function (show) {
        store.dispatch('viewAddress/setShow', show);
      },
    },
  },
  methods: {
    getTokenType(address) {
      if (address == ADDRESS_ETHEREUMS) {
        return "eth";
      } else {
        // TODO: ERC-20 & ERC-721
        return address.substring(0, 10) + '...' + address.slice(-8);
      }
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
        // if (this.settings.reportingDateTime == 1) {
          return moment.unix(ts).utc().format("YYYY-MM-DD HH:mm:ss");
        // } else {
        //   return moment.unix(ts).format("YYYY-MM-DD HH:mm:ss");
        // }
      }
      return null;
    },
    saveSettings() {
      logInfo("ViewAddress", "methods.saveSettings - transfersSettings: " + JSON.stringify(this.settings, null, 2));
      localStorage.transfersSettings = JSON.stringify(this.settings);
    },
    setShow(show) {
      store.dispatch('viewAddress/setShow', show);
    },
    async deleteAddress(account) {
      this.$bvModal.msgBoxConfirm('Are you sure?')
        .then(value => {
          if (value) {
            store.dispatch('data/deleteAddress', account);
            this.$refs['viewaddress'].hide();
          }
        })
        .catch(err => {
          // An error occurred
        })
    },
    async timeoutCallback() {
      logDebug("ViewAddress", "timeoutCallback() count: " + this.count);

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
    logDebug("ViewAddress", "beforeDestroy()");
  },
  mounted() {
    logDebug("ViewAddress", "mounted() $route: " + JSON.stringify(this.$route.params));
    store.dispatch('data/restoreState');
    if ('transfersSettings' in localStorage) {
      const tempSettings = JSON.parse(localStorage.transfersSettings);
      if ('version' in tempSettings && tempSettings.version == 0) {
        this.settings = tempSettings;
        this.settings.currentPage = 1;
      }
    }
    this.reschedule = true;
    logDebug("ViewAddress", "Calling timeoutCallback()");
    this.timeoutCallback();
  },
  destroyed() {
    this.reschedule = false;
  },
};

const viewAddressModule = {
  namespaced: true,
  state: {
    address: null,
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
    address: state => state.address,
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
    viewAddress(state, address) {
      logInfo("viewAddressModule", "mutations.viewAddress - address: " + address);
      const data = store.getters['data/addresses'][address] || {};
      state.address = address;
      state.linkedTo = data.linkedTo || { address: null, stealthMetaAddress: null };
      state.type = data.type;
      state.mine = data.mine;
      state.favourite = data.favourite;
      state.name = data.name;
      state.notes = data.notes;
      state.source = data.source;
      const stealthTransfers = [];
      if (data.type == "stealthAddress") {
        const transfers = store.getters['data/transfers'][store.getters['connection/chainId']] || {};
        for (const [blockNumber, logIndexes] of Object.entries(transfers)) {
          for (const [logIndex, item] of Object.entries(logIndexes)) {
            if (item.schemeId == 0 && item.stealthAddress == address) {
              stealthTransfers.push(item);
            }
          }
        }
      }
      Vue.set(state, 'stealthTransfers', stealthTransfers);
      state.show = true;
    },
    setMine(state, mine) {
      logInfo("viewAddressModule", "mutations.setMine - mine: " + mine);
      state.mine = mine;
    },
    setFavourite(state, favourite) {
      logInfo("viewAddressModule", "mutations.setFavourite - favourite: " + favourite);
      state.favourite = favourite;
    },
    setName(state, name) {
      logInfo("viewAddressModule", "mutations.setName - name: " + name);
      state.name = name;
    },
    setNotes(state, notes) {
      logInfo("viewAddressModule", "mutations.setNotes - notes: " + notes);
      state.notes = notes;
    },
    setShow(state, show) {
      state.show = show;
    },
  },
  actions: {
    async viewAddress(context, address) {
      logInfo("viewAddressModule", "actions.viewAddress - address: " + address);
      await context.commit('viewAddress', address);
    },
    async setMine(context, mine) {
      logInfo("viewAddressModule", "actions.setMine - mine: " + mine);
      await context.commit('setMine', mine);
    },
    async setFavourite(context, favourite) {
      logInfo("viewAddressModule", "actions.setFavourite - favourite: " + favourite);
      await context.commit('setFavourite', favourite);
    },
    async setName(context, name) {
      logInfo("viewAddressModule", "actions.setName - name: " + name);
      await context.commit('setName', name);
    },
    async setNotes(context, notes) {
      logInfo("viewAddressModule", "actions.setNotes - notes: " + notes);
      await context.commit('setNotes', notes);
    },
    async setSource(context, source) {
      logInfo("viewAddressModule", "actions.setSource - source: " + source);
      await context.commit('setSource', source);
    },
    async setShow(context, show) {
      await context.commit('setShow', show);
    },
  },
};
