const Registry = {
  template: `
    <div class="m-0 p-0">
      <b-card no-body no-header class="border-0">
        <div class="d-flex flex-wrap m-0 p-0">
          <div class="mt-0 flex-grow-1">
          </div>
          <div class="mt-0 pr-1">
            <b-button size="sm" :disabled="!coinbase" @click="syncIt({ sections: ['all'], parameters: [] })" variant="link" v-b-popover.hover.top="'Sync data from the blockchain'"><b-icon-cloud-download shift-v="+1" font-scale="1.2"></b-icon-cloud-download></b-button>
          </div>
          <div v-if="false" class="mt-0 pr-1">
            <b-button size="sm" :disabled="!coinbase" @click="syncIt({ sections: ['syncIdentifyMyStealthTransfers'], parameters: [] })" variant="link" v-b-popover.hover.top="'Sync some'"><b-icon-cloud-download shift-v="+1" font-scale="1.2" variant="info"></b-icon-cloud-download></b-button>
          </div>
          <div class="mt-0 flex-grow-1">
          </div>
          <div class="mt-0 pr-1">
            <b-form-select size="sm" v-model="settings.sortOption" @change="saveSettings" :options="sortOptions" v-b-popover.hover.top="'Yeah. Sort'"></b-form-select>
          </div>
          <div class="mt-0 pr-1">
            <font size="-2" v-b-popover.hover.top="'# registry entries'">{{ filteredSortedRegistryEntries.length + '/' + totalRegistryEntries }}</font>
          </div>
          <div class="mt-0 pr-1">
            <b-pagination size="sm" v-model="settings.currentPage" @input="saveSettings" :total-rows="filteredSortedRegistryEntries.length" :per-page="settings.pageSize" style="height: 0;"></b-pagination>
          </div>
          <div class="mt-0 pl-1">
            <b-form-select size="sm" v-model="settings.pageSize" @change="saveSettings" :options="pageSizes" v-b-popover.hover.top="'Page size'"></b-form-select>
          </div>
        </div>

        <b-table ref="registryTable" small fixed striped responsive hover :fields="fields" :items="pagedFilteredSortedRegistryEntries" show-empty head-variant="light" class="m-0 mt-1">
          <template #empty="scope">
            <h6>{{ scope.emptyText }}</h6>
            <div>
              <ul>
                <li>
                  Check you are correctly connected to the Sepolia testnet
                </li>
                <li>
                  Click <b-button size="sm" variant="link" class="m-0 p-0"><b-icon-cloud-download shift-v="+1" font-scale="1.2"></b-icon-cloud-download></b-button> above to sync this app to the blockchain
                </li>
              </ul>
            </div>
          </template>
          <template #cell(number)="data">
            {{ parseInt(data.index) + ((settings.currentPage - 1) * settings.pageSize) + 1 }}
          </template>
        </b-table>
      </b-card>
    </div>
  `,
  data: function () {
    return {
      count: 0,
      reschedule: true,
      settings: {
        filter: null,
        currentPage: 1,
        pageSize: 10,
        sortOption: 'registrantasc',
        version: 0,
      },
      sortOptions: [
        // { value: 'nameregistrantasc', text: '▲ Name, ▲ Registrant' },
        // { value: 'nameregistrantdsc', text: '▼ Name, ▲ Registrant' },
        { value: 'registrantasc', text: '▲ Registrant' },
        { value: 'registrantdsc', text: '▼ Registrant' },
      ],
      fields: [
        { key: 'number', label: '#', sortable: false, thStyle: 'width: 5%;', tdClass: 'text-truncate' },
        { key: 'registrant', label: 'Registrant', sortable: false, thStyle: 'width: 35%;', thClass: 'text-left', tdClass: 'text-left' },
        { key: 'stealthMetaAddress', label: 'Stealth Meta-Address', sortable: false, thStyle: 'width: 60%;', tdClass: 'text-left' },
      ],
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
    pageSizes() {
      return store.getters['config/pageSizes'];
    },
    registry() {
      return store.getters['data/registry'];
    },

    totalRegistryEntries() {
      return Object.keys(this.registry[this.chainId] || {}).length;
    },
    filteredRegistryEntries() {
      const results = [];
      for (const [registrant, stealthMetaAddress] of Object.entries(this.registry[this.chainId] || {})) {
        results.push({ registrant, stealthMetaAddress });
      }
      return results;
    },
    filteredSortedRegistryEntries() {
      const results = this.filteredRegistryEntries;
      if (this.settings.sortOption == 'registrantasc') {
        results.sort((a, b) => {
          return ('' + a.registrant).localeCompare(b.registrant);
        });
      } else if (this.settings.sortOption == 'registrantdsc') {
        results.sort((a, b) => {
          return ('' + b.registrant).localeCompare(a.registrant);
        });
      }
      return results;
    },
    pagedFilteredSortedRegistryEntries() {
      logInfo("Addresses", "pagedFilteredSortedRegistryEntries - results[0..1]: " + JSON.stringify(this.filteredSortedRegistryEntries.slice(0, 2), null, 2));
      return this.filteredSortedRegistryEntries.slice((this.settings.currentPage - 1) * this.settings.pageSize, this.settings.currentPage * this.settings.pageSize);
    },

  },
  methods: {
    saveSettings() {
      logInfo("Registry", "methods.saveSettings - registrySettings: " + JSON.stringify(this.settings, null, 2));
      localStorage.registrySettings = JSON.stringify(this.settings);
    },
    async syncIt(info) {
      store.dispatch('data/syncIt', info);
    },
    async timeoutCallback() {
      logDebug("Registry", "timeoutCallback() count: " + this.count);

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
    logDebug("Registry", "beforeDestroy()");
  },
  mounted() {
    logDebug("Registry", "mounted() $route: " + JSON.stringify(this.$route.params));
    store.dispatch('data/restoreState');
    if ('registrySettings' in localStorage) {
      const tempSettings = JSON.parse(localStorage.registrySettings);
      if ('version' in tempSettings && tempSettings.version == 0) {
        this.settings = tempSettings;
        this.settings.currentPage = 1;
      }
    }
    this.reschedule = true;
    logDebug("Registry", "Calling timeoutCallback()");
    this.timeoutCallback();
  },
  destroyed() {
    this.reschedule = false;
  },
};

const registryModule = {
  namespaced: true,
  state: {
    params: null,
    executing: false,
    executionQueue: [],
  },
  getters: {
    params: state => state.params,
    executionQueue: state => state.executionQueue,
  },
  mutations: {
    deQueue(state) {
      logDebug("registryModule", "deQueue(" + JSON.stringify(state.executionQueue) + ")");
      state.executionQueue.shift();
    },
    updateParams(state, params) {
      state.params = params;
      logDebug("registryModule", "updateParams('" + params + "')")
    },
    updateExecuting(state, executing) {
      state.executing = executing;
      logDebug("registryModule", "updateExecuting(" + executing + ")")
    },
  },
  actions: {
  },
};