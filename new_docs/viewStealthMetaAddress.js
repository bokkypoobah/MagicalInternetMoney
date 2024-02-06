const ViewStealthMetaAddress = {
  template: `
    <div>
      <b-modal ref="viewstealthmetaaddress" v-model="show" hide-footer header-class="m-0 px-3 py-2" body-bg-variant="light" size="lg">
        <template #modal-title>Stealth Meta-Address</template>
        <b-form-group label="Address:" label-for="stealthmetaddress-address" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-form-textarea size="sm" plaintext id="stealthmetaddress-address" v-model.trim="address" rows="3" max-rows="4" class="px-2"></b-form-textarea>
        </b-form-group>
        <b-form-group label="Name:" label-for="stealthmetaddress-name" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-input-group size="sm" class="w-75">
            <b-form-input size="sm" id="stealthmetaddress-name" v-model.trim="name" debounce="600" placeholder="optional" class="w-50"></b-form-input>
            <b-input-group-append>
              <div>
                <b-button size="sm" :pressed.sync="mine" variant="transparent" v-b-popover.hover="addressTypeInfo['stealthMetaAddress'].name" class="m-0 ml-5 p-0"><b-icon :icon="mine ? 'star-fill' : 'star'" shift-v="+1" font-scale="0.95" :variant="addressTypeInfo['stealthMetaAddress'].variant"></b-icon></b-button>
                <b-button size="sm" :pressed.sync="favourite" variant="transparent" v-b-popover.hover="'Favourite?'" class="m-0 ml-1 p-0"><b-icon :icon="favourite ? 'heart-fill' : 'heart'" shift-v="+1" font-scale="0.95" variant="danger"></b-icon></b-button>
              </div>
            </b-input-group-append>
          </b-input-group>
        </b-form-group>
        <b-form-group label="Notes:" label-for="stealthmetaddress-notes" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-form-textarea size="sm" id="stealthmetaddress-notes" v-model.trim="notes" debounce="600" placeholder="..." class="w-100"></b-form-textarea>
        </b-form-group>
        <b-form-group label="Linked To Address:" label-for="stealthmetaddress-linkedtoaddress" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-input-group size="sm" class="w-100">
            <b-form-input size="sm" plaintext id="stealthmetaddress-linkedtoaddress" v-model.trim="linkedToAddress" class="px-2"></b-form-input>
            <b-input-group-append>
              <div>
                <b-button size="sm" :href="'https://sepolia.etherscan.io/address/' + linkedToAddress" variant="link" v-b-popover.hover="'View in explorer'" target="_blank" class="m-0 ml-1 p-0"><b-icon-link45deg shift-v="+1" font-scale="0.95"></b-icon-link45deg></b-button>
              </div>
            </b-input-group-append>
          </b-input-group>
        </b-form-group>
        <b-form-group v-if="phrase" label="Phrase:" label-for="stealthmetaddress-phrase" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-form-input size="sm" plaintext id="stealthmetaddress-phrase" v-model.trim="phrase" class="px-2 w-100"></b-form-input>
        </b-form-group>
        <b-form-group v-if="phrase" label="Spending Private Key:" label-for="stealthmetaddress-spendingprivatekey" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-input-group size="sm" class="w-100">
            <b-form-input :type="spendingPrivateKey ? 'text' : 'password'" size="sm" plaintext id="stealthmetaddress-spendingprivatekey" :value="spendingPrivateKey ? spendingPrivateKey : 'a'.repeat(65) + 'h'" class="px-2"></b-form-input>
            <b-input-group-append>
              <b-button v-if="!spendingPrivateKey" :disabled="linkedToAddress != coinbase" @click="revealModalAddressSpendingPrivateKey();" variant="link" class="m-0 ml-2 p-0"><b-icon-eye shift-v="+1" font-scale="1.1"></b-icon-eye></b-button>
            </b-input-group-append>
          </b-input-group>
        </b-form-group>
        <b-form-group v-if="phrase" label="Viewing Private Key:" label-for="stealthmetaddress-viewingprivatekey" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-form-input size="sm" plaintext id="stealthmetaddress-viewingprivatekey" v-model.trim="viewingPrivateKey" class="px-2 w-100"></b-form-input>
        </b-form-group>
        <b-form-group v-if="phrase" label="Spending Public Key:" label-for="stealthmetaddress-spendingpublickey" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-form-input size="sm" plaintext id="stealthmetaddress-spendingpublickey" v-model.trim="spendingPublicKey" class="px-2 w-100"></b-form-input>
        </b-form-group>
        <b-form-group v-if="phrase" label="Viewing Public Key:" label-for="stealthmetaddress-viewingpublickey" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-form-input size="sm" plaintext id="stealthmetaddress-viewingpublickey" v-model.trim="viewingPublicKey" class="px-2 w-100"></b-form-input>
        </b-form-group>
        <b-form-group label="Source:" label-for="stealthmetaddress-source" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-form-input size="sm" plaintext id="stealthmetaddress-source" :value="source && (source.substring(0, 1).toUpperCase() + source.slice(1))" class="px-2 w-25"></b-form-input>
        </b-form-group>
        <b-form-group v-if="address" label="" label-for="address-delete" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-button size="sm" @click="deleteAddress(address);" variant="link" v-b-popover.hover.top="'Delete address ' + address.substring(0, 17) + '...' + address.slice(-8) + '?'"><b-icon-trash shift-v="+1" font-scale="1.1" variant="danger"></b-icon-trash></b-button>
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
      return store.getters['viewStealthMetaAddress/address'];
    },
    type() {
      return store.getters['viewStealthMetaAddress/type'];
    },
    linkedToAddress() {
      return store.getters['viewStealthMetaAddress/linkedToAddress'];
    },
    phrase() {
      return store.getters['viewStealthMetaAddress/phrase'];
    },
    mine: {
      get: function () {
        return store.getters['viewStealthMetaAddress/mine'];
      },
      set: function (mine) {
        store.dispatch('data/setAddressField', { account: store.getters['viewStealthMetaAddress/address'], field: 'mine', value: mine });
        store.dispatch('viewStealthMetaAddress/setMine', mine);
      },
    },
    favourite: {
      get: function () {
        return store.getters['viewStealthMetaAddress/favourite'];
      },
      set: function (favourite) {
        store.dispatch('data/setAddressField', { account: store.getters['viewStealthMetaAddress/address'], field: 'favourite', value: favourite });
        store.dispatch('viewStealthMetaAddress/setFavourite', favourite);
      },
    },
    name: {
      get: function () {
        return store.getters['viewStealthMetaAddress/name'];
      },
      set: function (name) {
        store.dispatch('data/setAddressField', { account: store.getters['viewStealthMetaAddress/address'], field: 'name', value: name });
        store.dispatch('viewStealthMetaAddress/setName', name);
      },
    },
    notes: {
      get: function () {
        return store.getters['viewStealthMetaAddress/notes'];
      },
      set: function (notes) {
        store.dispatch('data/setAddressField', { account: store.getters['viewStealthMetaAddress/address'], field: 'notes', value: notes });
        store.dispatch('viewStealthMetaAddress/setNotes', notes);
      },
    },
    spendingPrivateKey() {
      return store.getters['viewStealthMetaAddress/spendingPrivateKey'];
    },
    viewingPrivateKey() {
      return store.getters['viewStealthMetaAddress/viewingPrivateKey'];
    },
    spendingPublicKey() {
      return store.getters['viewStealthMetaAddress/spendingPublicKey'];
    },
    viewingPublicKey() {
      return store.getters['viewStealthMetaAddress/viewingPublicKey'];
    },
    source() {
      return store.getters['viewStealthMetaAddress/source'];
    },
    show: {
      get: function () {
        return store.getters['viewStealthMetaAddress/show'];
      },
      set: function (show) {
        store.dispatch('viewStealthMetaAddress/setShow', show);
      },
    },
  },
  methods: {
    saveSettings() {
      logInfo("ViewStealthMetaAddress", "methods.saveSettings - transfersSettings: " + JSON.stringify(this.settings, null, 2));
      localStorage.transfersSettings = JSON.stringify(this.settings);
    },
    async revealModalAddressSpendingPrivateKey() {
      logInfo("ViewStealthMetaAddress", "methods.revealModalAddressSpendingPrivateKey - phrase: " + this.phrase);
      const phraseInHex = ethers.utils.hexlify(ethers.utils.toUtf8Bytes(this.phrase));
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
      store.dispatch('viewStealthMetaAddress/setSpendingPrivateKey', keyPair1.privateKey);
    },

    setShow(show) {
      store.dispatch('viewStealthMetaAddress/setShow', show);
    },
    async deleteAddress(account) {
      this.$bvModal.msgBoxConfirm('Are you sure?')
        .then(value => {
          if (value) {
            store.dispatch('data/deleteAddress', account);
            this.$refs['viewstealthmetaaddress'].hide();
          }
        })
        .catch(err => {
          // An error occurred
        })
    },
    async timeoutCallback() {
      logDebug("ViewStealthMetaAddress", "timeoutCallback() count: " + this.count);

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
    logDebug("ViewStealthMetaAddress", "beforeDestroy()");
  },
  mounted() {
    logDebug("ViewStealthMetaAddress", "mounted() $route: " + JSON.stringify(this.$route.params));
    // store.dispatch('data/restoreState');
    if ('transfersSettings' in localStorage) {
      const tempSettings = JSON.parse(localStorage.transfersSettings);
      if ('version' in tempSettings && tempSettings.version == 0) {
        this.settings = tempSettings;
        // this.settings.currentPage = 1;
      }
    }
    // this.reschedule = true;
    // logDebug("ViewStealthMetaAddress", "Calling timeoutCallback()");
    // this.timeoutCallback();
  },
  destroyed() {
    this.reschedule = false;
  },
};

const viewStealthMetaAddressModule = {
  namespaced: true,
  state: {
    address: null,
    type: null,
    linkedToAddress: null,
    phrase: null,
    mine: null,
    favourite: null,
    name: null,
    notes: null,
    spendingPrivateKey: 'null abc',
    viewingPrivateKey: null,
    spendingPublicKey: null,
    viewingPublicKey: null,
    source: null,
    show: false,
  },
  getters: {
    address: state => state.address,
    type: state => state.type,
    linkedToAddress: state => state.linkedToAddress,
    phrase: state => state.phrase,
    mine: state => state.mine,
    favourite: state => state.favourite,
    name: state => state.name,
    notes: state => state.notes,
    spendingPrivateKey: state => state.spendingPrivateKey,
    viewingPrivateKey: state => state.viewingPrivateKey,
    spendingPublicKey: state => state.spendingPublicKey,
    viewingPublicKey: state => state.viewingPublicKey,
    source: state => state.source,
    show: state => state.show,
  },
  mutations: {
    viewStealthMetaAddress(state, stealthMetaAddress) {
      logInfo("viewStealthMetaAddressModule", "mutations.viewStealthMetaAddress - stealthMetaAddress: " + stealthMetaAddress);
      const data = store.getters['data/addresses'][stealthMetaAddress] || {};
      state.address = stealthMetaAddress;
      state.type = data.type;
      state.linkedToAddress = data.linkedToAddress;
      state.phrase = data.phrase;
      state.mine = data.mine;
      state.favourite = data.favourite;
      state.name = data.name;
      state.notes = data.notes;
      state.spendingPrivateKey = null;
      state.viewingPrivateKey = data.viewingPrivateKey;
      state.spendingPublicKey = data.spendingPublicKey;
      state.viewingPublicKey = data.viewingPublicKey;
      state.source = data.source;
      state.show = true;
    },
    setMine(state, mine) {
      logInfo("viewStealthMetaAddressModule", "mutations.setMine - mine: " + mine);
      state.mine = mine;
    },
    setFavourite(state, favourite) {
      logInfo("viewStealthMetaAddressModule", "mutations.setFavourite - favourite: " + favourite);
      state.favourite = favourite;
    },
    setName(state, name) {
      logInfo("viewStealthMetaAddressModule", "mutations.setName - name: " + name);
      state.name = name;
    },
    setNotes(state, notes) {
      logInfo("viewStealthMetaAddressModule", "mutations.setNotes - notes: " + notes);
      state.notes = notes;
    },
    setSpendingPrivateKey(state, spendingPrivateKey) {
      logInfo("viewStealthMetaAddressModule", "mutations.setSpendingPrivateKey - spendingPrivateKey: " + spendingPrivateKey);
      state.spendingPrivateKey = spendingPrivateKey;
    },
    setShow(state, show) {
      state.show = show;
    },
  },
  actions: {
    async viewStealthMetaAddress(context, stealthMetaAddress) {
      logInfo("viewStealthMetaAddressModule", "actions.viewStealthMetaAddress - stealthMetaAddress: " + stealthMetaAddress);
      await context.commit('viewStealthMetaAddress', stealthMetaAddress);
    },
    async setMine(context, mine) {
      logInfo("viewStealthMetaAddressModule", "actions.setMine - mine: " + mine);
      await context.commit('setMine', mine);
    },
    async setFavourite(context, favourite) {
      logInfo("viewStealthMetaAddressModule", "actions.setFavourite - favourite: " + favourite);
      await context.commit('setFavourite', favourite);
    },
    async setName(context, name) {
      logInfo("viewStealthMetaAddressModule", "actions.setName - name: " + name);
      await context.commit('setName', name);
    },
    async setNotes(context, notes) {
      logInfo("viewStealthMetaAddressModule", "actions.setNotes - notes: " + notes);
      await context.commit('setNotes', notes);
    },
    async setSpendingPrivateKey(context, spendingPrivateKey) {
      logInfo("viewStealthMetaAddressModule", "actions.setSpendingPrivateKey - spendingPrivateKey: " + spendingPrivateKey);
      await context.commit('setSpendingPrivateKey', spendingPrivateKey);
    },
    async setSource(context, source) {
      logInfo("viewStealthMetaAddressModule", "actions.setSource - source: " + source);
      await context.commit('setSource', source);
    },
    async setShow(context, show) {
      await context.commit('setShow', show);
    },
  },
};
