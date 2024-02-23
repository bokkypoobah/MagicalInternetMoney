const ViewAddress = {
  template: `
    <div>
      <b-modal ref="viewaddress" v-model="show" hide-footer header-class="m-0 px-3 py-2" body-bg-variant="light" size="lg">
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
        <b-form-group v-if="type == 'stealthAddress'" label="Private Key:" label-for="address-spendingprivatekey" label-size="sm" label-cols-sm="3" label-align-sm="right" description="Sign message to reveal the private key" class="mx-0 my-1 p-0">
          <b-input-group size="sm" class="w-100">
            <b-form-input :type="stealthPrivateKey ? 'text' : 'password'" size="sm" plaintext id="address-spendingprivatekey" :value="stealthPrivateKey ? stealthPrivateKey : 'A'.repeat(66)" class="px-2"></b-form-input>
            <b-input-group-append>
              <b-button v-if="!stealthPrivateKey" :disabled="!linkedTo || linkedTo.address != coinbase" @click="revealSpendingPrivateKey();" variant="link" class="m-0 ml-2 p-0"><b-icon-eye shift-v="+1" font-scale="1.1"></b-icon-eye></b-button>
              <b-button v-if="stealthPrivateKey" @click="copyToClipboard(stealthPrivateKey ? stealthPrivateKey : '*'.repeat(66));" variant="link" class="m-0 ml-2 p-0"><b-icon-clipboard shift-v="+1" font-scale="1.1"></b-icon-clipboard></b-button>
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

        <b-form-group label="Mine:" label-for="address-mine" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-button size="sm" id="address-mine" :pressed.sync="mine" variant="transparent"><b-icon :icon="mine ? 'star-fill' : 'star'" shift-v="+1" font-scale="0.95" :variant="mine ? 'warning' : 'secondary'"></b-icon></b-button>
        </b-form-group>

        <b-form-group label="Favourite:" label-for="address-favourite" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-button size="sm" id="address-favourite" :pressed.sync="favourite" variant="transparent"><b-icon :icon="favourite ? 'heart-fill' : 'heart'" shift-v="+1" font-scale="0.95" variant="danger"></b-icon></b-button>
        </b-form-group>

        <b-form-group label="Check:" label-for="address-check" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-form-checkbox-group size="sm" id="address-check" v-model="check" :options="checkOptions" class="ml-2"></b-form-checkbox-group>
        </b-form-group>

        <b-form-group label="Name:" label-for="address-name" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-input-group size="sm" class="w-75">
            <b-form-input size="sm" type="text" id="address-name" v-model.trim="name" debounce="600" placeholder="optional"></b-form-input>
            <!--
            <b-input-group-append>
              <div>
                <b-button size="sm" :pressed.sync="mine" variant="transparent" v-b-popover.hover="addressTypeInfo[type || 'address'].name" class="m-0 ml-5 p-0"><b-icon :icon="mine ? 'star-fill' : 'star'" shift-v="+1" font-scale="0.95" :variant="addressTypeInfo[type || 'address'].variant"></b-icon></b-button>
                <b-button size="sm" :pressed.sync="favourite" variant="transparent" v-b-popover.hover="'Favourite?'" class="m-0 ml-1 p-0"><b-icon :icon="favourite ? 'heart-fill' : 'heart'" shift-v="+1" font-scale="0.95" variant="danger"></b-icon></b-button>
              </div>
            </b-input-group-append>
            -->
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
      stealthPrivateKey: null,
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
    checkOptions() {
      return store.getters['data/checkOptions'];
    },
    addresses() {
      return store.getters['data/addresses'];
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
        store.dispatch('data/setAddressField', { address: store.getters['viewAddress/address'], field: 'mine', value: mine });
        store.dispatch('viewAddress/setMine', mine);
      },
    },
    favourite: {
      get: function () {
        return store.getters['viewAddress/favourite'];
      },
      set: function (favourite) {
        store.dispatch('data/setAddressField', { address: store.getters['viewAddress/address'], field: 'favourite', value: favourite });
        store.dispatch('viewAddress/setFavourite', favourite);
      },
    },
    check: {
      get: function () {
        return store.getters['viewAddress/check'];
      },
      set: function (check) {
        store.dispatch('data/setAddressField', { address: store.getters['viewAddress/address'], field: 'check', value: check });
        store.dispatch('viewAddress/setCheck', check);
      },
    },
    name: {
      get: function () {
        return store.getters['viewAddress/name'];
      },
      set: function (name) {
        store.dispatch('data/setAddressField', { address: store.getters['viewAddress/address'], field: 'name', value: name });
        store.dispatch('viewAddress/setName', name);
      },
    },
    notes: {
      get: function () {
        return store.getters['viewAddress/notes'];
      },
      set: function (notes) {
        store.dispatch('data/setAddressField', { address: store.getters['viewAddress/address'], field: 'notes', value: notes });
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
    copyToClipboard(str) {
      navigator.clipboard.writeText(str);
    },
    async revealSpendingPrivateKey() {
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

      logInfo("ViewAddress", "methods.revealSpendingPrivateKey BEGIN");
      const stealthTransfer = this.stealthTransfers && this.stealthTransfers.length > 0 && this.stealthTransfers[0] || {};
      const linkedToStealthMetaAddress = this.linkedTo && this.linkedTo.stealthMetaAddress || null;
      const stealthMetaAddressData = linkedToStealthMetaAddress && this.addresses[linkedToStealthMetaAddress] || {};
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
      const computedStealthKey = computeStealthKey(stealthTransfer.ephemeralPublicKey, viewingPrivateKey, spendingPrivateKey);
      const stealthPrivateKey = computedStealthKey.stealthPrivateKey;
      Vue.set(this, 'stealthPrivateKey', stealthPrivateKey);
    },
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
  },
  beforeDestroy() {
    logDebug("ViewAddress", "beforeDestroy()");
  },
  mounted() {
    logDebug("ViewAddress", "mounted() $route: " + JSON.stringify(this.$route.params));
    if ('transfersSettings' in localStorage) {
      const tempSettings = JSON.parse(localStorage.transfersSettings);
      if ('version' in tempSettings && tempSettings.version == 0) {
        this.settings = tempSettings;
      }
    }
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
    check: state => state.check,
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
      state.check = data.check;
      state.name = data.name;
      state.notes = data.notes;
      state.source = data.source;
      const stealthTransfers = [];
      if (data.type == "stealthAddress") {
        const transfers = store.getters['data/stealthTransfers'][store.getters['connection/chainId']] || {};
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
    setCheck(state, check) {
      logInfo("viewAddressModule", "mutations.setCheck - check: " + check);
      state.check = check;
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
    async setCheck(context, check) {
      logInfo("viewAddressModule", "actions.setCheck - check: " + check);
      await context.commit('setCheck', check);
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
