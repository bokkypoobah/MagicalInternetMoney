const ViewToken = {
  template: `
    <div>
      <b-modal ref="viewtoken" v-model="show" hide-footer header-class="m-0 px-3 py-2" body-bg-variant="light" size="lg">
        <template #modal-title>ERC-721 Token</template>

        <b-form-group label="Address:" label-for="token-address" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-input-group size="sm" class="w-100">
            <b-form-input size="sm" plaintext id="token-address" v-model.trim="address" class="px-2"></b-form-input>
            <b-input-group-append>
              <div>
                <b-button v-if="chainInfo[chainId]" size="sm" :href="chainInfo[chainId].explorerTokenPrefix + address" variant="link" v-b-popover.hover="'View in explorer'" target="_blank" class="m-0 ml-1 p-0"><b-icon-link45deg shift-v="+1" font-scale="0.95"></b-icon-link45deg></b-button>
              </div>
            </b-input-group-append>
          </b-input-group>
        </b-form-group>

        <b-form-group label="Token Id:" label-for="token-tokenid" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-input-group size="sm" class="w-100">
            <component size="sm" plaintext :is="tokenId && tokenId.length > 30 ? 'b-form-textarea' : 'b-form-input'" v-model="tokenId" rows="2" max-rows="3" class="px-2" />
            <b-input-group-append>
              <div>
                <b-button v-if="chainInfo[chainId]" size="sm" :href="chainInfo[chainId].nftTokenPrefix + address + '/' + tokenId" variant="link" v-b-popover.hover="'View in NFT explorer'" target="_blank" class="m-0 ml-1 p-0"><b-icon-link45deg shift-v="+1" font-scale="0.95"></b-icon-link45deg></b-button>
              </div>
            </b-input-group-append>
          </b-input-group>
        </b-form-group>

        <b-form-group label="Collection Symbol:" label-for="token-collectionsymbol" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-form-input size="sm" plaintext id="token-collectionsymbol" :value="collectionSymbol" class="px-2 w-100"></b-form-input>
        </b-form-group>

        <b-form-group label="Collection Name:" label-for="token-collectionname" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-form-input size="sm" plaintext id="token-collectionname" :value="collectionName" class="px-2 w-100"></b-form-input>
        </b-form-group>

        <b-form-group label="Name:" label-for="token-name" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-form-input size="sm" plaintext id="token-name" :value="name" class="px-2 w-100"></b-form-input>
        </b-form-group>

        <b-form-group label="Description:" label-for="token-description" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <component size="sm" plaintext :is="description && description.length > 60 ? 'b-form-textarea' : 'b-form-input'" :value="description" rows="3" max-rows="10" class="px-2" />
        </b-form-group>

        <b-form-group label="Image:" label-for="token-image" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-avatar v-if="image" button rounded size="15rem" :src="image" class="m-2">
            <!-- <template v-if="selectedTraits[layer] && selectedTraits[layer][trait.value]" #badge><b-icon icon="check"></b-icon></template> -->
          </b-avatar>
        </b-form-group>
        <b-form-group label="Attributes:" label-for="token-image" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-row v-for="(attribute, i) in attributes"  v-bind:key="i" class="m-0 p-0">
            <b-col cols="3" class="m-0 px-2 text-right"><font size="-3">{{ attribute.trait_type }}</font></b-col>
            <b-col cols="9" class="m-0 px-2"><b><font size="-2">{{ ["Created Date", "Registration Date", "Expiration Date"].includes(attribute.trait_type) ? (attribute.value > 1000000000000n ? formatTimestamp(attribute.value / 1000) : formatTimestamp(attribute.value)) : attribute.value }}</font></b></b-col>
          </b-row>
        </b-form-group>

        <b-form-group label="" label-for="token-refreshtokenmetadata" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-button size="sm" @click="refreshTokenMetadata();" variant="link" v-b-popover.hover.top="'Refresh Token Metadata'"><b-icon-arrow-repeat shift-v="+1" font-scale="1.1" variant="primary"></b-icon-arrow-repeat></b-button>
        </b-form-group>

        <b-form-group v-if="false" label="" label-for="token-delete" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-button size="sm" @click="deleteAddress(address);" variant="link" v-b-popover.hover.top="'Delete address ' + address.substring(0, 10) + '...' + address.slice(-8) + '?'"><b-icon-trash shift-v="+1" font-scale="1.1" variant="danger"></b-icon-trash></b-button>
        </b-form-group>
      </b-modal>
    </div>
  `,
  data: function () {
    return {
      count: 0,
      reschedule: true,
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
    explorer () {
      return store.getters['connection/explorer'];
    },
    coinbase() {
      return store.getters['connection/coinbase'];
    },
    chainId() {
      return store.getters['connection/chainId'];
    },
    chainInfo() {
      return store.getters['config/chainInfo'];
    },
    addresses() {
      return store.getters['data/addresses'];
    },
    address() {
      return store.getters['viewToken/address'];
    },
    tokenId() {
      return store.getters['viewToken/tokenId'];
    },
    tokenContracts() {
      return store.getters['data/tokenContracts'];
    },
    collectionSymbol() {
      if (this.address) {
        return this.tokenContracts[this.chainId] && this.tokenContracts[this.chainId][this.address] && this.tokenContracts[this.chainId][this.address].symbol || null;
      }
      return null;
    },
    collectionName() {
      if (this.address) {
        return this.tokenContracts[this.chainId] && this.tokenContracts[this.chainId][this.address] && this.tokenContracts[this.chainId][this.address].name || null;
      }
      return null;
    },
    name() {
      if (this.address) {
        // console.log("this.tokenContracts[this.chainId][this.address]: " + JSON.stringify(this.tokenContracts[this.chainId][this.address], null, 2));
        return this.tokenContracts[this.chainId] && this.tokenContracts[this.chainId][this.address] && this.tokenContracts[this.chainId][this.address].tokenIds[this.tokenId] && this.tokenContracts[this.chainId][this.address].tokenIds[this.tokenId].metadata && this.tokenContracts[this.chainId][this.address].tokenIds[this.tokenId].metadata.name || null;
      }
      return null;
    },
    description() {
      if (this.address) {
        // console.log("this.tokenContracts[this.chainId][this.address]: " + JSON.stringify(this.tokenContracts[this.chainId][this.address], null, 2));
        return this.tokenContracts[this.chainId] && this.tokenContracts[this.chainId][this.address] && this.tokenContracts[this.chainId][this.address].tokenIds[this.tokenId] && this.tokenContracts[this.chainId][this.address].tokenIds[this.tokenId].metadata && this.tokenContracts[this.chainId][this.address].tokenIds[this.tokenId].metadata.description || null;
      }
      return null;
    },
    image() {
      if (this.address) {
        // console.log("this.tokenContracts[this.chainId][this.address]: " + JSON.stringify(this.tokenContracts[this.chainId][this.address], null, 2));
        return this.tokenContracts[this.chainId] && this.tokenContracts[this.chainId][this.address] && this.tokenContracts[this.chainId][this.address].tokenIds[this.tokenId] && this.tokenContracts[this.chainId][this.address].tokenIds[this.tokenId].metadata && this.tokenContracts[this.chainId][this.address].tokenIds[this.tokenId].metadata.image || null;
      }
      return null;
    },

    attributes() {
      if (this.address) {
        // console.log("this.tokenContracts[this.chainId][this.address]: " + JSON.stringify(this.tokenContracts[this.chainId][this.address], null, 2));
        return this.tokenContracts[this.chainId] && this.tokenContracts[this.chainId][this.address] && this.tokenContracts[this.chainId][this.address].tokenIds[this.tokenId] && this.tokenContracts[this.chainId][this.address].tokenIds[this.tokenId].metadata && this.tokenContracts[this.chainId][this.address].tokenIds[this.tokenId].metadata.attributes || null;
      }
      return null;
    },

    linkedTo() {
      return store.getters['viewToken/linkedTo'];
    },
    type() {
      return store.getters['viewToken/type'];
    },
    mine: {
      get: function () {
        return store.getters['viewToken/mine'];
      },
      set: function (mine) {
        store.dispatch('data/setAddressField', { account: store.getters['viewToken/address'], field: 'mine', value: mine });
        store.dispatch('viewToken/setMine', mine);
      },
    },
    favourite: {
      get: function () {
        return store.getters['viewToken/favourite'];
      },
      set: function (favourite) {
        store.dispatch('data/setAddressField', { account: store.getters['viewToken/address'], field: 'favourite', value: favourite });
        store.dispatch('viewToken/setFavourite', favourite);
      },
    },
    notes: {
      get: function () {
        return store.getters['viewToken/notes'];
      },
      set: function (notes) {
        store.dispatch('data/setAddressField', { account: store.getters['viewToken/address'], field: 'notes', value: notes });
        store.dispatch('viewToken/setNotes', notes);
      },
    },
    source() {
      return store.getters['viewToken/source'];
    },
    stealthTransfers() {
      return store.getters['viewToken/stealthTransfers'];
    },
    show: {
      get: function () {
        return store.getters['viewToken/show'];
      },
      set: function (show) {
        store.dispatch('viewToken/setShow', show);
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

      logInfo("ViewToken", "methods.revealSpendingPrivateKey BEGIN");
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
        // if (this.settings.reportingDateTime == 1) {
          return moment.unix(ts).utc().format("YYYY-MM-DD HH:mm:ss");
        // } else {
        //   return moment.unix(ts).format("YYYY-MM-DD HH:mm:ss");
        // }
      }
      return null;
    },
    saveSettings() {
      logInfo("ViewToken", "methods.saveSettings - transfersSettings: " + JSON.stringify(this.settings, null, 2));
      localStorage.transfersSettings = JSON.stringify(this.settings);
    },
    setShow(show) {
      store.dispatch('viewToken/setShow', show);
    },

    async refreshTokenMetadata() {

      const imageUrlToBase64 = async url => {
        const response = await fetch(url);
        const blob = await response.blob();
        return new Promise((onSuccess, onError) => {
          try {
            const reader = new FileReader() ;
            reader.onload = function(){ onSuccess(this.result) } ;
            reader.readAsDataURL(blob) ;
          } catch(e) {
            onError(e);
          }
        });
      };

      logInfo("ViewToken", "refreshTokenMetadata()");

      const url = "https://api.reservoir.tools/tokens/v7?tokens=" + this.address + "%3A" + this.tokenId + "&includeAttributes=true";
      console.log("url: " + url);
      const data = await fetch(url).then(response => response.json());
      // console.log("data: " + JSON.stringify(data, null, 2));
      if (data.tokens.length > 0) {
        const tokenData = data.tokens[0].token;
        // console.log("tokenData: " + JSON.stringify(tokenData, null, 2));
        const base64 = await imageUrlToBase64(tokenData.image);
        const metadata = {
          chainId: tokenData.chainId,
          address: ethers.utils.getAddress(tokenData.contract),
          tokenId: tokenData.tokenId,
          name: tokenData.name,
          description: tokenData.description,
          attributes: tokenData.attributes.map(e => ({ trait_type: e.key, value: e.value })),
          imageSource: tokenData.image,
          image: base64,
        };
        console.log("metadata: " + JSON.stringify(metadata, null, 2));
        store.dispatch('data/setTokenMetadata', metadata);
      }
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
    async timeoutCallback() {
      logDebug("ViewToken", "timeoutCallback() count: " + this.count);

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
    logDebug("ViewToken", "beforeDestroy()");
  },
  mounted() {
    logDebug("ViewToken", "mounted() $route: " + JSON.stringify(this.$route.params));
    store.dispatch('data/restoreState');
    if ('transfersSettings' in localStorage) {
      const tempSettings = JSON.parse(localStorage.transfersSettings);
      if ('version' in tempSettings && tempSettings.version == 0) {
        this.settings = tempSettings;
        this.settings.currentPage = 1;
      }
    }
    this.reschedule = true;
    logDebug("ViewToken", "Calling timeoutCallback()");
    this.timeoutCallback();
  },
  destroyed() {
    this.reschedule = false;
  },
};

const viewTokenModule = {
  namespaced: true,
  state: {
    address: null,
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
    address: state => state.address,
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
    viewToken(state, info) {
      logInfo("viewTokenModule", "mutations.viewToken - info: " + JSON.stringify(info));

      // const data = store.getters['data/addresses'][address] || {};
      state.address = info.address;
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
      logInfo("viewTokenModule", "mutations.setMine - mine: " + mine);
      state.mine = mine;
    },
    setFavourite(state, favourite) {
      logInfo("viewTokenModule", "mutations.setFavourite - favourite: " + favourite);
      state.favourite = favourite;
    },
    setName(state, name) {
      logInfo("viewTokenModule", "mutations.setName - name: " + name);
      state.name = name;
    },
    setNotes(state, notes) {
      logInfo("viewTokenModule", "mutations.setNotes - notes: " + notes);
      state.notes = notes;
    },
    setShow(state, show) {
      state.show = show;
    },
  },
  actions: {
    async viewToken(context, info) {
      logInfo("viewTokenModule", "actions.viewToken - info: " + JSON.stringify(info));
      await context.commit('viewToken', info);
    },
    async setMine(context, mine) {
      logInfo("viewTokenModule", "actions.setMine - mine: " + mine);
      await context.commit('setMine', mine);
    },
    async setFavourite(context, favourite) {
      logInfo("viewTokenModule", "actions.setFavourite - favourite: " + favourite);
      await context.commit('setFavourite', favourite);
    },
    async setName(context, name) {
      logInfo("viewTokenModule", "actions.setName - name: " + name);
      await context.commit('setName', name);
    },
    async setNotes(context, notes) {
      logInfo("viewTokenModule", "actions.setNotes - notes: " + notes);
      await context.commit('setNotes', notes);
    },
    async setSource(context, source) {
      logInfo("viewTokenModule", "actions.setSource - source: " + source);
      await context.commit('setSource', source);
    },
    async setShow(context, show) {
      await context.commit('setShow', show);
    },
  },
};
