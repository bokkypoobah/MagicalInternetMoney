const SyncOptions = {
  template: `
    <div>
      <b-modal ref="syncoptions" v-model="show" hide-footer body-bg-variant="light" size="sm">
        <template #modal-title>Sync Data</template>

        <b-form-checkbox size="sm" switch :disabled="settings.devThing || chainId != 11155111" v-model="settings.stealthTransfers" @input="saveSettings" v-b-popover.hover="'ERC-5564: Stealth Addresses announcements'" class="ml-2 mt-1">Stealth Transfers</b-form-checkbox>
        <b-form-checkbox size="sm" switch :disabled="settings.devThing || chainId != 11155111" v-model="settings.stealthMetaAddressRegistry" @input="saveSettings" v-b-popover.hover="'ERC-6538: Stealth Meta-Address Registry entries'" class="ml-2 mt-1">Stealth Meta-Address Registry</b-form-checkbox>
        <b-form-checkbox v-if="false" size="sm" switch :disabled="true" v-model="settings.eth" @input="saveSettings" v-b-popover.hover="'Ether Balances'" class="ml-2 mt-1">TODO: Ether Balances</b-form-checkbox>
        <b-form-checkbox size="sm" switch :disabled="settings.devThing" v-model="settings.tokens" @input="saveSettings" v-b-popover.hover="'ERC-20, ERC-721 and ERC-1155 Tokens'" class="ml-2 mt-1">Tokens</b-form-checkbox>
        <b-form-checkbox size="sm" switch :disabled="settings.devThing" v-model="settings.metadata" @input="saveSettings" v-b-popover.hover="'ERC-721 Non-Fungible Token metadata'" class="ml-2 mt-1">Token Metadata</b-form-checkbox>

        <b-form-checkbox size="sm" switch :disabled="chainId != 1" v-model="settings.ens" @input="saveSettings" class="ml-2 mt-1">ENS Names on ETH Mainnet</b-form-checkbox>
        <b-form-checkbox v-if="false" size="sm" switch :disabled="true" v-model="settings.exchangeRates" @input="saveSettings" class="ml-2 mt-1">TODO: Exchange Rates</b-form-checkbox>

        <b-form-checkbox size="sm" switch :disabled="settings.devThing" v-model="settings.timestamps" @input="saveSettings" v-b-popover.hover="'Timestamps'" class="ml-2 mt-1">Timestamps</b-form-checkbox>
        <b-form-checkbox size="sm" switch :disabled="settings.devThing" v-model="settings.txData" @input="saveSettings" v-b-popover.hover="'Transaction Data'" class="ml-2 mt-1">Transaction Data</b-form-checkbox>
        <!-- <b-form-checkbox size="sm" switch :disabled="settings.devThing" v-model="settings.incrementalSync" @input="saveSettings" v-b-popover.hover="'Incremental sync or resync all events'" class="ml-2 mt-1">Incremental Sync</b-form-checkbox> -->
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
        ethers: true,
        tokens: true,
        metadata: true,
        ens: true,
        exchangeRates: true,
        // incrementalSync: true,
        timestamps: true,
        txData: true,
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
        ethers: this.settings.ethers,
        tokens: this.settings.tokens,
        metadata: this.settings.metadata,
        ens: this.settings.ens,
        exchangeRates: this.settings.exchangeRates,
        // incrementalSync: this.settings.incrementalSync,
        timestamps: this.settings.timestamps,
        txData: this.settings.txData,
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
    viewSyncOptions(state) {
      logInfo("syncOptionsModule", "mutations.viewSyncOptions");
      state.show = true;
    },
    setShow(state, show) {
      state.show = show;
    },
  },
  actions: {
    async viewSyncOptions(context, blah) {
      logInfo("syncOptionsModule", "actions.viewSyncOptions");
      await context.commit('viewSyncOptions');
    },
    async setShow(context, show) {
      await context.commit('setShow', show);
    },
  },
};
