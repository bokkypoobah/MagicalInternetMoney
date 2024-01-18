const WETH = {
  template: `
    <div class="mt-5 pt-3">
      <b-card class="mt-5" header-class="warningheader" header="Web3 Connection And/Or Incorrect Network Detected" v-if="!powerOn || (network.chainId != 1 && network.chainId != 4)">
        <b-card-text>
          Please install the MetaMask extension, connect to the Rinkeby network and refresh this page. Then click the [Power] button on the top right.
        </b-card-text>
      </b-card>

      <b-card no-body header="WETH" class="border-0" header-class="p-1" v-if="network.chainId == 1 || network.chainId == 4">
        <b-card no-body class="border-0 m-0 mt-2">
          <b-card-body class="p-0">

            <div>
              <b-card no-body class="mt-2">

                <b-card header="Balances" class="mb-2">
                  <b-card-text>
                    <b-form-group label-cols="3" label-size="sm" label="Account">
                      <b-link :href="explorer + 'address/' + coinbase" class="card-link" target="_blank">{{ coinbase }}</b-link>
                    </b-form-group>
                    <b-form-group label-cols="3" label-size="sm" label="ETH Balance">
                      <b-form-input size="sm" readonly v-model="formatETH(balance)" class="w-50"></b-form-input>
                    </b-form-group>
                    <b-form-group label-cols="3" label-size="sm" label="WETH Address">
                      <b-link :href="explorer + 'address/' + network.wethAddress + '#code'" class="card-link" target="_blank">{{ network.wethAddress }}</b-link>
                    </b-form-group>
                    <b-form-group label-cols="3" label-size="sm" label="WETH Balance">
                      <b-form-input size="sm" readonly v-model="formatETH(wethBalance)" class="w-50"></b-form-input>
                    </b-form-group>
                    <b-form-group label-cols="3" label-size="sm" label="WETH Allowance To Nix">
                      <b-form-input size="sm" readonly v-model="formatETH(wethAllowanceToNix)" class="w-50"></b-form-input>
                    </b-form-group>
                  </b-card-text>
                </b-card>

                <b-card header="Wrap ETH To WETH" class="mb-2">
                  <b-card-text>
                    <b-form-group label-cols="3" label-size="sm" label="ETH to wrap" description="e.g. 0.123456789">
                      <b-form-input size="sm" v-model="weth.ethToWrap" class="w-50"></b-form-input>
                    </b-form-group>
                    <b-form-group label-cols="3" label-size="sm" label="">
                      <b-button size="sm" @click="wrapEth" variant="warning">Wrap</b-button>
                    </b-form-group>
                    <b-form-group v-if="weth.wrapMessage && weth.wrapMessage.substring(0, 2) != '0x'" label-cols="3" label-size="sm" label="">
                      <b-form-textarea size="sm" rows="10" v-model="weth.wrapMessage" class="w-50"></b-form-textarea>
                    </b-form-group>
                    <b-form-group v-if="weth.wrapMessage && weth.wrapMessage.substring(0, 2) == '0x'" label-cols="3" label-size="sm" label="">
                      Tx <b-link :href="explorer + 'tx/' + weth.wrapMessage" class="card-link" target="_blank">{{ weth.wrapMessage }}</b-link>
                    </b-form-group>
                  </b-card-text>
                </b-card>

                <b-card header="Unwrap WETH To ETH" class="mb-2">
                  <b-card-text>
                    <b-form-group label-cols="3" label-size="sm" label="WETH to unwrap" description="e.g. 0.123456789">
                      <b-form-input size="sm" v-model="weth.wethToUnwrap" class="w-50"></b-form-input>
                    </b-form-group>
                    <b-form-group label-cols="3" label-size="sm" label="">
                      <b-button size="sm" @click="unwrapWeth" variant="warning">Unwrap</b-button>
                    </b-form-group>
                    <b-form-group v-if="weth.unwrapMessage && weth.unwrapMessage.substring(0, 2) != '0x'" label-cols="3" label-size="sm" label="">
                      <b-form-textarea size="sm" rows="10" v-model="weth.unwrapMessage" class="w-50"></b-form-textarea>
                    </b-form-group>
                    <b-form-group v-if="weth.unwrapMessage && weth.unwrapMessage.substring(0, 2) == '0x'" label-cols="3" label-size="sm" label="">
                      Tx <b-link :href="explorer + 'tx/' + weth.unwrapMessage" class="card-link" target="_blank">{{ weth.unwrapMessage }}</b-link>
                    </b-form-group>
                  </b-card-text>
                </b-card>

                <b-card header="Approve WETH Allowance For Nix To Spend" class="mb-2">
                  <b-card-text>
                    <b-form-group label-cols="3" label-size="sm" label="WETH to approve to Nix" description="e.g. 0.123456789">
                      <b-form-input size="sm" v-model="weth.wethToApproveToNix" class="w-50"></b-form-input>
                    </b-form-group>
                    <b-form-group label-cols="3" label-size="sm" label="">
                      <b-button size="sm" @click="approveWeth" variant="warning">Approve</b-button>
                    </b-form-group>
                    <b-form-group v-if="weth.approvalMessage && weth.approvalMessage.substring(0, 2) != '0x'" label-cols="3" label-size="sm" label="">
                      <b-form-textarea size="sm" rows="10" v-model="weth.approvalMessage" class="w-50"></b-form-textarea>
                    </b-form-group>
                    <b-form-group v-if="weth.approvalMessage && weth.approvalMessage.substring(0, 2) == '0x'" label-cols="3" label-size="sm" label="">
                      Tx <b-link :href="explorer + 'tx/' + weth.approvalMessage" class="card-link" target="_blank">{{ weth.approvalMessage }}</b-link>
                    </b-form-group>
                  </b-card-text>
                </b-card>

                <b-card header="Transfer WETH" class="mb-2">
                  <b-card-text>
                    <b-form-group label-cols="3" label-size="sm" label="Transfer WETH to" description="e.g. 0x123456...">
                      <b-form-input size="sm" v-model="weth.transferTo" class="w-50"></b-form-input>
                    </b-form-group>
                    <b-form-group label-cols="3" label-size="sm" label="WETH to transfer" description="e.g. 0.123456789">
                      <b-form-input size="sm" v-model="weth.transferAmount" class="w-50"></b-form-input>
                    </b-form-group>
                    <b-form-group label-cols="3" label-size="sm" label="">
                      <b-button size="sm" @click="transferWeth" variant="warning">Transfer</b-button>
                    </b-form-group>
                    <b-form-group v-if="weth.transferMessage && weth.transferMessage.substring(0, 2) != '0x'" label-cols="3" label-size="sm" label="">
                      <b-form-textarea size="sm" rows="10" v-model="weth.transferMessage" class="w-50"></b-form-textarea>
                    </b-form-group>
                    <b-form-group v-if="weth.transferMessage && weth.transferMessage.substring(0, 2) == '0x'" label-cols="3" label-size="sm" label="">
                      Tx <b-link :href="explorer + 'tx/' + weth.transferMessage" class="card-link" target="_blank">{{ weth.transferMessage }}</b-link>
                    </b-form-group>
                  </b-card-text>
                </b-card>

              </b-card>
            </div>

          </b-card-body>
        </b-card>
      </b-card>
    </div>
  `,
  data: function () {
    return {
      count: 0,
      reschedule: true,

      weth: {
        ethBalance: null,
        wethBalance: null,
        wethAllowanceToNix: null,
        ethToWrap: null,
        wrapMessage: null,
        wethToUnwrap: null,
        unwrapMessage: null,
        wethToApproveToNix: null,
        approvalMessage: null,
        transferTo: null,
        transferAmount: null,
        transferMessage: null,
      },

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
    balance() {
      return store.getters['connection/balance'];
    },
    wethData() {
      return store.getters['nixData/wethData'];
    },
    wethAddress() {
      return this.network.wethAddress;
    },
    wethBalance() {
      return store.getters['connection/weth'] ? store.getters['connection/weth'].balance : null;
    },
    wethAllowanceToNix() {
      return store.getters['connection/weth'] ? store.getters['connection/weth'].allowanceToNix : null;
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

    wrapEth() {
      console.log("wrapEth");
      this.$bvModal.msgBoxConfirm('Wrap ' + this.weth.ethToWrap + ' ETH?', {
          title: 'Please Confirm',
          size: 'sm',
          buttonSize: 'sm',
          okVariant: 'danger',
          okTitle: 'Yes',
          cancelTitle: 'No',
          footerClass: 'p-2',
          hideHeaderClose: false,
          centered: true
        })
        .then(async value1 => {
          if (value1) {
            event.preventDefault();
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const weth = new ethers.Contract(store.getters['connection/network'].wethAddress, WETHABI, provider);
            const wethWithSigner = weth.connect(provider.getSigner());
            try {
              const tx = await wethWithSigner.deposit({ value: ethers.utils.parseEther(this.weth.ethToWrap) });
              this.weth.wrapMessage = tx.hash;
              console.log("tx: " + JSON.stringify(tx));
            } catch (e) {
              this.weth.wrapMessage = e.message.toString();
              console.log("error: " + e.toString());
            }
          }
        })
        .catch(err => {
          // An error occurred
        });
    },

    unwrapWeth() {
      console.log("unwrapWeth");
      this.$bvModal.msgBoxConfirm('Unwrap ' + this.weth.wethToUnwrap + ' WETH?', {
          title: 'Please Confirm',
          size: 'sm',
          buttonSize: 'sm',
          okVariant: 'danger',
          okTitle: 'Yes',
          cancelTitle: 'No',
          footerClass: 'p-2',
          hideHeaderClose: false,
          centered: true
        })
        .then(async value1 => {
          if (value1) {
            event.preventDefault();
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const weth = new ethers.Contract(store.getters['connection/network'].wethAddress, WETHABI, provider);
            const wethWithSigner = weth.connect(provider.getSigner());
            try {
              const tx = await wethWithSigner.withdraw(ethers.utils.parseEther(this.weth.wethToUnwrap));
              this.weth.unwrapMessage = tx.hash;
              console.log("tx: " + JSON.stringify(tx));
            } catch (e) {
              this.weth.unwrapMessage = e.message.toString();
              console.log("error: " + e.toString());
            }
          }
        })
        .catch(err => {
          // An error occurred
        });
    },

    approveWeth() {
      console.log("approveWeth");
      this.$bvModal.msgBoxConfirm('Approve ' + this.weth.wethToApproveToNix + ' WETH for Nix to spend?', {
          title: 'Please Confirm',
          size: 'sm',
          buttonSize: 'sm',
          okVariant: 'danger',
          okTitle: 'Yes',
          cancelTitle: 'No',
          footerClass: 'p-2',
          hideHeaderClose: false,
          centered: true
        })
        .then(async value1 => {
          if (value1) {
            event.preventDefault();
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const weth = new ethers.Contract(store.getters['connection/network'].wethAddress, WETHABI, provider);
            const wethWithSigner = weth.connect(provider.getSigner());
            try {
              const tx = await wethWithSigner.approve(store.getters['connection/network'].nixAddress, ethers.utils.parseEther(this.weth.wethToApproveToNix));
              this.weth.approvalMessage = tx.hash;
              console.log("tx: " + JSON.stringify(tx));
            } catch (e) {
              this.weth.approvalMessage = e.message.toString();
              console.log("error: " + e.toString());
            }
          }
        })
        .catch(err => {
          // An error occurred
        });
    },

    transferWeth() {
      console.log("transferWeth");
      this.$bvModal.msgBoxConfirm('Transfer ' + this.weth.transferAmount + ' to ' + this.weth.transferTo + '?', {
          title: 'Please Confirm',
          size: 'sm',
          buttonSize: 'sm',
          okVariant: 'danger',
          okTitle: 'Yes',
          cancelTitle: 'No',
          footerClass: 'p-2',
          hideHeaderClose: false,
          centered: true
        })
        .then(async value1 => {
          if (value1) {
            event.preventDefault();
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const weth = new ethers.Contract(store.getters['connection/network'].wethAddress, WETHABI, provider);
            const wethWithSigner = weth.connect(provider.getSigner());
            try {
              const tx = await wethWithSigner.transfer(this.weth.transferTo, ethers.utils.parseEther(this.weth.transferAmount));
              this.weth.transferMessage = tx.hash;
              console.log("tx: " + JSON.stringify(tx));
            } catch (e) {
              this.weth.transferMessage = e.message.toString();
              console.log("error: " + e.toString());
            }
          }
        })
        .catch(err => {
          // An error occurred
        });
    },

    async timeoutCallback() {
      logDebug("WETH", "timeoutCallback() count: " + this.count);

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
    logDebug("WETH", "beforeDestroy()");
  },
  mounted() {
    logDebug("WETH", "mounted() $route: " + JSON.stringify(this.$route.params));
    this.reschedule = true;
    logDebug("WETH", "Calling timeoutCallback()");
    this.timeoutCallback();
    // this.loadNFTs();
  },
  destroyed() {
    this.reschedule = false;
  },
};

const wethModule = {
  namespaced: true,
  state: {
    canvas: null,
    params: null,
    executing: false,
    executionQueue: [],
  },
  getters: {
    canvas: state => state.canvas,
    params: state => state.params,
    executionQueue: state => state.executionQueue,
  },
  mutations: {
    setCanvas(state, c) {
      logDebug("wethModule", "mutations.setCanvas('" + c + "')")
      state.canvas = c;
    },
    deQueue(state) {
      logDebug("wethModule", "deQueue(" + JSON.stringify(state.executionQueue) + ")");
      state.executionQueue.shift();
    },
    updateParams(state, params) {
      state.params = params;
      logDebug("wethModule", "updateParams('" + params + "')")
    },
    updateExecuting(state, executing) {
      state.executing = executing;
      logDebug("wethModule", "updateExecuting(" + executing + ")")
    },
  },
  actions: {
    setCanvas(context, c) {
      logDebug("connectionModule", "actions.setCanvas(" + JSON.stringify(c) + ")");
      // context.commit('setCanvas', c);
    },
  },
};
