const Mappings = {
  template: `
    <div class="m-0 p-0">
      <b-card no-body no-header class="border-0">

        <div class="d-flex flex-wrap m-0 p-0">
          <div class="mt-0 pr-1">
            <b-form-input type="text" size="sm" v-model.trim="settings.filter" @change="saveSettings" debounce="600" v-b-popover.hover.top="'Filter by address or ENS name fragment'" placeholder="🔍 address / ens name"></b-form-input>
          </div>
          <div class="mt-0 pr-1" style="max-width: 8.0rem;">
            <b-form-select size="sm" v-model="settings.accountTypeFilter" @change="saveSettings" :options="accountTypeFilters" v-b-popover.hover.top="'Filter by account types'"></b-form-select>
          </div>
          <!--
          <div class="mt-0 pr-1" style="max-width: 8.0rem;">
            <b-form-select size="sm" v-model="settings.myAccountsFilter" @change="saveSettings" :options="myAccountsFilterOptions" v-b-popover.hover.top="'My accounts filter'"></b-form-select>
          </div>
          -->
          <div class="mt-0 pr-1">
            <b-dropdown size="sm" variant="link" v-b-popover.hover="settings.myAccountsFilter == null ? 'All accounts' : (settings.myAccountsFilter == 'mine' ? 'My accounts' : 'Other accounts')">
              <template #button-content>
                <span v-if="settings.myAccountsFilter == null">
                  <b-iconstack font-scale="1">
                    <b-icon stacked icon="person-fill" variant="dark" scale="0.5" shift-v="3" shift-h="-3"></b-icon>
                    <b-icon stacked icon="person" variant="info" scale="0.5" shift-v="3" shift-h="3"></b-icon>
                    <b-icon stacked icon="person" variant="info" scale="0.5" shift-v="-3" shift-h="3"></b-icon>
                    <b-icon stacked icon="person" variant="info" scale="0.5" shift-v="-3" shift-h="-3"></b-icon>
                  </b-iconstack>
                </span>
                <span v-else-if="settings.myAccountsFilter == 'mine'">
                  <b-iconstack font-scale="1">
                    <b-icon stacked icon="person-fill" variant="dark" scale="0.75"></b-icon>
                  </b-iconstack>
                </span>
                <span v-else>
                  <b-iconstack font-scale="1">
                    <b-icon stacked icon="person" variant="info" scale="0.5" shift-v="3" shift-h="-3"></b-icon>
                    <b-icon stacked icon="person" variant="info" scale="0.5" shift-v="3" shift-h="3"></b-icon>
                    <b-icon stacked icon="person" variant="info" scale="0.5" shift-v="-3" shift-h="3"></b-icon>
                    <b-icon stacked icon="person" variant="info" scale="0.5" shift-v="-3" shift-h="-3"></b-icon>
                  </b-iconstack>
                </span>
              </template>
              <b-dropdown-item href="#" @click="settings.myAccountsFilter = null; saveSettings()">
                <b-iconstack font-scale="1">
                  <b-icon stacked icon="person-fill" variant="dark" scale="0.5" shift-v="3" shift-h="-3"></b-icon>
                  <b-icon stacked icon="person" variant="info" scale="0.5" shift-v="3" shift-h="3"></b-icon>
                  <b-icon stacked icon="person" variant="info" scale="0.5" shift-v="-3" shift-h="3"></b-icon>
                  <b-icon stacked icon="person" variant="info" scale="0.5" shift-v="-3" shift-h="-3"></b-icon>
                </b-iconstack>
                All Accounts
              </b-dropdown-item>
              <b-dropdown-item href="#" @click="settings.myAccountsFilter = 'mine'; saveSettings()">
                <b-iconstack font-scale="1">
                  <b-icon stacked icon="person-fill" variant="dark" scale="0.75"></b-icon>
                </b-iconstack>
                My Accounts
              </b-dropdown-item>
              <b-dropdown-item href="#" @click="settings.myAccountsFilter = 'notmine'; saveSettings()">
                <b-iconstack font-scale="1">
                  <b-icon stacked icon="person" variant="info" scale="0.5" shift-v="3" shift-h="-3"></b-icon>
                  <b-icon stacked icon="person" variant="info" scale="0.5" shift-v="3" shift-h="3"></b-icon>
                  <b-icon stacked icon="person" variant="info" scale="0.5" shift-v="-3" shift-h="3"></b-icon>
                  <b-icon stacked icon="person" variant="info" scale="0.5" shift-v="-3" shift-h="-3"></b-icon>
                </b-iconstack>
                Other Accounts
              </b-dropdown-item>
            </b-dropdown>
          </div>
          <div class="mt-0 pr-1">
            <b-dropdown size="sm" variant="link" v-b-popover.hover="settings.junkFilter == 'excludejunk' ? 'Junk excluded' : (settings.junkFilter == null ? 'Junk included' : 'Junk')">
              <template #button-content>
                <span v-if="settings.junkFilter == null">
                  <b-iconstack font-scale="1">
                    <b-icon stacked icon="circle-fill" variant="warning"></b-icon>
                    <b-icon stacked icon="trash" variant="info" scale="0.75"></b-icon>
                  </b-iconstack>
                </span>
                <span v-else-if="settings.junkFilter == 'excludejunk'">
                  <b-iconstack font-scale="1">
                    <b-icon stacked icon="trash" variant="info" scale="0.75"></b-icon>
                    <b-icon stacked icon="slash-circle" variant="danger"></b-icon>
                  </b-iconstack>
                </span>
                <span v-else>
                  <b-iconstack font-scale="1">
                    <b-icon stacked icon="trash" variant="info" scale="0.75"></b-icon>
                  </b-iconstack>
                </span>
              </template>
              <b-dropdown-item href="#" @click="settings.junkFilter = null; saveSettings()">
                <b-iconstack font-scale="1">
                  <b-icon stacked icon="circle-fill" variant="warning"></b-icon>
                  <b-icon stacked icon="trash" variant="info" scale="0.75"></b-icon>
                </b-iconstack>
                Include Junk
              </b-dropdown-item>
              <b-dropdown-item href="#" @click="settings.junkFilter = 'excludejunk'; saveSettings()">
                <b-iconstack font-scale="1">
                  <b-icon stacked icon="trash" variant="info" scale="0.75"></b-icon>
                  <b-icon stacked icon="slash-circle" variant="danger"></b-icon>
                </b-iconstack>
                Exclude Junk
              </b-dropdown-item>
              <b-dropdown-item href="#" @click="settings.junkFilter = 'junk'; saveSettings()">
                <b-iconstack font-scale="1">
                  <b-icon stacked icon="trash" variant="info" scale="0.75"></b-icon>
                </b-iconstack>
                Junk
              </b-dropdown-item>
            </b-dropdown>
          </div>
          <!--
          <div class="mt-0 pr-1">
            <b-button size="sm" :pressed.sync="settings.showAdditionalFilters" @click="saveSettings" variant="link" v-b-popover.hover.top="'Additional filters'"><span v-if="settings.showAdditionalFilters"><b-icon-funnel-fill shift-v="+1" font-scale="1.0"></b-icon-funnel-fill></span><span v-else><b-icon-funnel shift-v="+1" font-scale="1.0"></b-icon-funnel></span></b-button>
          </div>
          -->
          <div class="mt-0 flex-grow-1">
          </div>
          <div class="mt-0 pr-1">
            <b-button size="sm" :pressed.sync="settings.editMappings" @click="saveSettings" :variant="settings.editMappings ? 'danger' : 'link'" v-b-popover.hover.top="settings.editMappings ? 'End adding/editing accounts' : 'Add/Edit accounts'"><b-icon-pencil shift-v="+1" font-scale="1.0"></b-icon-pencil></b-button>
          </div>
          <div class="mt-0 flex-grow-1">
          </div>
          <div v-if="sync.section == null" class="mt-0 pr-1">
            <b-button size="sm" :disabled="block == null" @click="syncIt({ sections: ['all'], parameters: Object.keys(settings.selectedAccounts) })" variant="link" v-b-popover.hover.top="'Import Etherscan transactions and web3 transfer events for accounts configured to be synced, or all selected accounts'"><b-icon-cloud-download shift-v="+1" font-scale="1.2"></b-icon-cloud-download></b-button>
          </div>
          <div v-if="sync.section == null" class="mt-0 pr-1">
            <b-button size="sm" :disabled="block == null" @click="syncIt({ sections: ['syncBuildTokenContractsAndAccounts'], parameters: Object.keys(settings.selectedAccounts) })" variant="link" v-b-popover.hover.top="'DEV BUTTON 1'"><b-icon-lightning shift-v="+1" font-scale="1.2"></b-icon-lightning></b-button>
          </div>
          <div v-if="sync.section == null" class="mt-0 pr-1">
            <b-button size="sm" :disabled="block == null" @click="syncIt({ sections: ['syncTransferEvents'], parameters: Object.keys(settings.selectedAccounts) })" variant="link" v-b-popover.hover.top="'DEV BUTTON 2'"><b-icon-lightning shift-v="+1" font-scale="1.2"></b-icon-lightning></b-button>
          </div>
          <div v-if="sync.section == null" class="mt-0 pr-1">
            <b-button size="sm" @click="exportAccounts" variant="link" v-b-popover.hover.top="'Export accounts'"><b-icon-file-earmark-spreadsheet shift-v="+1" font-scale="1.2"></b-icon-file-earmark-spreadsheet></b-button>
          </div>
          <div class="mt-1" style="width: 200px;">
            <b-progress v-if="sync.section != null" height="1.5rem" :max="sync.total" show-progress :animated="sync.section != null" :variant="sync.section != null ? 'success' : 'secondary'" v-b-popover.hover.top="'Click the button on the right to stop. This process can be continued later'">
              <b-progress-bar :value="sync.completed">
                {{ sync.total == null ? (sync.completed + ' ' + sync.section) : (sync.completed + '/' + sync.total + ' ' + ((sync.completed / sync.total) * 100).toFixed(0) + '% ' + sync.section) }}
              </b-progress-bar>
            </b-progress>
          </div>
          <div class="ml-0 mt-1">
            <b-button v-if="sync.section != null" size="sm" @click="halt" variant="link" v-b-popover.hover.top="'Click to stop. This process can be continued later'"><b-icon-stop-fill shift-v="+1" font-scale="1.0"></b-icon-stop-fill></b-button>
          </div>
          <div class="mt-0 flex-grow-1">
          </div>
          <div class="mt-0 pr-1" style="max-width: 8.0rem;">
            <b-form-select size="sm" v-model="settings.sortOption" @change="saveSettings" :options="sortOptions" v-b-popover.hover.top="'Yeah. Sort'"></b-form-select>
          </div>
          <div class="mt-0 pr-1">
            <font size="-2" v-b-popover.hover.top="'# accounts'">{{ filteredSortedMappings.length + '/' + totalMappings }}</font>
          </div>
          <div class="mt-0 pr-1">
            <b-pagination size="sm" v-model="settings.currentPage" @input="saveSettings" :total-rows="filteredSortedMappings.length" :per-page="settings.pageSize" style="height: 0;"></b-pagination>
          </div>
          <div class="mt-0 pl-1">
            <b-form-select size="sm" v-model="settings.pageSize" @change="saveSettings" :options="pageSizes" v-b-popover.hover.top="'Page size'"></b-form-select>
          </div>
        </div>

        <b-card v-if="settings.showAdditionalFilters" no-body no-header bg-variant="light" class="m-1 p-1 w-75">
          <div class="mt-0 pr-1" style="width: 15.0rem;">
            <b-card no-header no-body class="m-0 mt-1 p-0 border-1">
              <b-card-body class="m-0 p-0">
                BLAH
                <!--
                <font size="-2">
                  <b-table small fixed striped sticky-header="200px" :fields="accountsFilterFields" :items="getAllAccounts" head-variant="light">
                    <template #cell(select)="data">
                      <b-form-checkbox size="sm" :checked="(settings.filters['accounts'] && settings.filters['accounts'][data.item.account]) ? 1 : 0" value="1" @change="filterChanged('accounts', data.item.account)"></b-form-checkbox>
                    </template>
                    <template #cell(account)="data">
                      {{ ensOrAccount(data.item.account, 20) }}
                    </template>
                  </b-table>
                </font>
                -->
              </b-card-body>
            </b-card>
          </div>
        </b-card>

        <b-card v-if="settings.editMappings || totalMappings == 0" no-body no-header bg-variant="light" class="m-1 p-1">
          <b-card-body class="m-1 p-1">
            <h6>Add New Mappings</h6>
            <br />
            <!-- <b-form-group label-cols-lg="2" label="Add New Mappings" label-size="md" label-class="font-weight-bold pt-0" class="mb-0"> -->
              <b-form-group label="Select Function Selector:" label-for="select-function-selector" label-size="sm" label-cols-sm="2" label-align-sm="right" class="mx-0 my-1 p-0">
                <font size="-1">
                  <b-table small sticky-header fixed striped responsive hover selectable select-mode="single" @row-selected='functionSelectorSelected' :fields="functionSelectorFields" :items="allFunctionSelectors" show-empty head-variant="light" class="m-0 mt-1">
                    <template #cell(number)="data">
                      {{ data.index }}
                    </template>
                    <!--
                    <template #cell(accountCount)="data">
                      {{ Object.keys(data.item.accounts).length }}
                    </template>
                    <template #cell(txCount)="data">
                      {{ data.item.txCount }}
                    </template>
                    -->
                  </b-table>
                </font>
              </b-form-group>
              <b-form-group label="" label-for="newaccounts-submit" label-size="sm" label-cols-sm="2" label-align-sm="right" description="Only valid accounts will be added. Click the 'cloud download' button above to retrieve the transactions" class="mx-0 my-1 p-0">
                <b-button size="sm" id="newaccounts-submit" :disabled="settings.newAccounts == null || settings.newAccounts.length == 0 || block == null" @click="addNewAccounts" variant="primary">Add</b-button>
              </b-form-group>
              <b-form-group label="Coinbase:" label-for="newaccounts-coinbase-submit" label-size="sm" label-cols-sm="2" label-align-sm="right" :description="coinbase == null ? '' : (coinbaseIncluded ? (coinbase + ' already added') : ('Add ' + coinbase + '?'))" class="mx-0 my-1 p-0">
                <b-button size="sm" id="newaccounts-coinbase-submit" :disabled="block == null || coinbaseIncluded" @click="addCoinbase" variant="primary">Add</b-button>
              </b-form-group>
            <!-- </b-form-group> -->
            {{ settings.selectedFunctionSelector }}
          </b-card-body>
        </b-card>

        <b-table small fixed striped responsive hover :items="pagedFilteredSortedMappings" show-empty head-variant="light" class="m-0 mt-1">
          <template #empty="scope">
            <h6>{{ scope.emptyText }}</h6>
            <div v-if="totalMappings == 0">
              <ul>
                <li>
                  Enter your account(s) in the Accounts tab
                </li>
                <li>
                  Click <b-button size="sm" variant="link" class="m-0 p-0"><b-icon-cloud-download shift-v="+1" font-scale="1.2"></b-icon-cloud-download></b-button> in the Accounts or Report tab to sync your account data
                </li>
                <li>
                  Click <b-button size="sm" variant="link" class="m-0 p-0"><b-icon-newspaper shift-v="+1" font-scale="1.0"></b-icon-newspaper></b-button> in the Report tab, to generate a report from your account data
                </li>
              </ul>
            </div>
          </template>
        </b-table>

        <b-table v-if="false" small fixed striped responsive hover :fields="accountsFields" :items="pagedFilteredSortedMappings" show-empty empty-html="Click [+] above to add accounts" head-variant="light" class="m-0 mt-1">
          <template #head(number)="data">
            <b-dropdown size="sm" variant="link" v-b-popover.hover="'Toggle selection'">
              <template #button-content>
                <b-icon-check-square shift-v="+1" font-scale="0.9"></b-icon-check-square>
              </template>
              <b-dropdown-item href="#" @click="toggleSelectedAccounts(pagedFilteredSortedMappings)">Toggle selection for all accounts on this page</b-dropdown-item>
              <b-dropdown-item href="#" @click="toggleSelectedAccounts(filteredSortedMappings)">Toggle selection for all accounts on all pages</b-dropdown-item>
              <b-dropdown-item href="#" @click="clearSelectedAccounts()">Clear selection</b-dropdown-item>
            </b-dropdown>
          </template>
          <template #cell(number)="data">
            <b-form-checkbox size="sm" :checked="settings.selectedAccounts[data.item.account] ? 1 : 0" value="1" @change="toggleSelectedAccounts([data.item])">
              {{ parseInt(data.index) + ((settings.currentPage - 1) * settings.pageSize) + 1 }}
            </b-form-checkbox>
          </template>
          <template #cell(image)="data">
            <div v-if="data.item.type == 'preerc721' || data.item.type == 'erc721' || data.item.type == 'erc1155'">
              <b-avatar rounded variant="light" size="3.0rem" :src="data.item.image" v-b-popover.hover="'ERC-721 collection'"></b-avatar>
            </div>
            <div v-else-if="data.item.type == 'eoa' && data.item.account != ensOrAccount(data.item.account)">
              <b-avatar rounded variant="light" size="3.0rem" :src="'https://metadata.ens.domains/mainnet/avatar/' + ensOrAccount(data.item.account)" v-b-popover.hover="'ENS avatar if set'"></b-avatar>
            </div>
            <div v-else-if="data.item.type == 'erc20'">
              <b-avatar rounded variant="light" size="3.0rem" :src="'https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/ethereum/assets/' + data.item.account + '/logo.png'" v-b-popover.hover="'ERC-20 logo if available'"></b-avatar>
            </div>
          </template>
          <template #cell(account)="data">
            <b-link class="sm" :id="'popover-target-' + data.item.account">
              {{ data.item.account }}
            </b-link>
            <br />
            <font size="-1">
              <div class="d-flex flex-row">
                <div class="m-0 pt-1 pr-1">
                  <span v-if="settings.editMappings">
                    <b-form-select size="sm" v-model="data.item.type" @change="setAccountInfoField(data.item.account, 'type', $event)" :options="accountTypes" v-b-popover.hover.top="'Select type'"></b-form-select>
                  </span>
                  <span v-if="!settings.editMappings">
                    <b-badge variant="info" v-b-popover.hover="'Account type'">{{ data.item.type }}</b-badge>
                  </span>
                </div>
                <div v-if="data.item.mine || settings.editMappings" class="m-0 pt-1 pr-1">
                  <span v-if="settings.editMappings">
                    <b-form-checkbox size="sm" :checked="data.item.mine ? 1 : 0" value="1" @change="toggleAccountInfoField(data.item.account, 'mine')" v-b-popover.hover="'My account?'">Mine</b-form-checkbox>
                  </span>
                  <span v-if="!settings.editMappings">
                    <b-badge v-if="data.item.mine" variant="primary" v-b-popover.hover="'My account'">Mine</b-badge>
                  </span>
                </div>
                <div v-if="data.item.sync || settings.editMappings" class="m-0 pt-1 pr-1">
                  <span v-if="settings.editMappings">
                    <b-form-checkbox size="sm" :checked="data.item.sync ? 1 : 0" value="1" @change="toggleAccountInfoField(data.item.account, 'sync')" v-b-popover.hover="'Include in sync process?'">Sync</b-form-checkbox>
                  </span>
                  <span v-if="!settings.editMappings">
                    <b-badge v-if="data.item.sync" variant="primary" v-b-popover.hover="'Will be included in the sync process'">Sync</b-badge>
                  </span>
                </div>
                <div v-if="data.item.report || settings.editMappings" class="m-0 pt-1 pr-1">
                  <span v-if="settings.editMappings">
                    <b-form-checkbox size="sm" :checked="data.item.report ? 1 : 0" value="1" @change="toggleAccountInfoField(data.item.account, 'report')" v-b-popover.hover="'Include in report?'">Report</b-form-checkbox>
                  </span>
                  <span v-if="!settings.editMappings">
                    <b-badge v-if="data.item.report" variant="primary" v-b-popover.hover="'Will be included in the report'">Report</b-badge>
                  </span>
                </div>
                <div v-if="data.item.junk || settings.editMappings" class="m-0 pt-1 pr-1">
                  <span v-if="settings.editMappings">
                    <b-form-checkbox size="sm" :checked="data.item.junk ? 1 : 0" value="1" @change="toggleAccountInfoField(data.item.account, 'junk')" v-b-popover.hover="'Junk?'">Junk</b-form-checkbox>
                  </span>
                  <span v-if="!settings.editMappings">
                    <b-badge v-if="data.item.junk" pill variant="warning" v-b-popover.hover="'Account and transactions will be marked as junk for filtering'">junk</b-badge>
                  </span>
                </div>
                <div class="m-0 pt-1 pr-1">
                  <span v-if="data.item.type != 'preerc721' && data.item.type != 'erc721' && data.item.type != 'erc1155'">
                    <b-badge v-if="hasENS(data.item.account)" variant="secondary" v-b-popover.hover="'ENS name if set'">{{ ensOrNull(data.item.account) }}</b-badge>
                  </span>
                  <span v-if="data.item.type == 'preerc721' || data.item.type == 'erc721' || data.item.type == 'erc1155'">
                    <b-badge variant="secondary" v-b-popover.hover="'ERC-721 collection name'">{{ data.item.name }}</b-badge>
                  </span>
                  <span v-if="data.item.type == 'erc20'">
                    <b-badge variant="secondary" v-b-popover.hover="'ERC-20 collection name'">{{ data.item.contract && (data.item.contract.symbol + ' - ' + data.item.contract.name) || '???' }}</b-badge>
                  </span>
                </div>
                <div class="m-0 pt-1 pr-1">
                  <span v-if="settings.editMappings">
                    <b-form-input type="text" size="sm" v-model.trim="data.item.group" @change="setAccountInfoField(data.item.account, 'group', data.item.group)" debounce="600" placeholder="group"></b-form-input>
                  </span>
                  <span v-if="!settings.editMappings">
                    <b-badge v-if="data.item.group && data.item.group.length > 0" variant="dark" v-b-popover.hover="'Group'">{{ data.item.group }}</b-badge>
                  </span>
                </div>
              </div>
            </font>
            <b-popover :target="'popover-target-' + data.item.account" placement="right" custom-class="popover-max-width">
              <template #title>
                <span v-if="data.item.type != 'erc721' && data.item.type != 'erc1155'">
                  {{ ensOrAccount(data.item.account) }}
                </span>
                <span v-if="data.item.type == 'erc721' || data.item.type == 'erc1155'">
                  {{ data.item.name }}
                </span>
              </template>
              <span v-if="data.item.type != 'erc721' && data.item.type != 'erc1155'">
                <b-link @click="copyToClipboard(data.item.account);">Copy account to clipboard</b-link>
                <br />
                <span v-if="ensOrNull(data.item.account) != null && ensOrNull(data.item.account).length > 0">
                  <b-link @click="copyToClipboard(ensOrNull(data.item.account));">Copy ENS name to clipboard</b-link>
                  <br />
                  <b-link :href="'https://app.ens.domains/name/' + ensOrNull(data.item.account)" target="_blank">View ENS name in app.ens.domains</b-link>
                  <br />
                </span>
                <b-link :href="'https://etherscan.io/address/' + data.item.account" target="_blank">View account in etherscan.io</b-link>
                <br />
                <b-link :href="'https://opensea.io/' + data.item.account" target="_blank">View account in opensea.io</b-link>
                <br />
                <b-link :href="'https://opensea.io/' + data.item.account + '?tab=bids'" target="_blank">View offers received in opensea.io</b-link>
                <br />
                <b-link :href="'https://looksrare.org/accounts/' + data.item.account + '#owned'" target="_blank">View account in looksrare.org</b-link>
                <br />
                <b-link :href="'https://x2y2.io/user/' + data.item.account + '/items'" target="_blank">View account in x2y2.io</b-link>
                <br />
                <b-link :href="'https://www.gem.xyz/profile/' + data.item.account" target="_blank">View account in gem.xyz</b-link>
                <br />
                <b-link :href="'https://blur.io/' + data.item.account" target="_blank">View account in blur.io</b-link>
                <br />
              </span>
              <span v-if="data.item.type == 'erc721' || data.item.type == 'erc1155'">
                <b-link @click="copyToClipboard(data.item.account);">Copy ERC-721 NFT collection address to clipboard</b-link>
                <br />
                <b-link :href="'https://etherscan.io/token/' + data.item.account + '#balances'" target="_blank">View ERC-721 NFT collection in etherscan.io</b-link>
                <br />
                <b-link :href="'https://opensea.io/collection/' + data.item.slug" target="_blank">View ERC-721 NFT collection in opensea.io</b-link>
                <br />
                <b-link :href="'https://looksrare.org/collections/' + data.item.account" target="_blank">View ERC-721 NFT collection in looksrare.org</b-link>
                <br />
                <b-link :href="'https://x2y2.io/collection/' + data.item.slug + '/items'" target="_blank">View ERC-721 NFT collection in x2y2.io</b-link>
                <br />
                <b-link :href="'https://www.gem.xyz/collection/' + data.item.slug" target="_blank">View ERC-721 NFT collection in gem.xyz</b-link>
                <br />
                <b-link :href="'https://blur.io/collection/' + data.item.slug" target="_blank">View ERC-721 NFT collection in blur.io</b-link>
                <br />
              </span>
            </b-popover>
            <span v-if="settings.editMappings">
              <br />
              <b-button size="sm" @click="deleteAccountAndAccountInfo(data.item.account);" variant="link" v-b-popover.hover.top="'Delete account?'"><b-icon-trash shift-v="+1" font-scale="1.2"></b-icon-trash></b-button>
            </span>
          </template>
          <template #cell(name)="data">
            <span v-if="settings.editMappings">
              <b-form-input type="text" size="sm" v-model.trim="data.item.name" @change="setAccountInfoField(data.item.account, 'name', data.item.name)" debounce="600" placeholder="name"></b-form-input>
              <b-form-textarea size="sm" v-model.trim="data.item.notes" @change="setAccountInfoField(data.item.account, 'notes', data.item.notes)" placeholder="notes" rows="2" max-rows="20" class="mt-1"></b-form-textarea>
            </span>
            <span v-if="!settings.editMappings">
              {{ data.item.name }}
              <br />
              <font size="-1">
                {{ data.item.notes }}
              </font>
            </span>
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
        accountTypeFilter: null,
        myAccountsFilter: null,
        junkFilter: null,
        showAdditionalFilters: false,
        editMappings: false,
        newAccounts: null,
        selectedAccounts: {},
        selectedFunctionSelector: null,
        currentPage: 1,
        pageSize: 10,
        sortOption: 'accountasc',
        version: 1,
      },
      accountTypes: [
        { value: null, text: '(unknown)' },
        { value: 'eoa', text: 'EOA' },
        { value: 'contract', text: 'Contract' },
        { value: 'erc721', text: 'ERC-721' },
        { value: 'erc1155', text: 'ERC-1155' },
        { value: 'erc20', text: 'ERC-20' },
        { value: 'exchangewallet', text: 'Exchange Wallet' },
        { value: 'erc20exchange', text: 'ERC-20 Exchange' },
        { value: 'nftexchange', text: 'NFT Exchange' },
      ],
      accountTypeFilters: [
        { value: null, text: '(all)' },
        { value: 'eoa', text: 'EOA' },
        { value: 'contract', text: 'Contract' },
        { value: 'preerc721', text: 'pre ERC-721' },
        { value: 'erc721', text: 'ERC-721' },
        { value: 'erc1155', text: 'ERC-1155' },
        { value: 'erc20', text: 'ERC-20' },
        { value: 'exchangewallet', text: 'Exchange Wallet' },
        { value: 'erc20exchange', text: 'ERC-20 Exchange' },
        { value: 'nftexchange', text: 'NFT Exchange' },
        { value: 'unknown', text: '(unknown)' },
      ],
      myAccountsFilterOptions: [
        { value: null, text: 'All Accounts' },
        { value: 'mine', text: 'My Accounts' },
        { value: 'notmine', text: 'Not My Accounts' },
      ],
      sortOptions: [
        { value: 'accountasc', text: '▲ Account' },
        { value: 'accountdsc', text: '▼ Account' },
        { value: 'groupasc', text: '▲ Group, ▲ Name' },
        { value: 'groupdsc', text: '▼ Group, ▲ Name' },
        { value: 'nameasc', text: '▲ Name, ▲ Group' },
        { value: 'namedsc', text: '▼ Name, ▲ Group' },
      ],
      pageSizes: [
        { value: 1, text: '1' },
        { value: 5, text: '5' },
        { value: 10, text: '10' },
        { value: 25, text: '25' },
        { value: 50, text: '50' },
        { value: 100, text: '100' },
        { value: 500, text: '500' },
        { value: 1000, text: '1k' },
        { value: 2500, text: '2.5k' },
        { value: 10000, text: '10k' },
      ],
      functionSelectorFields: [
        { key: 'number', label: '#', sortable: false, thStyle: 'width: 5%;', thClass: 'text-right', tdClass: 'text-right' },
        { key: 'functionSelector', label: 'Function Selector', sortable: true, thStyle: 'width: 15%;', tdClass: 'text-truncate' },
        { key: 'functionCall', label: 'Function Call', sortable: true, thStyle: 'width: 70%;' },
        { key: 'accountCount', label: '#acc', sortable: true, thStyle: 'width: 5%;', thClass: 'text-right', tdClass: 'text-right' },
        { key: 'txCount', label: '#txs', sortable: true, thStyle: 'width: 5%;', thClass: 'text-right', tdClass: 'text-right' },
      ],
      accountsFields: [
        { key: 'number', label: '#', sortable: false, thStyle: 'width: 5%;', tdClass: 'text-truncate' },
        { key: 'image', label: '', sortable: false, thStyle: 'width: 5%;', thClass: 'text-right', tdClass: 'text-right' },
        { key: 'account', label: 'Account', sortable: false, thStyle: 'width: 35%;', tdClass: 'text-truncate' },
        // { key: 'type', label: 'Type', sortable: false, thStyle: 'width: 10%;', tdClass: 'text-truncate' },
        // { key: 'mine', label: 'Mine', sortable: false, thStyle: 'width: 10%;', tdClass: 'text-truncate' },
        // { key: 'ens', label: 'ENS', sortable: false, thStyle: 'width: 10%;', tdClass: 'text-truncate' },
        // { key: 'group', label: 'Group', sortable: false, thStyle: 'width: 10%;', tdClass: 'text-truncate' },
        { key: 'name', label: 'Name', sortable: false, thStyle: 'width: 45%;', tdClass: 'text-truncate' },
        // { key: 'notes', label: 'Notes', sortable: false, thStyle: 'width: 30%;', tdClass: 'text-truncate' },
        { key: 'end', label: 'Info', sortable: false, thStyle: 'width: 10%;', thClass: 'text-right', tdClass: 'text-right' },
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
    block() {
      return store.getters['connection/block'];
    },
    accounts() {
      return store.getters['data/accounts'];
    },
    accountsInfo() {
      return store.getters['data/accountsInfo'];
    },
    functionSelectors() {
      return store.getters['data/functionSelectors'];
    },
    processFilters() {
      return store.getters['config/processFilters'];
    },
    mappings() {
      return store.getters['data/mappings'];
    },
    txs() {
      return store.getters['data/txs'];
    },
    assets() {
      return store.getters['data/assets'];
    },
    ensMap() {
      return store.getters['data/ensMap'];
    },
    report() {
      return store.getters['report/report'];
    },
    sync() {
      return store.getters['data/sync'];
    },
    coinbaseIncluded() {
      return this.accounts[this.coinbase] && true || false;
    },
    totalMappings() {
      return Object.keys(this.mappings).length;
    },
    collatedFunctionSelectors() {
      const results = [];
      const collator = {};
      for (const [account, accountData] of Object.entries(this.accounts)) {
        const accountsInfo = this.accountsInfo[account] || {};
        if (accountsInfo.mine && accountsInfo.report) {
          // results.push(account);
          console.log("--- Processing " + account + " ---");
          const txHashesByBlocks = getTxHashesByBlocks(account, this.accounts, this.accountsInfo, this.processFilters);
          for (const [blockNumber, txHashes] of Object.entries(txHashesByBlocks)) {
            for (const [index, txHash] of Object.keys(txHashes).entries()) {
              const txData = this.txs[txHash] || null;
              if (txData) {
                let functionSelector = null;
                let functionCall = null;
                if (txData.tx.to == null) {
                  functionSelector = "(contract creation)";
                  functionCall = "(contract creation)";
                } else if (txData.tx.data.length >= 10) {
                  functionSelector = txData.tx.data.substring(0, 10);
                  functionCall = this.functionSelectors[functionSelector] && this.functionSelectors[functionSelector].length > 0 && this.functionSelectors[functionSelector][0] || functionSelector;
                } else if (txData.tx.data.length > 2) {
                  functionSelector = txData.tx.data;
                  functionCall = functionSelector;
                } else {
                  functionSelector = "(none)";
                  functionCall = "(none)";
                }
                console.log("  " + functionSelector + " " + functionCall);
                if (!(functionSelector in collator)) {
                  collator[functionSelector] = {
                    functionCall,
                    txCount: 0,
                    accounts: {},
                  };
                }
                const a = txData.tx.to || "(account creation)";
                if (!(a in collator[functionSelector].accounts)) {
                  collator[functionSelector].accounts[a] = [];
                }
                collator[functionSelector].accounts[a].push(txHash);
                collator[functionSelector].txCount++;
              }
            }
          }
        }
      }
      for (const [functionSelector, someData] of Object.entries(collator)) {
        results.push({ functionSelector, functionCall: someData.functionCall, txCount: someData.txCount, accounts: someData.accounts });
      }
      return results;
    },
    allFunctionSelectors() {
      const results = [];
      for (const item of this.collatedFunctionSelectors) {
        results.push({ functionSelector: item.functionSelector, functionCall: item.functionCall, txCount: item.txCount, accountCount: Object.keys(item.accounts).length, accounts: item.accounts });
      }
      return results;
    },
    filteredMappings() {
      const results = [];
      // const filterLower = this.settings.filter && this.settings.filter.toLowerCase() || null;
      // results.push({ functionSelector: 'BLah', type: "nft", action: "sold", defaultTxTag: "nft-sales", accountsFilter: [ { name: "a", includeOrExclude: "i" }, { name: "b", includeOrExclude: "j" } ], require: { ft: ">0", "nfts": ">0" } });
      // for (const [account, accountData] of Object.entries(this.accounts)) {
      //   const accountInfo = this.accountsInfo[account] || {};
      //   const ensName = this.ensMap[account] || null;
      //   const accountName = accountInfo.name || accountData.name || null;
      //   let include = filterLower == null ||
      //     (account.toLowerCase().includes(filterLower)) ||
      //     (accountName.toLowerCase().includes(filterLower)) ||
      //     (accountInfo.group && accountInfo.group.toLowerCase().includes(filterLower)) ||
      //     (accountInfo.notes && accountInfo.notes.toLowerCase().includes(filterLower)) ||
      //     (ensName != null && ensName.toLowerCase().includes(filterLower));
      //   if (include && this.settings.myAccountsFilter != null) {
      //     if (this.settings.myAccountsFilter == 'mine' && accountInfo.mine) {
      //     } else if (this.settings.myAccountsFilter == 'notmine' && !accountInfo.mine) {
      //     } else {
      //       include = false;
      //     }
      //   }
      //   if (include && this.settings.accountTypeFilter != null) {
      //     const accountType = accountInfo.type || accountData.type || null;
      //     if (this.settings.accountTypeFilter == 'unknown' && accountInfo.type == null) {
      //     } else if (this.settings.accountTypeFilter == accountType) {
      //     } else {
      //       include = false;
      //     }
      //   }
      //   if (include && this.settings.junkFilter) {
      //     if (this.settings.junkFilter == 'junk' && !accountInfo.junk) {
      //       include = false;
      //     } else if (this.settings.junkFilter == 'excludejunk' && accountInfo.junk) {
      //       include = false;
      //     }
      //   }
      //   if (include) {
      //     results.push({
      //       account,
      //       group: accountInfo.group,
      //       name: accountName,
      //       type: accountInfo.type || accountData.type,
      //       slug: accountInfo.slug || accountData.slug,
      //       image: accountInfo.image || accountData.image,
      //       mine: accountInfo.mine,
      //       sync: accountInfo.sync,
      //       report: accountInfo.report,
      //       junk: accountInfo.junk,
      //       tags: accountInfo.tags,
      //       notes: accountInfo.notes,
      //       created: accountData.created,
      //       updated: accountData.updated,
      //     });
      //   }
      // }
      return results;
    },
    filteredSortedMappings() {
      const results = this.filteredMappings;
      if (this.settings.sortOption == 'accountasc') {
        results.sort((a, b) => {
          return ('' + a.account).localeCompare(b.account);
        });
      } else if (this.settings.sortOption == 'accountdsc') {
        results.sort((a, b) => {
          return ('' + b.account).localeCompare(a.account);
        });
      } else if (this.settings.sortOption == 'groupasc') {
        results.sort((a, b) => {
          if (('' + a.group).localeCompare(b.group) == 0) {
            if (('' + a.name).localeCompare(b.name) == 0) {
              return ('' + a.account).localeCompare(b.account);
            } else {
              return ('' + a.name).localeCompare(b.name);
            }
          } else {
            return ('' + a.group).localeCompare(b.group);
          }
        });
      } else if (this.settings.sortOption == 'groupdsc') {
        results.sort((a, b) => {
          if (('' + a.group).localeCompare(b.group) == 0) {
            if (('' + a.name).localeCompare(b.name) == 0) {
              return ('' + a.account).localeCompare(b.account);
            } else {
              return ('' + a.name).localeCompare(b.name);
            }
          } else {
            return ('' + b.group).localeCompare(a.group);
          }
        });
      } else if (this.settings.sortOption == 'nameasc') {
        results.sort((a, b) => {
          if (('' + a.name).localeCompare(b.name) == 0) {
            if (('' + a.group).localeCompare(b.group) == 0) {
              return ('' + a.account).localeCompare(b.account);
            } else {
              return ('' + a.group).localeCompare(b.group);
            }
          } else {
            return ('' + a.name).localeCompare(b.name);
          }
        });
      } else if (this.settings.sortOption == 'namedsc') {
        results.sort((a, b) => {
          if (('' + a.name).localeCompare(b.name) == 0) {
            if (('' + a.group).localeCompare(b.group) == 0) {
              return ('' + a.account).localeCompare(b.account);
            } else {
              return ('' + a.group).localeCompare(b.group);
            }
          } else {
            return ('' + b.name).localeCompare(a.name);
          }
        });
      }
      return results;
    },
    pagedFilteredSortedMappings() {
      return this.filteredSortedMappings.slice((this.settings.currentPage - 1) * this.settings.pageSize, this.settings.currentPage * this.settings.pageSize);
    },
  },
  methods: {
    saveSettings() {
      localStorage.mappingsSettings = JSON.stringify(this.settings);
    },
    functionSelectorSelected(item) {
      // console.log("functionSelectorSelected: " + JSON.stringify(item));
      this.settings.selectedFunctionSelector = item.length > 0 ? item[0] : null;
      // if (item && item.length > 0) {
      //   this.settings.selectedFunctionSelector = this.settings.selectedFunctionSelector != null ? null : item[0].functionSelector;
      //
      //   // this.selectedPool = this.selectedPool != null ? null : item[0].address;
      //   // for (const setName of ['validTokenIdsInPool', 'validTokenIdsOwned']) {
      //   //   Vue.set(this.selectedTokens, setName, {});
      //   // }
      // }
    },
    addNewAccounts() {
      store.dispatch('data/addNewAccounts', this.settings.newAccounts);
    },
    addCoinbase() {
      store.dispatch('data/addNewAccounts', this.coinbase);
    },
    toggleSelectedAccounts(items) {
      let someFalse = false;
      let someTrue = false;
      for (const item of items) {
        if (this.settings.selectedAccounts[item.account]) {
          someTrue = true;
        } else {
          someFalse = true;
        }
      }
      for (const item of items) {
        if (!(someTrue && !someFalse)) {
          Vue.set(this.settings.selectedAccounts, item.account, true);
        } else {
          Vue.delete(this.settings.selectedAccounts, item.account);
        }
      }
      this.saveSettings();
    },
    clearSelectedAccounts() {
      this.settings.selectedAccounts = {};
      this.saveSettings();
    },
    async toggleAccountInfoField(account, field) {
      store.dispatch('data/toggleAccountInfoField', { account, field });
    },
    async setAccountInfoField(account, field, value) {
      store.dispatch('data/setAccountInfoField', { account, field, value });
    },
    async deleteAccountAndAccountInfo(account) {
      store.dispatch('data/deleteAccountAndAccountInfo', account);
    },
    async syncIt(info) {
      store.dispatch('data/syncIt', info);
    },
    async syncItNew(info) {
      store.dispatch('data/syncItNew', info);
    },
    async halt() {
      store.dispatch('data/setSyncHalt', true);
    },
    ensOrAccount(account, length = 0) {
      let result = null;
      if (this.ensMap && account in this.ensMap) {
        result = this.ensMap[account];
      }
      if (result == null || result.length == 0) {
        result = account;
      }
      return result == null || result.length == 0 ? null : (length == 0 ? result : result.substring(0, length));
    },
    hasENS(account) {
      if (this.ensMap && account in this.ensMap) {
        result = this.ensMap[account];
        if (result != account) {
          return true;
        }
      }
      return false;
    },
    ensOrNull(account, length = 0) {
      let result = null;
      if (this.ensMap && account in this.ensMap) {
        result = this.ensMap[account];
        if (result == account) {
          result = null;
        }
      }
      return result == null || result.length == 0 ? null : (length == 0 ? result : result.substring(0, length));
    },
    copyToClipboard(str) {
      // https://github.com/30-seconds/30-seconds-of-code/blob/master/snippets/copyToClipboard.md
      const el = document.createElement('textarea');
      el.value = str;
      el.setAttribute('readonly', '');
      el.style.position = 'absolute';
      el.style.left = '-9999px';
      document.body.appendChild(el);
      const selected =
        document.getSelection().rangeCount > 0
          ? document.getSelection().getRangeAt(0)
          : false;
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      if (selected) {
        document.getSelection().removeAllRanges();
        document.getSelection().addRange(selected);
      }
    },
    exportAccounts() {
      console.log("exportAccounts");
      const rows = [
          ["No", "Account", "Type", "Mine", "ENSName", "Group", "Name", "Notes"],
      ];
      let i = 1;
      for (const result of this.filteredSortedMappings) {
        rows.push([
          i,
          result.account,
          result.type,
          result.mine ? "y" : "n",
          this.ensMap[result.account] || null,
          result.group,
          result.name,
          result.notes,
        ]);
        i++;
      }
      let csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
      var encodedUri = encodeURI(csvContent);
      var link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "txs_account_export-" + moment().format("YYYY-MM-DD-HH-mm-ss") + ".csv");
      document.body.appendChild(link); // Required for FF
      link.click(); // This will download the data with the specified file name
    },
    async timeoutCallback() {
      logDebug("Mappings", "timeoutCallback() count: " + this.count);
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
    logDebug("Mappings", "beforeDestroy()");
  },
  mounted() {
    logDebug("Mappings", "mounted() $route: " + JSON.stringify(this.$route.params));
    store.dispatch('data/restoreState');
    store.dispatch('report/restoreState');
    if ('mappingsSettings' in localStorage) {
      const tempSettings = JSON.parse(localStorage.mappingsSettings);
      if ('version' in tempSettings && tempSettings.version == 1) {
        this.settings = tempSettings;
        this.settings.currentPage = 1;
      }
    }
    this.reschedule = true;
    logDebug("Mappings", "Calling timeoutCallback()");
    this.timeoutCallback();
  },
  destroyed() {
    this.reschedule = false;
  },
};

const mappingsModule = {
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
