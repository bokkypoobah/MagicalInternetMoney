const NewAddress = {
  template: `
    <div>
      aaaa

      <b-modal ref="viewaddress" v-model="show" id="modal-newaddress" hide-footer header-class="m-0 px-3 py-2" body-bg-variant="light" size="lg">
        <template #modal-title>New Address</template>

        <b-form-group label="Action: " label-for="addnewaddress-type" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-form-select size="sm" id="addnewaddress-type" v-model="action" :options="newAccountActions" class="w-50"></b-form-select>
        </b-form-group>
        <b-form-group v-if="action == 'generateStealthMetaAddress'" label="Phrase:" label-for="addnewaddress-phrase" label-size="sm" label-cols-sm="3" label-align-sm="right" description="This exact phrase with the linked address is required for the recovery of your stealth keys!" class="mx-0 my-1 p-0">
          <b-form-input size="sm" id="addnewaddress-phrase" v-model.trim="phrase" placeholder="enter phrase" class="w-75"></b-form-input>
        </b-form-group>
        <b-form-group v-if="action == 'generateStealthMetaAddress'" label="" label-for="addnewaddress-generate" label-size="sm" label-cols-sm="3" label-align-sm="right" description="Click Generate and sign the phrase with your web3 attached account" class="mx-0 my-1 p-0">
          <b-button size="sm" :disabled="!coinbase" id="addnewaddress-generate" @click="generateNewStealthMetaAddress" variant="primary">Generate</b-button>
        </b-form-group>
        <!-- <b-form-group v-if="action == 'addCoinbase'" label="Attached Web3 Address:" label-for="addnewaddress-coinbase" label-size="sm" label-cols-sm="3" label-align-sm="right" :state="addNewAddressCoinbaseFeedback == null" :invalid-feedback="addNewAddressCoinbaseFeedback" class="mx-0 my-1 p-0">
          <b-form-input size="sm" readonly id="addnewaddress-coinbase" :value="coinbase" class="w-75"></b-form-input>
        </b-form-group> -->
        <!-- <b-form-group v-if="action == 'addAddress'" label="Address:" label-for="addnewaddress-address" label-size="sm" label-cols-sm="3" label-align-sm="right" :state="!address || addNewAddressAddressFeedback == null" :invalid-feedback="addNewAddressAddressFeedback" class="mx-0 my-1 p-0">
          <b-form-input size="sm" id="addnewaddress-address" v-model.trim="address" placeholder="0x1234...6789" class="w-75"></b-form-input>
        </b-form-group> -->

        {{ action }}
        <b-form-group v-if="action == 'addStealthMetaAddress'" label="Stealth Meta-Address:" label-for="addnewaddress-stealthmetaaddress" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-form-textarea size="sm" id="addnewaddress-stealthmetaaddress" v-model.trim="address" debounce="600" placeholder="st:eth:0x1234...6789" rows="3" max-rows="4" class="w-100"></b-form-textarea>
        </b-form-group>


        <!-- <b-form-group v-if="action == 'addStealthMetaAddress'" label="Linked To Address:" label-for="addnewaddress-linkedtoaddress" label-size="sm" label-cols-sm="3" label-align-sm="right" :state="!linkedToAddress || addNewAddressLinkedToFeedback == null" :invalid-feedback="addNewAddressLinkedToFeedback" class="mx-0 my-1 p-0">
          <b-form-input size="sm" id="addnewaddress-linkedtoaddress" v-model.trim="linkedToAddress" placeholder="0x1234...6789" class="w-75"></b-form-input>
        </b-form-group> -->
        <!-- <b-form-group v-if="action == 'generateStealthMetaAddress'" label="Generated Stealth Meta-Address:" label-for="addnewaddress-generatedstealthmetaaddress" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-form-textarea size="sm" readonly id="addnewaddress-generatedstealthmetaaddress" v-model.trim="stealthMetaAddress" placeholder="Click generate and sign the phrase with your web3 attached wallet" rows="3" max-rows="4" class="w-75"></b-form-textarea>
        </b-form-group> -->
        <!-- <b-form-group v-if="action == 'generateStealthMetaAddress'" label="Linked To Address:" label-for="addnewaddress-generatedlinkedtoaddress" label-size="sm" label-cols-sm="3" label-align-sm="right" description="Attached web3 address" class="mx-0 my-1 p-0">
          <b-form-input size="sm" readonly id="addnewaddress-coinbase" :value="linkedToAddress" class="w-75"></b-form-input>
        </b-form-group> -->
        <!-- <b-form-group v-if="action == 'addAddress' || action == 'addStealthMetaAddress'" label="Mine:" label-for="addnewaddress-mine" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-button size="sm" id="addnewaddress-mine" :pressed.sync="mine" @click="saveSettings" variant="transparent"><b-icon :icon="mine ? 'star-fill' : 'star'" shift-v="+1" font-scale="0.95" :variant="mine ? 'warning' : 'secondary'"></b-icon></b-button>
        </b-form-group> -->
        <!-- <b-form-group label="Favourite:" label-for="addnewaddress-favourite" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-button size="sm" id="addnewaddress-favourite" :pressed.sync="favourite" @click="saveSettings" variant="transparent"><b-icon :icon="favourite ? 'heart-fill' : 'heart'" shift-v="+1" font-scale="0.95" variant="danger"></b-icon></b-button>
        </b-form-group> -->
        <!-- <b-form-group label="Name:" label-for="addnewaddress-name" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-form-input size="sm" id="addnewaddress-name" v-model.trim="name" @change="saveSettings" placeholder="optional" class="w-50"></b-form-input>
        </b-form-group> -->
        <!-- <b-form-group label="" label-for="addnewaddress-submit" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-button size="sm" :disabled="!!addNewAddressFeedback" id="addnewaddress-submit" @click="addNewAddress" variant="primary">Add/Update</b-button>
        </b-form-group> -->


        <!--
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
        -->
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
      newAccountActions: [
        { value: 'addCoinbase', text: 'Add Attached Web3 Address' },
        { value: 'addAddress', text: 'Add Address' },
        { value: 'addStealthMetaAddress', text: 'Add Stealth Meta-Address' },
        { value: 'generateStealthMetaAddress', text: 'Generate Stealth Meta-Address' },
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
    action: {
      get: function () {
        return store.getters['newAddress/action'];
      },
      set: function (action) {
        // store.dispatch('data/setAddressField', { account: store.getters['newAddress/address'], field: 'action', value: action });
        store.dispatch('newAddress/setAction', action);
      },
    },
    address: {
      get: function () {
        return store.getters['newAddress/address'];
      },
      set: function (address) {
        store.dispatch('newAddress/setAddress', address);
      },
    },
    phrase: {
      get: function () {
        return store.getters['newAddress/phrase'];
      },
      set: function (phrase) {
        // store.dispatch('data/setAddressField', { account: store.getters['newAddress/address'], field: 'phrase', value: phrase });
        store.dispatch('newAddress/setPhrase', phrase);
      },
    },

    type() {
      return store.getters['newAddress/type'];
    },
    mine: {
      get: function () {
        return store.getters['newAddress/mine'];
      },
      set: function (mine) {
        store.dispatch('data/setAddressField', { account: store.getters['newAddress/address'], field: 'mine', value: mine });
        store.dispatch('newAddress/setMine', mine);
      },
    },
    favourite: {
      get: function () {
        return store.getters['newAddress/favourite'];
      },
      set: function (favourite) {
        store.dispatch('data/setAddressField', { account: store.getters['newAddress/address'], field: 'favourite', value: favourite });
        store.dispatch('newAddress/setFavourite', favourite);
      },
    },
    name: {
      get: function () {
        return store.getters['newAddress/name'];
      },
      set: function (name) {
        store.dispatch('data/setAddressField', { account: store.getters['newAddress/address'], field: 'name', value: name });
        store.dispatch('newAddress/setName', name);
      },
    },
    notes: {
      get: function () {
        return store.getters['newAddress/notes'];
      },
      set: function (notes) {
        store.dispatch('data/setAddressField', { account: store.getters['newAddress/address'], field: 'notes', value: notes });
        store.dispatch('newAddress/setNotes', notes);
      },
    },
    source() {
      return store.getters['newAddress/source'];
    },
    show: {
      get: function () {
        return store.getters['newAddress/show'];
      },
      set: function (show) {
        store.dispatch('newAddress/setShow', show);
      },
    },
  },
  methods: {
    saveSettings() {
      logInfo("NewAddress", "methods.saveSettings - transfersSettings: " + JSON.stringify(this.settings, null, 2));
      localStorage.transfersSettings = JSON.stringify(this.settings);
    },
    setShow(show) {
      store.dispatch('newAddress/setShow', show);
    },

    async generateNewStealthMetaAddress() {
      logInfo("NewAddress", "methods.generateNewStealthMetaAddress BEGIN: " + JSON.stringify(this.phrase, null, 2));
      logInfo("NewAddress", "methods.generateNewStealthMetaAddress - coinbase: " + this.coinbase);
      const phraseInHex = ethers.utils.hexlify(ethers.utils.toUtf8Bytes(this.phrase));
      logInfo("NewAddress", "methods.generateNewStealthMetaAddress - phraseInHex: " + phraseInHex);
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
      const viewingPrivateKey = keyPair2.privateKey;
      const spendingPublicKey = ethers.utils.computePublicKey(keyPair1.privateKey, true);
      const viewingPublicKey = ethers.utils.computePublicKey(keyPair2.privateKey, true);
      const stealthMetaAddress = "st:eth:" + spendingPublicKey + viewingPublicKey.substring(2);
      store.dispatch('newAddress/setKeys', { viewingPrivateKey, spendingPublicKey, viewingPublicKey, stealthMetaAddress });

      // console.log("stealthMetaAddress: " + stealthMetaAddress);
      // this.spendingPublicKey = spendingPublicKey;
      // this.newAccount.viewingPublicKey = viewingPublicKey;
      // this.newAccount.linkedToAddress = this.coinbase;
      // this.newAccount.stealthMetaAddress = stealthMetaAddress;
      // logInfo("NewAddress", "methods.generateNewStealthMetaAddress END: " + JSON.stringify(this.settings.newAccount, null, 2));
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
    action: 'addCoinbase',
    address: null,
    // stealthMetaAddress: null,
    linkedToAddress: null,
    phrase: "I want to login into my stealth wallet on Ethereum mainnet.",
    mine: null,
    favourite: null,
    name: null,
    notes: null,
    viewingPrivateKey: null,
    spendingPublicKey: null,
    viewingPublicKey: null,
    source: null,
    show: false,
  },
  getters: {
    action: state => state.action,
    address: state => state.address,
    // stealthMetaAddress: state => state.stealthMetaAddress,
    linkedToAddress: state => state.linkedToAddress,
    phrase: state => state.phrase,
    mine: state => state.mine,
    favourite: state => state.favourite,
    name: state => state.name,
    notes: state => state.notes,
    viewingPrivateKey: state => state.viewingPrivateKey,
    spendingPublicKey: state => state.spendingPublicKey,
    viewingPublicKey: state => state.viewingPublicKey,
    source: state => state.source,
    show: state => state.show,
  },
  mutations: {
    newAddress(state, blah) {
      logInfo("newAddressModule", "mutations.newAddress - blah: " + blah);
      state.action = 'addCoinbase';
      state.address = null;
      // state.stealthMetaAddress = null;
      state.linkedToAddress = null;
      state.phrase = "I want to login into my stealth wallet on Ethereum mainnet.";
      state.mine = false;
      state.favourite = false;
      state.name = null;
      state.notes = null;
      state.source = null;
      state.show = true;
    },
    setAction(state, action) {
      logInfo("newAddressModule", "mutations.setAction - action: " + action);
      state.action = action;
    },
    setAddress(state, address) {
      logInfo("newAddressModule", "mutations.setAddress - address: " + address);
      state.address = address;
    },
    setPhrase(state, phrase) {
      logInfo("newAddressModule", "mutations.setPhrase - phrase: " + phrase);
      state.phrase = phrase;
    },
    setKeys(state, keys) {
      logInfo("newAddressModule", "mutations.setKeys - keys: " + JSON.stringify(keys, null, 2));
      state.address = keys.stealthMetaAddress;
      state.viewingPrivateKey = keys.viewingPrivateKey;
      state.spendingPublicKey = keys.spendingPublicKey;
      state.viewingPublicKey = keys.viewingPublicKey;
      // state.linkedToAddress = this.coinbase;
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
    async newAddress(context, blah) {
      logInfo("newAddressModule", "actions.newAddress - blah: " + blah);
      await context.commit('newAddress', blah);
    },
    async setAction(context, action) {
      logInfo("newAddressModule", "actions.setAction - action: " + action);
      await context.commit('setAction', action);
    },
    async setAddress(context, address) {
      logInfo("newAddressModule", "addresss.setAddress - address: " + address);
      await context.commit('setAddress', address);
    },
    async setPhrase(context, phrase) {
      logInfo("newAddressModule", "phrases.setPhrase - phrase: " + phrase);
      await context.commit('setPhrase', phrase);
    },
    async setKeys(context, keys) {
      logInfo("newAddressModule", "keyss.setKeys - keys: " + JSON.stringify(keys, null, 2));
      await context.commit('setKeys', keys);
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
