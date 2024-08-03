const NonFungibles = {
  template: `
    <div class="m-0 p-0">
      <b-card no-body no-header class="border-0">
        <!-- <b-icon-eye-slash shift-v="+1" font-scale="1.0"></b-icon-eye-slash> -->
        <!-- <b-icon-eye-slash-fill shift-v="+1" font-scale="1.0"></b-icon-eye-slash-fill> -->

        <!-- :MODALFAUCETS -->
        <b-modal ref="modalfaucet" id="modal-faucets" hide-footer body-bg-variant="light" size="md">
          <template #modal-title>ERC-721 Faucets</template>
          <b-form-select size="sm" v-model="modalFaucet.selectedFaucet" :options="faucetsOptions" v-b-popover.hover.ds500="'Select faucet'"></b-form-select>
          <b-button size="sm" block :disabled="!modalFaucet.selectedFaucet" @click="drip()" variant="warning" class="mt-2">Drip {{ modalFaucet.selectedFaucet && faucets.filter(e => e.address == modalFaucet.selectedFaucet)[0] ? (faucets.filter(e => e.address == modalFaucet.selectedFaucet)[0].drip + ' Tokens') : '' }}</b-button>
        </b-modal>

        <div class="d-flex flex-wrap m-0 p-0">
          <div class="mt-0 pr-1">
            <b-button size="sm" :pressed.sync="settings.sidebar" @click="saveSettings" variant="transparent" v-b-popover.hover.ds500="'Show sidebar'"><b-icon :icon="settings.sidebar ? 'layout-sidebar-inset' : 'layout-sidebar'" font-scale="1.1" variant="primary"></b-icon></b-button>
          </div>
          <div class="mt-0 pr-1" style="width: 200px;">
            <b-form-input type="text" size="sm" v-model.trim="settings.filter" @change="saveSettings" debounce="600" v-b-popover.hover.ds500="'Regex filter by name, description or tokenId'" placeholder="🔍 name/desc/id regex"></b-form-input>
          </div>
          <div class="mt-0 pr-1">
            <b-dropdown size="sm" variant="link" v-b-popover.hover.ds500="'Junk filter'">
              <template #button-content>
                <span v-if="settings.junkFilter == 'excludejunk'">
                  <b-iconstack font-scale="1">
                    <b-icon stacked icon="trash" variant="info" scale="0.75"></b-icon>
                    <b-icon stacked icon="slash-circle" variant="danger"></b-icon>
                  </b-iconstack>
                </span>
                <span v-else-if="settings.junkFilter == null">
                  <b-iconstack font-scale="1">
                    <b-icon stacked icon="circle-fill" variant="warning"></b-icon>
                    <b-icon stacked icon="trash" variant="info" scale="0.75"></b-icon>
                  </b-iconstack>
                </span>
                <span v-else>
                  <b-iconstack font-scale="1">
                    <b-icon stacked icon="trash" variant="info" scale="0.75"></b-icon>
                  </b-iconstack>
                </span>
              </template>
              <b-dropdown-item href="#" @click="settings.junkFilter = 'excludejunk'; saveSettings()">
                <b-iconstack font-scale="1">
                  <b-icon stacked icon="trash" variant="info" scale="0.75"></b-icon>
                  <b-icon stacked icon="slash-circle" variant="danger"></b-icon>
                </b-iconstack>
                Exclude Junk
              </b-dropdown-item>
              <b-dropdown-item href="#" @click="settings.junkFilter = null; saveSettings()">
                <b-iconstack font-scale="1">
                  <b-icon stacked icon="circle-fill" variant="warning"></b-icon>
                  <b-icon stacked icon="trash" variant="info" scale="0.75"></b-icon>
                </b-iconstack>
                Include Junk
              </b-dropdown-item>
              <b-dropdown-item href="#" @click="settings.junkFilter = 'junk'; saveSettings()">
                <b-iconstack font-scale="1">
                  <b-icon stacked icon="trash" variant="info" scale="0.75"></b-icon>
                </b-iconstack>
                Junk
              </b-dropdown-item>
            </b-dropdown>
          </div>
          <div class="mt-0 pr-1">
            <b-button size="sm" :pressed.sync="settings.activeOnly" @click="saveSettings" variant="transparent" v-b-popover.hover.ds500="'Show active only'"><b-icon :icon="settings.activeOnly ? 'check-circle-fill' : 'check-circle'" font-scale="1.1" variant="primary"></b-icon></b-button>
          </div>
          <div class="mt-0 flex-grow-1">
          </div>
          <div class="mt-0 pr-1">
            <b-button size="sm" @click="viewFaucets" variant="link" v-b-popover.hover.ds500="'Drip tokens from ERC-20 and ERC-721 faucets'"><b-icon-plus shift-v="+1" font-scale="1.0"></b-icon-plus></b-button>
          </div>
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
            <font size="-2" v-b-popover.hover.ds500="'# tokens / total tokens transferred'">{{ filteredSortedItems.length + '/' + items.length }}</font>
          </div>
          <div class="mt-0 pr-1">
            <b-pagination size="sm" v-model="settings.currentPage" @input="saveSettings" :total-rows="filteredSortedItems.length" :per-page="settings.pageSize" style="height: 0;"></b-pagination>
          </div>
          <div class="mt-0 pl-1">
            <b-form-select size="sm" v-model="settings.pageSize" @change="saveSettings" :options="pageSizes" v-b-popover.hover.ds500="'Page size'"></b-form-select>
          </div>
          <div class="mt-0 pl-1">
            <b-dropdown size="sm" variant="link" v-b-popover.hover.ds500="'View'" right>
              <template #button-content>
                <span v-if="settings.viewOption == 'list'">
                  <b-iconstack font-scale="1">
                    <b-icon stacked icon="list" variant="primary" scale="0.75"></b-icon>
                  </b-iconstack>
                </span>
                <span v-else-if="settings.viewOption == 'detailedlist'">
                <b-iconstack font-scale="1">
                  <b-icon stacked icon="list-ol" variant="primary" scale="0.75"></b-icon>
                </b-iconstack>
                </span>
                <span v-else>
                  <b-iconstack font-scale="1">
                    <b-icon stacked icon="grid3x3-gap" variant="primary" scale="0.75"></b-icon>
                  </b-iconstack>
                </span>
              </template>
              <b-dropdown-item href="#" @click="settings.viewOption = 'list'; saveSettings()">
                <b-iconstack font-scale="1">
                  <b-icon stacked icon="list" variant="primary" scale="0.75"></b-icon>
                </b-iconstack>
                List
              </b-dropdown-item>
              <b-dropdown-item href="#" @click="settings.viewOption = 'detailedlist'; saveSettings()">
                <b-iconstack font-scale="1">
                  <b-icon stacked icon="list-ol" variant="primary" scale="0.75"></b-icon>
                </b-iconstack>
                Detailed list
              </b-dropdown-item>
              <b-dropdown-item href="#" @click="settings.viewOption = 'icons'; saveSettings()">
                <b-iconstack font-scale="1">
                  <b-icon stacked icon="grid3x3-gap" variant="primary" scale="0.75"></b-icon>
                </b-iconstack>
                Icons
              </b-dropdown-item>
            </b-dropdown>
          </div>
        </div>

        <b-row class="m-0 p-0">
          <b-col v-if="settings.sidebar" cols="2" class="m-0 mr-1 p-0 border-0">
            <b-card no-header no-body class="m-0 p-0 border-0">
              <b-card-body class="m-0 p-1" style="flex-grow: 1; max-height: 2000px; overflow-y: auto;">
                <b-card header-class="m-0 px-1 py-1 pb-0" body-class="p-0" class="m-0 p-0 border-0">
                  <template #header>
                    <b-input-group v-if="settings.showOwnerFilter">
                      <b-form-input type="text" size="sm" v-model.trim="settings.ownerFilter" @change="saveSettings" debounce="600" placeholder="Owner" class="border-0 m-0 p-0 px-2"></b-form-input>
                      <b-input-group-append>
                        <b-button size="sm" :pressed.sync="settings.showOwnerFilter" @click="saveSettings" variant="transparent" v-b-popover.hover.ds500="'Show owner filter'"><b-icon :icon="settings.showOwnerFilter ? 'chevron-up' : 'chevron-down'" font-scale="1.1" variant="primary"></b-icon></b-button>
                      </b-input-group-append>
                    </b-input-group>
                    <div v-if="!settings.showOwnerFilter" class="d-flex flex-wrap m-0 p-0">
                      <div class="mt-0 pr-1">
                        Owners
                      </div>
                      <div class="mt-0 flex-grow-1">
                      </div>
                      <div class="mt-0 pl-1">
                        <b-button size="sm" :pressed.sync="settings.showOwnerFilter" @click="saveSettings" variant="transparent" v-b-popover.hover.ds500="'Show owner filter'"><b-icon :icon="settings.showOwnerFilter ? 'chevron-up' : 'chevron-down'" font-scale="1.1" variant="primary"></b-icon></b-button>
                      </div>
                    </div>
                  </template>
                  <font v-if="settings.showOwnerFilter" size="-2">
                    <b-table small fixed striped sticky-header="200px" :fields="ownersFields" :items="ownersWithCounts" head-variant="light" class="mt-1">
                      <template #cell(select)="data">
                        <b-form-checkbox size="sm" :checked="settings.selectedOwners[chainId] && settings.selectedOwners[chainId][data.item.owner]" @change="ownersFilterChange(data.item.owner)"></b-form-checkbox>
                      </template>
                      <template #cell(owner)="data">
                        <span v-b-popover.hover.ds500="data.item.owner">
                        {{ names[data.item.owner] || (data.item.owner.substring(0, 8) + '...' + data.item.owner.slice(-6)) }}
                        </span>
                      </template>
                      <template #cell(items)="data">
                        <span v-b-popover.hover.ds500="data.item.counts + ' including copies'">{{ data.item.items }}</span>
                      </template>
                    </b-table>
                  </font>
                </b-card>
                <b-card header-class="m-0 mt-1 px-1 py-1 pb-0" body-class="p-0" class="m-0 p-0 border-0">
                  <template #header>
                    <b-input-group v-if="settings.showcollectionFilter">
                      <b-form-input type="text" size="sm" v-model.trim="settings.collectionFilter" @change="saveSettings" debounce="600" placeholder="Collection" class="border-0 m-0 p-0 px-2"></b-form-input>
                      <b-input-group-append>
                        <b-button size="sm" :pressed.sync="settings.showcollectionFilter" @click="saveSettings" variant="transparent" v-b-popover.hover.ds500="'Show owner filter'"><b-icon :icon="settings.showcollectionFilter ? 'chevron-up' : 'chevron-down'" font-scale="1.1" variant="primary"></b-icon></b-button>
                      </b-input-group-append>
                    </b-input-group>
                    <div v-if="!settings.showcollectionFilter" class="d-flex flex-wrap m-0 p-0">
                      <div class="mt-0 pr-1">
                        Collections
                      </div>
                      <div class="mt-0 flex-grow-1">
                      </div>
                      <div class="mt-0 pl-1">
                        <b-button size="sm" :pressed.sync="settings.showcollectionFilter" @click="saveSettings" variant="transparent" v-b-popover.hover.ds500="'Show collection filter'"><b-icon :icon="settings.showcollectionFilter ? 'chevron-up' : 'chevron-down'" font-scale="1.1" variant="primary"></b-icon></b-button>
                      </div>
                    </div>
                  </template>
                  <font v-if="settings.showcollectionFilter" size="-2">
                    <b-table small fixed striped sticky-header="800px" :fields="collectionsFields" :items="collectionsWithCounts" head-variant="light" class="mt-1">
                      <template #cell(select)="data">
                        <b-form-checkbox size="sm" :checked="settings.selectedCollections[chainId] && settings.selectedCollections[chainId][data.item.contract]" @change="collectionsFilterChange(data.item.contract)"></b-form-checkbox>
                      </template>
                      <template #cell(collection)="data">
                        <b-link v-if="data.item.collection" :href="'https://opensea.io/collection/' + data.item.slug" target="_blank">
                          {{ data.item.collection }}
                        </b-link>
                        <b-link v-else :href="explorer + 'token/' + data.item.contract"  v-b-popover.hover.ds500="data.item.contract" target="_blank">
                          {{ data.item.contract.substring(0, 8) + '...' + data.item.contract.slice(-6) }}
                        </b-link>
                      </template>
                      <template #cell(items)="data">
                        <span v-b-popover.hover.ds500="data.item.counts + ' including copies'">{{ data.item.items }}</span>
                      </template>
                    </b-table>
                  </font>
                </b-card>
                <b-card header-class="m-0 mt-1 px-1 py-1 pb-0" body-class="p-0" class="m-0 p-0 border-0">
                  <template #header>
                    <div class="d-flex flex-wrap m-0 p-0">
                      <div class="mt-0 pr-1">
                        ENS
                      </div>
                      <div class="mt-0 flex-grow-1">
                      </div>
                      <div class="mt-0 pl-1">
                        <b-button size="sm" :pressed.sync="settings.showENSFilter" @click="saveSettings" variant="transparent" v-b-popover.hover.ds500="'Show ENS filter'"><b-icon :icon="settings.showENSFilter ? 'chevron-up' : 'chevron-down'" font-scale="1.1" variant="primary"></b-icon></b-button>
                      </div>
                    </div>
                  </template>
                  <div v-if="settings.showENSFilter" class="mt-1">
                    <b-form-select size="sm" v-model="settings.ensDateOption" @change="saveSettings" :options="ensDateOptions"></b-form-select>
                  </div>
                </b-card>
              </b-card-body>
            </b-card>
          </b-col>
          <b-col class="m-0 p-0">
            <b-table v-if="settings.viewOption == 'list' || settings.viewOption == 'detailedlist'" ref="tokenContractsTable" small fixed striped responsive hover selectable select-mode="single" @row-selected='rowSelected' :fields="settings.viewOption == 'list' ? listFields : detailedListfields" :items="pagedFilteredSortedItems" show-empty head-variant="light" class="m-0 mt-1">
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

              <template #head(number)="data">
                <b-dropdown size="sm" variant="link" v-b-popover.hover.ds500="'Toggle selection'">
                  <template #button-content>
                    <b-icon-check-square shift-v="+1" font-scale="0.9"></b-icon-check-square>
                  </template>
                  <b-dropdown-item href="#" @click="toggleSelected(pagedFilteredSortedItems)">Toggle selection for all tokens on this page</b-dropdown-item>
                  <!-- <b-dropdown-item href="#" @click="toggleSelected(filteredSortedAccounts)">Toggle selection for all tokens on all pages</b-dropdown-item> -->
                  <b-dropdown-item href="#" @click="clearSelected()">Clear selection</b-dropdown-item>
                  <b-dropdown-divider></b-dropdown-divider>
                  <b-dropdown-item href="#" @click="refreshSelectedNonFungibles()"><b-icon-cloud-download shift-v="+1" font-scale="1.1" variant="primary"></b-icon-cloud-download> Refresh metadata for selected tokens from Reservoir</b-dropdown-item>
                  <b-dropdown-item href="#" @click="requestSelectedReservoirMetadataRefresh()" v-b-popover.hover.ds500="'Use this if Reservoir does not have the correct metadata. Wait a few minutes then repeat selection above'"><b-icon-cloud-fill shift-v="+1" font-scale="1.1" variant="primary"></b-icon-cloud-fill> Request Reservoir API to refresh their metadata for selected tokens</b-dropdown-item>
                </b-dropdown>
              </template>

              <template #cell(number)="data">
                <b-form-checkbox size="sm" :checked="settings.selected[data.item.contract] && settings.selected[data.item.contract][data.item.tokenId]" @change="toggleSelected([data.item])">
                  <font size="-1">{{ parseInt(data.index) + ((settings.currentPage - 1) * settings.pageSize) + 1 }}</font>
                </b-form-checkbox>
              </template>

              <!-- <b-avatar button @click="toggleTrait(layer, trait.value)" rounded size="7rem" :src="getSVG(layer, trait.value)">
                <template v-if="selectedTraits[layer] && selectedTraits[layer][trait.value]" #badge><b-icon icon="check"></b-icon></template>
              </b-avatar> -->

              <template #cell(image)="data">
                <!-- <b-avatar v-if="data.item.image" button rounded fluid size="7rem" :src="data.item.image"> -->
                  <!-- <template v-if="selectedTraits[layer] && selectedTraits[layer][trait.value]" #badge><b-icon icon="check"></b-icon></template> -->
                <!-- </b-avatar> -->
                <b-img v-if="data.item.image" button rounded fluid size="7rem" :src="data.item.image">
                </b-img>
              </template>

              <template #cell(name)="data">
                <b-link v-if="networkSupported" :href="nonFungibleViewerURL(data.item.contract, data.item.tokenId)" target="_blank">
                  <span v-if="data.item.name">
                    <font size="-1">{{ data.item.name }}</font>
                  </span>
                  <span v-else>
                    <font size="-1">{{ '#' + (data.item.tokenId.length > 20 ? (data.item.tokenId.substring(0, 10) + '...' + data.item.tokenId.slice(-8)) : data.item.tokenId) }}</font>
                  </span>
                </b-link>
              </template>

              <template #cell(collection)="data">
                <b-link v-if="networkSupported" @click="viewTokenContract(data.item);" v-b-popover.hover.ds500="'View token contract'">
                  <font size="-1">{{ names[data.item.contract] || data.item.collection }}</font>
                </b-link>
              </template>

              <template #cell(info)="data">
                <b-link v-if="networkSupported" :href="nonFungibleViewerURL(data.item.contract, data.item.tokenId)" target="_blank">
                  <span v-if="data.item.name">
                    <font size="-1">{{ data.item.name }}</font>
                  </span>
                  <span v-else>
                    <font size="-1">{{ '#' + (data.item.tokenId.length > 20 ? (data.item.tokenId.substring(0, 10) + '...' + data.item.tokenId.slice(-8)) : data.item.tokenId) }}</font>
                  </span>
                </b-link>
                <br />
                <font size="-1">{{ data.item.description }}</font>
                <br />
                <b-link v-if="networkSupported" @click="viewTokenContract(data.item);" v-b-popover.hover.ds500="'View token contract'">
                  <font size="-1">{{ names[data.item.contract] || data.item.collection }}</font>
                </b-link>

                <!-- <b-button size="sm" @click="viewTokenContract(data.item);" variant="transparent"  v-b-popover.hover.ds500="'View Token Contract'" class="m-0 ml-1 p-0"> -->
                <font size="-1">
                  <b-badge variant="light">
                    {{ data.item.type == "erc721" ? "ERC-721" : "ERC-1155" }}
                  </b-badge>
                </font>
                <!-- </b-button> -->
                <b-button size="sm" @click="toggleNonFungibleJunk(data.item);" variant="transparent" v-b-popover.hover.ds500="data.item.junk ? 'Junk collection' : 'Not junk collection'" class="m-0 ml-1 p-0">
                  <b-icon :icon="data.item.junk ? 'trash-fill' : 'trash'" font-scale="1.2" :variant="data.item.junk ? 'primary' : 'secondary'">
                  </b-icon>
                </b-button>
                <b-button size="sm" :disabled="data.item.junk" @click="toggleNonFungibleActive(data.item);" variant="transparent" v-b-popover.hover.ds500="data.item.active ? 'Token active' : 'Token inactive'" class="m-0 ml-1 p-0">
                  <b-icon :icon="data.item.active & !data.item.junk ? 'check-circle-fill' : 'check-circle'" font-scale="1.2" :variant="(data.item.junk || !data.item.active) ? 'secondary' : 'primary'">
                  </b-icon>
                </b-button>
              </template>

              <template #cell(expiry)="data">
                <font size="-1">{{ formatTimestamp(data.item.expiry) }}</font>
              </template>

              <template #cell(owners)="data">
                <div v-for="(info, i) in data.item.owners"  v-bind:key="i" class="m-0 p-0">
                  <b-link :href="explorer + 'address/' + info.owner" v-b-popover.hover.ds500="info.owner" target="_blank">
                    <font size="-1">
                      {{ names[info.owner] || (info.owner.substring(0, 8) + '...' + info.owner.slice(-6)) }}
                      <span v-if="data.item.type == 'erc1155' && info.count > 1" class="small muted">
                        {{ 'x' + info.count }}
                      </span>
                    </font>
                  </b-link>
                </div>
              </template>

              <template #cell(attributes)="data">
                <b-row v-for="(attribute, i) in data.item.attributes" v-bind:key="i" class="m-0 p-0">
                  <b-col cols="6" class="m-0 p-0 px-2 text-right"><font size="-3">{{ attribute.trait_type }}</font></b-col>
                  <b-col cols="6" class="m-0 p-0 px-2 truncate"><b><font size="-2">{{ ["Created Date", "Registration Date", "Expiration Date"].includes(attribute.trait_type) ? formatTimestamp(attribute.value) : attribute.value }}</font></b></b-col>
                </b-row>
              </template>

              <!-- <template #cell(favourite)="data"> -->
                <!-- <b-button size="sm" @click="toggleNonFungibleActive(data.item);" variant="transparent"><b-icon :icon="data.item.favourite ? 'heart-fill' : 'heart'" font-scale="0.9" variant="danger"></b-icon></b-button> -->
              <!-- </template> -->
            </b-table>

            <b-card-group v-if="settings.viewOption == 'icons'" deck class="m-1 p-1">
              <div v-for="record in pagedFilteredSortedItems">
                <b-card body-class="p-1" header-class="p-1" footer-class="p-1" img-top class="m-1 p-0 border-0" >
                  <b-link :href="nonFungibleViewerURL(record.contract, record.tokenId)" target="_blank">
                    <b-img-lazy v-if="record.image" width="200%" height="200%" :src="record.image">
                    </b-img-lazy>
                  </b-link>
                  <b-card-text>
                    <div class="d-flex justify-content-between m-0 p-0" style="max-width: 13rem;">
                      <div class="mt-0 pr-1 truncate">
                        <b-link v-if="networkSupported" @click="viewToken(record);" v-b-popover.hover.ds500="'View token'">
                          <font size="-1">{{ record.name }}</font>
                        </b-link>
                      </div>
                    </div>
                    <div class="d-flex justify-content-between m-0 p-0" style="max-width: 13rem;">
                      <div class="mt-0 pr-1 truncate">
                        <b-link v-if="networkSupported" @click="viewTokenContract(record);" v-b-popover.hover.ds500="'View token contract'">
                          <font size="-1">{{ names[record.contract] || record.collection }}</font>
                        </b-link>
                      </div>
                    </div>
                    <div class="d-flex justify-content-between m-0 p-0">
                      <div class="mt-0 pr-1">
                        <div v-for="(info, i) in record.owners"  v-bind:key="i" class="m-0 p-0">
                          <b-link :href="explorer + 'address/' + info.owner"  v-b-popover.hover.ds500="info.owner" target="_blank">
                            <font size="-1">
                              {{ names[info.owner] || (info.owner.substring(0, 8) + '...' + info.owner.slice(-6)) }}
                              <span v-if="record.type == 'erc1155' && info.count > 1" class="small muted">
                                {{ 'x' + info.count }}
                              </span>
                            </font>
                          </b-link>
                        </div>
                      </div>
                    </div>
                  </b-card-text>
                </b-card>
              </div>
            </b-card-group>

          </b-col>
        </b-row>
      </b-card>
    </div>
  `,
  data: function () {
    return {
      count: 0,
      reschedule: true,
      settings: {
        sidebar: false,
        viewOption: 'list',
        filter: null,
        showOwnerFilter: false,
        ownerFilter: null,
        showcollectionFilter: false,
        collectionFilter: null,
        showENSFilter: false,
        ensDateOption: null,
        junkFilter: null,
        activeOnly: false,
        selectedOwners: {},
        selectedCollections: {},
        selected: {},
        currentPage: 1,
        pageSize: 10,
        sortOption: 'collectionasc',
        version: 9,
      },
      transfer: {
        item: null,
        stealthPrivateKey: null,
      },
      modalFaucet: {
        selectedFaucet: null,
      },
      sortOptions: [
        // { value: 'nameregistrantasc', text: '▲ Name, ▲ Registrant' },
        // { value: 'nameregistrantdsc', text: '▼ Name, ▲ Registrant' },
        { value: 'collectionasc', text: '▲ Collection' },
        { value: 'collectiondsc', text: '▼ Collection' },
        { value: 'nameasc', text: '▲ Name' },
        { value: 'namedsc', text: '▼ Name' },
        { value: 'expiryasc', text: '▲ Expiry' },
        { value: 'expirydsc', text: '▼ Expiry' },
      ],
      ensDateOptions: [
        { value: null, text: 'Unfiltered' },
        { value: 'all', text: 'All' },
        { value: 'active', text: 'Active' },
        { value: 'grace', text: 'Grace Period' },
        { value: 'expired', text: 'Expired' },
        { value: 'expiry1m', text: 'Expiry <= 1m' },
        { value: 'expiry3m', text: 'Expiry <= 3m' },
        { value: 'expiry1y', text: 'Expiry <= 1y' },
        { value: 'expiry1yp', text: 'Expiry > 1y' },
      ],
      listFields: [
        { key: 'number', label: '#', sortable: false, thStyle: 'width: 7%;', tdClass: 'text-truncate' },
        // { key: 'image', label: 'Image', sortable: false, thStyle: 'width: 10%;', thClass: 'text-right', tdClass: 'text-right' },
        { key: 'name', label: 'Name', sortable: false, thStyle: 'width: 30%;', thClass: 'text-left', tdClass: 'text-truncate' },
        { key: 'collection', label: 'Collection', sortable: false, thStyle: 'width: 30%;', thClass: 'text-left', tdClass: 'text-truncate' },
        // { key: 'info', label: 'Info', sortable: false, thStyle: 'width: 30%;', thClass: 'text-left', tdClass: 'text-truncate' },
        { key: 'expiry', label: 'Expiry', sortable: false, thStyle: 'width: 13%;', thClass: 'text-left', tdClass: 'text-truncate' },
        { key: 'owners', label: 'Owner(s)', sortable: false, thStyle: 'width: 10%;', thClass: 'text-left', tdClass: 'text-truncate' },
        // { key: 'attributes', label: 'Attributes', sortable: false, thStyle: 'width: 30%;', thClass: 'text-left', tdClass: 'text-truncate' },
      ],
      detailedListfields: [
        { key: 'number', label: '#', sortable: false, thStyle: 'width: 7%;', tdClass: 'text-truncate' },
        { key: 'image', label: 'Image', sortable: false, thStyle: 'width: 10%;', thClass: 'text-right', tdClass: 'text-right' },
        { key: 'info', label: 'Info', sortable: false, thStyle: 'width: 30%;', thClass: 'text-left', tdClass: 'text-truncate' },
        { key: 'expiry', label: 'Expiry', sortable: false, thStyle: 'width: 13%;', thClass: 'text-left', tdClass: 'text-truncate' },
        { key: 'owners', label: 'Owner(s)', sortable: false, thStyle: 'width: 10%;', thClass: 'text-left', tdClass: 'text-truncate' },
        { key: 'attributes', label: 'Attributes', sortable: false, thStyle: 'width: 30%;', thClass: 'text-left', tdClass: 'text-truncate' },
      ],
      ownersFields: [
        { key: 'select', label: '', thStyle: 'width: 10%;' },
        { key: 'owner', label: 'Owner', sortable: true },
        { key: 'items', label: 'Items', sortable: true, thStyle: 'width: 25%;', thClass: 'text-right', tdClass: 'text-right' },
      ],
      collectionsFields: [
        { key: 'select', label: '', thStyle: 'width: 10%;' },
        { key: 'collection', label: 'Collection', sortable: true },
        { key: 'items', label: 'Items', sortable: true, thStyle: 'width: 25%;', thClass: 'text-right', tdClass: 'text-right' },
      ],
    }
  },
  computed: {
    coinbase() {
      return store.getters['connection/coinbase'];
    },
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
    nonFungibleViewer() {
      return store.getters['connection/nonFungibleViewer'];
    },
    sync() {
      return store.getters['data/sync'];
    },
    pageSizes() {
      return store.getters['config/pageSizes'];
    },
    addresses() {
      return store.getters['data/addresses'];
    },
    registry() {
      return store.getters['data/registry'];
    },
    balances() {
      return store.getters['data/balances'];
    },
    tokens() {
      return store.getters['data/tokens'];
    },
    expiries() {
      return store.getters['data/expiries'];
    },
    names() {
      return store.getters['data/names'];
    },
    faucets() {
      return FAUCETS && FAUCETS[this.chainId];
    },
    faucetsOptions() {
      const results = [];
      if (FAUCETS && FAUCETS[this.chainId]) {
        results.push({ value: null, text: '(select a faucet)' });
        for (const item of FAUCETS[this.chainId]) {
          if (item.type == "erc721") {
            results.push({
              value: item.address,
              text: item.drip + " x " + (item.type == "erc20" ? "ERC-20 " : "ERC-721 ") + item.symbol + ' ' + item.name + (item.type == "erc20" ? " (" + item.decimals + " dp)" : "") + ' @ ' + item.address.substring(0, this.ADDRESS_SEGMENT_LENGTH + 2) + '...' + item.address.slice(-this.ADDRESS_SEGMENT_LENGTH),
            });
          }
        }
      }
      return results;
    },

    owners() {
      const results = (store.getters['data/forceRefresh'] % 2) == 0 ? {} : {};
      for (const [address, addressData] of Object.entries(this.addresses)) {
        // TODO: Remove "address" check
        if (address.substring(0, 2) == "0x" && !addressData.junk && addressData.watch) {
          results[address] = true;
        }
      }
      return results;
    },
    items() {
      const results = (store.getters['data/forceRefresh'] % 2) == 0 ? [] : [];
      for (const [contract, data] of Object.entries(this.balances[this.chainId] || {})) {
        if (data.type == "erc721" || data.type == "erc1155") {
          for (const [tokenId, tokenData] of Object.entries(data.tokens)) {
            const junk = this.tokens[this.chainId] && this.tokens[this.chainId][contract] && this.tokens[this.chainId][contract].junk || false;
            const tokenContractMetadata = this.tokens[this.chainId] && this.tokens[this.chainId][contract] || {};
            const tokenMetadata = this.tokens[this.chainId] && this.tokens[this.chainId][contract] && this.tokens[this.chainId][contract].tokens[tokenId] || {};
            let image = null;
            if (tokenMetadata.image) {
              if (tokenMetadata.image.substring(0, 12) == "ipfs://ipfs/") {
                image = "https://ipfs.io/" + tokenMetadata.image.substring(7)
              } else if (tokenMetadata.image.substring(0, 7) == "ipfs://") {
                image = "https://ipfs.io/ipfs/" + tokenMetadata.image.substring(7);
              } else {
                image = tokenMetadata.image;
              }
            }
            const owners = [];
            if (data.type == "erc721") {
              if (tokenData in this.owners) {
                owners.push({ owner: tokenData });
              }
            } else {
              for (const [owner, count] of Object.entries(tokenData)) {
                if (owner in this.owners) {
                  owners.push({ owner, count });
                }
              }
            }
            if (owners.length > 0) {
              const expiry = (contract == ENS_ERC721_ADDRESS || contract == ENS_ERC1155_ADDRESS) && this.expiries[this.chainId] && this.expiries[this.chainId][contract] && this.expiries[this.chainId][contract][tokenId] || null;
              results.push({
                chainId: this.chainId,
                contract,
                type: data.type,
                symbol: tokenContractMetadata.symbol,
                collection: tokenContractMetadata.name,
                slug: tokenContractMetadata.slug,
                junk,
                active: tokenMetadata.active,
                totalSupply: data.totalSupply,
                tokenId,
                owners,
                name: tokenMetadata.name || null,
                description: tokenMetadata.description || null,
                expiry,
                attributes: tokenMetadata.attributes || null,
                // imageSource: tokenMetadata.imageSource || null,
                image,
                // blockNumber: tokenData.blockNumber,
                // logIndex: tokenData.logIndex,
                lastSale: tokenMetadata.lastSale,
                price: tokenMetadata.price,
                topBid: tokenMetadata.topBid,
              });
            }
          }
        }
      }
      return results;
    },
    ownersWithCounts() {
      let regex = null;
      if (this.settings.ownerFilter != null && this.settings.ownerFilter.length > 0) {
        try {
          regex = new RegExp(this.settings.ownerFilter, 'i');
        } catch (e) {
          console.log("ownersWithCounts - regex error: " + e.message);
          regex = new RegExp(/thequickbrowndogjumpsoverthelazyfox/, 'i');
        }
      }
      const collator = {};
      for (const item of this.items) {
        for (const o of item.owners) {
          const [ owner, count ] = [ o.owner, item.type == "erc721" ? 1 : o.count ];
          if (owner in collator) {
            collator[owner] = [ parseInt(collator[owner][0]) + 1, parseInt(collator[owner][1]) + parseInt(count) ];
          } else {
            collator[owner] = [1, count];
          }
        }
      }
      const results = [];
      for (const [owner, info] of Object.entries(collator)) {
        if (!regex || regex.test(owner) || (this.ens[owner] && regex.test(this.ens[owner]))) {
          results.push({ owner, items: info[0], counts: info[1] });
        }
      }
      return results;
    },
    collectionsWithCounts() {
      let regex = null;
      if (this.settings.collectionFilter != null && this.settings.collectionFilter.length > 0) {
        try {
          regex = new RegExp(this.settings.collectionFilter, 'i');
        } catch (e) {
          console.log("collectionsWithCounts - regex error: " + e.message);
          regex = new RegExp(/thequickbrowndogjumpsoverthelazyfox/, 'i');
        }
      }
      const collator = {};
      for (const item of this.items) {
        for (const o of item.owners) {
          const [ owner, count ] = [ o.owner, item.type == "erc721" ? 1 : o.count ];
          if (item.contract in collator) {
            collator[item.contract][0] = parseInt(collator[item.contract][0]) + 1;
            collator[item.contract][1] = parseInt(collator[item.contract][1]) + parseInt(count);
          } else {
            collator[item.contract] = [1, count, item.symbol, item.collection, item.slug ];
          }
        }
      }
      const results = [];
      for (const [contract, info] of Object.entries(collator)) {
        if (!regex || regex.test(contract) || regex.test(info[2]) || regex.test(info[3])) {
          results.push({ contract, symbol: info[2], collection: info[3], slug: info[4], items: info[0], counts: info[1] });
        }
      }
      results.sort((a, b) => {
        return ('' + a.collection).localeCompare(b.collection);
      });
      return results;
    },
    filteredItems() {
      const results = (store.getters['data/forceRefresh'] % 2) == 0 ? [] : [];
      let regex = null;
      if (this.settings.filter != null && this.settings.filter.length > 0) {
        try {
          regex = new RegExp(this.settings.filter, 'i');
        } catch (e) {
          console.log("filteredItems - regex error: " + e.message);
          regex = new RegExp(/thequickbrowndogjumpsoverthelazyfox/, 'i');
        }
      }
      const selectedOwners = Object.keys(this.settings.selectedOwners[this.chainId] || {}).length > 0 ? this.settings.selectedOwners[this.chainId] : null;
      const selectedCollections = Object.keys(this.settings.selectedCollections[this.chainId] || {}).length > 0 ? this.settings.selectedCollections[this.chainId] : null;
      const ensOnly = this.settings.ensDateOption != null;
      const graceFrom = moment().subtract(90, 'days').unix();
      const expiry1m = moment().add(1, 'months').unix();
      const expiry3m = moment().add(3, 'months').unix();
      const expiry1y = moment().add(1, 'years').unix();
      let dateFrom = null;
      let dateTo = null;
      if (this.settings.ensDateOption) {
        if (this.settings.ensDateOption == "active") {
          dateFrom = graceFrom;
        } else if (this.settings.ensDateOption == "grace") {
          dateFrom = graceFrom;
          dateTo = moment().unix();
        } else if (this.settings.ensDateOption == "expired") {
          dateTo = moment().unix();
        } else if (this.settings.ensDateOption == "expiry1m") {
          dateFrom = graceFrom;
          dateTo = expiry1m;
        } else if (this.settings.ensDateOption == "expiry3m") {
          dateFrom = graceFrom;
          dateTo = expiry3m;
        } else if (this.settings.ensDateOption == "expiry1y") {
          dateFrom = graceFrom;
          dateTo = expiry1y;
        } else if (this.settings.ensDateOption == "expiry1yp") {
          dateFrom = expiry1y;
        }
      }
      for (const item of this.items) {
        let include = true;
        if (this.settings.junkFilter) {
          if (this.settings.junkFilter == 'junk' && !item.junk) {
            include = false;
          } else if (this.settings.junkFilter == 'excludejunk' && item.junk) {
            include = false;
          }
        }
        if (include && ensOnly) {
          if (item.contract != ENS_ERC721_ADDRESS && item.contract != ENS_ERC1155_ADDRESS) {
            include = false;
          }
          if (include && dateFrom) {
            if (item.expiry < dateFrom) {
              include = false;
            }
          }
          if (include && dateTo) {
            if (item.expiry > dateTo) {
              include = false;
            }
          }
        }
        if (include && this.settings.activeOnly && (!item.active || item.junk)) {
          include = false;
        }
        if (include && regex) {
          if (!(regex.test(item.tokenId) || regex.test(item.name) || regex.test(item.description))) {
            include = false;
          }
        }
        if (include && selectedOwners) {
          let found = false;
          for (const o of item.owners) {
            if (o.owner in selectedOwners) {
              found = true;
              break;
            }
          }
          if (!found) {
            include = false;
          }
        }
        if (include && selectedCollections) {
          if (!(item.contract in selectedCollections)) {
            include = false;
          }
        }
        if (include) {
          results.push(item);
        }
      }
      return results;
    },
    filteredSortedItems() {
      const results = this.filteredItems;
      if (this.settings.sortOption == 'collectionasc') {
        results.sort((a, b) => {
          let compare = ('' + a.collection).localeCompare(b.collection);
          if (compare == 0) {
            compare = ('' + a.name).localeCompare(b.name);
          }
          return compare;
        });
      } else if (this.settings.sortOption == 'collectiondsc') {
        results.sort((a, b) => {
          let compare = ('' + b.collection).localeCompare(a.collection);
          if (compare == 0) {
            compare = ('' + b.name).localeCompare(a.name);
          }
          return compare;
        });
      } else if (this.settings.sortOption == 'nameasc') {
        results.sort((a, b) => {
          let compare = ('' + a.name).localeCompare(b.name);
          if (compare == 0) {
            compare = ('' + a.collection).localeCompare(b.collection);
          }
          return compare;
        });
      } else if (this.settings.sortOption == 'namedsc') {
        results.sort((a, b) => {
          let compare = ('' + b.name).localeCompare(a.name);
          if (compare == 0) {
            compare = ('' + b.collection).localeCompare(a.collection);
          }
          return compare;
        });
      } else if (this.settings.sortOption == 'expiryasc') {
        results.sort((a, b) => {
          const expiryA = a.expiry && a.expiry > 0 ? a.expiry : 1234567890123456789;
          const expiryB = b.expiry && b.expiry > 0 ? b.expiry : 1234567890123456789;
          return expiryA - expiryB;
        });
      } else if (this.settings.sortOption == 'expirydsc') {
        results.sort((a, b) => {
          const expiryA = a.expiry && a.expiry > 0 ? a.expiry : -1234567890123456789;
          const expiryB = b.expiry && b.expiry > 0 ? b.expiry : -1234567890123456789;
          return expiryB - expiryA;
        });
      }
      return results;
    },
    pagedFilteredSortedItems() {
      // console.log(now() + " INFO NonFungibles:computed.pagedFilteredSortedItems - results[0..1]: " + JSON.stringify(this.filteredSortedItems.slice(0, 2), null, 2));
      return this.filteredSortedItems.slice((this.settings.currentPage - 1) * this.settings.pageSize, this.settings.currentPage * this.settings.pageSize);
    },

  },
  methods: {
    nonFungibleViewerURL(contract, tokenId) {
      return this.nonFungibleViewer.replace(/\${contract}/, contract).replace(/\${tokenId}/, tokenId);
    },
    viewFaucets() {
      console.log(now() + " INFO NonFungibles:methods.viewFaucets");
      this.$bvModal.show('modal-faucets');
    },
    async drip() {
      console.log(now() + " INFO NonFungibles:methods.drip BEGIN: " + JSON.stringify(this.modalFaucet, null, 2));
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const faucetInfo = FAUCETS[this.chainId] && FAUCETS[this.chainId].filter(e => e.address == this.modalFaucet.selectedFaucet)[0] || null;
      if (faucetInfo) {
        console.log(now() + " INFO NonFungibles:methods.drip - faucetInfo: " + JSON.stringify(faucetInfo, null, 2));
        if (faucetInfo.type == "erc20") {
          try {
            const tx = await signer.sendTransaction({ to: faucetInfo.address, value: "0" });
            console.log(now() + " INFO NonFungibles:methods.drip ERC-20 - tx: " + JSON.stringify(tx));
          } catch (e) {
            console.log(now() + " ERROR NonFungibles:methods.drip ERC-20: " + JSON.stringify(e));
          }
        } else {
          const testToadzContract = new ethers.Contract(faucetInfo.address, TESTTOADZABI, provider);
          const testToadzContractWithSigner = testToadzContract.connect(provider.getSigner());
          try {
            const tx = await testToadzContractWithSigner.mint(3);
            console.log(now() + " INFO NonFungibles:methods.drip ERC-721 - tx: " + JSON.stringify(tx));
          } catch (e) {
            console.log(now() + " ERROR NonFungibles:methods.drip ERC-721: " + JSON.stringify(e));
          }
        }
      }
    },

    toggleNonFungibleJunk(item) {
      // console.log(now() + " INFO NonFungibles:methods.toggleNonFungibleJunk - item: " + JSON.stringify(item));
      store.dispatch('data/toggleNonFungibleJunk', item);
    },
    toggleNonFungibleActive(item) {
      // console.log(now() + " INFO NonFungibles:methods.toggleNonFungibleActive - item: " + JSON.stringify(item));
      store.dispatch('data/toggleNonFungibleActive', item);
    },

    toggleSelected(items) {
      console.log(now() + " INFO NonFungibles:methods.toggleSelected - items: " + JSON.stringify(items));
      let someFalse = false;
      let someTrue = false;
      for (const item of items) {
        if (this.settings.selected[item.contract] && this.settings.selected[item.contract][item.tokenId]) {
          someTrue = true;
        } else {
          someFalse = true;
        }
      }
      for (const item of items) {
        if (!(someTrue && !someFalse)) {
          if (!(item.contract in this.settings.selected)) {
            Vue.set(this.settings.selected, item.contract, {});
          }
          if (!(item.tokenId in this.settings.selected[item.contract])) {
            Vue.set(this.settings.selected[item.contract], item.tokenId, true);
          }
        } else {
          Vue.delete(this.settings.selected[item.contract], item.tokenId);
          if (Object.keys(this.settings.selected[item.contract]) == 0) {
            Vue.delete(this.settings.selected, item.contract);
          }
        }
      }
      // console.log(now() + " INFO NonFungibles:methods.toggleSelected - this.settings.selected: " + JSON.stringify(this.settings.selected));
      this.saveSettings();
    },
    clearSelected() {
      this.settings.selected = {};
      this.saveSettings();
    },

    ownersFilterChange(owner) {
      if (!(this.chainId in this.settings.selectedOwners)) {
        Vue.set(this.settings.selectedOwners, this.chainId, {});
      }
      if (this.settings.selectedOwners[this.chainId][owner]) {
        Vue.delete(this.settings.selectedOwners[this.chainId], owner);
      } else {
        Vue.set(this.settings.selectedOwners[this.chainId], owner, true);
      }
      // console.log(now() + " INFO NonFungibles:methods.ownersFilterChange: " + JSON.stringify(this.settings.selectedOwners));
      this.saveSettings();
    },
    collectionsFilterChange(contract) {
      if (!(this.chainId in this.settings.selectedCollections)) {
        Vue.set(this.settings.selectedCollections, this.chainId, {});
      }
      if (this.settings.selectedCollections[this.chainId][contract]) {
        Vue.delete(this.settings.selectedCollections[this.chainId], contract);
      } else {
        Vue.set(this.settings.selectedCollections[this.chainId], contract, true);
      }
      // console.log(now() + " INFO NonFungibles:methods.collectionsFilterChange: " + JSON.stringify(this.settings.selectedCollections));
      this.saveSettings();
    },

    refreshSelectedNonFungibles() {
      console.log(now() + " INFO NonFungibles:methods.refreshSelectedNonFungibles");
      const selectedTokens = [];
      for (const token of this.pagedFilteredSortedItems) {
        console.log(JSON.stringify(token));
        if (this.settings.selected[token.contract] && this.settings.selected[token.contract][token.tokenId]) {
          selectedTokens.push(token);
        }
      }
      console.log(now() + " INFO NonFungibles:methods.refreshSelectedNonFungibles - selectedTokens: " + JSON.stringify(selectedTokens));
      store.dispatch('data/refreshNonFungibleMetadata', selectedTokens);
    },
    requestSelectedReservoirMetadataRefresh() {
      console.log(now() + " INFO NonFungibles:methods.requestSelectedReservoirMetadataRefresh");
      const selectedTokens = [];
      for (const token of this.pagedFilteredSortedItems) {
        console.log(JSON.stringify(token));
        if (this.settings.selected[token.contract] && this.settings.selected[token.contract][token.tokenId]) {
          selectedTokens.push(token);
        }
      }
      console.log(now() + " INFO NonFungibles:methods.requestSelectedReservoirMetadataRefresh - selectedTokens: " + JSON.stringify(selectedTokens));
      store.dispatch('data/requestReservoirMetadataRefresh', selectedTokens);
    },

    copyToClipboard(str) {
      navigator.clipboard.writeText(str);
    },
    formatETH(e, precision = 0) {
      try {
        if (precision == 0) {
          return e ? ethers.utils.formatEther(e).replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",") : null;
        } else {
          return e ? parseFloat(parseFloat(ethers.utils.formatEther(e)).toFixed(precision)) : null;
        }
      } catch (err) {
      }
      return e.toFixed(precision);
    },
    formatDecimals(e, decimals = 18) {
      return e ? ethers.utils.formatUnits(e, decimals).replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",") : null;
    },
    saveSettings() {
      // console.log(now() + " INFO NonFungibles:methods.saveSettings - nonFungiblesSettings: " + JSON.stringify(this.settings));
      localStorage.nonFungiblesSettings = JSON.stringify(this.settings);
    },
    async viewSyncOptions() {
      store.dispatch('syncOptions/viewSyncOptions');
    },
    async halt() {
      store.dispatch('data/setSyncHalt', true);
    },
    newTransfer(stealthMetaAddress = null) {
      store.dispatch('newTransfer/newTransfer', stealthMetaAddress);
    },
    getTokenType(address) {
      if (address == ADDRESS_ETHEREUMS) {
        return "eth";
      } else {
        // TODO: ERC-20 & ERC-721
        return address.substring(0, 10) + '...' + address.slice(-8);
      }
    },
    formatTimestamp(ts) {
      if (ts != null) {
        if (ts > 1000000000000n) {
          ts = ts / 1000;
        }
        if (store.getters['config/settings'].reportingDateTime) {
          return moment.unix(ts).utc().format("YYYY-MM-DD HH:mm:ss");
        } else {
          return moment.unix(ts).format("YYYY-MM-DD HH:mm:ss");
        }
      }
      return null;
    },
    commify0(n) {
      if (n != null) {
        return Number(n).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
      }
      return null;
    },
    rowSelected(item) {
      // console.log(now() + " INFO NonFungibles:methods.rowSelected - item: " + JSON.stringify(item, null, 2));
      if (item && item.length > 0) {
        store.dispatch('viewNonFungible/viewNonFungible', { contract: item[0].contract, tokenId: item[0].tokenId, name: item[0].name });
        this.$refs.tokenContractsTable.clearSelected();
      }
    },
    viewTokenContract(item) {
      console.log(now() + " INFO NonFungibles:methods.viewTokenContract - item: " + JSON.stringify(item, null, 2));
      store.dispatch('viewTokenContract/viewTokenContract', { contract: item.contract, tokenId: item.tokenId });
    },
    viewToken(item) {
      console.log(now() + " INFO NonFungibles:methods.viewToken - item: " + JSON.stringify(item, null, 2));
      store.dispatch('viewNonFungible/viewNonFungible', { contract: item.contract, tokenId: item.tokenId, name: item.name });
    },


    async timeoutCallback() {
      // console.log(now() + " DEBUG NonFungibles:methods.timeoutCallback - count: " + this.count);
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
    // console.log(now() + " DEBUG NonFungibles:beforeDestroy");
  },
  mounted() {
    // console.log(now() + " DEBUG NonFungibles:mounted - $route: " + JSON.stringify(this.$route.params));
    store.dispatch('data/restoreState');
    if ('nonFungiblesSettings' in localStorage) {
      const tempSettings = JSON.parse(localStorage.nonFungiblesSettings);
      if ('version' in tempSettings && tempSettings.version == this.settings.version) {
        this.settings = tempSettings;
        this.settings.currentPage = 1;
      }
    }
    this.reschedule = true;
    // console.log(now() + " DEBUG NonFungibles:mounted - calling timeoutCallback()");
    this.timeoutCallback();
  },
  destroyed() {
    this.reschedule = false;
  },
};

const nonFungiblesModule = {
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
