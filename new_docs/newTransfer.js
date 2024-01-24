const NewTransfer = {
  template: `
    <div>
      <b-modal ref="newtransfer" v-model="show" id="modal-newtransfer" hide-footer header-class="m-0 px-3 py-2" body-bg-variant="light" size="lg">
        <template #modal-title>New Stealth Transfer</template>
        <b-form-group label="Attached Web3 Address:" label-for="newtransfer-coinbase" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-form-input size="sm" readonly id="newtransfer-coinbase" :value="coinbase" class="w-75"></b-form-input>
        </b-form-group>
        <b-form-group v-if="stealthMetaAddressSpecified" label="To:" label-for="newtransfer-to-specified" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-form-textarea size="sm" plaintext id="newtransfer-to-specified" :value="stealthMetaAddress" rows="3" max-rows="4" class="px-2"></b-form-textarea>
        </b-form-group>
        <b-form-group v-if="!stealthMetaAddressSpecified" label="To:" label-for="newtransfer-to-unspecified" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-form-select size="sm" v-model="stealthMetaAddress" :options="stealthMetaAddressesOptions" v-b-popover.hover.bottom="'Select Stealth Meta-Address from Favourited Addresses'" class="w-100"></b-form-select>
        </b-form-group>
        <b-form-group label="Amount:" label-for="newtransfer-amount" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-form-input type="text" size="sm" id="newtransfer-amount" v-model.trim="amount" placeholder="e.g., 0.01 for 0.01 ETH" debounce="600" class="w-50 text-right"></b-form-input>
        </b-form-group>
        <b-form-group label="" label-for="newtransfer-transfer" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-button size="sm" :disabled="!stealthMetaAddress || amount == null" id="newtransfer-transfer" @click="executeNewTransfer()" variant="warning">Transfer</b-button>
        </b-form-group>
      </b-modal>
    </div>
  `,
  data: function () {
    return {
      count: 0,
      reschedule: true,
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
    network() {
      return store.getters['connection/network'];
    },
    chainId() {
      return store.getters['connection/chainId'];
    },
    addresses() {
      return store.getters['data/addresses'];
    },
    registry() {
      return store.getters['data/registry'];
    },
    transfers() {
      return store.getters['data/transfers'];
    },
    stealthMetaAddressSpecified() {
      return store.getters['newTransfer/stealthMetaAddressSpecified'];
    },
    show: {
      get: function () {
        return store.getters['newTransfer/show'];
      },
      set: function (show) {
        store.dispatch('newTransfer/setShow', show);
      },
    },
    stealthMetaAddress: {
      get: function () {
        return store.getters['newTransfer/stealthMetaAddress'];
      },
      set: function (stealthMetaAddress) {
        store.dispatch('newTransfer/setStealthMetaAddress', stealthMetaAddress);
      },
    },
    amount: {
      get: function () {
        return store.getters['newTransfer/amount'];
      },
      set: function (amount) {
        store.dispatch('newTransfer/setAmount', amount);
      },
    },

    stealthMetaAddressesOptions() {
      const results = [];
      results.push({ value: null, text: "(Select Stealth Meta-Address from Favourited Addresses)"})
      for (const [address, addressData] of Object.entries(this.addresses)) {
        if (addressData.favourite) {
          results.push({ value: address, text: (addressData.name ? (addressData.name + ' ') : '') + address.substring(0, 17) + '...' + address.slice(-8) + ' / ' + (addressData.linkedToAddress ? (addressData.linkedToAddress.substring(0, 10) + '...' + addressData.linkedToAddress.slice(-8)) : '') });
        }
      }
      return results;
    },

  },
  methods: {
    saveSettings() {
      logInfo("NewTransfer", "methods.saveSettings - transfersSettings: " + JSON.stringify(this.settings, null, 2));
      localStorage.transfersSettings = JSON.stringify(this.settings);
    },
    setShow(show) {
      store.dispatch('newTransfer/setShow', show);
    },
    async executeNewTransfer() {
      function generateStealthAddress(stealthMetaAddress) {
          const result = {};
          result.stealthMetaAddress = stealthMetaAddress;
          result.receiverSpendingPublicKey = stealthMetaAddress.slice(9, 75);
          result.receiverViewingPublicKey = stealthMetaAddress.slice(75);
          result.ephemeralPrivateKey = nobleCurves.secp256k1.utils.randomPrivateKey();
          // // TODO: Remove after testing
          // result.ephemeralPrivateKey = 26997109008263982877621605952415166666118239613620770339187915977330619367704n;
          result.ephemeralPublicKey = nobleCurves.secp256k1.getPublicKey(result.ephemeralPrivateKey, isCompressed=true);
          result.sharedSecret = nobleCurves.secp256k1.getSharedSecret(result.ephemeralPrivateKey, result.receiverViewingPublicKey, false);
          result.hashedSharedSecret = ethers.utils.keccak256(result.sharedSecret.slice(1));
          result.viewTag = "0x" + result.hashedSharedSecret.substring(2, 4);
          result.hashedSharedSecretPoint = nobleCurves.secp256k1.ProjectivePoint.fromPrivateKey(result.hashedSharedSecret.substring(2));
          result.stealthPublicKey = nobleCurves.secp256k1.ProjectivePoint.fromHex(result.receiverSpendingPublicKey).add(result.hashedSharedSecretPoint);
          result.stealthAddress = ethers.utils.computeAddress("0x" + result.stealthPublicKey.toHex(false));
          return result;
      }
      logInfo("NewTransfer", "methods.executeNewTransfer BEGIN");
      const result = generateStealthAddress(this.stealthMetaAddress);
      for (const [k, v] of Object.entries(result)) {
        console.log("    ", k, "=>", v);
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(MAGICALINTERNETMONEYADDRESS_SEPOLIA, MAGICALINTERNETMONEYABI_SEPOLIA, provider);
      const contractWithSigner = contract.connect(provider.getSigner());
      const schemeId = 0;
      const value = ethers.utils.parseEther(this.amount);
      const tokenInfos = [];
      // for (const item of this.modalNewTransfer.items) {
      //   console.log(JSON.stringify(item));
      //   if (item.type == "erc20") {
      //     tokenInfos.push([false, item.token, ethers.utils.parseUnits(item.amount, item.decimals).toString()]);
      //   } else {
      //     tokenInfos.push([true, item.token, item.tokenId.toString()]);
      //   }
      // }
      console.log("tokenInfos: " + JSON.stringify(tokenInfos));
      try {
        const tx = await contractWithSigner.transferAndAnnounce(schemeId, result.stealthAddress, result.ephemeralPublicKey, result.viewTag, tokenInfos, { value });
        console.log("tx: " + JSON.stringify(tx));
      } catch (e) {
        console.log("executeNewTransfer MagicalInternetMoney.transferEthAndAnnounce(...) error: " + JSON.stringify(e));
      }
      logInfo("NewTransfer", "methods.executeNewTransfer END");
    },
    async syncIt(info) {
      store.dispatch('data/syncIt', info);
    },

    async timeoutCallback() {
      logDebug("NewTransfer", "timeoutCallback() count: " + this.count);

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
    logDebug("NewTransfer", "beforeDestroy()");
  },
  mounted() {
    logDebug("NewTransfer", "mounted() $route: " + JSON.stringify(this.$route.params));
    store.dispatch('data/restoreState');
    if ('transfersSettings' in localStorage) {
      const tempSettings = JSON.parse(localStorage.transfersSettings);
      if ('version' in tempSettings && tempSettings.version == 0) {
        this.settings = tempSettings;
        this.settings.currentPage = 1;
      }
    }
    this.reschedule = true;
    logDebug("NewTransfer", "Calling timeoutCallback()");
    this.timeoutCallback();
  },
  destroyed() {
    this.reschedule = false;
  },
};

const newTransferModule = {
  namespaced: true,
  state: {
    show: false,
    stealthMetaAddressSpecified: false,
    stealthMetaAddress: null,
    amount: null,
  },
  getters: {
    show: state => state.show,
    stealthMetaAddressSpecified: state => state.stealthMetaAddressSpecified,
    stealthMetaAddress: state => state.stealthMetaAddress,
    amount: state => state.amount,
  },
  mutations: {
    newTransfer(state, stealthMetaAddress) {
      logInfo("newTransferModule", "mutations.newTransfer - stealthMetaAddress: " + stealthMetaAddress);
      state.show = true;
      state.stealthMetaAddressSpecified = !!stealthMetaAddress;
      state.stealthMetaAddress = stealthMetaAddress;
    },
    setShow(state, show) {
      state.show = show;
    },
    setStealthMetaAddress(state, stealthMetaAddress) {
      logInfo("newTransferModule", "mutations.setStealthMetaAddress - stealthMetaAddress: " + stealthMetaAddress);
      state.stealthMetaAddress = stealthMetaAddress;
    },
    setAmount(state, amount) {
      logInfo("newTransferModule", "mutations.setAmount - amount: " + amount);
      state.amount = amount;
    },
  },
  actions: {
    async newTransfer(context, stealthMetaAddress) {
      logInfo("newTransferModule", "actions.newTransfer - stealthMetaAddress: " + stealthMetaAddress);
      await context.commit('newTransfer', stealthMetaAddress);
    },
    async setShow(context, show) {
      await context.commit('setShow', show);
    },
    async setStealthMetaAddress(context, stealthMetaAddress) {
      logInfo("newTransferModule", "actions.setStealthMetaAddress - stealthMetaAddress: " + stealthMetaAddress);
      await context.commit('setStealthMetaAddress', stealthMetaAddress);
    },
    async setAmount(context, amount) {
      logInfo("newTransferModule", "actions.setAmount - amount: " + amount);
      await context.commit('setAmount', amount);
    },
  },
};
