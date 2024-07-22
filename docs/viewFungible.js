const ViewFungible = {
  template: `
    <div>
      <b-modal ref="viewtoken" v-model="show" hide-footer header-class="m-0 px-3 py-2" body-bg-variant="light" size="lg">
        <template #modal-title>ERC-20 Fungible Token</template>

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

        <b-form-group label="" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-button size="sm" id="address-junk" :pressed.sync="junk" variant="transparent" v-b-popover.hover="junk ? 'Junk' : 'Not junk'" class="m-0 mx-2 p-0">
            <b-icon :icon="junk ? 'trash-fill' : 'trash'" shift-v="+1" font-scale="1.2" :variant="junk ? 'primary' : 'secondary'">
            </b-icon>
          </b-button>
          <b-button size="sm" :disabled="junk" id="address-active" :pressed.sync="active" variant="transparent" v-b-popover.hover="active ? 'Active' : 'Inactive'" class="m-0 mx-2 p-0">
            <b-icon :icon="(active && !junk) ? 'check-circle-fill' : 'check-circle'" shift-v="+1" font-scale="1.2" :variant="(junk || !active) ? 'secondary' : 'primary'">
            </b-icon>
          </b-button>
        </b-form-group>

        <b-form-group label="Symbol:" label-for="token-symbol" label-size="sm" label-cols-sm="3" label-align-sm="right" :description="contractSymbol && symbol != contractSymbol ? ('Contract value: ' + contractSymbol) : ''" class="mx-0 my-1 p-0">
          <b-form-input size="sm" id="token-symbol" v-model.trim="symbol" debounce="600" class="px-2 w-50"></b-form-input>
        </b-form-group>

        <b-form-group label="Name:" label-for="token-name" label-size="sm" label-cols-sm="3" label-align-sm="right" :description="contractName && name != contractName ? ('Contract value: ' + contractName) : ''" class="mx-0 my-1 p-0">
          <b-form-input size="sm" id="token-name" v-model.trim="name" debounce="600" class="px-2 w-100"></b-form-input>
        </b-form-group>

        <b-form-group label="Decimals:" label-for="token-decimals" label-size="sm" label-cols-sm="3" label-align-sm="right" :description="contractDecimals && decimals != contractDecimals ? ('Contract value: ' + contractDecimals) : ''" class="mx-0 my-1 p-0">
          <b-form-select size="sm" id="token-decimals" v-model="decimals" :options="decimalsOptions" v-b-popover.hover="'Decimals'" class="w-25"></b-form-select>
        </b-form-group>

        <b-form-group label="Image:" label-for="token-image" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-img v-if="image" button rounded fluid size="15rem" :src="image" class="m-2" style="width: 100px;">
          </b-img>
        </b-form-group>

        <b-form-group label="" label-for="token-updateimage" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-form-file size="sm" id="token-updateimage" @change="handleImage" accept="image/*" placeholder="Update image" class="w-50">
          </b-form-file>
        </b-form-group>

        <b-form-group label="Total Supply:" label-for="token-totalsupply" label-size="sm" label-cols-sm="3" label-align-sm="right" :description="contractTotalSupply && totalSupply != contractTotalSupply ? ('Current contract value: ' + formatERC20(contractTotalSupply, contractDecimals)) : ''" class="mx-0 my-1 p-0">
          <b-form-input size="sm" plaintext id="token-totalsupply" :value="formatERC20(totalSupply, decimals)" class="px-2 w-50"></b-form-input>
        </b-form-group>

        <b-form-group v-if="balances.length > 0" label="" label-for="token-balances" label-size="sm" label-cols-sm="3" label-align-sm="right" :description="contractTotalSupply && totalSupply != contractTotalSupply ? ('Current contract value: ' + formatERC20(contractTotalSupply, contractDecimals)) : ''" class="mx-0 my-1 p-0">
          <b-row class="m-0 p-0">
            <b-col cols="6" class="m-0 px-2">
              <font size="-1">Address</font>
            </b-col>
            <b-col cols="6" class="m-0 px-2">
              <font size="-1">Balance</font>
            </b-col>
          </b-row>
          <b-row v-for="(b, i) in balances" v-bind:key="i" class="m-0 p-0">
            <b-col cols="6" class="m-0 px-2">
              <b-link :href="explorer + 'address/' + b.address" target="_blank">
                <font size="-1">{{ b.address.substring(0, 10) + '...' + b.address.slice(-8) }}</font>
              </b-link>
            </b-col>
            <b-col cols="6" class="m-0 px-2">
              <b-link :href="explorer + 'token/' + contract + '?a=' + b.address" target="_blank">
                <font size="-1">{{ formatERC20(b.balance, decimals) }}</font>
              </b-link>
            </b-col>
          </b-row>
        </b-form-group>

        <!-- <b-form-group label="" label-for="token-refreshtokenmetadata" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-button size="sm" @click="refreshTokenMetadata();" variant="link" v-b-popover.hover.top="'Refresh Token Metadata'"><b-icon-arrow-repeat shift-v="+1" font-scale="1.1" variant="primary"></b-icon-arrow-repeat></b-button>
        </b-form-group> -->

        <!-- <b-form-group v-if="false" label="" label-for="token-delete" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-button size="sm" @click="deleteAddress(contract);" variant="link" v-b-popover.hover.top="'Delete address ' + contract.substring(0, 10) + '...' + contract.slice(-8) + '?'"><b-icon-trash shift-v="+1" font-scale="1.1" variant="danger"></b-icon-trash></b-button>
        </b-form-group> -->
      </b-modal>
    </div>
  `,
  data: function () {
    return {
      stealthPrivateKey: null,
      decimalsOptions: [
        { value: null, text: 'Select' },
        { value: 0, text: '0' },
        { value: 1, text: '1' },
        { value: 2, text: '2' },
        { value: 3, text: '3' },
        { value: 4, text: '4' },
        { value: 5, text: '5' },
        { value: 6, text: '6' },
        { value: 7, text: '7' },
        { value: 8, text: '8' },
        { value: 9, text: '9' },
        { value: 10, text: '10' },
        { value: 11, text: '11' },
        { value: 12, text: '12' },
        { value: 13, text: '13' },
        { value: 14, text: '14' },
        { value: 15, text: '15' },
        { value: 16, text: '16' },
        { value: 17, text: '17' },
        { value: 18, text: '18' },
      ],
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
    address() {
      return store.getters['viewFungible/address'];
    },
    contract() {
      return store.getters['viewFungible/contract'];
    },
    tokenId() {
      return store.getters['viewFungible/tokenId'];
    },
    tokens() {
      return store.getters['data/tokens'];
    },
    symbol: {
      get: function () {
        return store.getters['viewFungible/symbol'];
      },
      set: function (symbol) {
        store.dispatch('data/setFungibleField', { chainId: this.chainId, contract: this.contract, field: 'symbol', value: symbol });
        store.dispatch('viewFungible/setSymbol', symbol);
      },
    },
    name: {
      get: function () {
        return store.getters['viewFungible/name'];
      },
      set: function (name) {
        store.dispatch('data/setFungibleField', { chainId: this.chainId, contract: this.contract, field: 'name', value: name });
        store.dispatch('viewFungible/setName', name);
      },
    },
    decimals: {
      get: function () {
        return store.getters['viewFungible/decimals'];
      },
      set: function (decimals) {
        store.dispatch('data/setFungibleField', { chainId: this.chainId, contract: this.contract, field: 'decimals', value: decimals });
        store.dispatch('viewFungible/setDecimals', decimals);
      },
    },
    totalSupply() {
      return store.getters['viewFungible/totalSupply'];
    },
    balances() {
      return store.getters['viewFungible/balances'];
    },
    image() {
      return store.getters['viewFungible/image'];
    },
    contractSymbol() {
      return store.getters['viewFungible/contractSymbol'];
    },
    contractName() {
      return store.getters['viewFungible/contractName'];
    },
    contractDecimals() {
      return store.getters['viewFungible/contractDecimals'];
    },
    contractTotalSupply() {
      return store.getters['viewFungible/contractTotalSupply'];
    },
    junk: {
      get: function () {
        return store.getters['viewFungible/junk'];
      },
      set: function (junk) {
        store.dispatch('data/toggleFungibleJunk', { chainId: this.chainId, contract: this.contract });
        store.dispatch('viewFungible/toggleFungibleJunk');
      },
    },
    active: {
      get: function () {
        return store.getters['viewFungible/active'];
      },
      set: function (active) {
        store.dispatch('data/toggleFungibleActive', { chainId: this.chainId, contract: this.contract });
        store.dispatch('viewFungible/toggleFungibleActive');
      },
    },
    show: {
      get: function () {
        return store.getters['viewFungible/show'];
      },
      set: function (show) {
        store.dispatch('viewFungible/setShow', show);
      },
    },
  },
  methods: {
    async handleImage(e) {
      const selectedImage = e.target.files[0];
      try {
        const image = await toBase64(selectedImage);
        store.dispatch('data/setFungibleField', { chainId: this.chainId, contract: this.contract, field: 'image', value: image });
        store.dispatch('viewFungible/setImage', image);
      } catch (e) {
        logInfo("ViewFungible", "methods.handleImage - error: " + e.message);
      }
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
    formatERC20(e, decimals = 18) {
      try {
        return e ? ethers.utils.formatUnits(e, decimals).replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",") : null;
      } catch (err) {
      }
      return e.toString();
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
      logInfo("ViewFungible", "methods.saveSettings - transfersSettings: " + JSON.stringify(this.settings, null, 2));
      localStorage.transfersSettings = JSON.stringify(this.settings);
    },
    setShow(show) {
      store.dispatch('viewFungibleModule/setShow', show);
    },

    async refreshTokenMetadata() {
      const imageUrlToBase64 = async url => {
        const response = await fetch(url /*, { mode: 'cors' }*/);
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

      logInfo("ViewFungible", "refreshTokenMetadata()");
      const url = "https://api.reservoir.tools/tokens/v7?tokens=" + this.contract + "%3A" + this.tokenId + "&includeAttributes=true";
      console.log("url: " + url);
      const data = await fetch(url).then(response => response.json());
      // console.log("data: " + JSON.stringify(data, null, 2));
      if (data.tokens.length > 0) {
        const tokenData = data.tokens[0].token;
        // console.log("tokenData: " + JSON.stringify(tokenData, null, 2));
        // const base64 = await imageUrlToBase64(tokenData.image);
        const attributes = tokenData.attributes.map(e => ({ trait_type: e.key, value: e.value }));
        attributes.sort((a, b) => {
          return ('' + a.trait_type).localeCompare(b.trait_type);
        });
        const address = ethers.utils.getAddress(tokenData.contract);
        let expiry = undefined;
        if (address == ENS_ERC721_ADDRESS) {
          const expiryRecord = attributes.filter(e => e.trait_type == "Expiration Date");
          console.log("expiryRecord: " + JSON.stringify(expiryRecord, null, 2));
          expiry = expiryRecord.length == 1 && expiryRecord[0].value || null;
        }
        const metadata = {
          chainId: tokenData.chainId,
          contract: this.contract,
          tokenId: tokenData.tokenId,
          expiry,
          name: tokenData.name,
          description: tokenData.description,
          image: tokenData.image,
          attributes,
          // image: base64,
        };
        console.log("metadata: " + JSON.stringify(metadata, null, 2));
        store.dispatch('data/addTokenMetadata', metadata);
        store.dispatch('data/saveData', ['tokenMetadata']);
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
  },
  beforeDestroy() {
    logDebug("ViewFungible", "beforeDestroy()");
  },
  mounted() {
    logDebug("ViewFungible", "mounted() $route: " + JSON.stringify(this.$route.params));
    if ('transfersSettings' in localStorage) {
      const tempSettings = JSON.parse(localStorage.transfersSettings);
      if ('version' in tempSettings && tempSettings.version == 0) {
        this.settings = tempSettings;
      }
    }
  },
};

const viewFungibleModule = {
  namespaced: true,
  state: {
    contract: null,
    symbol: null,
    name: null,
    decimals: null,
    totalSupply: null,
    balances: [],
    image: null,
    junk: null,
    active: null,
    contractSymbol: null,
    contractName: null,
    contractDecimals: null,
    contractTotalSupply: null,
    show: false,
  },
  getters: {
    contract: state => state.contract,
    symbol: state => state.symbol,
    name: state => state.name,
    decimals: state => state.decimals,
    totalSupply: state => state.totalSupply,
    balances: state => state.balances,
    image: state => state.image,
    junk: state => state.junk,
    active: state => state.active,
    contractSymbol: state => state.contractSymbol,
    contractName: state => state.contractName,
    contractDecimals: state => state.contractDecimals,
    contractTotalSupply: state => state.contractTotalSupply,
    show: state => state.show,
  },
  mutations: {
    viewFungible(state, info) {
      logInfo("viewFungibleModule", "mutations.viewFungible - info: " + JSON.stringify(info));
      state.contract = info.contract;
      state.symbol = info.symbol;
      state.name = info.name;
      state.decimals = info.decimals;
      state.totalSupply = info.totalSupply;
      state.image = info.image;
      state.junk = info.junk;
      state.active = info.active;
      state.show = true;
    },
    setSymbol(state, symbol) {
      logInfo("viewFungibleModule", "mutations.setSymbol - symbol: " + symbol);
      state.symbol = symbol;
    },
    setName(state, name) {
      logInfo("viewFungibleModule", "mutations.setName - name: " + name);
      state.name = name;
    },
    setDecimals(state, decimals) {
      logInfo("viewFungibleModule", "mutations.setDecimals - decimals: " + decimals);
      state.decimals = decimals;
    },
    setImage(state, image) {
      logInfo("viewFungibleModule", "mutations.setImage - image: " + image);
      state.image = image;
    },
    toggleFungibleJunk(state) {
      logInfo("viewFungibleModule", "mutations.toggleFungibleJunk");
      state.junk = !state.junk;
    },
    toggleFungibleActive(state) {
      logInfo("viewFungibleModule", "mutations.toggleFungibleActive");
      state.active = !state.active;
    },
    setContractValues(state, info) {
      logInfo("viewFungibleModule", "mutations.setContractValues - info: " + JSON.stringify(info));
      state.contractSymbol = info.contractSymbol;
      state.contractName = info.contractName;
      state.contractDecimals = info.contractDecimals;
      state.contractTotalSupply = info.contractTotalSupply;
      // logInfo("viewFungibleModule", "mutations.setContractValues - state: " + JSON.stringify(state));
    },
    setBalances(state, balances) {
      logInfo("viewFungibleModule", "mutations.setBalances - balances: " + JSON.stringify(balances));
      state.balances = balances;
      logInfo("viewFungibleModule", "mutations.setContractValues - state: " + JSON.stringify(state));
    },
    setShow(state, show) {
      state.show = show;
    },
  },
  actions: {
    async viewFungible(context, info) {
      logInfo("viewFungibleModule", "actions.viewFungible - info: " + JSON.stringify(info));
      const chainId = store.getters['connection/chainId'] || null;
      const token = chainId && store.getters['data/tokens'][chainId] && store.getters['data/tokens'][chainId][info.contract] || {};
      await context.commit('viewFungible', {
        chainId,
        contract: info.contract,
        symbol: token.symbol,
        name: token.name,
        decimals: token.decimals,
        totalSupply: token.totalSupply,
        image: token.image,
        junk: token.junk,
        active: token.active,
      });
      console.log("token.balances: " + JSON.stringify(token.balances));

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const interface = new ethers.Contract(info.contract, ERC20ABI, provider);
      let symbol = null;
      let name = null;
      let decimals = null;
      let totalSupply = null;
      try {
        symbol = await interface.symbol();
      } catch (e) {
      }
      try {
        name = await interface.name();
      } catch (e) {
      }
      try {
        decimals = await interface.decimals();
      } catch (e) {
      }
      try {
        totalSupply = await interface.totalSupply();
      } catch (e) {
      }
      await context.commit('setContractValues', {
        contractSymbol: symbol,
        contractName: name,
        contractDecimals: decimals && decimals.toString() || null,
        contractTotalSupply: totalSupply && totalSupply.toString() || null,
      });
      const selectedAddressesMap = {};
      for (const [address, addressData] of Object.entries(store.getters['data/addresses'] || {})) {
        if (address.substring(0, 2) == "0x" && addressData.type == "address" && !addressData.junk && addressData.watch) {
          selectedAddressesMap[address] = true;
        }
      }
      const balances = chainId && store.getters['data/balances'] && store.getters['data/balances'][chainId] && store.getters['data/balances'][chainId][info.contract] && store.getters['data/balances'][chainId][info.contract].balances || {};
      const balancesResults = [];
      for (const [address, balance] of Object.entries(balances)) {
        balancesResults.push({ address, balance });
      }
      await context.commit('setBalances', balancesResults);
    },
    async setSymbol(context, symbol) {
      logInfo("viewFungibleModule", "actions.setSymbol - symbol: " + symbol);
      await context.commit('setSymbol', symbol);
    },
    async setName(context, name) {
      logInfo("viewFungibleModule", "actions.setName - name: " + name);
      await context.commit('setName', name);
    },
    async setDecimals(context, decimals) {
      logInfo("viewFungibleModule", "actions.setDecimals - decimals: " + decimals);
      await context.commit('setDecimals', decimals);
    },
    async setImage(context, image) {
      logInfo("viewFungibleModule", "actions.setImage - image: " + image);
      await context.commit('setImage', image);
    },
    async toggleFungibleJunk(context) {
      logInfo("viewFungibleModule", "actions.toggleFungibleJunk");
      await context.commit('toggleFungibleJunk');
    },
    async toggleFungibleActive(context) {
      logInfo("viewFungibleModule", "actions.toggleFungibleActive");
      await context.commit('toggleFungibleActive');
    },
    async setShow(context, show) {
      await context.commit('setShow', show);
    },
  },
};
