const NewTransfer = {
  template: `
    <div>
      <!-- :MODALADDTOKENSTOTRANSFER -->
      <b-modal ref="addtokensfortransfer" id="modal-addtokensfortransfer" hide-footer body-bg-variant="light" size="md">
        <template #modal-title>Add Tokens For Transfer</template>
        <b-form-select size="sm" v-model="modalAddTokensToNewTransfer.token" @change="additionalTokenSelected" :options="additionalERC20TokensOptions" v-b-popover.hover="'Select ERC-20 or ERC-721 tokens to transfer'" class="w-100"></b-form-select>
        <div v-if="additionalERC20TokensOptions.length == 1">
          <b-alert size="sm" show variant="warning" class="mt-2">Select favourite tokens in the Tokens tab first</b-alert>
        </div>
        <b-form-group v-if="modalAddTokensToNewTransfer.token && modalAddTokensToNewTransfer.type =='erc20'" label="Balance:" label-for="newtransfer-additionaltokens-erc20-balance" label-size="sm" label-cols-sm="5" label-align-sm="right" class="mx-0 my-1 p-0">
          <font size="-1">{{ modalAddTokensToNewTransfer.balance }}</font>
        </b-form-group>
        <b-form-group v-if="modalAddTokensToNewTransfer.token && modalAddTokensToNewTransfer.type =='erc20'" label="Approved To Transfer:" label-for="newtransfer-additionaltokens-erc20-approved" label-size="sm" label-cols-sm="5" label-align-sm="right" description="Approval to MagicalInternetMoney for transfer" class="mx-0 my-1 p-0">
          <b-input-group size="sm" class="w-100">
            <b-form-input type="text" size="sm" id="newtransfer-additionaltokens-erc20-approved" v-model.trim="modalAddTokensToNewTransfer.approvedInput"></b-form-input>
            <b-input-group-append>
              <b-button :disabled="modalAddTokensToNewTransfer.approved == modalAddTokensToNewTransfer.approvedInput" @click="updateApproval();" variant="warning"><b-icon-pencil-square shift-v="+1" font-scale="1.1"></b-icon-pencil-square></b-button>
              <b-button @click="additionalTokenSelected();" variant="link"><b-icon-arrow-repeat shift-v="+1" font-scale="1.1"></b-icon-arrow-repeat></b-button>
            </b-input-group-append>
          </b-input-group>
        </b-form-group>
        <b-form-group v-if="modalAddTokensToNewTransfer.token && modalAddTokensToNewTransfer.type =='erc20'" label="Amount To Transfer:" label-for="newtransfer-additionaltokens-erc20-amounttotransfer" label-size="sm" label-cols-sm="5" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-form-input type="text" size="sm" id="newtransfer-additionaltokens-erc20-amounttotransfer" v-model.trim="modalAddTokensToNewTransfer.amount" class="w-100"></b-form-input>
        </b-form-group>
        <b-form-group v-if="modalAddTokensToNewTransfer.token && modalAddTokensToNewTransfer.type =='erc20'" label="" label-for="newtransfer-additionaltokens-transfer-erc-20" label-size="sm" label-cols-sm="5" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-button size="sm" :disabled="!modalAddTokensToNewTransfer.amount" id="newtransfer-additionaltokens-transfer-erc-20" @click="addERC20TokenToTransfer()" variant="primary">Add To Transfer List</b-button>
        </b-form-group>

        <b-table v-if="modalAddTokensToNewTransfer.token && modalAddTokensToNewTransfer.type =='erc721'" small fixed striped responsive hover :fields="erc721TokensFields" :items="pagedFilteredSortedERC721Tokens" head-variant="light" class="m-0 mt-1 p-0">
          <template #cell(number)="data">
            <font size="-1">
              {{ parseInt(data.index) + ((settings.erc721TokensTable.currentPage - 1) * settings.erc721TokensTable.pageSize) + 1 }}
            </font>
          </template>
          <template #cell(tokenId)="data">
            <b-button size="sm" :href="'https://testnets.opensea.io/assets/sepolia/' + modalAddTokensToNewTransfer.token + '/' + data.item.tokenId" variant="link" v-b-popover.hover="data.item.tokenId" class="m-0 ml-2 p-0" target="_blank">{{ data.item.tokenId.toString().length > 20 ? (data.item.tokenId.toString().substring(0, 8) + '...' + data.item.tokenId.toString().slice(-8)) : data.item.tokenId.toString() }}</b-button>
          </template>
          <template #cell(select)="data">
            <b-form-checkbox size="sm" :checked="data.item.selected ? 1 : 0" value="1" @change="erc721TokenIdToggle(data.item.tokenId)" class="ml-2"></b-form-checkbox>
          </template>
        </b-table>
        <b-form-group v-if="modalAddTokensToNewTransfer.token && modalAddTokensToNewTransfer.type =='erc721'" label="Approved To Transfer:" label-for="newtransfer-additionaltokens-erc20-approved" label-size="sm" label-cols-sm="5" label-align-sm="right" description="Approval to MagicalInternetMoney for transfer" class="mx-0 my-1 p-0">
          <b-input-group size="sm" class="w-100">
            <b-form-checkbox size="sm" v-model="modalAddTokensToNewTransfer.isApprovedForAllInput" value="true" unchecked-value="false" class="ml-2"></b-form-checkbox>
            <b-input-group-append>
              <b-button :disabled="modalAddTokensToNewTransfer.isApprovedForAll == modalAddTokensToNewTransfer.isApprovedForAllInput" @click="updateApproval();" variant="warning"><b-icon-pencil-square shift-v="+1" font-scale="1.1"></b-icon-pencil-square></b-button>
              <b-button @click="additionalTokenSelected();" variant="link"><b-icon-arrow-repeat shift-v="+1" font-scale="1.1"></b-icon-arrow-repeat></b-button>
            </b-input-group-append>
          </b-input-group>
        </b-form-group>
        <b-form-group v-if="modalAddTokensToNewTransfer.token && modalAddTokensToNewTransfer.type =='erc721'" label="" label-for="newtransfer-additionaltokens-transfer-erc721" label-size="sm" label-cols-sm="4" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-button size="sm" :disabled="!modalAddTokensToNewTransfer.token || Object.keys(modalAddTokensToNewTransfer.selectedERC721TokenIds) == 0" id="newtransfer-additionaltokens-transfer-erc721" @click="addERC721TokenToTransfer()" variant="primary">Add To Transfer List</b-button>
        </b-form-group>
        <!-- <font size="-2">
          <pre>
{{ pagedFilteredSortedERC721Tokens }}
<br />
{{ modalAddTokensToNewTransfer }}
          </pre>
        </font> -->
      </b-modal>

      <b-modal ref="newtransfer" v-model="show" id="modal-newtransfer" hide-footer header-class="m-0 px-3 py-2" body-bg-variant="light" size="lg">
        <template #modal-title>New Stealth Transfer</template>
        <b-form-group label="Attached Web3 Address:" label-for="newtransfer-coinbase" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-form-input size="sm" plaintext id="newtransfer-coinbase" :value="coinbase" class="px-2 w-75"></b-form-input>
        </b-form-group>
        <b-form-group v-if="stealthMetaAddressSpecified" label="To:" label-for="newtransfer-to-specified" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-form-textarea size="sm" plaintext id="newtransfer-to-specified" :value="stealthMetaAddress" rows="3" max-rows="4" class="px-2"></b-form-textarea>
        </b-form-group>
        <b-form-group v-if="!stealthMetaAddressSpecified" label="To:" label-for="newtransfer-to-unspecified" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-form-select size="sm" v-model="stealthMetaAddress" :options="stealthMetaAddressesOptions" v-b-popover.hover="'Select from your approved Stealth Meta-Addresses'" class="w-100"></b-form-select>
        </b-form-group>
        <b-form-group v-if="!stealthMetaAddressSpecified" label="" label-for="newtransfer-to-specified" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-form-textarea size="sm" plaintext id="newtransfer-to-specified" :value="stealthMetaAddress" rows="3" max-rows="4" placeholder="Select from above" class="px-2"></b-form-textarea>
        </b-form-group>
        <b-form-group label="Amount:" label-for="newtransfer-amount" label-size="sm" label-cols-sm="3" label-align-sm="right" :state="!amount || newTransferAmountFeedback == null" :invalid-feedback="newTransferAmountFeedback" class="mx-0 my-1 p-0">
          <b-form-input type="text" size="sm" id="newtransfer-amount" v-model.trim="amount" placeholder="e.g., 0.01 for 0.01 ETH" debounce="600" class="w-50 text-right"></b-form-input>
        </b-form-group>
        <b-form-group label="" label-for="newtransfer-tokens" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-row v-for="(item, index) of items" v-bind:key="index">
            <b-col cols="3" class="mx-0 px-1 text-right">
              <font size="-1">{{ item.symbol }}</font>
            </b-col>
            <b-col cols="3" class="mb-1 pr-1">
              <div v-if="item.type == 'erc20'" class="ml-1">
                <font size="-1">{{ item.amount }}</font>
              </div>
              <div v-if="item.type == 'erc721'">
                <b-button size="sm" :href="'https://testnets.opensea.io/assets/sepolia/' + item.token + '/' + item.tokenId" variant="link" v-b-popover.hover="item.tokenId" class="m-0 ml-2 p-0" target="_blank">{{ item.tokenId.toString().length > 20 ? (item.tokenId.toString().substring(0, 8) + '...' + item.tokenId.toString().slice(-8)) : item.tokenId.toString() }}</b-button>
              </div>
            </b-col>
            <b-col cols="1" class="mx-0 px-1">
              <b-button size="sm" @click="removeTokensForTransfer(index);" variant="link" v-b-popover.hover="'Remove ' + item.symbol + ' ' + (item.type == 'erc20' ? item.amount : item.tokenId)" class="m-0 ml-2 p-0"><b-icon-dash shift-v="+1" font-scale="1.1"></b-icon-dash></b-button>
            </b-col>
          </b-row>
          <b-row>
            <b-col cols="3" class="mx-0 px-1 text-right">
            </b-col>
            <b-col cols="3" class="mb-1 pr-1">
            </b-col>
            <b-col cols="1" class="mx-0 px-1">
              <b-button size="sm" @click="addTokensForTransfer();" variant="link" v-b-popover.hover="'Add ERC-20/ERC-721 tokens to transfer'" class="m-0 ml-2 p-0"><b-icon-plus shift-v="+1" font-scale="1.1"></b-icon-plus></b-button>
            </b-col>
          </b-row>
        </b-form-group>
        <b-form-group label="" label-for="newtransfer-transfer" label-size="sm" label-cols-sm="3" label-align-sm="right" :description="newTransferFeedback" class="mx-0 my-1 p-0">
          <!-- <b-button size="sm" :disabled="!modalNewTransfer.stealthMetaAddress || modalNewTransfer.amount == null || (modalNewTransfer.amount == 0 && modalNewTransfer.items.length == 0)" id="newtransfer-transfer" @click="executeNewTransfer()" variant="warning">Transfer</b-button> -->
          <b-button size="sm" :disabled="!!newTransferFeedback" id="newtransfer-transfer" @click="executeNewTransfer()" variant="warning">Transfer</b-button>
        </b-form-group>
      </b-modal>
    </div>
  `,
  data: function () {
    return {
      settings: {
        erc721TokensTable: {
          filter: null,
          currentPage: 1,
          pageSize: 10000,
          sortOption: 'receiveddsc',
        },
      },

      modalAddTokensToNewTransfer: {
        token: null,
        type: null,
        amount: null,
        balance: null,
        approved: null,
        approvedInput: null,
        isApprovedForAll: null,
        isApprovedForAllInput: null,
        selectedERC721TokenIds: {},
      },
      erc721TokensFields: [
        { key: 'number', label: '#', sortable: false, thStyle: 'width: 5%;', tdClass: 'text-truncate' },
        { key: 'tokenId', label: 'Token Id', sortable: false, thStyle: 'width: 75%;', tdClass: 'text-truncate' },
        { key: 'select', label: 'Select', sortable: false, thStyle: 'width: 20%;', thClass: 'text-left', tdClass: 'text-truncate' },
      ],

    }
  },
  computed: {
    coinbase() {
      return store.getters['connection/coinbase'];
    },
    chainId() {
      return store.getters['connection/chainId'];
    },
    transferHelper() {
      return store.getters['connection/transferHelper'];
    },
    addresses() {
      return store.getters['data/addresses'];
    },
    tokens() {
      return store.getters['data/tokens'];
    },
    registry() {
      return store.getters['data/registry'];
    },
    transfers() {
      return store.getters['data/transfers'];
    },
    tokens() {
      return store.getters['data/tokens'];
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
    items() {
      return store.getters['newTransfer/items'];
    },

    stealthMetaAddressesOptions() {
      const results = [];
      results.push({ value: null, text: "(Select from your approved Stealth Meta-Addresses)"})
      for (const [address, addressData] of Object.entries(this.addresses)) {
        if (addressData.type == "stealthMetaAddress" && addressData.sendTo) {
          results.push({ value: address, text: (addressData.name ? (addressData.name + ' ') : '') + address.substring(0, 17) + '...' + address.slice(-8) + ' / ' + (addressData.linkedToAddress ? (addressData.linkedToAddress.substring(0, 10) + '...' + addressData.linkedToAddress.slice(-8)) : '') });
        }
      }
      return results;
    },
    additionalERC20TokensOptions() {
      const results = [];
      results.push({ value: null, text: "(select ERC-20 or ERC-721 token from active list)"})
      for (const [address, data] of Object.entries(this.tokens[this.chainId] || {})) {
        if (data.favourite) {
          // console.log(address + " => " + JSON.stringify(data));
          results.push({ value: address, text: (data.type == "erc20" ? "ERC-20 " : "ERC-721 ") + data.symbol + ' ' + data.name + ' @ ' + address.substring(0, 10) })
        }
      }
      return results;
    },

    newTransferAmountFeedback() {
      if (!this.amount) {
        return "Enter Amount";
      }
      if (this.amount == 0 && this.items.length == 0) {
        return "Enter Non-Zero Amount";
      }
      if (!this.amount.match(/^\d*\.?\d+$/)) {
        return "Invalid Number";
      }
      return null;
    },

    newTransferFeedback() {
      if (!this.amount) {
        return "Enter Amount";
      }
      if (this.amount == 0 && this.items.length == 0) {
        return "Enter Non-Zero Amount";
      }
      if (!this.amount.match(/^\d*\.?\d+$/)) {
        return "Invalid Number";
      }
      if (!this.stealthMetaAddress) {
        return "Select A Stealth Meta-Address"
      }
      return null;
    },


    filteredERC721Tokens() {
      logInfo("NewTransfer", "methods.filteredERC721Tokens BEGIN");
      const results = [];
      const tokenContract = this.tokens[this.chainId] && this.tokens[this.chainId][this.modalAddTokensToNewTransfer.token] || {};
      if (tokenContract.type == "erc721") {
        for (const [tokenId, tokenData] of Object.entries(tokenContract.tokenIds)) {
          if (tokenData.owner == this.coinbase) {
            const selected = tokenId in this.modalAddTokensToNewTransfer.selectedERC721TokenIds;
            results.push({ tokenId, ...tokenData, selected });
          }
        }
      }
      return results;
    },
    filteredSortedERC721Tokens() {
      let results = this.filteredERC721Tokens;
      // if (this.settings.contractsTable.sortOption == 'typenameasc') {
      //   results.sort((a, b) => {
      //     if (a.contractTypeSortIndex == b.contractTypeSortIndex) {
      //       if (('' + a.name).localeCompare(b.name) == 0) {
      //         return ('' + a.contract).localeCompare(b.contract);
      //       } else {
      //         return ('' + a.name).localeCompare(b.name);
      //       }
      //     } else {
      //       return a.contractTypeSortIndex - b.contractTypeSortIndex;
      //     }
      //   });
      // } else if (this.settings.contractsTable.sortOption == 'typenamedsc') {
      //   results.sort((a, b) => {
      //     if (a.contractTypeSortIndex == b.contractTypeSortIndex) {
      //       if (('' + a.name).localeCompare(b.name) == 0) {
      //         return ('' + b.contract).localeCompare(a.contract);
      //       } else {
      //         return ('' + b.name).localeCompare(a.name);
      //       }
      //     } else {
      //       return b.contractTypeSortIndex - a.contractTypeSortIndex;
      //     }
      //   });
      // } else if (this.settings.contractsTable.sortOption == 'nameasc') {
      //   results.sort((a, b) => {
      //     if (('' + a.name).localeCompare(b.name) == 0) {
      //       return ('' + a.contract).localeCompare(b.contract);
      //     } else {
      //       return ('' + a.name).localeCompare(b.name);
      //     }
      //   });
      // } else if (this.settings.contractsTable.sortOption == 'namedsc') {
      //   results.sort((a, b) => {
      //     if (('' + a.name).localeCompare(b.name) == 0) {
      //       return ('' + b.contract).localeCompare(a.contract);
      //     } else {
      //       return ('' + b.name).localeCompare(a.name);
      //     }
      //   });
      // }
      return results;
    },
    pagedFilteredSortedERC721Tokens() {
      logInfo("NewTransfer", "methods.pagedFilteredSortedERC721Tokens - results[0..9]: " + JSON.stringify(this.filteredSortedERC721Tokens.slice(0, 10), null, 2));
      return this.filteredSortedERC721Tokens.slice((this.settings.erc721TokensTable.currentPage - 1) * this.settings.erc721TokensTable.pageSize, this.settings.erc721TokensTable.currentPage * this.settings.erc721TokensTable.pageSize);
    },

  },
  methods: {
    saveSettings() {
      logInfo("NewTransfer", "methods.saveSettings - newTransferSettings: " + JSON.stringify(this.settings, null, 2));
      localStorage.newTransferSettings = JSON.stringify(this.settings);
    },
    formatDecimals(e, decimals = 18) {
      return e ? ethers.utils.formatUnits(e, decimals).replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",") : null;
    },
    setShow(show) {
      store.dispatch('newTransfer/setShow', show);
    },
    addTokensForTransfer() {
      logInfo("NewTransfer", "methods.addTokensForTransfer");
      this.$bvModal.show('modal-addtokensfortransfer');
    },
    async additionalTokenSelected() {
      logInfo("NewTransfer", "methods.additionalTokenSelected");
      logInfo("NewTransfer", "methods.additionalTokenSelected - this.modalAddTokensToNewTransfer: " + JSON.stringify(this.modalAddTokensToNewTransfer, null, 2));
      if (this.modalAddTokensToNewTransfer.token) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        console.log("this.tokens: " + JSON.stringify(this.tokens, null, 2));
        const tokenContract = this.tokens[this.chainId] && this.tokens[this.chainId][this.modalAddTokensToNewTransfer.token] || {};
        console.log("tokenContract: " + JSON.stringify(tokenContract, null, 2));
        Vue.set(this.modalAddTokensToNewTransfer, 'type', tokenContract.type || null);
        if (tokenContract.type == "erc20") {
          const contract = new ethers.Contract(this.modalAddTokensToNewTransfer.token, ERC20ABI, provider);
          const decimals = tokenContract.decimals && parseInt(tokenContract.decimals) || null;
          const balance = await contract.balanceOf(this.coinbase);
          Vue.set(this.modalAddTokensToNewTransfer, 'balance', this.formatDecimals(balance.toString(), decimals));
          const allowance = await contract.allowance(this.coinbase, MAGICALINTERNETMONEYADDRESS_SEPOLIA);
          Vue.set(this.modalAddTokensToNewTransfer, 'approved', this.formatDecimals(allowance.toString(), decimals));
          Vue.set(this.modalAddTokensToNewTransfer, 'approvedInput', this.formatDecimals(allowance.toString(), decimals));
        } else if (tokenContract.type == "erc721") {
          const contract = new ethers.Contract(this.modalAddTokensToNewTransfer.token, ERC721ABI, provider);
          const isApprovedForAll = await contract.isApprovedForAll(this.coinbase, MAGICALINTERNETMONEYADDRESS_SEPOLIA);
          Vue.set(this.modalAddTokensToNewTransfer, 'isApprovedForAll', isApprovedForAll.toString());
          Vue.set(this.modalAddTokensToNewTransfer, 'isApprovedForAllInput', isApprovedForAll.toString());
        }
        console.log("this.modalAddTokensToNewTransfer: " + JSON.stringify(this.modalAddTokensToNewTransfer));
      }
    },

    async updateApproval() {
      console.log(moment().format("HH:mm:ss") + " updateApproval BEGIN: " + JSON.stringify(this.modalAddTokensToNewTransfer, null, 2));
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      if (this.modalAddTokensToNewTransfer.type == "erc20") {
        const contract = new ethers.Contract(this.modalAddTokensToNewTransfer.token, ERC20ABI, provider);
        const contractWithSigner = contract.connect(provider.getSigner());
        const decimals = await contract.decimals();
        try {
          const tx = await contractWithSigner.approve(MAGICALINTERNETMONEYADDRESS_SEPOLIA, ethers.utils.parseUnits(this.modalAddTokensToNewTransfer.approvedInput, decimals));
          console.log("tx: " + JSON.stringify(tx));
        } catch (e) {
          console.log("updateApproval - ERC20.approve(...) error: " + JSON.stringify(e));
        }
      } else if (this.modalAddTokensToNewTransfer.type == "erc721") {
        const contract = new ethers.Contract(this.modalAddTokensToNewTransfer.token, ERC721ABI, provider);
        const contractWithSigner = contract.connect(provider.getSigner());
        try {
          const tx = await contractWithSigner.setApprovalForAll(MAGICALINTERNETMONEYADDRESS_SEPOLIA, this.modalAddTokensToNewTransfer.isApprovedForAllInput);
          console.log("tx: " + JSON.stringify(tx));
        } catch (e) {
          console.log("updateApproval - ERC721.setApprovalForAll(...) error: " + JSON.stringify(e));
        }
      }
      console.log(moment().format("HH:mm:ss") + " updateApproval END");
    },

    erc721TokenIdToggle(tokenId) {
      // console.log(moment().format("HH:mm:ss") + " erc721TokenIdToggle - tokenId: " + tokenId);
      if (tokenId in this.modalAddTokensToNewTransfer.selectedERC721TokenIds) {
        Vue.delete(this.modalAddTokensToNewTransfer.selectedERC721TokenIds, tokenId);
      } else {
        Vue.set(this.modalAddTokensToNewTransfer.selectedERC721TokenIds, tokenId, true);
      }
      // console.log(moment().format("HH:mm:ss") + " erc721TokenIdToggle - this.modalAddTokensToNewTransfer.selectedERC721TokenIds: " + JSON.stringify(this.modalAddTokensToNewTransfer.selectedERC721TokenIds, null, 2));
    },

    addERC20TokenToTransfer() {
      console.log(moment().format("HH:mm:ss") + " addERC20TokenToTransfer");
      const tokenContract = this.tokens[this.chainId] && this.tokens[this.chainId][this.modalAddTokensToNewTransfer.token] || {};
      const decimals = tokenContract.decimals && parseInt(tokenContract.decimals) || null;
      const symbol = tokenContract.symbol || null;
      const name = tokenContract.name || null;
      store.dispatch('newTransfer/addItem', {
        token: this.modalAddTokensToNewTransfer.token,
        type: this.modalAddTokensToNewTransfer.type,
        symbol,
        name,
        decimals,
        amount: this.modalAddTokensToNewTransfer.amount
      });
      this.$refs['addtokensfortransfer'].hide();
    },

    addERC721TokenToTransfer() {
      console.log(moment().format("HH:mm:ss") + " addERC721TokenToTransfer");
      const tokenContract = this.tokens[this.chainId] && this.tokens[this.chainId][this.modalAddTokensToNewTransfer.token] || {};
      console.log("tokenContract: " + JSON.stringify(tokenContract, null, 2));
      console.log("this.modalAddTokensToNewTransfer: " + JSON.stringify(this.modalAddTokensToNewTransfer, null, 2));
      if (tokenContract.type == "erc721") {
        for (const [tokenId, tokenData] of Object.entries(tokenContract.tokenIds)) {
          if (tokenData.owner == this.coinbase) {
            const selected = tokenId in this.modalAddTokensToNewTransfer.selectedERC721TokenIds;
            if (selected) {
              // console.log(tokenId + " " + selected + " => " + JSON.stringify(tokenData));
              const symbol = tokenContract.symbol || null;
              const name = tokenContract.name || null;
              store.dispatch('newTransfer/addItem', {
                token: this.modalAddTokensToNewTransfer.token,
                type: this.modalAddTokensToNewTransfer.type,
                symbol,
                name,
                tokenId,
              });
            }
          }
        }
      }
      // console.log("this.modalNewTransfer: " + JSON.stringify(this.modalNewTransfer, null, 2));
      console.log("this.modalAddTokensToNewTransfer: " + JSON.stringify(this.modalAddTokensToNewTransfer, null, 2));
      this.$refs['addtokensfortransfer'].hide();
    },

    removeTokensForTransfer(index) {
      console.log(moment().format("HH:mm:ss") + " removeTokensForTransfer: " + index);
      // this.modalNewTransfer.items.splice(index, 1);
      store.dispatch('newTransfer/removeItem', index);
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
      const schemeId = 1;
      const value = ethers.utils.parseEther(this.amount);
      const tokenInfos = [];
      for (const item of this.items) {
        console.log(JSON.stringify(item));
        if (item.type == "erc20") {
          tokenInfos.push([false, item.token, ethers.utils.parseUnits(item.amount, item.decimals).toString()]);
        } else {
          tokenInfos.push([true, item.token, item.tokenId.toString()]);
        }
      }
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
  },
  beforeDestroy() {
    logDebug("NewTransfer", "beforeDestroy()");
  },
  mounted() {
    logDebug("NewTransfer", "mounted() $route: " + JSON.stringify(this.$route.params));
    if ('newTransferSettings' in localStorage) {
      const tempSettings = JSON.parse(localStorage.newTransferSettings);
      if ('version' in tempSettings && tempSettings.version == 0) {
        this.settings = tempSettings;
      }
    }
  },
};

const newTransferModule = {
  namespaced: true,
  state: {
    show: false,
    stealthMetaAddressSpecified: false,
    stealthMetaAddress: null,
    amount: null,
    items: [
      // {"token":"0x8b73448426797099b6b9a96c4343f528bbAfc55e","type":"erc721","symbol":"TESTTOADZ","name":"TestToadz","tokenId":"60"},
      // {"token":"0x5A4Fc44325aa235B81aD60c60444F515fD418436","type":"erc20","symbol":"WEENUS","name":"Weenus 💪","decimals":18,"amount":"20"},
    ],
  },
  getters: {
    show: state => state.show,
    stealthMetaAddressSpecified: state => state.stealthMetaAddressSpecified,
    stealthMetaAddress: state => state.stealthMetaAddress,
    amount: state => state.amount,
    items: state => state.items,
  },
  mutations: {
    newTransfer(state, stealthMetaAddress) {
      logInfo("newTransferModule", "mutations.newTransfer - stealthMetaAddress: " + stealthMetaAddress);
      state.show = true;
      state.stealthMetaAddressSpecified = !!stealthMetaAddress;
      state.stealthMetaAddress = stealthMetaAddress;
      state.items = [];
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
    addItem(state, item) {
      logInfo("newTransferModule", "mutations.addItem - item: " + JSON.stringify(item));
      state.items.push(item);
    },
    removeItem(state, index) {
      logInfo("newTransferModule", "mutations.removeItem - index: " + JSON.stringify(index));
      state.items.splice(index, 1);
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
    async addItem(context, item) {
      logInfo("newTransferModule", "actions.addItem - item: " + JSON.stringify(item));
      await context.commit('addItem', item);
    },
    async removeItem(context, index) {
      logInfo("newTransferModule", "actions.removeItem - index: " + JSON.stringify(index));
      await context.commit('removeItem', index);
    },
  },
};
