const NewAddress = {
  template: `
    <div>
      aaaa
      
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
        <b-form-group v-if="false" label="ENS Name:" label-for="address-ensname" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-form-input size="sm" plaintext id="address-ensname" v-model.trim="account.ensName" class="px-2 w-75"></b-form-input>
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
    saveSettings() {
      logInfo("NewAddress", "methods.saveSettings - transfersSettings: " + JSON.stringify(this.settings, null, 2));
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
      logDebug("NewAddress", "timeoutCallback() count: " + this.count);

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
    logDebug("NewAddress", "beforeDestroy()");
  },
  mounted() {
    logDebug("NewAddress", "mounted() $route: " + JSON.stringify(this.$route.params));
    store.dispatch('data/restoreState');
    if ('transfersSettings' in localStorage) {
      const tempSettings = JSON.parse(localStorage.transfersSettings);
      if ('version' in tempSettings && tempSettings.version == 0) {
        this.settings = tempSettings;
        this.settings.currentPage = 1;
      }
    }
    this.reschedule = true;
    logDebug("NewAddress", "Calling timeoutCallback()");
    this.timeoutCallback();
  },
  destroyed() {
    this.reschedule = false;
  },
};

const newAddressModule = {
  namespaced: true,
  state: {
    address: null,
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
    type: state => state.type,
    mine: state => state.mine,
    favourite: state => state.favourite,
    name: state => state.name,
    notes: state => state.notes,
    source: state => state.source,
    show: state => state.show,
  },
  mutations: {
    viewAddress(state, address) {
      logInfo("newAddressModule", "mutations.viewAddress - address: " + address);
      const data = store.getters['data/addresses'][address] || {};
      state.address = address;
      state.type = data.type;
      state.mine = data.mine;
      state.favourite = data.favourite;
      state.name = data.name;
      state.notes = data.notes;
      state.source = data.source;
      state.show = true;
    },
    setMine(state, mine) {
      logInfo("newAddressModule", "mutations.setMine - mine: " + mine);
      state.mine = mine;
    },
    setFavourite(state, favourite) {
      logInfo("newAddressModule", "mutations.setFavourite - favourite: " + favourite);
      state.favourite = favourite;
    },
    setName(state, name) {
      logInfo("newAddressModule", "mutations.setName - name: " + name);
      state.name = name;
    },
    setNotes(state, notes) {
      logInfo("newAddressModule", "mutations.setNotes - notes: " + notes);
      state.notes = notes;
    },
    setShow(state, show) {
      state.show = show;
    },
  },
  actions: {
    async viewAddress(context, address) {
      logInfo("newAddressModule", "actions.viewAddress - address: " + address);
      await context.commit('viewAddress', address);
    },
    async setMine(context, mine) {
      logInfo("newAddressModule", "actions.setMine - mine: " + mine);
      await context.commit('setMine', mine);
    },
    async setFavourite(context, favourite) {
      logInfo("newAddressModule", "actions.setFavourite - favourite: " + favourite);
      await context.commit('setFavourite', favourite);
    },
    async setName(context, name) {
      logInfo("newAddressModule", "actions.setName - name: " + name);
      await context.commit('setName', name);
    },
    async setNotes(context, notes) {
      logInfo("newAddressModule", "actions.setNotes - notes: " + notes);
      await context.commit('setNotes', notes);
    },
    async setSource(context, source) {
      logInfo("newAddressModule", "actions.setSource - source: " + source);
      await context.commit('setSource', source);
    },
    async setShow(context, show) {
      await context.commit('setShow', show);
    },
  },
};
