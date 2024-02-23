const SyncOptions = {
  template: `
    <div>
      <b-modal ref="syncoptions" v-model="show" hide-footer body-bg-variant="light" size="sm">
        <template #modal-title>Sync Data</template>

        <b-form-checkbox size="sm" switch :disabled="settings.devThing || chainId != 11155111" v-model="settings.stealthTransfers" @input="saveSettings" v-b-popover.hover="'ERC-5564: Stealth Addresses announcements'" class="ml-2 mt-1">Stealth Transfers</b-form-checkbox>
        <b-form-checkbox size="sm" switch :disabled="settings.devThing || chainId != 11155111" v-model="settings.stealthMetaAddressRegistry" @input="saveSettings" v-b-popover.hover="'ERC-6538: Stealth Meta-Address Registry entries'" class="ml-2 mt-1">Stealth Meta-Address Registry</b-form-checkbox>
        <b-form-checkbox size="sm" switch :disabled="settings.devThing || (chainId != 1 && chainId != 11155111)" v-model="settings.erc20" @input="saveSettings" v-b-popover.hover="'ERC-20 Fungible Tokens'" class="ml-2 mt-1">ERC-20 Fungible Tokens</b-form-checkbox>
        <b-form-checkbox size="sm" switch :disabled="settings.devThing || (chainId != 1 && chainId != 11155111)" v-model="settings.erc721" @input="saveSettings" v-b-popover.hover="'ERC-721 Non-Fungible Tokens'" class="ml-2 mt-1">ERC-721 Non-Fungible Tokens</b-form-checkbox>
        <b-form-checkbox size="sm" switch :disabled="settings.devThing || (chainId != 1 && chainId != 11155111)" v-model="settings.erc1155" @input="saveSettings" v-b-popover.hover="'ERC-1155 Non-Fungible Tokens'" class="ml-2 mt-1">ERC-1155 Non-Fungible Tokens</b-form-checkbox>
        <b-form-checkbox size="sm" switch :disabled="settings.devThing || (chainId != 1 && chainId != 11155111)" v-model="settings.metadata" @input="saveSettings" v-b-popover.hover="'ERC-721 Non-Fungible Token metadata'" class="ml-2 mt-1">Non-Fungible Token Metadata</b-form-checkbox>

        <b-form-checkbox v-if="false" size="sm" switch :disabled="chainId != 1" v-model="settings.ens" @input="saveSettings" class="ml-2 mt-1">Sync ENS names on Mainnet</b-form-checkbox>
        <b-form-checkbox v-if="false" size="sm" switch :disabled="true" v-model="settings.balances" @input="saveSettings" class="ml-2 mt-1">TODO: Balances</b-form-checkbox>
        <b-form-checkbox v-if="false" size="sm" switch :disabled="true" v-model="settings.exchangeRates" @input="saveSettings" class="ml-2 mt-1">TODO: Exchange Rates</b-form-checkbox>

        <b-form-checkbox size="sm" switch :disabled="settings.devThing" v-model="settings.incrementalSync" @input="saveSettings" v-b-popover.hover="'Incremental sync or resync all events'" class="ml-2 mt-1">Incremental Sync</b-form-checkbox>
        <b-form-checkbox size="sm" switch v-model="settings.devThing" @input="saveSettings" v-b-popover.hover="'Do Some Dev Thing'" class="ml-2 mt-1">Dev Thing</b-form-checkbox>

        <b-form-group label="" label-for="sync-go" label-size="sm" label-cols-sm="5" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-button size="sm" id="sync-go" @click="syncNow()" variant="primary">Do It!</b-button>
        </b-form-group>
      </b-modal>
    </div>
  `,
  data: function () {
    return {
      settings: {
        stealthTransfers: true,
        stealthMetaAddressRegistry: true,
        erc20: true,
        erc721: true,
        erc1155: true,
        metadata: true,
        ens: true,
        balances: true,
        exchangeRates: true,
        incrementalSync: true,
        devThing: false,
        version: 0,
      },
    }
  },
  computed: {
    chainId() {
      return store.getters['connection/chainId'];
    },
    show: {
      get: function () {
        return store.getters['syncOptions/show'];
      },
      set: function (show) {
        store.dispatch('syncOptions/setShow', show);
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

  },
  methods: {
    saveSettings() {
      // logInfo("SyncOptions", "methods.saveSettings - syncOptionsSettings: " + JSON.stringify(this.settings, null, 2));
      localStorage.syncOptionsSettings = JSON.stringify(this.settings);
    },
    syncNow() {
      store.dispatch('data/syncIt', {
        stealthTransfers: this.settings.stealthTransfers,
        stealthMetaAddressRegistry: this.settings.stealthMetaAddressRegistry,
        erc20: this.settings.erc20,
        erc721: this.settings.erc721,
        erc1155: this.settings.erc1155,
        metadata: this.settings.metadata,
        ens: this.settings.ens,
        balances: this.settings.balances,
        exchangeRates: this.settings.exchangeRates,
        incrementalSync: this.settings.incrementalSync,
        devThing: this.settings.devThing,
      });
      store.dispatch('syncOptions/setShow', false);
    },
  },
  mounted() {
    logDebug("SyncOptions", "mounted() $route: " + JSON.stringify(this.$route.params));
    if ('syncOptionsSettings' in localStorage) {
      const tempSettings = JSON.parse(localStorage.syncOptionsSettings);
      if ('version' in tempSettings && tempSettings.version == 0) {
        this.settings = tempSettings;
      }
    }
  },
};

const syncOptionsModule = {
  namespaced: true,
  state: {
    show: false,
  },
  getters: {
    show: state => state.show,
  },
  mutations: {
    viewSyncOptions(state, blah) {
      logInfo("syncOptionsModule", "mutations.viewSyncOptions - blah: " + blah);
      state.show = true;
    },
    setShow(state, show) {
      state.show = show;
    },
  },
  actions: {
    async viewSyncOptions(context, blah) {
      logInfo("syncOptionsModule", "actions.viewSyncOptions - blah: " + blah);
      await context.commit('viewSyncOptions', blah);
    },
    async setShow(context, show) {
      await context.commit('setShow', show);
    },
  },
};
