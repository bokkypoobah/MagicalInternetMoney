// ----------------------------------------------------------------------------
// Web3 connection, including coinbase and coinbase balance
// ----------------------------------------------------------------------------
const Connection = {
  template: `
    <div>
      <b-card header-class="warningheader" v-if="!connected" header="Web3 Connection Not Detected">
        <b-card-text>
          Please use the <b-link href="https://metamask.io" target="_blank">MetaMask</b-link> addon with Firefox, Chromium, Opera or Chrome, or any other other web3 browser to view this page
        </b-card-text>
      </b-card>
      <b-button v-b-toggle.connection size="sm" block variant="outline-info" v-if="connected">{{ networkName }} <b-spinner class="float-right mt-1" :variant="spinnerVariant" style="animation: spinner-grow 3.75s linear infinite;" small type="grow" label="Spinning" /></b-button>
      <b-collapse id="connection" visible class="mt-2">
        <b-card no-body class="border-0" v-if="connected">
          <b-row>
            <b-col cols="5" class="small px-1 text-right">Block:</b-col>
            <b-col class="small px-1 truncate" cols="7" >
              <div v-if="networkSupported">
                <b-link :href="explorer + 'block/'+ blockNumber" class="card-link" target="_blank">{{ blockNumberString }}</b-link>&nbsp;&nbsp;<font size="-3">{{ lastBlockTimeDiff }}</font>
              </div>
              <div v-else>
                {{ blockNumberString }}
              </div>
            </b-col>
          </b-row>
          <b-row>
            <b-col cols="5" v-b-popover.hover="'Your Web3 attached account'" class="small px-1 text-right">Attached Account:</b-col>
            <b-col class="small px-1 truncate" cols="7">
              <div v-if="networkSupported">
                <b-link :href="explorer + 'address/' + coinbase" class="card-link" target="_blank">{{ coinbase == null ? '' : (coinbase.substring(0, 10) + '...' + coinbase.slice(-8)) }}</b-link>
              </div>
              <div v-else>
                {{ coinbase == null ? '' : (coinbase.substring(0, 10) + '...' + coinbase.slice(-8)) }}
              </div>
              <!-- <span class="float-right"><b-link v-if="chainInfo[chainId]" v-b-popover.hover="'View on OpenSea.io'" :href="chainInfo[chainId].nftAccountPrefix + coinbase" target="_blank"><img src="images/381114e-opensea-logomark-flat-colored-blue.png" width="20px" /></b-link></span> -->
            </b-col>
          </b-row>
          <!-- <b-row>
            <b-col cols="4" class="small">ETH Balance</b-col>
            <b-col class="small truncate" cols="8">
              <b-link v-if="chainInfo[chainId]" :href="chainInfo[chainId].explorerAddressPrefix + coinbase" class="card-link" target="_blank">{{ formatETH(balance) }}</b-link>
            </b-col>
          </b-row> -->
          <b-row v-show="Object.keys(txs).length">
            <b-col cols="4" class="small">
              Transactions
            </b-col>
            <b-col class="truncate" cols="8">
              <span v-for="(key, hash) in txs">
                <b-row>
                <b-col class="small truncate">
                  <b-link href="#" v-b-popover.hover="'Clear transaction ' + hash" @click="removeTx(hash)" class="card-link">x</b-link>
                  <b-link :href="explorer + 'tx/' + hash" class="card-link" target="_blank">{{ hash }}</b-link>
                </b-col>
                </b-row>
              </span>
            </b-col>
          </b-row>
          <b-row v-show="txError.length > 0">
            <b-col cols="4" class="small">
              Last Error
            </b-col>
            <b-col class="small truncate" cols="8">
              <b-link href="#" v-b-popover.hover="'Clear error ' + txError" @click="clearTxError()" class="card-link">x</b-link>
              {{ txError }}
            </b-col>
          </b-row>
        </b-card>
      </b-collapse>
    </div>
  `,
  data: function () {
    return {
      count: 0,
      provider: null,
      spinnerVariant: "success",
      lastBlockTimeDiff: "establishing network connection",
      reschedule: false,
      refreshNow: false,
      listenersInstalled: false,
    }
  },
  computed: {
    powerOn() {
      return store.getters['connection/powerOn'];
    },
    connected() {
      return store.getters['connection/connected'];
    },
    connectionError() {
      return store.getters['connection/connectionError'];
    },
    chainId() {
      return store.getters['connection/chainId'];
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
    coinbaseUpdated() {
      return store.getters['connection/coinbaseUpdated'];
    },
    balance() {
      return store.getters['connection/balance'];
    },
    balanceString() {
      return store.getters['connection/balance'] == null ? "" : new BigNumber(store.getters['connection/balance']).shift(-18).toString();
    },
    block() {
      return store.getters['connection/block'];
    },
    blockUpdated() {
      return store.getters['connection/blockUpdated'];
    },
    blockNumber() {
      return store.getters['connection/block'] == null ? 0 : store.getters['connection/block'].number;
    },
    blockNumberString() {
      return store.getters['connection/block'] == null ? "" : formatNumber(store.getters['connection/block'].number);
    },
    txs() {
      return store.getters['connection/txs'];
    },
    txError() {
      return store.getters['connection/txError'];
    },
  },
  methods: {
    formatETH(e) {
      try {
        return e ? ethers.utils.commify(ethers.utils.formatEther(e)) : null;
      } catch (err) {
      }
      return e.toFixed(9);
    },
    removeTx(tx) {
      logDebug("Connection", "removeTx");
      store.dispatch('connection/removeTx', tx);
    },
    clearTxError(tx) {
      logDebug("Connection", "clearTxError");
      store.dispatch('connection/setTxError', "");
    },
    async execWeb3() {
      logInfo("Connection", "execWeb3() start[" + this.count + "]");

      if (this.powerOn) {
        if (!window.ethereum.isConnected() || !window.ethereum['isUnlocked']) {
            logDebug("Connection", "execWeb3() requesting accounts");
            try {
              const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
              logDebug("Connection", "execWeb3() accounts: " + JSON.stringify(accounts));
              store.dispatch('connection/setConnected', true);
              logDebug("Connection", "execWeb3() setConnected done");
              store.dispatch('connection/setConnectionError', null);
              logDebug("Connection", "execWeb3() setConnectionError done");
            } catch (e) {
              logError("Connection", "execWeb3() error: " + JSON.stringify(e.message));
              store.dispatch('connection/setConnected', false);
              store.dispatch('connection/setConnectionError', 'Web3 account not permissioned');
            }
        }
        if (this.connected && !this.listenersInstalled) {
          logInfo("Connection", "execWeb3() Installing listeners");
          async function handleChainChanged(_chainId) {
            logInfo("Connection", "execWeb3() handleChainChanged: " + JSON.stringify(_chainId));
            // alert('Ethereum chain has changed - reloading this page.')
            // window.location.reload();
            store.dispatch('connection/setNetworkData', parseInt(_chainId));
            // const signer = provider.getSigner();
            // const coinbase = await signer.getAddress();
            // const balance = await provider.getBalance(coinbase);
            // store.dispatch('connection/setBalance', balance);
          }
          window.ethereum.on('chainChanged', handleChainChanged);

          const t = this;
          async function handleAccountsChanged(accounts) {
            logInfo("Connection", "execWeb3() handleAccountsChanged: " + JSON.stringify(accounts));
            const signer = provider.getSigner();
            const coinbase = await signer.getAddress();
            store.dispatch('connection/setCoinbase', coinbase);
            const balance = await provider.getBalance(coinbase);
            store.dispatch('connection/setBalance', balance);
            t.refreshNow = true;
          }
          window.ethereum.on('accountsChanged', handleAccountsChanged);
          // const signer = provider.getSigner()
          // const coinbase = await signer.getAddress();
          // store.dispatch('connection/setCoinbase', coinbase);

          const provider = new ethers.providers.Web3Provider(window.ethereum);
          function handleNewBlock(b) {
            // logInfo("Connection", "execWeb3() handleNewBlock: " + JSON.stringify(b));
            t.refreshNow = true;
          }
          provider.on('block', handleNewBlock);

        }
        if (this.connected) {
          logDebug("Connection", "execWeb3() Getting data");
          try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const network = await provider.getNetwork();
            // console.log("this.chainId: " + this.chainId + ", network.chainId: " + network.chainId);
            if (this.chainId != network.chainId) {
              store.dispatch('connection/setNetworkData', network.chainId);
            }
            // store.dispatch('connection/setNetwork', network);
            // logInfo("Connection", "execWeb3() network: " + JSON.stringify(this.network));
            const block = await provider.getBlock();
            store.dispatch('connection/setBlock', block);
            const signer = provider.getSigner()
            const coinbase = await signer.getAddress();
            store.dispatch('connection/setCoinbase', coinbase);
            const balance = await provider.getBalance(this.coinbase);
            store.dispatch('connection/setBalance', balance);

            if (this.network.chainId == 1 || this.network.chainId == 4) {
              const weth = new ethers.Contract(this.network.wethAddress, WETHABI, provider);
              const wethBalance = await weth.balanceOf(this.coinbase);
              const wethAllowanceToNix = await weth.allowance(this.coinbase, this.network.nixAddress);
              store.dispatch('connection/setWeth', { balance: wethBalance, allowanceToNix: wethAllowanceToNix });
            } else {
              store.dispatch('connection/setWeth', { balance: null, allowanceToNix: null, updatedAccounts: [] });
            }

          } catch (e) {
            store.dispatch('connection/setConnectionError', 'Cannot retrieve data from web3 provider');
          }
        } else {
          logError("Connection", "execWeb3() Getting data - not connected");
        }

      } else {
        if (this.connected) {
          store.dispatch('connection/setConnected', false);
        }
        if (this.connectionError != null) {
          store.dispatch('connection/setConnectionError', null);
        }
      }

      if (this.connected && this.network && this.network.chainId == 1) {
        store.dispatch('data/execWeb3', { count: this.count, listenersInstalled: this.listenersInstalled });
        // console.log("1");
        // await store.dispatch('collectionData/execWeb3', { count: this.count, listenersInstalled: this.listenersInstalled });
        // console.log("2");
        // console.log("3");
      }

      if (!this.listenersInstalled) {
        this.listenersInstalled = true;
      }
      logDebug("Connection", "execWeb3() end[" + this.count + "]");
    },
    async timeoutCallback() {
      if (this.count++ % 150 == 0 || this.refreshNow) {
        if (this.refreshNow) {
          this.refreshNow = false;
        }
        await this.execWeb3();
      }
      if (this.block != null) {
        this.lastBlockTimeDiff = getTimeDiff(this.block.timestamp);
        var secs = parseInt(new Date() / 1000 - this.block.timestamp);
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
      var t = this;
      if (this.reschedule) {
        setTimeout(function() {
          t.timeoutCallback();
        }, 1000);
      }
    }
  },
  mounted() {
    logDebug("Connection", "mounted()");
    this.reschedule = true;
    var t = this;
    setTimeout(function() {
      t.timeoutCallback();
    }, 1000);
  },
  destroyed() {
    logDebug("Connection", "destroyed()");
    this.reschedule = false;
  },
};


const connectionModule = {
  namespaced: true,
  state: {
    powerOn: false,
    connected: false,
    connectionError: null,
    chainId: null,
    networkSupported: null,
    networkName: null,
    transferHelper: null,
    explorer: null,
    nonFungibleViewer: null,
    coinbase: null,
    coinbaseUpdated: false,
    balance: null,
    block: null,
    blockUpdated: false,
    txs: {},
    txError: "",
  },
  getters: {
    powerOn: state => state.powerOn,
    connected: state => state.connected,
    connectionError: state => state.connectionError,
    connection: state => state.connection,
    chainId: state => state.chainId,
    networkSupported: state => state.networkSupported,
    networkName: state => state.networkName,
    transferHelper: state => state.transferHelper,
    explorer: state => state.explorer,
    nonFungibleViewer: state => state.nonFungibleViewer,
    coinbase: state => state.coinbase,
    coinbaseUpdated: state => state.coinbaseUpdated,
    balance: state => state.balance,
    block: state => state.block,
    blockUpdated: state => state.blockUpdated,
    txs: state => state.txs,
    txError: state => state.txError,
  },
  mutations: {
    setPowerOn(state, powerOn) {
      logDebug("connectionModule", "mutations.setPowerOn(" + powerOn + ")");
      state.powerOn = powerOn;
    },
    setConnected(state, connected) {
      logDebug("connectionModule", "mutations.setConnected(" + connected + ")");
      state.connected = connected;
    },
    setConnectionError(state, error) {
      logDebug("connectionModule", "mutations.setConnectionError(" + error + ")");
      state.connectionError = error;
    },
    setNetworkData(state, info) {
      logInfo("connectionModule", "mutations.setNetworkData(" + JSON.stringify(info) + ")");
      state.chainId = info.chainId;
      state.networkSupported = info.networkSupported;
      state.networkName = info.networkName;
      state.transferHelper = info.transferHelper;
      state.explorer = info.explorer;
      state.nonFungibleViewer = info.nonFungibleViewer;
      logInfo("connectionModule", "state: " + JSON.stringify(state, null, 2));
    },
    setCoinbase(state, coinbase) {
      logDebug("connectionModule", "mutations.setCoinbase(" + coinbase + ")");
      if (coinbase != state.coinbase) {
        logDebug("connectionModule", "mutations.setCoinbase(" + coinbase + ") updated");
        state.coinbase = coinbase;
        state.coinbaseUpdated = true;
      } else {
        if (state.coinbaseUpdated) {
          state.coinbaseUpdated = false;
        }
      }
    },
    setBalance(state, b) {
      state.balance = b;
    },
    setBlock(state, block) {
      logDebug("connectionModule", "mutations.setBlock()");
      if (block == null) {
        logDebug("connectionModule", "actions.setBlock - block == null");
        if (state.block != null) {
          state.block = block;
          state.blockUpdated = true;
        }
      } else {
        if (state.block == null || block.hash != state.block.hash) {
          state.block = block;
          logDebug("connectionModule", "mutations.setBlock - state.blockUpdated set to true");
          state.blockUpdated = true;
        } else {
          if (state.blockUpdated) {
            logDebug("connectionModule", "mutations.setBlock - state.blockUpdated set to false");
            state.blockUpdated = false;
          }
        }
      }
    },
    addTx(state, tx) {
      logDebug("connectionModule", "mutations.addTx(): " + tx);
      Vue.set(state.txs, tx, tx);
    },
    removeTx(state, tx) {
      logDebug("connectionModule", "mutations.removeTx(): " + tx);
      Vue.delete(state.txs, tx);
    },
    setTxError(state, txError) {
      logDebug("connectionModule", "mutations.setTxError(): " + txError);
      state.txError = txError;
    },
  },
  actions: {
    setPowerOn(context, powerOn) {
      logDebug("connectionModule", "actions.setPowerOn(" + powerOn + ")");
      context.commit('setPowerOn', powerOn);
    },
    setConnected(context, connected) {
      logDebug("connectionModule", "actions.setConnected(" + connected + ")");
      context.commit('setConnected', connected);
    },
    setConnectionError(context, error) {
      logDebug("connectionModule", "actions.setConnectionError(" + error + ")");
      context.commit('setConnectionError', error);
    },
    setNetworkData(context, chainId) {
      logInfo("connectionModule", "actions.setNetworkData(" + chainId + ")");
      const networkSupported = ('' + chainId) in NETWORKS;
      const networkName = networkSupported && NETWORKS['' + chainId].name || "Chain Id: " + chainId;
      const transferHelper = networkSupported && NETWORKS['' + chainId].transferHelper || null;
      const explorer = networkSupported && NETWORKS['' + chainId].explorer || "unknown";
      const nonFungibleViewer = networkSupported && NETWORKS['' + chainId].nonFungibleViewer || "unknown";
      context.commit('setNetworkData', { chainId, networkSupported, networkName, transferHelper, explorer, nonFungibleViewer });
    },
    setCoinbase(context, cb) {
      context.commit('setCoinbase', cb);
    },
    setBalance(context, b) {
      context.commit('setBalance', b);
    },
    setBlock(context, block) {
      logDebug("connectionModule", "actions.setBlock()");
      context.commit('setBlock', block);
    },
    addTx(context, tx) {
      logDebug("connectionModule", "actions.addTx(): " + tx);
      context.commit('addTx', tx);
    },
    removeTx(context, tx) {
      logDebug("connectionModule", "actions.removeTx(): " + tx);
      context.commit('removeTx', tx);
    },
    setTxError(context, txError) {
      logDebug("connectionModule", "actions.setTxError(): " + txError);
      context.commit('setTxError', txError);
    },
  },
};
