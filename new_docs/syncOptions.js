const SyncOptions = {
  template: `
    <div>
      <b-modal ref="syncoptions" v-model="show" hide-footer body-bg-variant="light" size="sm">
        <template #modal-title>Sync Data</template>

        <b-form-checkbox size="sm" switch v-model="settings.full" @input="saveSettings" v-b-popover.hover="'Full or incremental sync'" class="ml-2 mt-1">Full Sync</b-form-checkbox>
        <b-form-checkbox size="sm" switch v-model="settings.dev" @input="saveSettings" v-b-popover.hover="'Dev Mode'" class="ml-2 mt-1">Dev Sync</b-form-checkbox>

        <!-- <b-form-checkbox size="sm" switch :disabled="chainId != 11155111" v-model="settings.sync.transfers" @input="saveSettings" class="ml-2 mt-1">Stealth Address transfer announcements</b-form-checkbox>
        <b-form-checkbox size="sm" switch :disabled="chainId != 11155111" v-model="settings.sync.directory" @input="saveSettings" class="ml-2 mt-1">Stealth Address Registry registrations</b-form-checkbox>
        <b-form-checkbox size="sm" switch :disabled="chainId != 11155111" v-model="settings.sync.tokens" @input="saveSettings" class="ml-2 mt-1">ERC-20 & ERC-721 transfers for my address set</b-form-checkbox>
        <b-form-checkbox size="sm" switch :disabled="chainId != 11155111 || !settings.sync.tokens" v-model="settings.sync.rescanTokens" @input="saveSettings" class="ml-2 mt-1">Full ERC-20 & ERC-721 rescan, after my address set changes</b-form-checkbox>
        <b-form-checkbox size="sm" switch :disabled="chainId != 1" v-model="settings.sync.ens" @input="saveSettings" class="ml-2 mt-1">Sync ENS names in Mainnet</b-form-checkbox>
        <b-form-checkbox size="sm" switch :disabled="true" v-model="settings.sync.balances" @input="saveSettings" class="ml-2 mt-1">TODO: Balances for my addresses</b-form-checkbox>
        <b-form-checkbox size="sm" switch :disabled="chainId != 11155111" v-model="settings.sync.exchangeRates" @input="saveSettings" class="ml-2 mt-1">TODO: Exchange rates</b-form-checkbox> -->

        <b-form-group label="" label-for="sync-go" label-size="sm" label-cols-sm="5" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-button size="sm" id="sync-go" @click="syncNow()" variant="primary">Do It!</b-button>
        </b-form-group>
      </b-modal>
    </div>
  `,
  data: function () {
    return {
      settings: {
        full: false,
        dev: false,
        version: 0,
      },
    }
  },
  computed: {
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
      logInfo("SyncOptions", "methods.saveSettings - syncOptionsSettings: " + JSON.stringify(this.settings, null, 2));
      localStorage.syncOptionsSettings = JSON.stringify(this.settings);
    },
    setShow(show) {
      store.dispatch('newTransfer/setShow', show);
    },
    syncNow() {
      store.dispatch('data/syncIt', { sections: ['all'], parameters: [] });
    },

    async syncIt(info) {
      store.dispatch('data/syncIt', info);
    },
  },
  mounted() {
    logDebug("SyncOptions", "mounted() $route: " + JSON.stringify(this.$route.params));
    if ('syncOptionsSettings' in localStorage) {
      const tempSettings = JSON.parse(localStorage.syncOptionsSettings);
      if ('version' in tempSettings && tempSettings.version == 0) {
        this.settings = tempSettings;
        this.settings.currentPage = 1;
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
