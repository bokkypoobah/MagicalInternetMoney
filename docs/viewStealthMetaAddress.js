const ViewStealthMetaAddress = {
  template: `
    <div>
      <b-modal ref="viewstealthmetaaddress" v-model="show" hide-footer header-class="m-0 px-3 py-2" body-bg-variant="light" size="lg">
        <template #modal-title>Stealth Meta-Address</template>
        <b-form-group label="Address:" label-for="stealthmetaddress-address" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-form-textarea size="sm" plaintext id="stealthmetaddress-address" v-model.trim="address" rows="3" max-rows="4" class="px-2"></b-form-textarea>
        </b-form-group>
        <b-form-group label="" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <div>
            <b-button size="sm" :pressed.sync="junk" variant="transparent" v-b-popover.hover="junk ? 'Junk' : 'Not junk'" class="m-0 ml-2 p-0">
              <b-icon :icon="junk ? 'trash-fill' : 'trash'" shift-v="+1" font-scale="0.95" variant="primary">
              </b-icon>
            </b-button>
            <b-button size="sm" :pressed.sync="mine" variant="transparent" v-b-popover.hover="mine ? 'My account' : 'Not my account'" class="m-0 ml-3 p-0">
              <b-icon :icon="mine ? 'person-fill' : 'person'" shift-v="+1" font-scale="0.95" variant="primary">
              </b-icon>
            </b-button>
            <b-button size="sm" :pressed.sync="sendTo" variant="transparent" v-b-popover.hover="'ETH and tokens ' + (sendTo ? 'can' : 'cannot') + ' be sent to this address'" class="m-0 ml-3 p-0">
              <b-icon :icon="sendTo ? 'arrow-down-right-circle-fill' : 'arrow-down-right-circle'" shift-v="+1" font-scale="0.95" variant="primary">
              </b-icon>
            </b-button>
          </div>
        </b-form-group>

        <b-form-group label="Name:" label-for="stealthmetaddress-name" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-form-input size="sm" id="stealthmetaddress-name" v-model.trim="name" debounce="600" placeholder="optional" class="w-50"></b-form-input>
        </b-form-group>
        <b-form-group label="Notes:" label-for="stealthmetaddress-notes" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-form-textarea size="sm" id="stealthmetaddress-notes" v-model.trim="notes" debounce="600" placeholder="..." class="w-100"></b-form-textarea>
        </b-form-group>
        <b-form-group label="Linked To Address:" label-for="stealthmetaddress-linkedtoaddress" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-input-group size="sm" class="w-100">
            <b-form-input size="sm" plaintext id="stealthmetaddress-linkedtoaddress" v-model.trim="linkedToAddress" class="px-2"></b-form-input>
            <b-input-group-append>
              <div>
                <b-button size="sm" :href="explorer + 'address/' + linkedToAddress" variant="link" v-b-popover.hover="'View in explorer'" target="_blank" class="m-0 ml-1 p-0"><b-icon-link45deg shift-v="+1" font-scale="0.95"></b-icon-link45deg></b-button>
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
          <b-form-input size="sm" :type="spendingPrivateKey ? 'text' : 'password'" plaintext id="stealthmetaddress-viewingprivatekey" v-model.trim="viewingPrivateKey" class="px-2 w-100"></b-form-input>
        </b-form-group>
        <!-- <b-form-group v-if="phrase" label="Spending Public Key:" label-for="stealthmetaddress-spendingpublickey" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-form-input size="sm" plaintext id="stealthmetaddress-spendingpublickey" v-model.trim="spendingPublicKey" class="px-2 w-100"></b-form-input>
        </b-form-group> -->
        <!-- <b-form-group v-if="phrase" label="Viewing Public Key:" label-for="stealthmetaddress-viewingpublickey" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-form-input size="sm" plaintext id="stealthmetaddress-viewingpublickey" v-model.trim="viewingPublicKey" class="px-2 w-100"></b-form-input>
        </b-form-group> -->
        <b-form-group label="Source:" label-for="stealthmetaddress-source" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-form-input size="sm" plaintext id="stealthmetaddress-source" :value="source && (source.substring(0, 1).toUpperCase() + source.slice(1))" class="px-2 w-25"></b-form-input>
        </b-form-group>
        <b-form-group v-if="address" label="Registry" label-for="address-registry" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-button size="sm" @click="addAddressToRegistry(address);" variant="link" v-b-popover.hover.top="'Add address ' + address.substring(0, 17) + '...' + address.slice(-8) + ' to the ERC-6538 Stealth Meta-Address Registry?'"><b-icon-plus shift-v="+1" font-scale="1.1" variant="primary"></b-icon-plus></b-button>
        </b-form-group>
        <b-form-group v-if="address" label="" label-for="address-delete" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-button size="sm" @click="deleteAddress(address);" variant="link" v-b-popover.hover.top="'Delete address ' + address.substring(0, 17) + '...' + address.slice(-8) + '?'"><b-icon-trash shift-v="+1" font-scale="1.1" variant="danger"></b-icon-trash></b-button>
        </b-form-group>
      </b-modal>
    </div>
  `,
  data: function () {
    return {
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
    junk: {
      get: function () {
        return store.getters['viewStealthMetaAddress/junk'];
      },
      set: function (junk) {
        store.dispatch('data/setAddressField', { address: store.getters['viewStealthMetaAddress/address'], field: 'junk', value: junk });
        store.dispatch('viewStealthMetaAddress/setJunk', junk);
      },
    },
    mine: {
      get: function () {
        return store.getters['viewStealthMetaAddress/mine'];
      },
      set: function (mine) {
        store.dispatch('data/setAddressField', { address: store.getters['viewStealthMetaAddress/address'], field: 'mine', value: mine });
        store.dispatch('viewStealthMetaAddress/setMine', mine);
      },
    },
    sendTo: {
      get: function () {
        return store.getters['viewStealthMetaAddress/sendTo'];
      },
      set: function (sendTo) {
        store.dispatch('data/setAddressField', { address: store.getters['viewStealthMetaAddress/address'], field: 'sendTo', value: sendTo });
        store.dispatch('viewStealthMetaAddress/setSendTo', sendTo);
      },
    },
    name: {
      get: function () {
        return store.getters['viewStealthMetaAddress/name'];
      },
      set: function (name) {
        store.dispatch('data/setAddressField', { address: store.getters['viewStealthMetaAddress/address'], field: 'name', value: name });
        store.dispatch('viewStealthMetaAddress/setName', name);
      },
    },
    notes: {
      get: function () {
        return store.getters['viewStealthMetaAddress/notes'];
      },
      set: function (notes) {
        store.dispatch('data/setAddressField', { address: store.getters['viewStealthMetaAddress/address'], field: 'notes', value: notes });
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
    async deleteAddress(address) {
      logInfo("ViewStealthMetaAddress", "deleteAddress - address: " + JSON.stringify(address));
      this.$bvModal.msgBoxConfirm("Delete " + address.substring(0, 17) + '...' + address.slice(-8) + "?")
        .then(value => {
          if (value) {
            store.dispatch('data/deleteAddress', address);
            this.$refs['viewstealthmetaaddress'].hide();
          }
        })
        .catch(err => {
          // An error occurred
        })
    },
    async addAddressToRegistry(address) {
      logInfo("ViewStealthMetaAddress", "addAddressToRegistry - address: " + JSON.stringify(address));
      this.$bvModal.msgBoxConfirm("Add " + address.substring(0, 17) + '...' + address.slice(-8) + " to the ERC-6538 Registry?")
        .then(async value => {
          if (value) {
            console.log("TODO: Add address to registry");
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const contract = new ethers.Contract(ERC6538REGISTRYADDRESS, ERC6538REGISTRYABI, provider);
            const contractWithSigner = contract.connect(provider.getSigner());
            console.log("HERE");
            try {
              const tx = await contractWithSigner.registerKeys(ONLY_SUPPORTED_SCHEME_ID, ethers.utils.toUtf8Bytes(address));
              console.log("tx: " + JSON.stringify(tx));
            } catch (e) {
              console.log("ViewStealthMetaAddress registry.registerKeys(...) error: " + e.message);
            }
            // store.dispatch('data/addAddressToRegistry', address);
            // this.$refs['viewstealthmetaaddress'].hide();
          }
        })
        .catch(err => {
          // An error occurred
        })
    },
  },
  beforeDestroy() {
    logDebug("ViewStealthMetaAddress", "beforeDestroy()");
  },
  mounted() {
    logDebug("ViewStealthMetaAddress", "mounted() $route: " + JSON.stringify(this.$route.params));
    if ('transfersSettings' in localStorage) {
      const tempSettings = JSON.parse(localStorage.transfersSettings);
      if ('version' in tempSettings && tempSettings.version == 0) {
        this.settings = tempSettings;
      }
    }
  },
};

const viewStealthMetaAddressModule = {
  namespaced: true,
  state: {
    address: null,
    type: null,
    linkedToAddress: null,
    phrase: null,
    junk: null,
    mine: null,
    sendTo: null,
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
    junk: state => state.junk,
    mine: state => state.mine,
    sendTo: state => state.sendTo,
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
      state.junk = data.junk;
      state.mine = data.mine;
      state.sendTo = data.sendTo;
      state.name = data.name;
      state.notes = data.notes;
      state.spendingPrivateKey = null;
      state.viewingPrivateKey = data.viewingPrivateKey;
      state.spendingPublicKey = data.spendingPublicKey;
      state.viewingPublicKey = data.viewingPublicKey;
      state.source = data.source;
      state.show = true;
    },
    setJunk(state, junk) {
      logInfo("viewStealthMetaAddressModule", "mutations.setJunk - junk: " + junk);
      state.junk = junk;
    },
    setMine(state, mine) {
      logInfo("viewStealthMetaAddressModule", "mutations.setMine - mine: " + mine);
      state.mine = mine;
    },
    setSendTo(state, sendTo) {
      logInfo("viewStealthMetaAddressModule", "mutations.setSendTo - sendTo: " + sendTo);
      state.sendTo = sendTo;
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
    async setJunk(context, junk) {
      logInfo("viewStealthMetaAddressModule", "actions.setJunk - junk: " + junk);
      await context.commit('setJunk', junk);
    },
    async setMine(context, mine) {
      logInfo("viewStealthMetaAddressModule", "actions.setMine - mine: " + mine);
      await context.commit('setMine', mine);
    },
    async setSendTo(context, sendTo) {
      logInfo("viewStealthMetaAddressModule", "actions.setSendTo - sendTo: " + sendTo);
      await context.commit('setSendTo', sendTo);
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
