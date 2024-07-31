const NewAddress = {
  template: `
    <div>
      <b-modal ref="newaddress" v-model="show" id="modal-newaddress" hide-footer header-class="m-0 px-3 py-2" body-bg-variant="light" size="lg">
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
        <b-form-group v-if="action == 'addCoinbase'" label="Attached Web3 Address:" label-for="addnewaddress-coinbase" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-form-input size="sm" plaintext id="addnewaddress-coinbase" :value="coinbase" class="px-2 w-75"></b-form-input>
        </b-form-group>
        <b-form-group v-if="action == 'addAddress'" label="Address:" label-for="addnewaddress-address" label-size="sm" label-cols-sm="3" label-align-sm="right" :state="!address || addNewAddressAddressFeedback == null" :invalid-feedback="addNewAddressAddressFeedback" class="mx-0 my-1 p-0">
          <b-form-input size="sm" id="addnewaddress-address" v-model.trim="address" debounce="600" placeholder="0x1234...6789" class="w-75"></b-form-input>
        </b-form-group>
        <b-form-group v-if="action == 'addStealthMetaAddress'" label="Stealth Meta-Address:" label-for="addnewaddress-stealthmetaaddress" label-size="sm" label-cols-sm="3" label-align-sm="right" :state="!address || addNewAddressStealthMetaAddressFeedback == null" :invalid-feedback="addNewAddressStealthMetaAddressFeedback" class="mx-0 my-1 p-0">
          <b-form-textarea size="sm" id="addnewaddress-stealthmetaaddress" v-model.trim="address" debounce="600" placeholder="st:eth:0x1234...6789" rows="3" max-rows="4" class="w-100"></b-form-textarea>
        </b-form-group>
        <b-form-group v-if="action == 'addStealthMetaAddress'" label="Linked To Address:" label-for="addnewaddress-linkedtoaddress" label-size="sm" label-cols-sm="3" label-align-sm="right" :state="!linkedToAddress || addNewAddressLinkedToAddressFeedback == null" :invalid-feedback="addNewAddressLinkedToAddressFeedback" class="mx-0 my-1 p-0">
          <b-form-input size="sm" id="addnewaddress-linkedtoaddress" v-model.trim="linkedToAddress" debounce="600" placeholder="0x1234...6789" class="w-75"></b-form-input>
        </b-form-group>
        <b-form-group v-if="action == 'generateStealthMetaAddress' && address" label="Generated Stealth Meta-Address:" label-for="addnewaddress-generatedstealthmetaaddress" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-form-textarea size="sm" plaintext id="addnewaddress-generatedstealthmetaaddress" v-model.trim="address" placeholder="Click generate and sign the phrase with your web3 attached wallet" rows="3" max-rows="4" class="px-2 w-75"></b-form-textarea>
        </b-form-group>
        <b-form-group v-if="action == 'generateStealthMetaAddress' && linkedToAddress" label="Linked To Address:" label-for="addnewaddress-generatedlinkedtoaddress" label-size="sm" label-cols-sm="3" label-align-sm="right" description="Attached web3 address" class="mx-0 my-1 p-0">
          <b-form-input size="sm" plaintext id="addnewaddress-coinbase" :value="linkedToAddress" class="px-2 w-75"></b-form-input>
        </b-form-group>

        <b-form-group label="" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 mt-1 mb-2 p-0">
          <b-button v-if="action == 'addAddress' || action == 'addStealthMetaAddress'" size="sm" :pressed.sync="mine" variant="transparent" v-b-popover.hover.ds500="mine ? 'My account' : 'Not my account'" class="m-0 mx-2 p-0">
            <b-icon :icon="mine ? 'person-fill' : 'person'" shift-v="+1" font-scale="1.2" :variant="mine ? 'primary' : 'secondary'">
            </b-icon>
          </b-button>
          <b-button v-if="action == 'addCoinbase' || action == 'addAddress'" size="sm" :pressed.sync="watch" variant="transparent" v-b-popover.hover.ds500="(watch ? 'Watch' : 'Do not watch') + ' this address for ETH, ERC-20, ERC-721 and ERC-1155 transfers'" class="m-0 mx-2 p-0">
            <b-icon :icon="watch ? 'eye-fill' : 'eye'" shift-v="+1" font-scale="1.2" :variant="watch ? 'primary' : 'secondary'">
            </b-icon>
          </b-button>
          <b-button v-if="action == 'addCoinbase' || action == 'addAddress'" size="sm" id="addnewaddress-send" :pressed.sync="sendFrom" variant="transparent" v-b-popover.hover.ds500="'ETH and tokens ' + (sendFrom ? 'can' : 'cannot') + ' be sent from this address'" class="m-0 mx-2 p-0">
            <b-icon :icon="sendFrom ? 'arrow-up-right-circle-fill' : 'arrow-up-right-circle'" shift-v="+1" font-scale="1.2" :variant="sendFrom ? 'primary' : 'secondary'">
            </b-icon>
          </b-button>
          <b-button size="sm" id="addnewaddress-sendto" :pressed.sync="sendTo" variant="transparent" v-b-popover.hover.ds500="'ETH and tokens ' + (sendTo ? 'can' : 'cannot') + ' be sent to this address'" class="m-0 mx-2 p-0">
            <b-icon :icon="sendTo ? 'arrow-down-right-circle-fill' : 'arrow-down-right-circle'" shift-v="+1" font-scale="1.2" :variant="sendTo ? 'primary' : 'secondary'">
            </b-icon>
          </b-button>
        </b-form-group>

        <b-form-group label="Name:" label-for="addnewaddress-name" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-form-input size="sm" id="addnewaddress-name" v-model.trim="name" debounce="600" placeholder="optional" class="w-50"></b-form-input>
        </b-form-group>

        <b-form-group label="" label-for="addnewaddress-submit" label-size="sm" label-cols-sm="3" label-align-sm="right" :description="addNewAddressFeedback" class="mx-0 my-1 p-0">
          <!-- <b-button size="sm" :disabled="!!addNewAddressFeedback" id="addnewaddress-submit" @click="addNewAddress" variant="primary">Add/Update</b-button> -->
          <b-button size="sm" :disabled="!!addNewAddressFeedback" id="addnewaddress-submit" @click="addNewAddress" variant="primary">Add/Update</b-button>
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
        // store.dispatch('data/setAddressField', { address: store.getters['newAddress/address'], field: 'action', value: action });
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
    linkedToAddress: {
      get: function () {
        return store.getters['newAddress/linkedToAddress'];
      },
      set: function (linkedToAddress) {
        store.dispatch('newAddress/setLinkedToAddress', linkedToAddress);
      },
    },
    phrase: {
      get: function () {
        return store.getters['newAddress/phrase'];
      },
      set: function (phrase) {
        store.dispatch('newAddress/setPhrase', phrase);
      },
    },
    mine: {
      get: function () {
        return store.getters['newAddress/mine'];
      },
      set: function (mine) {
        store.dispatch('newAddress/setMine', mine);
      },
    },
    watch: {
      get: function () {
        return store.getters['newAddress/watch'];
      },
      set: function (watch) {
        store.dispatch('newAddress/setWatch', watch);
      },
    },
    sendFrom: {
      get: function () {
        return store.getters['newAddress/sendFrom'];
      },
      set: function (sendFrom) {
        store.dispatch('newAddress/setSendFrom', sendFrom);
      },
    },
    sendTo: {
      get: function () {
        return store.getters['newAddress/sendTo'];
      },
      set: function (sendTo) {
        store.dispatch('newAddress/setSendTo', sendTo);
      },
    },
    name: {
      get: function () {
        return store.getters['newAddress/name'];
      },
      set: function (name) {
        store.dispatch('newAddress/setName', name);
      },
    },
    notes: {
      get: function () {
        return store.getters['newAddress/notes'];
      },
      set: function (notes) {
        store.dispatch('newAddress/setNotes', notes);
      },
    },
    viewingPrivateKey() {
      return store.getters['newAddress/viewingPrivateKey'];
    },
    spendingPublicKey() {
      return store.getters['newAddress/spendingPublicKey'];
    },
    viewingPublicKey() {
      return store.getters['newAddress/viewingPublicKey'];
    },
    show: {
      get: function () {
        return store.getters['newAddress/show'];
      },
      set: function (show) {
        store.dispatch('newAddress/setShow', show);
      },
    },

    addNewAddressAddressFeedback() {
      if (this.action == 'addAddress') {
        if (!this.address) {
          return "Enter Address";
        }
        try {
          const address = ethers.utils.getAddress(this.address);
        } catch (e) {
          return "Invalid Address";
        }
      }
      return null;
    },

    addNewAddressStealthMetaAddressFeedback() {
      if (this.action == 'addStealthMetaAddress') {
        if (!this.address) {
          return "Enter Stealth Meta-Address";
        }
        if (!this.address.match(/^st:eth:0x[0-9a-fA-F]{132}$/)) {
          return "Invalid Stealth Meta-Address";
        }
      }
      return null;
    },

    addNewAddressLinkedToAddressFeedback() {
      if (this.action == 'addStealthMetaAddress') {
        if (!this.linkedToAddress) {
          return "Enter Linked To Address";
        }
        if (!this.linkedToAddress.match(/^0x[0-9a-fA-F]{40}$/)) {
          return "Invalid Linked To Address";
        }
      }
      return null;
    },

    addNewAddressFeedback() {
      if (this.action == 'addCoinbase') {
        if (!this.coinbase) {
          return "Waiting for your web3 attached account connection";
        }
        return null;
      } else if (this.action == 'addAddress') {
        if (!this.address) {
          return "Enter Address";
        }
        if (!this.address.match(/^0x[0-9a-fA-F]{40}$/)) {
          return "Invalid Address";
        }
        return null;
      } else if (this.action == 'addStealthMetaAddress') {
        if (!this.address) {
          return "Enter Stealth Meta-Address";
        }
        if (!this.address.match(/^st:eth:0x[0-9a-fA-F]{132}$/)) {
          return "Invalid Stealth Meta-Address";
        }
        if (!this.linkedToAddress) {
          return "Enter Linked To Address";
        }
        if (!this.linkedToAddress.match(/^0x[0-9a-fA-F]{40}$/)) {
          return "Invalid Linked To Address";
        }
        return null;
      } else if (this.action == 'generateStealthMetaAddress') {
        if (!this.address) {
          return "Generate Stealth Meta-Address";
        }
        if (!this.address.match(/^st:eth:0x[0-9a-fA-F]{132}$/)) {
          return "Invalid Stealth Meta-Address";
        }
        if (!this.linkedToAddress) {
          return "Enter Linked To Address";
        }
        if (!this.linkedToAddress.match(/^0x[0-9a-fA-F]{40}$/)) {
          return "Invalid Linked To Address";
        }
        return null;
      }
      return "Aaargh";
    },


  },
  methods: {
    saveSettings() {
      console.log(now() + " INFO NewAddress:methods.saveSettings - transfersSettings: " + JSON.stringify(this.settings, null, 2));
      localStorage.transfersSettings = JSON.stringify(this.settings);
    },
    setShow(show) {
      store.dispatch('newAddress/setShow', show);
    },

    async generateNewStealthMetaAddress() {
      console.log(now() + " INFO NewAddress:methods.generateNewStealthMetaAddress BEGIN: " + JSON.stringify(this.phrase, null, 2));
      console.log(now() + " INFO NewAddress:methods.generateNewStealthMetaAddress - coinbase: " + this.coinbase);
      const phraseInHex = ethers.utils.hexlify(ethers.utils.toUtf8Bytes(this.phrase));
      console.log(now() + " INFO NewAddress:methods.generateNewStealthMetaAddress - phraseInHex: " + phraseInHex);
      const linkedToAddress = this.coinbase;
      const signature = await ethereum.request({
        method: 'personal_sign',
        params: [phraseInHex, linkedToAddress],
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
      store.dispatch('newAddress/setKeys', { viewingPrivateKey, spendingPublicKey, viewingPublicKey, stealthMetaAddress, linkedToAddress });
    },
    async addNewAddress() {
      console.log(now() + " INFO NewAddress:methods.addNewAddress BEGIN");
      store.dispatch('data/addNewAddress', {
        action: this.action,
        address: this.address,
        linkedToAddress: this.linkedToAddress,
        phrase: this.phrase,
        mine: this.mine,
        watch: this.watch,
        sendFrom: this.sendFrom,
        sendTo: this.sendTo,
        name: this.name,
        notes: this.notes,
        viewingPrivateKey: this.viewingPrivateKey,
        spendingPublicKey: this.spendingPublicKey,
        viewingPublicKey: this.viewingPublicKey,
        source: this.source,
      });
      this.$refs['newaddress'].hide();
    },

  },
  beforeDestroy() {
    // console.log(now() + " INFO NewAddress:beforeDestroy");
  },
  mounted() {
    // console.log(now() + " INFO NewAddress:mounted - $route: " + JSON.stringify(this.$route.params));
    if ('transfersSettings' in localStorage) {
      const tempSettings = JSON.parse(localStorage.transfersSettings);
      if ('version' in tempSettings && tempSettings.version == 0) {
        this.settings = tempSettings;
      }
    }
  },
};

const newAddressModule = {
  namespaced: true,
  state: {
    action: 'addCoinbase',
    address: null,
    linkedToAddress: null,
    phrase: "I want to login into my stealth wallet on Ethereum mainnet.",
    mine: null,
    watch: null,
    sendFrom: null,
    sendTo: null,
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
    linkedToAddress: state => state.linkedToAddress,
    phrase: state => state.phrase,
    mine: state => state.mine,
    watch: state => state.watch,
    sendFrom: state => state.sendFrom,
    sendTo: state => state.sendTo,
    name: state => state.name,
    notes: state => state.notes,
    viewingPrivateKey: state => state.viewingPrivateKey,
    spendingPublicKey: state => state.spendingPublicKey,
    viewingPublicKey: state => state.viewingPublicKey,
    source: state => state.source,
    show: state => state.show,
  },
  mutations: {
    newAddress(state) {
      console.log(now() + " INFO newAddressModule:mutations.newAddress");
      state.action = 'addCoinbase';
      state.address = null;
      state.linkedToAddress = null;
      state.phrase = "I want to login into my stealth wallet on Ethereum mainnet.";
      state.mine = false;
      state.watch = true;
      state.sendFrom = false;
      state.sendTo = false;
      state.name = null;
      state.notes = null;
      state.source = null;
      state.show = true;
    },
    setAction(state, action) {
      console.log(now() + " INFO newAddressModule:mutations.setAction - action: " + action);
      state.action = action;
    },
    setAddress(state, address) {
      console.log(now() + " INFO newAddressModule:mutations.setAddress - address: " + address);
      state.address = address;
    },
    setPhrase(state, phrase) {
      console.log(now() + " INFO newAddressModule:mutations.setPhrase - phrase: " + phrase);
      state.phrase = phrase;
    },
    setLinkedToAddress(state, linkedToAddress) {
      console.log(now() + " INFO newAddressModule:mutations.setLinkedToAddress - linkedToAddress: " + linkedToAddress);
      state.linkedToAddress = linkedToAddress;
    },
    setKeys(state, keys) {
      console.log(now() + " INFO newAddressModule:mutations.setKeys - keys: " + JSON.stringify(keys, null, 2));
      state.address = keys.stealthMetaAddress;
      state.viewingPrivateKey = keys.viewingPrivateKey;
      state.spendingPublicKey = keys.spendingPublicKey;
      state.viewingPublicKey = keys.viewingPublicKey;
      state.linkedToAddress = keys.linkedToAddress;
    },

    setMine(state, mine) {
      console.log(now() + " INFO newAddressModule:mutations.setMine - mine: " + mine);
      state.mine = mine;
    },
    setWatch(state, watch) {
      console.log(now() + " INFO newAddressModule:mutations.setWatch - watch: " + watch);
      state.watch = watch;
    },
    setSendFrom(state, sendFrom) {
      console.log(now() + " INFO newAddressModule:mutations.setSendFrom - sendFrom: " + sendFrom);
      state.sendFrom = sendFrom;
    },
    setSendTo(state, sendTo) {
      console.log(now() + " INFO newAddressModule:mutations.setSendTo - sendTo: " + sendTo);
      state.sendTo = sendTo;
    },
    setName(state, name) {
      console.log(now() + " INFO newAddressModule:mutations.setName - name: " + name);
      state.name = name;
    },
    setNotes(state, notes) {
      console.log(now() + " INFO newAddressModule:mutations.setNotes - notes: " + notes);
      state.notes = notes;
    },
    setShow(state, show) {
      state.show = show;
    },
  },
  actions: {
    async newAddress(context) {
      console.log(now() + " INFO newAddressModule:actions.newAddress");
      await context.commit('newAddress');
    },
    async setAction(context, action) {
      console.log(now() + " INFO newAddressModule:actions.setAction - action: " + action);
      await context.commit('setAction', action);
    },
    async setAddress(context, address) {
      console.log(now() + " INFO newAddressModule:actions.setAddress - address: " + address);
      await context.commit('setAddress', address);
    },
    async setPhrase(context, phrase) {
      console.log(now() + " INFO newAddressModule:actions.setPhrase - phrase: " + phrase);
      await context.commit('setPhrase', phrase);
    },
    async setLinkedToAddress(context, linkedToAddress) {
      console.log(now() + " INFO newAddressModule:actions.setLinkedToAddress - linkedToAddress: " + linkedToAddress);
      await context.commit('setLinkedToAddress', linkedToAddress);
    },
    async setKeys(context, keys) {
      console.log(now() + " INFO newAddressModule:actions.setKeys - keys: " + JSON.stringify(keys, null, 2));
      await context.commit('setKeys', keys);
    },
    async setMine(context, mine) {
      console.log(now() + " INFO newAddressModule:actions.setMine - mine: " + mine);
      await context.commit('setMine', mine);
    },
    async setWatch(context, watch) {
      console.log(now() + " INFO newAddressModule:actions.setWatch - watch: " + watch);
      await context.commit('setWatch', watch);
    },
    async setSendFrom(context, sendFrom) {
      console.log(now() + " INFO newAddressModule:actions.setSendFrom - sendFrom: " + sendFrom);
      await context.commit('setSendFrom', sendFrom);
    },
    async setSendTo(context, sendTo) {
      console.log(now() + " INFO newAddressModule:actions.setSendTo - sendTo: " + sendTo);
      await context.commit('setSendTo', sendTo);
    },
    async setName(context, name) {
      console.log(now() + " INFO newAddressModule:actions.setName - name: " + name);
      await context.commit('setName', name);
    },
    async setNotes(context, notes) {
      console.log(now() + " INFO newAddressModule:actions.setNotes - notes: " + notes);
      await context.commit('setNotes', notes);
    },
    async setShow(context, show) {
      await context.commit('setShow', show);
    },
  },
};
