const Registry = {
  template: `
    <div class="m-0 p-0">
      <b-card no-body no-header class="border-0">
        <div class="d-flex flex-wrap m-0 p-0">
          <div class="mt-0 flex-grow-1">
          </div>
          <div v-if="sync.section == null" class="mt-0 pr-1">
            <b-button size="sm" :disabled="!networkSupported" @click="viewSyncOptions" variant="link" v-b-popover.hover.ds500="'Sync data from the blockchain'"><b-icon-arrow-repeat shift-v="+1" font-scale="1.2"></b-icon-arrow-repeat></b-button>
          </div>
          <div v-if="sync.section != null" class="mt-1" style="width: 300px;">
            <b-progress height="1.5rem" :max="sync.total" show-progress :animated="sync.section != null" :variant="sync.section != null ? 'success' : 'secondary'" v-b-popover.hover.ds500="'Click the button on the right to stop. This process can be continued later'">
              <b-progress-bar :value="sync.completed">
                {{ sync.total == null ? (sync.completed + ' ' + sync.section) : (sync.completed + '/' + sync.total + ' ' + ((sync.completed / sync.total) * 100).toFixed(0) + '% ' + sync.section) }}
              </b-progress-bar>
            </b-progress>
          </div>
          <div class="ml-0 mt-1">
            <b-button v-if="sync.section != null" size="sm" @click="halt" variant="link" v-b-popover.hover.ds500="'Click to stop. This process can be continued later'"><b-icon-stop-fill shift-v="+1" font-scale="1.0"></b-icon-stop-fill></b-button>
          </div>
          <div class="mt-0 flex-grow-1">
          </div>
          <div class="mt-0 pr-1">
            <b-button size="sm" :disabled="!transferHelper" @click="newTransfer(null); " variant="link" v-b-popover.hover.ds500="'New Stealth Transfer'"><b-icon-caret-right shift-v="+1" font-scale="1.1"></b-icon-caret-right></b-button>
          </div>
          <div class="mt-0 flex-grow-1">
          </div>
          <div class="mt-0 pr-1">
            <b-form-select size="sm" v-model="settings.sortOption" @change="saveSettings" :options="sortOptions" v-b-popover.hover.ds500="'Yeah. Sort'"></b-form-select>
          </div>
          <div class="mt-0 pr-1">
            <font size="-2" v-b-popover.hover.ds500="'# registry entries'">{{ filteredSortedRegistryEntries.length + '/' + totalRegistryEntries }}</font>
          </div>
          <div class="mt-0 pr-1">
            <b-pagination size="sm" v-model="settings.currentPage" @input="saveSettings" :total-rows="filteredSortedRegistryEntries.length" :per-page="settings.pageSize" style="height: 0;"></b-pagination>
          </div>
          <div class="mt-0 pl-1">
            <b-form-select size="sm" v-model="settings.pageSize" @change="saveSettings" :options="pageSizes" v-b-popover.hover.ds500="'Page size'"></b-form-select>
          </div>
        </div>

        <b-table ref="registryTable" small fixed striped responsive hover :fields="fields" :items="pagedFilteredSortedRegistryEntries" show-empty head-variant="light" class="m-0 mt-1">
          <template #empty="scope">
            <h6>{{ scope.emptyText }}</h6>
            <div>
              <ul>
                <li>
                  Check you are connected to one of the <b-link href="https://stealthaddress.dev/contracts/deployments" target="_blank">supported networks</b-link> (TODO: Only Sepolia currently)
                </li>
                <li>
                  Click <b-button size="sm" variant="link" class="m-0 p-0"><b-icon-arrow-repeat shift-v="+1" font-scale="1.2"></b-icon-arrow-repeat></b-button> above to sync this app to the blockchain
                </li>
              </ul>
            </div>
          </template>
          <template #cell(number)="data">
            {{ parseInt(data.index) + ((settings.currentPage - 1) * settings.pageSize) + 1 }}
          </template>
          <template #cell(registrant)="data">
            <b-link :href="explorer + 'address/' + data.item.registrant" v-b-popover.hover.ds500="data.item.registrant" target="_blank">
              {{ names[data.item.registrant] || (data.item.registrant.substring(0, 8) + '...' + data.item.registrant.slice(-6)) }}
            </b-link>
          </template>
          <template #cell(transfer)="data">
            <b-button size="sm" :disabled="!transferHelper" @click="newTransfer(data.item.stealthMetaAddress);" variant="link" v-b-popover.hover.ds500="'Transfer to ' + data.item.stealthMetaAddress" class="m-0 ml-2 p-0"><b-icon-caret-right shift-v="+1" font-scale="1.1"></b-icon-caret-right></b-button>
          </template>
          <template #cell(stealthMetaAddress)="data">
            {{ data.item.stealthMetaAddress }}
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
        { value: 'registrantasc', text: '▲ Registrant' },
        { value: 'registrantdsc', text: '▼ Registrant' },
        { value: 'stealthmetaaddressasc', text: '▲ Stealth Meta-Address' },
        { value: 'stealthmetaaddressdsc', text: '▼ Stealth Meta-Address' },
      ],
      fields: [
        { key: 'number', label: '#', sortable: false, thStyle: 'width: 5%;', tdClass: 'text-truncate' },
        { key: 'registrant', label: 'Registrant', sortable: false, thStyle: 'width: 35%;', thClass: 'text-left', tdClass: 'text-left' },
        { key: 'transfer', label: '', sortable: false, thStyle: 'width: 5%;', thClass: 'text-right', tdClass: 'text-right' },
        { key: 'stealthMetaAddress', label: 'Stealth Meta-Address', sortable: false, thStyle: 'width: 55%;', tdClass: 'text-left' },
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
    transferHelper() {
      return store.getters['connection/transferHelper'];
    },
    explorer() {
      return store.getters['connection/explorer'];
    },
    addresses() {
      return store.getters['data/addresses'];
    },
    names() {
      return store.getters['data/names'];
    },
    sync() {
      return store.getters['data/sync'];
    },
    pageSizes() {
      return store.getters['config/pageSizes'];
    },
    registry() {
      return store.getters['data/registry'];
    },

    totalRegistryEntries() {
      return Object.keys(this.registry[this.chainId] || {}).length + ((store.getters['data/forceRefresh'] % 2) == 0 ? 0 : 0);
    },
    filteredRegistryEntries() {
      const results = (store.getters['data/forceRefresh'] % 2) == 0 ? [] : [];
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
      } else if (this.settings.sortOption == 'stealthmetaaddressasc') {
        results.sort((a, b) => {
          return ('' + a.stealthMetaAddress).localeCompare(b.stealthMetaAddress);
        });
      } else if (this.settings.sortOption == 'stealthmetaaddressdsc') {
        results.sort((a, b) => {
          return ('' + b.stealthMetaAddress).localeCompare(a.stealthMetaAddress);
        });
      }
      return results;
    },
    pagedFilteredSortedRegistryEntries() {
      // console.log(now() + " INFO Registry:computed.pagedFilteredSortedRegistryEntries - results[0..1]: " + JSON.stringify(this.filteredSortedRegistryEntries.slice(0, 2), null, 2));
      return this.filteredSortedRegistryEntries.slice((this.settings.currentPage - 1) * this.settings.pageSize, this.settings.currentPage * this.settings.pageSize);
    },

  },
  methods: {
    saveSettings() {
      console.log(now() + " INFO Registry:methods.saveSettings - registrySettings: " + JSON.stringify(this.settings, null, 2));
      localStorage.registrySettings = JSON.stringify(this.settings);
    },
    async viewSyncOptions() {
      store.dispatch('syncOptions/viewSyncOptions');
    },
    async halt() {
      store.dispatch('data/setSyncHalt', true);
    },
    newTransfer(stealthMetaAddress = null) {
      console.log(now() + " INFO Registry:methods.newTransfer - stealthMetaAddress: " + stealthMetaAddress);
      store.dispatch('newTransfer/newTransfer', stealthMetaAddress);
    },
    async timeoutCallback() {
      // console.log(now() + " DEBUG Registry:methods.timeoutCallback - count: " + this.count);
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
    // console.log(now() + " DEBUG Registry:beforeDestroy");
  },
  mounted() {
    // console.log(now() + " DEBUG Registry:mounted - $route: " + JSON.stringify(this.$route.params));
    store.dispatch('data/restoreState');
    if ('registrySettings' in localStorage) {
      const tempSettings = JSON.parse(localStorage.registrySettings);
      if ('version' in tempSettings && tempSettings.version == 0) {
        this.settings = tempSettings;
        this.settings.currentPage = 1;
      }
    }
    this.reschedule = true;
    // console.log(now() + " DEBUG Registry:mounted - calling timeoutCallback()");
    this.timeoutCallback();
  },
  destroyed() {
    this.reschedule = false;
  },
};

const registryModule = {
  namespaced: true,
  state: {
  },
  getters: {
  },
  mutations: {
  },
  actions: {
  },
};
