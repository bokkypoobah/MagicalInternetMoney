const Config = {
  template: `
    <div class="m-0 p-0">
      <b-card no-body no-header class="border-0">
        <b-card no-body no-header bg-variant="light" class="m-1 p-1 w-75">
          <b-card-body class="m-1 p-1">
            <b-form-group label-cols-lg="2" label="Import Settings" label-size="md" label-class="font-weight-bold pt-0" class="mt-3 mb-0">
              <b-form-group label="Etherscan API Key:" label-for="etherscan-apikey" label-size="sm" label-cols-sm="2" label-align-sm="right" description="This key is stored in your local browser storage and is sent with Etherscan API requests. If not supplied, imports from Etherscan will be rate limited to 1 request every 5 seconds" class="mx-0 my-1 p-0">
                <b-form-input type="text" size="sm" id="etherscan-apikey" :value="settings.etherscanAPIKey" @change="setEtherscanAPIKey($event)" placeholder="See https://docs.etherscan.io/ to obtain an API key" class="w-75"></b-form-input>
              </b-form-group>
              <b-form-group label="CryptoCompare API Key:" label-for="cryptocompare-apikey" label-size="sm" label-cols-sm="2" label-align-sm="right" description="This key is stored in your local browser storage and is sent with CryptoCompare API requests. If not supplied, imports from CryptoCompare may fail if you reach your free quota" class="mx-0 my-1 p-0">
                <b-form-input type="text" size="sm" id="cryptocompare-apikey" :value="settings.cryptoCompareAPIKey" @change="setCryptoCompareAPIKey($event)" placeholder="See https://www.cryptocompare.com/ to obtain an API key" class="w-75"></b-form-input>
              </b-form-group>
              <b-form-group label="Batch Size:" label-for="import-batchsize" label-size="sm" label-cols-sm="2" label-align-sm="right" :description="'Batch size for Etherscan transactions and internal transactions API calls, and web3 event filter calls. Use the smaller values if the web3 event filter call returns more than 10k results as the RPC calls will fail'" class="mx-0 my-1 p-0">
                <b-form-select size="sm" id="import-batchsize" :value="settings.etherscanBatchSize" @change="setEtherscanBatchSize($event)" :options="etherscanBatchSizeOptions" class="w-25"></b-form-select>
              </b-form-group>
              <b-form-group label="Confirmations:" label-for="import-confirmations" label-size="sm" label-cols-sm="2" label-align-sm="right" :description="'Number of blocks before including a transaction in this dapp'" class="mx-0 my-1 p-0">
                <b-form-select size="sm" id="import-confirmations" :value="settings.confirmations" @change="setConfirmations($event)" :options="confirmationsOptions" class="w-25"></b-form-select>
              </b-form-group>
            </b-form-group>
            <b-form-group label-cols-lg="2" label="Reporting Period" label-size="md" label-class="font-weight-bold pt-0" class="mt-3 mb-0">
              <b-form-group label="Period Start:" label-for="period-start" label-size="sm" label-cols-sm="2" label-align-sm="right" :description="'Reporting periods: [' + periodOptions.map(e => e.text).join(', ') + ']'" class="mx-0 my-1 p-0">
                <b-form-select size="sm" id="period-start" :value="settings.periodStart" @change="setPeriodStart($event)" :options="periodStartOptions" class="w-25"></b-form-select>
              </b-form-group>
            </b-form-group>
            <b-form-group label-cols-lg="2" label="Reporting Currency" label-size="md" label-class="font-weight-bold pt-0" class="mt-3 mb-0">
              <b-form-group label="Currency:" label-for="reporting-currency" label-size="sm" label-cols-sm="2" label-align-sm="right" :description="'Used in https://min-api.cryptocompare.com/data/v2/histoday?fsym=ETH&tsym={ccy}&limit=2000'" class="mx-0 my-1 p-0">
                <b-form-select size="sm" id="reporting-currency" :value="settings.reportingCurrency" @change="setReportingCurrency($event)" :options="reportingCurrencyOptions" class="w-25"></b-form-select>
              </b-form-group>
            </b-form-group>
            <!--
            <b-form-group label-cols-lg="2" label="Function Signatures" label-size="md" label-class="font-weight-bold pt-0" class="mt-3 mb-0">
              <b-form-group label="Download:" label-for="download-function-signatures" label-size="sm" label-cols-sm="2" label-align-sm="right" :description="'Download function signatures from www.4byte.directory'" class="mx-0 my-1 p-0">
                <b-button size="sm" id="download-function-signatures" @click="downloadFunctionSignatures()" variant="info">Download</b-button>
              </b-form-group>
            </b-form-group>
            -->
            <b-form-group label-cols-lg="2" label="Pre ERC-721 NFTs" label-size="md" label-class="font-weight-bold pt-0" class="mt-3 mb-0" description="Pre ERC-721 NFTs with ERC-20 Transfer events">
              <!-- TODO: Edit table -->
                <!-- <b-table small fixed striped responsive hover :fields="transactionsFields" :items="pagedFilteredSortedTransactions" show-empty empty-html="Add [Accounts] then sync" head-variant="light" class="m-0 mt-1"> -->
                <b-table small fixed striped responsive hover id="preerc721-list" :items="preERC721TableData" show-empty empty-html="Add [Accounts] then sync" head-variant="light" class="m-0 mt-1">
                </b-table>
              <!-- </b-form-group> -->
            </b-form-group>
            <b-form-group label-cols-lg="2" label="Processing Filters" label-size="md" label-class="font-weight-bold pt-0" class="mt-3 mb-0">
              <b-form-group label="Period:" label-for="process-period" label-size="sm" label-cols-sm="2" label-align-sm="right" :description="'Only process transactions within this selected period (approximate atm)'" class="mx-0 my-1 p-0">
                <b-form-select size="sm" id="process-period" :value="settings.processPeriod" @change="setProcessPeriod($event)" :options="processPeriods" class="w-50"></b-form-select>
              </b-form-group>
              <b-form-group v-if="settings.processPeriod == 'custom'" label="First Block Number:" label-for="first-block" label-size="sm" label-cols-sm="2" label-align-sm="right" :description="'Only process transactions after this block number, inclusive'" class="mx-0 my-1 p-0">
                <b-form-input type="text" size="sm" id="first-block" :value="settings.firstBlock" @change="setFirstBlock($event)" placeholder="Leave blank for all" class="w-75"></b-form-input>
              </b-form-group>
              <b-form-group v-if="settings.processPeriod == 'custom'" label="Last Block Number:" label-for="last-block" label-size="sm" label-cols-sm="2" label-align-sm="right" :description="'Only process transactions before this block number, inclusive'" class="mx-0 my-1 p-0">
                <b-form-input type="text" size="sm" id="last-block" :value="settings.lastBlock" @change="setLastBlock($event)" placeholder="Leave blank for all" class="w-75"></b-form-input>
              </b-form-group>
              <!-- TODO: Delete code
              <b-form-group label="Contracts:" label-for="process-contracts" label-size="sm" label-cols-sm="2" label-align-sm="right" :description="'Restrict processing to a list of contracts. Case insensitive. Leave blank for all'" class="mx-0 my-1 p-0">
                <b-form-textarea size="sm" id="process-contracts" :value="settings.processContracts" @change="setProcessContracts($event)" rows="3" max-rows="5" placeholder="0x1234... 0x2345..., 0xAbCd..."></b-form-textarea>
              </b-form-group>
              -->
              <b-form-group label="Transactions:" label-for="process-transactions" label-size="sm" label-cols-sm="2" label-align-sm="right" :description="'Restrict processing to a list of transaction hashes. These transactions must be associated to a synced account. Lower case only. Leave blank for all'" class="mx-0 my-1 p-0">
                <b-form-textarea size="sm" id="process-transactions" :value="settings.processTransactions" @change="setProcessTransactions($event)" rows="3" max-rows="5" placeholder="0x1234... 0x2345..., 0xabcd..."></b-form-textarea>
              </b-form-group>
            </b-form-group>
            <b-form-group label-cols-lg="2" label="User Data Backup & Restore" label-size="md" label-class="font-weight-bold pt-0" class="mt-3 mb-0">
              <b-form-group label="Backup:" label-for="download-backup" label-size="sm" label-cols-sm="2" label-align-sm="right" :description="'Download a backup of user entered information. File name txs_backup*.tsv'" class="mx-0 my-1 p-0">
                <b-button size="sm" id="download-backup" @click="downloadBackup()" variant="primary">Download</b-button>
              </b-form-group>
              <b-form-group label="Restore:" label-for="restore-from-backup-browse" label-size="sm" label-cols-sm="2" label-align-sm="right" :description="'Select backup .tsv file from your local computer to restore'" class="mx-0 my-1 p-0">
                <b-form-file size="sm" id="restore-from-backup-browse" v-model="restoreFile" @change="backupFilesChange($event.target.name, $event.target.files)" accept=".tsv" class="w-75"></b-form-file>
              </b-form-group>
              <b-form-group label="" label-for="restore-from-backup" label-size="sm" label-cols-sm="2" label-align-sm="right" :description="'Restore from backup file. Data has to be re-synced'" class="mx-0 my-1 p-0">
                <b-button size="sm" id="restore-from-backup" :disabled="restoreAccountsData.length == 0" @click="restoreFromBackup()" variant="primary">Restore</b-button>
              </b-form-group>
            </b-form-group>
            <b-form-group label-cols-lg="2" label="Intermediate Data Backup & Restore" label-size="md" label-class="font-weight-bold pt-0" class="mt-3 mb-0">
              <b-form-group label="Backup:" label-for="download-intermediate-backup" label-size="sm" label-cols-sm="2" label-align-sm="right" :description="'Download a backup of blocks and tx data. File name txs_intermediate*.json'" class="mx-0 my-1 p-0">
                <b-button size="sm" id="download-intermediate-backup" @click="downloadIntermediateBackup()" variant="primary">Download</b-button>
              </b-form-group>
              <b-form-group label="Restore:" label-for="restore-from-backup-browse" label-size="sm" label-cols-sm="2" label-align-sm="right" :description="'Select backup .json file from your local computer to restore'" class="mx-0 my-1 p-0">
                <b-form-file size="sm" id="restore-from-backup-browse" v-model="restoreFile" @change="intermediateBackupFilesChange($event.target.name, $event.target.files)" accept=".json" class="w-75"></b-form-file>
              </b-form-group>
              <b-form-group label="" label-for="restore-from-backup" label-size="sm" label-cols-sm="2" label-align-sm="right" :description="'Restore from backup file. Data has to be re-synced'" class="mx-0 my-1 p-0">
                <b-button size="sm" id="restore-from-backup" :disabled="!restoreIntermediateData.blocks || !restoreIntermediateData.txs" @click="restoreFromIntermediateBackup()" variant="primary">Restore</b-button>
              </b-form-group>
            </b-form-group>
            <b-form-group label-cols-lg="2" label="Reset Data" label-size="md" label-class="font-weight-bold pt-0" class="mt-3 mb-0">
              <b-form-group label="Tokens:" label-for="reset-tokens" label-size="sm" label-cols-sm="2" label-align-sm="right" :description="'Reset tokens for regeneration. DEV function'" class="mx-0 my-1 p-0">
                <b-button size="sm" id="reset-tokens" @click="resetTokens()" variant="primary">Reset</b-button>
              </b-form-group>
              <b-form-group label="Temporary Data:" label-for="reset-localstorage" label-size="sm" label-cols-sm="2" label-align-sm="right" :description="'Reset view preferences stored in your browser LocalStorage'" class="mx-0 my-1 p-0">
                <b-button size="sm" id="reset-localstorage" @click="reset(['localStorage'])" variant="primary">Reset</b-button>
              </b-form-group>
              <b-form-group label="Intermediate Data:" label-for="reset-intermediate" label-size="sm" label-cols-sm="2" label-align-sm="right" :description="'Reset view preferences stored in your browser LocalStorage, plus assets, transactions and ENS names stored in your browser IndexedDB'" class="mx-0 my-1 p-0">
                <b-button size="sm" id="reset-intermediate" @click="reset(['localStorage', 'txs', 'assets', 'ensMap'])" variant="primary">Reset</b-button>
              </b-form-group>
              <b-form-group label="All Data:" label-for="reset-unlock" label-size="sm" label-cols-sm="2" label-align-sm="right" description="Type 'gm' three times above, no spaces, to unlock the button below" class="mx-0 my-1 p-0">
                <b-form-input type="text" size="sm" id="reset-unlock" v-model.trim="unlock" placeholder="gm" class="w-25"></b-form-input>
              </b-form-group>
              <b-form-group label="" label-for="reset-all" label-size="sm" label-cols-sm="2" label-align-sm="right" :description="'Reset view preferences stored in your browser LocalStorage, plus accounts, assets, transactions and ENS names stored in your browser IndexedDB'" class="mx-0 my-1 p-0">
                <b-button size="sm" :disabled="unlock != 'gmgmgm'" id="reset-all" @click="reset(['localStorage', 'accounts', 'accountsInfo', 'txs', 'txsInfo', 'blocks', 'functionSelectors', 'eventSelectors', 'assets', 'ensMap', 'exchangeRates', 'report'])" variant="warning">Reset</b-button>
              </b-form-group>
            </b-form-group>
          </b-card-body>
        </b-card>
      </b-card>
    </div>
  `,
  data: function () {
    return {
      count: 0,
      reschedule: true,
      restoreFile: null,
      restoreAccountsData: [],
      restoreIntermediateData: {},
      unlock: null,
      etherscanBatchSizeOptions: [
        { value: 250_000, text: '250,000 blocks' },
        { value: 500_000, text: '500,000 blocks' },
        { value: 1_000_000, text: '1,000,000 blocks' },
        { value: 5_000_000, text: '5,000,000 blocks' },
        { value: 10_000_000, text: '10,000,000 blocks' },
      ],
      confirmationsOptions: [
        { value: 1, text: '1 block' },
        { value: 5, text: '5 blocks' },
        { value: 10, text: '10 blocks' },
        { value: 20, text: '20 blocks' },
      ],
      periodStartOptions: [
        { value: 'jan', text: 'January' },
        { value: 'feb', text: 'February' },
        { value: 'mar', text: 'March' },
        { value: 'apr', text: 'April' },
        { value: 'may', text: 'May' },
        { value: 'jun', text: 'June' },
        { value: 'jul', text: 'July' },
        { value: 'aug', text: 'August' },
        { value: 'sep', text: 'September' },
        { value: 'oct', text: 'October' },
        { value: 'nov', text: 'November' },
        { value: 'dec', text: 'December' },
      ],
      // As supported by https://min-api.cryptocompare.com/data/v2/histoday?fsym=ETH&tsym={ccy}&limit=2000
      reportingCurrencyOptions: [
        { value: 'AUD', text: 'AUD' },
        { value: 'CAD', text: 'CAD' },
        { value: 'CHF', text: 'CHF' },
        { value: 'EUR', text: 'EUR' },
        { value: 'GBP', text: 'GBP' },
        { value: 'JPY', text: 'JPY' },
        { value: 'NZD', text: 'NZD' },
        { value: 'USD', text: 'USD' },
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
    settings() {
      return store.getters['config/settings'];
    },
    periodOptions() {
      return store.getters['config/periodOptions'];
    },
    processPeriods() {
      return store.getters['config/processPeriods'];
    },
    preERC721TableData() {
      const results = [];
      for (const [account, name] of Object.entries(this.settings.preERC721s)) {
        results.push({ account, name });
      }
      results.sort((a, b) => {
        return ('' + a.name).localeCompare(b.name);
      });
      return results;
    },
  },
  methods: {
    setEtherscanAPIKey(apiKey) {
      store.dispatch('config/setEtherscanAPIKey', apiKey);
    },
    setCryptoCompareAPIKey(apiKey) {
      store.dispatch('config/setCryptoCompareAPIKey', apiKey);
    },
    setEtherscanBatchSize(etherscanBatchSize) {
      store.dispatch('config/setEtherscanBatchSize', etherscanBatchSize);
    },
    setConfirmations(confirmations) {
      store.dispatch('config/setConfirmations', confirmations);
    },
    setPeriodStart(periodStart) {
      store.dispatch('config/setPeriodStart', periodStart);
    },
    setReportingCurrency(reportingCurrency) {
      store.dispatch('config/setReportingCurrency', reportingCurrency);
    },
    setProcessPeriod(processPeriod) {
      store.dispatch('config/setProcessPeriod', processPeriod);
    },
    setFirstBlock(firstBlock) {
      store.dispatch('config/setFirstBlock', firstBlock);
    },
    setLastBlock(lastBlock) {
      store.dispatch('config/setLastBlock', lastBlock);
    },
    setProcessContracts(processContracts) {
      store.dispatch('config/setProcessContracts', processContracts);
    },
    setProcessTransactions(processTransactions) {
      store.dispatch('config/setProcessTransactions', processTransactions);
    },
    // downloadFunctionSignatures() {
    //   store.dispatch('config/downloadFunctionSignatures');
    // },
    downloadBackup() {
      const rows = [
          ["DataType", "No", "Account", "Type", "ENSName", "Mine", "Sync", "Report", "Junk", "Group", "Name", "Tags", "Notes"],
      ];
      const ensMap = store.getters['data/ensMap'];
      let row = 1;
      for (const [account, accountInfo] of Object.entries(store.getters['data/accountsInfo'])) {
        rows.push([
          "Account",
          row,
          account,
          accountInfo.type,
          ensMap[account] || null,
          accountInfo.mine ? "y" : "n",
          accountInfo.sync ? "y" : "n",
          accountInfo.report ? "y" : "n",
          accountInfo.junk ? "y" : "n",
          accountInfo.group,
          accountInfo.name,
          accountInfo.tags,
          accountInfo.notes,
        ]);
        row++;
      }
      let tsvContent = "data:text/tsv;charset=utf-8," + rows.map(e => e.join("\t")).join("\n");
      var encodedUri = encodeURI(tsvContent);
      var link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "txs_backup-" + moment().format("YYYY-MM-DD-HH-mm-ss") + ".tsv");
      document.body.appendChild(link); // Required for FF
      link.click(); // This will download the data with the specified file name
    },
    downloadIntermediateBackup() {
      const blocks = store.getters['data/blocks'];
      const txs = store.getters['data/txs'];
      let jsonContent = "data:text/json;charset=utf-8," + JSON.stringify({ blocks, txs }, null, 2);
      var encodedUri = encodeURI(jsonContent);
      var link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "txs_intermediate_backup-" + moment().format("YYYY-MM-DD-HH-mm-ss") + ".json");
      document.body.appendChild(link); // Required for FF
      link.click(); // This will download the data with the specified file name
    },
    async backupFilesChange(fileName, fileList) {
      const reader = new FileReader();
      this.restoreAccountsData = [];
      const t = this;
      reader.onload = function (event) {
        const data = event.target.result;
        const lines = data.split("\n");
        for (const line of lines) {
          const fields = line.split("\t");
          if (fields[0] == "Account") {
            const [dataType, accountIndex, account, accountType, ensName, mine, sync, report, junk, group, name, tags, notes]  = fields;
            t.restoreAccountsData.push({ dataType, account, accountType: accountType || null, mine: mine == "y", sync: sync == "y", report: report == "y", junk: junk == "y", group: group || null, name: name || null, tags: tags || [], notes: notes || null });
          }
        }
      };
      await reader.readAsText(fileList[0]);
    },
    async intermediateBackupFilesChange(fileName, fileList) {
      const reader = new FileReader();
      this.restoreIntermediateData = {};
      const t = this;
      reader.onload = function (event) {
        const data = event.target.result;
        t.restoreIntermediateData = JSON.parse(data);
      };
      await reader.readAsText(fileList[0]);
    },
    async restoreFromBackup() {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      if (this.restoreAccountsData.length > 0) {
        for (const section of ['accounts', 'accountsInfo', 'txs', 'txsInfo', 'blocks', 'functionSelectors', 'eventSelectors', 'assets', 'ensMap', 'exchangeRates', 'report']) {
          await store.dispatch('data/resetData', section);
        }
      }
      for (const newAccount of this.restoreAccountsData) {
        await store.dispatch('data/restoreAccount', newAccount);
      }
      await store.dispatch('data/saveData', ['accounts', 'accountsInfo']);
      alert('Click OK. This page will be reloaded in 5 seconds.')
      setTimeout(function() {
        window.location.reload();
      }, 5000);
    },
    async restoreFromIntermediateBackup() {
      if (this.restoreIntermediateData.blocks && this.restoreIntermediateData.txs) {
        await store.dispatch('data/restoreIntermediateData', this.restoreIntermediateData);
        await store.dispatch('data/saveData', ['blocks', 'txs']);
        alert('Click OK. This page will be reloaded in 5 seconds.')
        setTimeout(function() {
          window.location.reload();
        }, 5000);
      }
    },
    async resetTokens() {
      await store.dispatch('data/resetTokens');
    },
    reset(sections) {
      console.log("reset() - sections: " + JSON.stringify(sections));
      for (let section of sections) {
        if (section == 'localStorage') {
          console.log("- deleting localStorage");
          for (let key of ['coinbase', 'accountsSettings', 'transactionsSettings', 'configSettings']) {
            delete localStorage[key];
          }
        } else {
          console.log("- data/resetData: " + section);
          store.dispatch('data/resetData', section);
        }
      }
      alert('Click OK. This page will be reloaded in 5 seconds.')
      setTimeout(function() {
        window.location.reload();
      }, 5000);
    },
    async timeoutCallback() {
      logDebug("Config", "timeoutCallback() count: " + this.count);
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
    logDebug("Config", "beforeDestroy()");
  },
  mounted() {
    logDebug("Config", "mounted() $route: " + JSON.stringify(this.$route.params));
    store.dispatch('config/restoreState');
    store.dispatch('data/restoreState');
    this.reschedule = true;
    logDebug("Config", "Calling timeoutCallback()");
    this.timeoutCallback();
  },
  destroyed() {
    this.reschedule = false;
  },
};

const configModule = {
  namespaced: true,
  state: {
    settings: {
      etherscanAPIKey: null,
      cryptoCompareAPIKey: null,
      etherscanBatchSize: 10_000_000,
      confirmations: 10,
      periodStart: 'jul',
      reportingCurrency: 'USD',
      processPeriod: null,
      processContracts: null,
      processTransactions: null,
      firstBlock: null,
      lastBlock: null,
      preERC721s: {
        "0x6Ba6f2207e343923BA692e5Cae646Fb0F566DB8D": "CryptoPunksV1",
        "0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB": "CryptoPunksV2Official",
        "0x60cd862c9C687A9dE49aecdC3A99b74A4fc54aB6": "MoonCatRescue",
        "0x19c320b43744254ebdBcb1F1BD0e2a3dc08E01dc": "CryptoCatsV1",
        "0x9508008227b6b3391959334604677d60169EF540": "CryptoCatsV2",
        "0x088C6Ad962812b5Aa905BA6F3c5c145f9D4C079f": "CryptoCatsV3Official",
        "0x011C77fa577c500dEeDaD364b8af9e8540b808C0": "ImmortalPlayerCharacter",
        "0x79986aF15539de2db9A5086382daEdA917A9CF0C": "CryptoVoxels",
        "0x06012c8cf97BEaD5deAe237070F9587f8E7A266d": "CryptoKitties", // Note that the transfer parameters are not indexed - Transfer (address from, address to, uint256 tokenId)
        "0x43fb95c7afA1Ac1E721F33C695b2A0A94C7ddAb2": "LunarMoonPlots",
      },
      version: 11,
    },
    processPeriods: [
      { value: null, text: '(all)', data: { from: null, to: null } },
      { value: "custom", text: '(custom)', data: { from: null, to: null } },
      { value: 'toJun302018', text: 'to Jun 30 2018', data: { from: 0, to: 5_880_581 } },
      { value: 'toJun302019', text: 'to Jun 30 2019', data: { from: 0, to: 8_059_133 } },
      { value: 'toJun302020', text: 'to Jun 30 2020', data: { from: 0, to: 10_366_994 } },
      { value: 'toJun302021', text: 'to Jun 30 2021', data: { from: 0, to: 12_735_199 } },
      { value: 'toJun302022', text: 'to Jun 30 2022', data: { from: 0, to: 15_050_239 } },
      { value: '20152016', text: 'Jul 1 2015 - Jun 30 2016', data: { from: 0, to: 1_795_814 } },
      { value: '20162017', text: 'Jul 1 2016 - Jun 30 2017', data: { from: 1_801_799, to: 3_950_123 } },
      { value: '20172018', text: 'Jul 1 2017 - Jun 30 2018', data: { from: 3_955_159, to: 5_880_581 } },
      { value: '20182019', text: 'Jul 1 2018 - Jun 30 2019', data: { from: 5_883_490, to: 8_059_133 } },
      { value: '20192020', text: 'Jul 1 2019 - Jun 30 2020', data: { from: 8_062_293, to: 10_366_994 } },
      { value: '20202021', text: 'Jul 1 2020 - Jun 30 2021', data: { from: 10_370_274, to: 12_735_199 } },
      { value: '20212022', text: 'Jul 1 2021 - Jun 30 2022', data: { from: 12_738_509, to: 15_050_239 } },
      { value: '20222023', text: 'Jul 1 2022 - ', data: { from: 15_053_226, to: null } },
    ],
    // Note: UTC, and approximate block numbers
    // 01/07/2017 - 30/06/2018 3,955,159 Jul-01-2017 12:00:11 AM +UTC 5,880,581
    // 01/07/2018 - 30/06/2019 5,883,490 Jul-01-2018 12:00:05 AM +UTC 8,059,133
    // 01/07/2019 - 30/06/2020 8,062,293 10,366,994
    // 01/07/2020 - 30/06/2021 10,370,274 12,735,199
    // 01/07/2021 - 30/06/2022 12,738,509 15,050,239
    // 01/07/2022 - 30/06/2023 15,053,226
  },
  getters: {
    settings: state => state.settings,
    processPeriods: state => state.processPeriods,
    periodOptions(state) {
      const results = [];
      const startMonth = state.settings.periodStart && state.settings.periodStart.length > 0 && state.settings.periodStart || "jul";
      const now = moment();
      let startPeriod = moment(now).month(startMonth).startOf('month');
      if (startPeriod > now) {
        startPeriod = startPeriod.subtract(1, 'year');
      }
      while (moment(startPeriod).year() >= 2015) {
        const endPeriod = moment(startPeriod).add(1, 'year').subtract(1, 'second');
        results.push({ value: "y" + moment(startPeriod).year(), text: startPeriod.format('MMM DD YYYY') + " - " + endPeriod.format('MMM DD YYYY'), data: { startPeriod, endPeriod } });
        startPeriod = moment(startPeriod).subtract(1, 'year');
      }
      return results;
    },
    quarterlyOptions(state) {
      const results = [];
      const now = moment();
      let startPeriod = moment().quarter(now.quarter()).startOf('quarter');
      while (moment(startPeriod).year() >= 2015) {
        const endPeriod = moment(startPeriod).add(3, 'month').subtract(1, 'second');
        results.push({ value: "q" + startPeriod.format('YYYYQ'), text: startPeriod.format('MMM DD YYYY') + " - " + endPeriod.format('MMM DD YYYY'), data: { startPeriod, endPeriod } });
        startPeriod = moment(startPeriod).subtract(3, 'month');
      }
      return results;
    },
    processFilters(state) {
      let firstBlock = null;
      let lastBlock = null;
      if (state.settings.processPeriod == "custom") {
        firstBlock = state.settings.firstBlock;
        lastBlock = state.settings.lastBlock;
      } else if (state.settings.processPeriod != null) {
        const setting = state.processPeriods.filter(e => e.value == state.settings.processPeriod);
        if (setting.length == 1) {
          firstBlock = setting[0].data.from;
          lastBlock = setting[0].data.to;
        }
      }
      return { firstBlock, lastBlock, processContracts: state.settings.processContracts, processTransactions: state.settings.processTransactions };
    },
  },
  mutations: {
    setEtherscanAPIKey(state, apiKey) {
      state.settings.etherscanAPIKey = apiKey;
    },
    setCryptoCompareAPIKey(state, apiKey) {
      state.settings.cryptoCompareAPIKey = apiKey;
    },
    setEtherscanBatchSize(state, etherscanBatchSize) {
      state.settings.etherscanBatchSize = etherscanBatchSize;
    },
    setConfirmations(state, confirmations) {
      state.settings.confirmations = confirmations;
    },
    setPeriodStart(state, periodStart) {
      state.settings.periodStart = periodStart;
    },
    setReportingCurrency(state, reportingCurrency) {
      state.settings.reportingCurrency = reportingCurrency;
    },
    setProcessPeriod(state, processPeriod) {
      state.settings.processPeriod = processPeriod;
    },
    setFirstBlock(state, firstBlock) {
      state.settings.firstBlock = firstBlock;
    },
    setLastBlock(state, lastBlock) {
      state.settings.lastBlock = lastBlock;
    },
    setProcessContracts(state, processContracts) {
      state.settings.processContracts = processContracts;
    },
    setProcessTransactions(state, processTransactions) {
      state.settings.processTransactions = processTransactions;
    },
  },
  actions: {
    restoreState(context) {
      if ('configSettings' in localStorage) {
        const tempSettings = JSON.parse(localStorage.configSettings);
        if ('version' in tempSettings && tempSettings.version == 11) {
          context.state.settings = tempSettings;
        }
      }
    },
    setEtherscanAPIKey(context, apiKey) {
      context.commit('setEtherscanAPIKey', apiKey);
      localStorage.configSettings = JSON.stringify(context.state.settings);
    },
    setCryptoCompareAPIKey(context, apiKey) {
      context.commit('setCryptoCompareAPIKey', apiKey);
      localStorage.configSettings = JSON.stringify(context.state.settings);
    },
    setEtherscanBatchSize(context, etherscanBatchSize) {
      context.commit('setEtherscanBatchSize', etherscanBatchSize);
      localStorage.configSettings = JSON.stringify(context.state.settings);
    },
    setConfirmations(context, confirmations) {
      context.commit('setConfirmations', confirmations);
      localStorage.configSettings = JSON.stringify(context.state.settings);
    },
    setPeriodStart(context, periodStart) {
      context.commit('setPeriodStart', periodStart);
      localStorage.configSettings = JSON.stringify(context.state.settings);
    },
    setReportingCurrency(context, reportingCurrency) {
      context.commit('setReportingCurrency', reportingCurrency);
      localStorage.configSettings = JSON.stringify(context.state.settings);
    },
    setProcessPeriod(context, processPeriod) {
      context.commit('setProcessPeriod', processPeriod);
      localStorage.configSettings = JSON.stringify(context.state.settings);
    },
    setFirstBlock(context, firstBlock) {
      context.commit('setFirstBlock', firstBlock);
      localStorage.configSettings = JSON.stringify(context.state.settings);
    },
    setLastBlock(context, lastBlock) {
      context.commit('setLastBlock', lastBlock);
      localStorage.configSettings = JSON.stringify(context.state.settings);
    },
    setProcessContracts(context, processContracts) {
      context.commit('setProcessContracts', processContracts);
      localStorage.configSettings = JSON.stringify(context.state.settings);
    },
    setProcessTransactions(context, processTransactions) {
      context.commit('setProcessTransactions', processTransactions);
      localStorage.configSettings = JSON.stringify(context.state.settings);
    },
    // async downloadFunctionSignatures(context) {
    //   console.log("action.downloadFunctionSignatures()");
    //   let url = "https://www.4byte.directory/api/v1/signatures/";
    //   do {
    //     console.log(url);
    //     const data = await fetch(url)
    //       .then(response => response.json())
    //       .catch(function(e) {
    //         console.log("error: " + e);
    //       });
    //     console.log(JSON.stringify(data, null, 2));
    //     url = data.next;
    //     delay(5000);
    //   } while (url);
    // },
  },
};
