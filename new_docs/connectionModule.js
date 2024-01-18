// ----------------------------------------------------------------------------
// Network           Network Id   Chain Id
// Mainnet                    1          1
// Ropsten                    3          3
// Rinkeby                    4          4
// Kovan                     42         42
// Görli                      5          5
// Truffle Develop Network 4447
// Ganache Blockchain      5777
// Testnet   | Explorers                     | Testnet ETH Faucets
// :-------- |:----------------------------- |:-------------------------
// Ropsten   | https://ropsten.etherscan.io/ | https://faucet.metamask.io/<br />https://twitter.com/BokkyPooBah/status/1099498823699714048
// Kovan     | https://kovan.etherscan.io/   | https://faucet.kovan.network/<br />https://github.com/kovan-testnet/faucet<br />https://faucet.kovan.radarrelay.com/
// Rinkeby   | https://rinkeby.etherscan.io/ | https://faucet.metamask.io/<br />https://faucet.rinkeby.io/
// Görli     | https://goerli.etherscan.io/  | https://faucet.goerli.mudit.blog/<br />https://goerli-faucet.slock.it/<br />https://bridge.goerli.com/
// ----------------------------------------------------------------------------
var networks = {
  "-1" : {
    "id": "-1",
    "name": "Network Unknown",
    "nixAddress": null,
    "nixHelperAddress": null,
    "wethAddress": null,
    "royaltyEngineAddress": null,
    "erc721HelperAddress": null,
    "explorer": "",
    "opensea": "(none)",
    "faucets": {}
  },
  "1" : {
    "id": "1",
    "name": "Ethereum Mainnet",
    "nixAddress": "0xFF0000ffe3475C081E541a1baAbc5DB7eA6e0353",
    "nixHelperAddress": "0x76f910c835b5a06CD465657f1a71153e2B6B2C0B",
    "wethAddress": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    "royaltyEngineAddress": "0x0385603ab55642cb4Dd5De3aE9e306809991804f",
    "erc721HelperAddress": "0x0eE1d7943890D8335110B879C25271e864Ee7CA8",
    "explorer": "https://etherscan.io/",
    "opensea": "https://opensea.io/",
    "faucets": {}
  },
  "2" : {
    "id": "2",
    "name": "Morden Testnet (deprecated)",
    "nixAddress": null,
    "nixHelperAddress": null,
    "wethAddress": null,
    "royaltyEngineAddress": null,
    "erc721HelperAddress": null,
    "explorer": "https://morden.etherscan.io/",
    "opensea": "(none)",
    "faucets": {}
  },
  "3" : {
    "id": "3",
    "name": "Ropsten Testnet",
    "nixAddress": null,
    "nixHelperAddress": null,
    "wethAddress": null,
    "royaltyEngineAddress": null,
    "erc721HelperAddress": null,
    "explorer": "https://ropsten.etherscan.io/",
    "opensea": "(none)",
    "faucets": { "faucet.metamask.io": "https://faucet.metamask.io/" }
  },
  "4" : {
    "id": "4",
    "name": "Rinkeby Testnet",
    "nixAddress": "0xFF0000ffe3475C081E541a1baAbc5DB7eA6e0353",
    "nixHelperAddress": "0x76f910c835b5a06CD465657f1a71153e2B6B2C0B",
    "wethAddress": "0xD0000DE5A8A759EAD912F89d2E6f1ae59063a61A",
    "royaltyEngineAddress": "0x8d17687ea9a6bb6efA24ec11DcFab01661b2ddcd",
    "erc721HelperAddress": "0x1CB0bA2E867549Aa7485a91dD90C454C2121b975",
    "explorer": "https://rinkeby.etherscan.io/",
    "opensea": "https://testnets.opensea.io/",
    "faucets": { "faucet.metamask.io": "https://faucet.metamask.io/", "faucet.rinkeby.io": "https://faucet.rinkeby.io/" }
  },
  "42" : {
    "id": "42",
    "name": "Kovan Testnet",
    "nixAddress": null,
    "nixHelperAddress": null,
    "wethAddress": null,
    "royaltyEngineAddress": null,
    "erc721HelperAddress": null,
    "explorer": "https://kovan.etherscan.io/",
    "opensea": "(none)",
    "faucets": { "faucet.kovan.network": "https://faucet.kovan.network/", "github.com/kovan-testnet": "https://github.com/kovan-testnet/faucet" }
  },
  "5" : {
    "id": "5",
    "name": "Görli Testnet",
    "nixAddress": null,
    "nixHelperAddress": null,
    "wethAddress": null,
    "royaltyEngineAddress": null,
    "erc721HelperAddress": null,
    "explorer": "https://goerli.etherscan.io/",
    "opensea": "(none)",
    "faucets": { "faucet.goerli.mudit.blog": "https://faucet.goerli.mudit.blog/", "goerli-faucet.slock.it": "https://goerli-faucet.slock.it/" }
  },
  "1337" : {
    "id": "1337",
    "name": "Geth Devnet",
    "nixAddress": null,
    "nixHelperAddress": null,
    "wethAddress": null,
    "royaltyEngineAddress": null,
    "erc721HelperAddress": null,
    "explorer": "(none)",
    "opensea": "(none)",
    "faucets": {}
  },
  "4447" : {
    "id": "4447",
    "name": "Truffle Devnet",
    "nixAddress": null,
    "nixHelperAddress": null,
    "wethAddress": null,
    "royaltyEngineAddress": null,
    "erc721HelperAddress": null,
    "explorer": "(none)",
    "opensea": "(none)",
    "faucets": {}
  },
  "5777" : {
    "id": "5777",
    "name": "Ganache Devnet",
    "nixAddress": null,
    "nixHelperAddress": null,
    "wethAddress": null,
    "royaltyEngineAddress": null,
    "erc721HelperAddress": null,
    "explorer": "(none)",
    "opensea": "(none)",
    "faucets": {}
  },
};

function getNetworkDetails(network) {
  return networks[network] || networks[-1];
}

function getTimeDiff(ts) {
  if (ts > 0) {
    var secs = parseInt(new Date() / 1000 - ts);
    var mins = parseInt(secs / 60);
    secs = secs % 60;
    var hours = parseInt(mins / 60);
    mins = mins % 60;
    var days = parseInt(hours / 24);
    hours = hours % 24;
    var s = "";
    if (days > 0) {
      s += days + "d ";
    }
    if (hours > 0) {
      s += hours + "h ";
    }
    if (mins > 0) {
      s += mins + "m ";
    }
    if (secs > 0) {
      s += secs + "s";
    }
    return "-" + s;
  } else {
    return "";
  }
}

// ----------------------------------------------------------------------------
// Convenience function
// ----------------------------------------------------------------------------
const promisify = (inner) =>
  new Promise((resolve, reject) =>
    inner((err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    })
  );


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
      <b-button v-b-toggle.connection size="sm" block variant="outline-info" v-if="connected">{{ network.name }} <b-spinner class="float-right mt-1" :variant="spinnerVariant" style="animation: spinner-grow 3.75s linear infinite;" small type="grow" label="Spinning" /></b-button>
      <b-collapse id="connection" visible class="mt-2">
        <b-card no-body class="border-0" v-if="connected">
          <b-row>
            <b-col cols="4" class="small">Block</b-col>
            <b-col class="small truncate" cols="8" >
              <b-link :href="network.explorer + 'block/' + blockNumber" class="card-link" target="_blank">{{ blockNumberString }}</b-link>&nbsp;&nbsp;<font size="-3">{{ lastBlockTimeDiff }}</font>
            </b-col>
          </b-row>
          <b-row>
            <b-col cols="4" class="small">Coinbase</b-col>
            <b-col class="small truncate" cols="8">
              <b-link :href="network.explorer + 'address/' + coinbase" class="card-link" target="_blank">{{ coinbase == null ? '' : (coinbase.substring(0, 20) + '...') }}</b-link><span class="float-right"><b-link v-b-popover.hover="'View on OpenSea.io'" :href="network.opensea + 'accounts/'+ coinbase" target="_blank"><img src="images/381114e-opensea-logomark-flat-colored-blue.png" width="20px" /></b-link></span>
            </b-col>
          </b-row>
          <b-row>
            <b-col cols="4" class="small">ETH Balance</b-col>
            <b-col class="small truncate" cols="8">
              <b-link :href="network.explorer + 'address/' + coinbase" class="card-link" target="_blank">{{ formatETH(balance) }}</b-link>
            </b-col>
          </b-row>
          <!--
          <b-row>
            <b-col cols="4" class="small">WETH Balance</b-col>
            <b-col class="small truncate" cols="8">
              <b-link :href="network.explorer + 'token/' + network.wethAddress + '?=' + coinbase" class="card-link" target="_blank">{{ formatETH(wethBalance) }}</b-link>
            </b-col>
          </b-row>
          -->
          <b-row>
            <b-col cols="4" class="small">WETH</b-col>
            <b-col class="small truncate" cols="8">
              <b-link :href="network.explorer + 'token/' + network.wethAddress" class="card-link" target="_blank">{{ network.wethAddress == null ? '' : (network.wethAddress.substring(0, 20) + '...') }}</b-link>
            </b-col>
          </b-row>
          <b-row>
            <b-col cols="4" class="small">ERC721 Helper</b-col>
            <b-col class="small truncate" cols="8">
              <b-link :href="network.explorer + 'address/' + network.erc721HelperAddress + '#code'" class="card-link" target="_blank">{{ network.erc721HelperAddress == null ? '' : (network.erc721HelperAddress.substring(0, 20) + '...') }}</b-link>
            </b-col>
          </b-row>
          <b-row v-show="Object.keys(faucets).length">
            <b-col cols="4" class="small">Faucet(s)</b-col>
            <b-col class="small truncate" cols="8">
              <span v-for="(url, name) in faucets">
                <b-link :href="url" class="card-link" target="_blank">{{ name }}</b-link><br />
              </span>
            </b-col>
          </b-row>
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
    network() {
      return store.getters['connection/network'];
    },
    explorer() {
      return store.getters['connection/explorer'];
    },
    faucets() {
      return store.getters['connection/faucets'] || [];
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
    weth() {
      return store.getters['connection/weth'];
    },
    wethBalance() {
      return store.getters['connection/weth'] ? store.getters['connection/weth'].balance : null;
    },
    wethAllowanceToNix() {
      return store.getters['connection/weth'] ? store.getters['connection/weth'].allowanceToNix : null;
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
          function handleChainChanged(_chainId) {
            alert('Ethereum chain has changed - reloading this page.')
            window.location.reload();
          }
          window.ethereum.on('chainChanged', handleChainChanged);

          const t = this;
          async function handleAccountsChanged(accounts) {
            logInfo("Connection", "execWeb3() handleAccountsChanged: " + JSON.stringify(accounts));
            const signer = provider.getSigner();
            const coinbase = await signer.getAddress();
            store.dispatch('connection/setCoinbase', coinbase);
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
            store.dispatch('connection/setNetwork', network);
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
    network: {
      chainId: null,
      updated: true,
      name: null,
      nixAddress: null,
      nixHelperAddress: null,
      wethAddress: null,
      royaltyEngineAddress: null,
      erc721HelperAddress: null,
      explorer: "https://etherscan.io/",
      opensea: null,
      faucets: {},
    },
    coinbase: null,
    coinbaseUpdated: false,
    balance: null,
    weth: {
      balance: null,
      allowanceToNix: null,
      updatedAccounts: [],
    },
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
    network: state => state.network,
    chainId: state => state.network && state.network.chainId || null,
    coinbase: state => state.coinbase,
    coinbaseUpdated: state => state.coinbaseUpdated,
    balance: state => state.balance,

    weth: state => state.weth,

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
    setNetwork(state, network) {
      // logInfo("connectionModule", "mutations.setNetwork() - network.chainId: " + network.chainId);
      if (state.network.chainId != network.chainId) {
        state.network.chainId = network.chainId;
        var networkDetails = getNetworkDetails(network.chainId);
        state.network.name = networkDetails.name;
        // state.network.nixAddress = networkDetails.nixAddress;
        // state.network.nixHelperAddress = networkDetails.nixHelperAddress;
        state.network.wethAddress = networkDetails.wethAddress;
        // state.network.royaltyEngineAddress = networkDetails.royaltyEngineAddress;
        state.network.erc721HelperAddress = networkDetails.erc721HelperAddress;
        state.network.explorer = networkDetails.explorer;
        state.network.opensea = networkDetails.opensea;
        state.network.faucets = networkDetails.faucets;
        state.network.updated = true;
        logDebug("connectionModule", "state.network: " + JSON.stringify(state.network));
      } else {
        if (state.network.updated) {
          state.network.updated = false;
        }
      }

      // network: {
      //   chainId: null,
      //   updated: true,
      //   name: null,
      //   explorer: "https://etherscan.io/",
      //   opensea: null,
      //   faucets: null,
      // },

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
    setWeth(state, weth) {
      // logInfo("connectionModule", "mutations.setWeth(): " + JSON.stringify(weth));
      state.weth = weth;
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
    setNetwork(context, n) {
      context.commit('setNetwork', n);
    },
    setCoinbase(context, cb) {
      context.commit('setCoinbase', cb);
    },
    setBalance(context, b) {
      context.commit('setBalance', b);
    },
    setWeth(context, weth ) {
      context.commit('setWeth', weth);
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
