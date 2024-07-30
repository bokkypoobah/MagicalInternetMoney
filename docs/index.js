// const JSONDATA = require("data.json");

Vue.use(Vuex);
// Vue.use(VueApexCharts);

// Vue.component('apexchart', VueApexCharts);
Vue.component('connection', Connection);
Vue.component('coredata', Data);
Vue.component('new-address', NewAddress);
Vue.component('new-transfer', NewTransfer);
Vue.component('sync-options', SyncOptions);
Vue.component('view-address', ViewAddress);
Vue.component('view-stealthmetaddress', ViewStealthMetaAddress);
Vue.component('view-tokencontract', ViewTokenContract);
Vue.component('view-nonfungible', ViewNonFungible);
// Vue.component('flat-pickr', VueFlatpickr);

// hljs.registerLanguage('solidity', window.hljsDefineSolidity);
// hljs.initHighlightingOnLoad();

const router = new VueRouter({
  // mode: 'history', // https://stackoverflow.com/questions/45201014/how-to-handle-anchors-bookmarks-with-vue-router
  routes: routes,
});

const storeVersion = 1;
const store = new Vuex.Store({
  strict: false, // TODO Set to true to test, false to disable _showDetails & vuex mutations
  // state: {
  //   username: 'Jack',
  //   phrases: ['Welcome back', 'Have a nice day'],
  // },
  // getters: {
  //   getMessage(state) {
  //     return state.route.name === 'top' ?
  //       `${state.phrases[0]}, ${state.username}` :
  //       `${state.phrases[1]}, ${state.username}`;
  //   },
  // },
  mutations: {
    initialiseStore(state) {
      // TODO: Restore to IndexedDB here?
      // // Check if the store exists
    	// if (localStorage.getItem('store')) {
    	// 	let store = JSON.parse(localStorage.getItem('store'));
      //
    	// 	// Check the version stored against current. If different, don't
    	// 	// load the cached version
    	// 	if(store.version == storeVersion) {
      //     // logDebug("store.initialiseStore BEFORE", JSON.stringify(state, null, 4));
    	// 		this.replaceState(
    	// 			Object.assign(state, store.state)
    	// 		);
      //     // logDebug("store.initialiseStore AFTER", JSON.stringify(state, null, 4));
    	// 	} else {
    	// 		state.version = storeVersion;
    	// 	}
    	// }
    }
  },
  modules: {
    connection: connectionModule,
    welcome: welcomeModule,
    registry: registryModule,
    stealthTransfers: stealthTransfersModule,
    approvals: approvalsModule,
    fungibles: fungiblesModule,
    nonFungibles: nonFungiblesModule,
    newTransfer: newTransferModule,
    newAddress: newAddressModule,
    syncOptions: syncOptionsModule,
    viewAddress: viewAddressModule,
    viewStealthMetaAddress: viewStealthMetaAddressModule,
    viewTokenContract: viewTokenContractModule,
    viewNonFungible: viewNonFungibleModule,
    config: configModule,
    // mappings: mappingsModule,
    data: dataModule,
    // account: accountModule,
    addresses: addressesModule,
    // assets: assetsModule,
    // report: reportModule,
    // transactions: transactionsModule,
  }
});

// Subscribe to store updates
store.subscribe((mutation, state) => {
  let store = {
		version: storeVersion,
		state: state,
	};
  // console.log("store.subscribe - mutation.type: " + mutation.type);
  // console.log("store.subscribe - mutation.payload: " + mutation.payload);
  // logDebug("store.updated", JSON.stringify(store, null, 4));
	// TODO: Save to IndexedDB here? localStorage.setItem('store', JSON.stringify(store));
});

// sync store and router by using `vuex-router-sync`
sync(store, router);

const app = new Vue({
  router,
  store,
  beforeCreate() {
    setLogLevel(1); // 0 = NONE, 1 = INFO (default), 2 = DEBUG
    logDebug("index.js", "app:beforeCreate()");
		this.$store.commit('initialiseStore');
	},
  data() {
    return {
      // connected: false,
      count: 0,
      spinnerVariant: "success",
      statusSidebar: false,
      lastBlockTimeDiff: null,
      reschedule: false,
      jsonData: null,
      selectedId: null,

      name: 'BootstrapVue',
      show: true,
    };
  },
  computed: {
    powerOn() {
      return store.getters['connection/powerOn'];
    },
    networkSupported() {
      return store.getters['connection/networkSupported'];
    },
    networkName() {
      return store.getters['connection/networkName'];
    },
    explorer() {
      return store.getters['connection/explorer'];
    },
    coinbase() {
      return store.getters['connection/coinbase'];
    },
    blockNumber() {
      return store.getters['connection/block'] == null ? 0 : store.getters['connection/block'].number;
    },
    timestamp() {
      return store.getters['connection/block'] == null ? 0 : store.getters['connection/block'].timestamp;
    },
    addresses() {
      return store.getters['data/addresses'];
    },
    names() {
      return store.getters['data/names'];
    },
    spinnerVariant1() {
      var sv = store.getters['connection/spinnerVariant'];
      logInfo("index.js - computed.spinnerVariant", sv);
      return sv;
      // return "danger";
    },
    moduleName () {
      return this.$route.name;
    },
  },
  mounted() {
    console.log(now() + " INFO app:mounted");
    // this.loadNFTData("config.json");
    // logInfo("app", "mounted() $route: " + JSON.stringify(this.$route.params));
    if (this.$route.params["id"] != null) {
      // function pad3Zeroes(s) {
      //   var o = s.toString();
      //   while (o.length < 3) {
      //     o = "0" + o;
      //   }
      //   return o;
      // }
      // this.selectedId = pad3Zeroes(this.$route.params["id"]);
      // const descEl = document.querySelector('head');
      // logInfo("app", "descEl " + JSON.stringify(descEl));
      store.dispatch('tokens/updateSelectedId', parseInt(this.$route.params["id"]));
    }

    if (localStorage.getItem('powerOn')) {
      var c = localStorage.getItem('powerOn');
      store.dispatch('connection/setPowerOn', c == 'true' || c === true);
    }
    this.reschedule = true;
    this.timeoutCallback();
  },
  destroyed() {
    // logInfo("app", "destroyed() Called");
    this.reschedule = false;
  },
  methods: {
    // loadNFTData(url) {
    //   var req = new XMLHttpRequest();
    //   req.overrideMimeType("application/json");
    //   req.open('GET', url, true);
    //   req.onload  = function() {
    //      var nftData = JSON.parse(req.responseText);
    //      store.dispatch('tokens/updateNFTData', nftData);
    //   };
    //   req.send(null);
    // },
    setPowerOn() {
      store.dispatch('connection/setPowerOn', true);
      localStorage.setItem('powerOn', true);
      var t = this;
      setTimeout(function() {
        t.statusSidebar = true;
      }, 1500);
    },
    setPowerOff() {
      store.dispatch('connection/setPowerOn', false);
      localStorage.setItem('powerOn', false);
      var t = this;
      setTimeout(function() {
        t.statusSidebar = false;
      }, 1500);
    },
    commify0(n) {
      if (n != null) {
        return Number(n).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
      }
      return null;
    },
    formatTimestamp(ts) {
      if (ts != null) {
        // TODO
        // if (this.settings.reportingDateTime == 1) {
        //   return moment.unix(ts).utc().format("YYYY-MM-DD HH:mm:ss");
        // } else {
          return moment.unix(ts).format("YYYY-MM-DD HH:mm:ss");
        // }
      }
      return null;
    },
    formatTimeDiff(unixtime) {
      if (!unixtime) {
        return "";
      } else {
        return moment.unix(unixtime).fromNow();
      }
    },
    timeoutCallback() {
      // logInfo("app", "timeoutCallback() Called");

      if (store.getters['connection/block'] != null) {
        this.lastBlockTimeDiff = getTimeDiff(store.getters['connection/block'].timestamp);
        var secs = parseInt(new Date() / 1000 - store.getters['connection/block'].timestamp);
        if (secs > 90) {
          this.spinnerVariant = "danger";
        } else if (secs > 60) {
          this.spinnerVariant = "warning";
        } else {
          this.spinnerVariant = "success";
        }
      } else {
        this.spinnerVariant = "danger";
      }

      if (this.reschedule) {
        var t = this;
        setTimeout(function() {
          t.timeoutCallback();
        }, 1000);
      }
    }
  },
  components: {
  // OptinoFactory
  //   "network": Network,
  //   "account": Account,
  },
}).$mount('#app');
