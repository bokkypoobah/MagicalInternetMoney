const ViewTokenContract = {
  template: `
    <div>
      <b-modal ref="viewtokencontract" v-model="show" hide-footer header-class="m-0 px-3 py-2" body-bg-variant="light" size="lg">
        <template #modal-title>{{ (type == 'erc20' ? 'ERC-20 ' : (type == 'erc721' ? 'ERC-721 Non-' : 'ERC-1155 Non-')) + 'Fungible Token Contract' }}</template>

        <b-form-group label="Contract:" label-for="token-contract" label-size="sm" label-cols-sm="3" label-align-sm="right" :description="unsupported ? 'Unsupported Non-Standard ERC-20' : ''" class="mx-0 my-1 p-0">
          <b-input-group size="sm" class="w-100">
            <b-form-input size="sm" plaintext id="token-contract" v-model.trim="contract" class="px-2"></b-form-input>
            <b-input-group-append>
              <div>
                <b-button v-if="networkSupported" size="sm" :href="explorer + 'token/' + contract" variant="link" v-b-popover.hover.ds500="'View in explorer'" target="_blank" class="m-0 ml-1 p-0"><b-icon-link45deg shift-v="+1" font-scale="0.95"></b-icon-link45deg></b-button>
              </div>
            </b-input-group-append>
          </b-input-group>
        </b-form-group>

        <b-form-group label="" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-button size="sm" id="address-junk" :pressed.sync="junk" variant="transparent" v-b-popover.hover.ds500="junk ? 'Junk' : 'Not junk'" class="m-0 mx-2 p-0">
            <b-icon :icon="junk ? 'trash-fill' : 'trash'" shift-v="+1" font-scale="1.2" :variant="junk ? 'primary' : 'secondary'">
            </b-icon>
          </b-button>
          <b-button size="sm" :disabled="junk || decimals === null || unsupported" id="address-active" :pressed.sync="active" variant="transparent" v-b-popover.hover.ds500="active ? 'Active' : 'Inactive'" class="m-0 mx-2 p-0">
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

        <b-form-group v-if="type == 'erc20'" label="Decimals:" label-for="token-decimals" label-size="sm" label-cols-sm="3" label-align-sm="right" :description="contractDecimals && decimals != contractDecimals ? ('Contract value: ' + contractDecimals) : ''" class="mx-0 my-1 p-0">
          <b-form-select size="sm" id="token-decimals" v-model="decimals" :options="decimalsOptions" v-b-popover.hover.ds500="'Decimals'" class="w-25"></b-form-select>
        </b-form-group>

        <b-form-group label="Image:" label-for="token-image" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-img v-if="image" button rounded fluid size="15rem" :src="image" class="m-2" style="width: 100px;">
          </b-img>
        </b-form-group>

        <b-form-group label="" label-for="token-updateimage" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-form-file size="sm" id="token-updateimage" @change="handleImage" accept="image/*" placeholder="Update image" class="w-50">
          </b-form-file>
        </b-form-group>

        <b-form-group v-if="type == 'erc20'" label="Total Supply:" label-for="token-totalsupply" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-form-input size="sm" plaintext id="token-totalsupply" :value="formatERC20(totalSupply, decimals)" class="px-2 w-50"></b-form-input>
        </b-form-group>

        <b-form-group label="" label-for="token-refresh" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-button size="sm" :disabled="!networkSupported || sync.section != null"  @click="syncTokenContract();" variant="link" v-b-popover.hover.ds500="'Refresh balances and approvals'" ><b-icon-arrow-repeat shift-v="+1" font-scale="1.1"></b-icon-arrow-repeat></b-button>
        </b-form-group>

        <b-form-group v-if="type == 'erc20'" label="Balances:" label-for="token-balances" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-row class="m-0 p-0">
            <b-col cols="5" class="m-0 px-2">
              <font size="-1">Address</font>
            </b-col>
            <b-col cols="7" class="m-0 px-2">
              <font size="-1">Balance</font>
            </b-col>
          </b-row>
          <b-row v-for="(b, i) in balances" v-bind:key="i" class="m-0 p-0">
            <b-col cols="5" class="m-0 px-2">
              <b-link :href="explorer + 'address/' + b.address" target="_blank">
                <font size="-1">{{ names[b.address] || (b.address.substring(0, 8) + '...' + b.address.slice(-6)) }}</font>
              </b-link>
            </b-col>
            <b-col cols="7" class="m-0 px-2">
              <b-link :href="explorer + 'token/' + contract + '?a=' + b.address" target="_blank">
                <font size="-1">{{ formatERC20(b.balance, decimals) }}</font>
              </b-link>
            </b-col>
          </b-row>
        </b-form-group>

        <b-form-group label="Approvals:" label-for="token-approvals" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-row class="m-0 p-0">
            <b-col cols="4" class="m-0 px-2">
              <font size="-1">Owner</font>
            </b-col>
            <b-col cols="4" class="m-0 px-2">
              <font size="-1">Spender</font>
            </b-col>
            <b-col cols="4" class="m-0 px-2">
              <font size="-1">Value</font>
            </b-col>
          </b-row>
          <b-row v-for="(a, i) in approvals" v-bind:key="i" class="m-0 p-0">
            <b-col cols="4" class="m-0 px-2">
              <b-link :href="explorer + 'address/' + a.owner" target="_blank">
                <font size="-1">{{ names[a.owner] || (a.owner.substring(0, 8) + '...' + a.owner.slice(-6)) }}</font>
              </b-link>
            </b-col>
            <b-col cols="4" class="m-0 px-2">
              <b-link :href="explorer + 'address/' + a.spender" target="_blank">
                <font size="-1">{{ names[a.spender] || (a.spender.substring(0, 8) + '...' + a.spender.slice(-6)) }}</font>
              </b-link>
            </b-col>
            <b-col cols="4" class="m-0 px-2">
              <font size="-1">
                <div v-if="type == 'erc20'">
                  <span v-if="a.value && a.value.toString().length > 30">
                    <b-badge pill variant="transparent" v-b-popover.hover.ds500="formatERC20(a.value, decimals)" class="px-0">&infin;</b-badge>
                  </span>
                  <span v-else>
                    {{ formatERC20(a.value, decimals || 0) }}
                  </span>
                </div>
                <div v-else-if="type == 'erc721' && a.eventType == 'Approval'">
                  {{ a.tokenId }}
                </div>
                <div v-else>
                  {{ a.approved }}
                </div>
              </font>
            </b-col>
          </b-row>
        </b-form-group>

        <!-- <b-form-group label="" label-for="token-refreshtokenmetadata" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-button size="sm" @click="refreshTokenMetadata();" variant="link" v-b-popover.hover.ds500="'Refresh Token Metadata'"><b-icon-arrow-repeat shift-v="+1" font-scale="1.1" variant="primary"></b-icon-arrow-repeat></b-button>
        </b-form-group> -->

        <!-- <b-form-group v-if="false" label="" label-for="token-delete" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-button size="sm" @click="deleteAddress(contract);" variant="link" v-b-popover.hover.ds500="'Delete address ' + contract.substring(0, 10) + '...' + contract.slice(-8) + '?'"><b-icon-trash shift-v="+1" font-scale="1.1" variant="danger"></b-icon-trash></b-button>
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
      return store.getters['viewTokenContract/address'];
    },
    contract() {
      return store.getters['viewTokenContract/contract'];
    },
    type() {
      return store.getters['viewTokenContract/type'];
    },
    unsupported() {
      return this.contract in UNSUPPORTED_FUNGIBLES;
    },
    contractDecimals() {
      return store.getters['viewTokenContract/contractDecimals'];
    },
    tokenId() {
      return store.getters['viewTokenContract/tokenId'];
    },
    addresses() {
      return store.getters['data/addresses'];
    },
    tokens() {
      return store.getters['data/tokens'];
    },
    names() {
      return store.getters['data/names'];
    },
    sync() {
      return store.getters['data/sync'];
    },
    symbol: {
      get: function () {
        return store.getters['viewTokenContract/symbol'];
      },
      set: function (symbol) {
        store.dispatch('data/setFungibleField', { chainId: this.chainId, contract: this.contract, field: 'symbol', value: symbol });
        store.dispatch('viewTokenContract/setSymbol', symbol);
      },
    },
    name: {
      get: function () {
        return store.getters['viewTokenContract/name'];
      },
      set: function (name) {
        store.dispatch('data/setFungibleField', { chainId: this.chainId, contract: this.contract, field: 'name', value: name });
        store.dispatch('viewTokenContract/setName', name);
      },
    },
    decimals: {
      get: function () {
        return store.getters['viewTokenContract/decimals'];
      },
      set: function (decimals) {
        store.dispatch('data/setFungibleField', { chainId: this.chainId, contract: this.contract, field: 'decimals', value: decimals });
        store.dispatch('viewTokenContract/setDecimals', decimals);
      },
    },
    totalSupply() {
      return this.chainId && this.contract && store.getters['data/tokens'] && store.getters['data/tokens'][this.chainId] && store.getters['data/tokens'][this.chainId][this.contract] && store.getters['data/tokens'][this.chainId][this.contract].totalSupply;
    },
    balances() {
      return store.getters['viewTokenContract/balances'];
    },
    approvals() {
      return store.getters['viewTokenContract/approvals'];
    },
    image() {
      return store.getters['viewTokenContract/image'];
    },
    contractSymbol() {
      return store.getters['viewTokenContract/contractSymbol'];
    },
    contractName() {
      return store.getters['viewTokenContract/contractName'];
    },
    contractDecimals() {
      return store.getters['viewTokenContract/contractDecimals'];
    },
    junk: {
      get: function () {
        return store.getters['viewTokenContract/junk'];
      },
      set: function (junk) {
        store.dispatch('data/toggleFungibleJunk', { chainId: this.chainId, contract: this.contract });
        store.dispatch('viewTokenContract/toggleFungibleJunk');
      },
    },
    active: {
      get: function () {
        return store.getters['viewTokenContract/active'];
      },
      set: function (active) {
        store.dispatch('data/toggleFungibleActive', { chainId: this.chainId, contract: this.contract });
        store.dispatch('viewTokenContract/toggleFungibleActive');
      },
    },
    show: {
      get: function () {
        return store.getters['viewTokenContract/show'];
      },
      set: function (show) {
        store.dispatch('viewTokenContract/setShow', show);
      },
    },
  },
  methods: {
    async handleImage(e) {
      const selectedImage = e.target.files[0];
      try {
        const image = await toBase64(selectedImage);
        store.dispatch('data/setFungibleField', { chainId: this.chainId, contract: this.contract, field: 'image', value: image });
        store.dispatch('viewTokenContract/setImage', image);
      } catch (e) {
        console.log(now() + " ERROR ViewTokenContract:methods.handleImage: " + e.message);
      }
    },
    async syncTokenContract() {
      console.log(now() + " INFO ViewTokenContract:methods.syncTokenContract");
      store.dispatch('data/syncIt', {
        selectedContract: this.contract,
      });
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
    setShow(show) {
      store.dispatch('viewTokenContract/setShow', show);
    },

    async deleteAddress(account) {
      this.$bvModal.msgBoxConfirm('Are you sure?')
        .then(value => {
          if (value) {
            store.dispatch('data/deleteAddress', account);
            this.$refs['viewtokencontract'].hide();
          }
        })
        .catch(err => {
          // An error occurred
        })
    },
  },
  beforeDestroy() {
    // console.log(now() + " DEBUG ViewTokenContract:beforeDestroy");
  },
  mounted() {
    // console.log(now() + " DEBUG ViewTokenContract:mounted - $route: " + JSON.stringify(this.$route.params));
    // if ('transfersSettings' in localStorage) {
    //   const tempSettings = JSON.parse(localStorage.transfersSettings);
    //   if ('version' in tempSettings && tempSettings.version == 0) {
    //     this.settings = tempSettings;
    //   }
    // }
  },
};

const viewTokenContractModule = {
  namespaced: true,
  state: {
    contract: null,
    type: null,
    symbol: null,
    name: null,
    decimals: null,
    balances: [],
    approvals: [],
    image: null,
    junk: null,
    active: null,
    contractSymbol: null,
    contractName: null,
    contractDecimals: null,
    show: false,
  },
  getters: {
    contract: state => state.contract,
    type: state => state.type,
    symbol: state => state.symbol,
    name: state => state.name,
    decimals: state => state.decimals,
    balances: state => state.balances,
    approvals: state => state.approvals,
    image: state => state.image,
    junk: state => state.junk,
    active: state => state.active,
    contractSymbol: state => state.contractSymbol,
    contractName: state => state.contractName,
    contractDecimals: state => state.contractDecimals,
    show: state => state.show,
  },
  mutations: {
    viewTokenContract(state, info) {
      // console.log(now() + " INFO viewTokenContractModule:mutations.viewTokenContract - info: " + JSON.stringify(info));
      state.contract = info.contract;
      state.type = info.type;
      state.symbol = info.symbol;
      state.name = info.name;
      state.decimals = info.decimals;
      state.balances = [];
      state.image = info.image;
      state.junk = info.junk;
      state.active = info.active;
      state.contractSymbol = null;
      state.contractName = null;
      state.contractDecimals = null;
      state.show = true;
    },
    setSymbol(state, symbol) {
      // console.log(now() + " INFO viewTokenContractModule:mutations.setSymbol - symbol: " + symbol);
      state.symbol = symbol;
    },
    setName(state, name) {
      // console.log(now() + " INFO viewTokenContractModule:mutations.setName - name: " + name);
      state.name = name;
    },
    setDecimals(state, decimals) {
      // console.log(now() + " INFO viewTokenContractModule:mutations.setDecimals - decimals: " + decimals);
      state.decimals = decimals;
    },
    setImage(state, image) {
      // console.log(now() + " INFO viewTokenContractModule:mutations.setImage - image: " + image);
      state.image = image;
    },
    toggleFungibleJunk(state) {
      // console.log(now() + " INFO viewTokenContractModule:mutations.toggleFungibleJunk");
      state.junk = !state.junk;
    },
    toggleFungibleActive(state) {
      // console.log(now() + " INFO viewTokenContractModule:mutations.toggleFungibleActive");
      state.active = !state.active;
    },
    setContractValues(state, info) {
      // console.log(now() + " INFO viewTokenContractModule:mutations.setContractValues - info: " + JSON.stringify(info));
      state.contractSymbol = info.contractSymbol;
      state.contractName = info.contractName;
      state.contractDecimals = info.contractDecimals;
    },
    setBalances(state, balances) {
      // console.log(now() + " INFO viewTokenContractModule:mutations.setBalances - balances: " + JSON.stringify(balances));
      state.balances = balances;
    },
    setApprovals(state, approvals) {
      console.log(now() + " INFO viewTokenContractModule:mutations.setApprovals - approvals: " + JSON.stringify(approvals));
      state.approvals = approvals;
    },
    setShow(state, show) {
      state.show = show;
    },
  },
  actions: {
    async viewTokenContract(context, info) {
      console.log(now() + " INFO viewTokenContractModule:actions.viewTokenContract - info: " + JSON.stringify(info));
      const chainId = store.getters['connection/chainId'] || null;
      const token = chainId && store.getters['data/tokens'][chainId] && store.getters['data/tokens'][chainId][info.contract] || {};
      await context.commit('viewTokenContract', {
        chainId,
        contract: info.contract,
        type: token.type,
        symbol: token.symbol,
        name: token.name,
        decimals: token.decimals,
        image: token.image,
        junk: token.junk,
        active: token.active,
      });

      const balances = chainId && store.getters['data/balances'] && store.getters['data/balances'][chainId] && store.getters['data/balances'][chainId][info.contract] && store.getters['data/balances'][chainId][info.contract].balances || {};
      const balancesResults = [];
      for (const [address, balance] of Object.entries(balances)) {
        balancesResults.push({ address, balance });
      }
      await context.commit('setBalances', balancesResults);

      const approvalsResults = [];
      for (const [owner, ownerData] of Object.entries(store.getters['data/approvals'][chainId] || {})) {
        const contractData = ownerData[info.contract] || [];
        if (token.type == "erc20") {
          for (const [spender, value] of Object.entries(contractData)) {
            approvalsResults.push({ type: token.type, eventType: "Approval", owner, spender, value });
          }
        } else if (token.type == "erc721" || token.type == "erc1155") {
          for (const [tokenId, spender] of Object.entries(contractData.tokens || {})) {
            approvalsResults.push({ type: token.type, eventType: "Approval", owner, spender, tokenId });
          }
          for (const [spender, approved] of Object.entries(contractData.approvalForAll || {})) {
            approvalsResults.push({ type: token.type, eventType: "SetApprovalForAll", owner, spender, approved });
          }
        }
      }
      await context.commit('setApprovals', approvalsResults);

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const interface = new ethers.Contract(info.contract, ERC20ABI, provider);
      let symbol = null;
      let name = null;
      let decimals = null;
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
      await context.commit('setContractValues', {
        contractSymbol: symbol,
        contractName: name,
        contractDecimals: decimals && decimals.toString() || null,
      });
      const selectedAddressesMap = {};
      for (const [address, addressData] of Object.entries(store.getters['data/addresses'] || {})) {
        if (address.substring(0, 2) == "0x" && addressData.type == "address" && !addressData.junk && addressData.watch) {
          selectedAddressesMap[address] = true;
        }
      }
    },
    async setSymbol(context, symbol) {
      console.log(now() + " INFO viewTokenContractModule:actions.setSymbol - symbol: " + symbol);
      await context.commit('setSymbol', symbol);
    },
    async setName(context, name) {
      console.log(now() + " INFO viewTokenContractModule:actions.setName - name: " + name);
      await context.commit('setName', name);
    },
    async setDecimals(context, decimals) {
      console.log(now() + " INFO viewTokenContractModule:actions.setDecimals - decimals: " + decimals);
      await context.commit('setDecimals', decimals);
    },
    async setImage(context, image) {
      console.log(now() + " INFO viewTokenContractModule:actions.setImage - image: " + image);
      await context.commit('setImage', image);
    },
    async toggleFungibleJunk(context) {
      console.log(now() + " INFO viewTokenContractModule:actions.toggleFungibleJunk");
      await context.commit('toggleFungibleJunk');
    },
    async toggleFungibleActive(context) {
      console.log(now() + " INFO viewTokenContractModule:actions.toggleFungibleActive");
      await context.commit('toggleFungibleActive');
    },
    async setShow(context, show) {
      await context.commit('setShow', show);
    },
  },
};
