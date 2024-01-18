const Welcome = {
  template: `
    <div class="m-0 p-0">

      <b-card no-body no-header class="border-0" header-class="p-1">
        <b-card no-body class="border-0 m-0 mt-2">

          <b-card-body class="p-0">
            <b-card class="mb-2 border-0">

              <b-card-text>
                <h5>Welcome to txs</h5>
                A dapp to help manage your Ethereum portfolio. Status: <b>WIP</b>
              </b-card-text>

              <b-card-text class="mt-3 mb-2">
                <h6>Usage</h6>
                <ul>
                  <li>
                    Click <b-button size="sm" variant="link" class="m-0 p-0"><b-icon-pencil shift-v="+1" font-scale="1.0"></b-icon-pencil></b-button> in the Accounts tab to enter your account(s)
                  </li>
                  <li>
                    Click <b-button size="sm" variant="link" class="m-0 p-0"><b-icon-cloud-download shift-v="+1" font-scale="1.2"></b-icon-cloud-download></b-button> to incrementally:
                    <ul>
                      <li>
                        Retrieve all ERC-20, ERC-721 and ERC-1155 events related to your accounts via your web3 connection
                      </li>
                      <li>
                        Retrieve all transactions and internal transactions related to your accounts via the Etherscan API
                      </li>
                      <li>
                        Retrieve all transaction and transaction receipt information via your web3 connection, for the transaction hashes of the data imported above
                      </li>
                      <li>
                        Retrieve collection and token metadata via the Reservoir API, for the contracts and assets resulting from the above processing
                      </li>
                      <li>
                        Compute a simpler representation of your transactions
                      </li>
                    </ul>
                  </li>
                  <!--
                  <li>
                    View your transactions by accounts in the Account tab
                  </li>
                  -->
                  <li>
                    Click on the Generate Report icon <b-button size="sm" variant="link" class="m-0 p-0"><b-icon-newspaper shift-v="+1" font-scale="1.0"></b-icon-newspaper></b-button> in the Report tab for the results to be displayed
                  </li>
                  <li>
                    Enter your Etherscan API key in the Config tab to avoid your API data retrieval being throttled to 1 request per 6 seconds
                  </li>
                  <li>
                    <b>WIP</b> You may have to re-enter your accounts and resync as this dapp still requires some data structure changes
                  </li>
                </ul>
              </b-card-text>

              <b-card-text class="mt-3 mb-2">
                <h6>Your Data</h6>
                <ul>
                  <li>
                    Your personal information (e.g., accounts, Etherscan API key) is stored in your web browser local storage (LocalStorage and IndexedDB)
                  </li>
                  <li>
                    Your accounts will be used when querying data via the web3 connection
                  </li>
                  <li>
                    Your Etherscan API key and your accounts will be used when querying data via the Etherscan API
                  </li>
                  <li>
                    Your collections and tokens will be used when querying data via the Reservoir API
                  </li>
                </ul>
              </b-card-text>

              <b-card-text class="mt-3 mb-2">
                <h6>This Web3 Dapp</h6>
                <ul>
                  <li>
                    <b-link href="https://bokkypoobah.github.io/txs/" target="_blank">https://bokkypoobah.github.io/txs/</b-link>
                  </li>
                </ul>
              </b-card-text>

              <b-card-text class="mt-3 mb-2">
                <h6>Source Code</h6>
                <ul>
                  <li>
                    <b-link href="https://github.com/bokkypoobah/txs" target="_blank">https://github.com/bokkypoobah/txs</b-link>
                  </li>
                </ul>
              </b-card-text>

            </b-card>
          </b-card-body>
        </b-card>
      </b-card>
    </div>
  `,
  data: function () {
    return {
      count: 0,
      reschedule: true,
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
  },
  methods: {
    async timeoutCallback() {
      logDebug("Welcome", "timeoutCallback() count: " + this.count);

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
    logDebug("Welcome", "beforeDestroy()");
  },
  mounted() {
    logDebug("Welcome", "mounted() $route: " + JSON.stringify(this.$route.params));
    this.reschedule = true;
    logDebug("Welcome", "Calling timeoutCallback()");
    this.timeoutCallback();
    // this.loadNFTs();
  },
  destroyed() {
    this.reschedule = false;
  },
};

const welcomeModule = {
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
      logDebug("welcomeModule", "deQueue(" + JSON.stringify(state.executionQueue) + ")");
      state.executionQueue.shift();
    },
    updateParams(state, params) {
      state.params = params;
      logDebug("welcomeModule", "updateParams('" + params + "')")
    },
    updateExecuting(state, executing) {
      state.executing = executing;
      logDebug("welcomeModule", "updateExecuting(" + executing + ")")
    },
  },
  actions: {
  },
};
