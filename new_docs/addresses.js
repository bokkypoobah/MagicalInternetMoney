const Addresses = {
  template: `
    <div class="m-0 p-0">
      <b-card no-body no-header class="border-0">

        <b-modal ref="modalnewaddress" id="modal-newaddress" hide-footer body-bg-variant="light" size="lg">
          <template #modal-title>New Address</template>
          <b-form-group label="Action: " label-for="addnewaddress-type" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
            <b-form-select size="sm" id="addnewaddress-type" v-model="newAccount.action" @change="saveSettings" :options="newAccountActions" class="w-50"></b-form-select>
          </b-form-group>
          <b-form-group v-if="newAccount.action == 'generateStealthMetaAddress'" label="Phrase:" label-for="addnewaddress-phrase" label-size="sm" label-cols-sm="3" label-align-sm="right" description="This exact phrase with the linked address is required for the recovery of your stealth keys!" class="mx-0 my-1 p-0">
            <b-form-input size="sm" id="addnewaddress-phrase" v-model.trim="newAccount.phrase" @change="saveSettings" placeholder="enter phrase" class="w-75"></b-form-input>
          </b-form-group>
          <b-form-group v-if="newAccount.action == 'generateStealthMetaAddress'" label="" label-for="addnewaddress-generate" label-size="sm" label-cols-sm="3" label-align-sm="right" description="Click Generate and sign the phrase with your web3 attached account" class="mx-0 my-1 p-0">
            <b-button size="sm" :disabled="!coinbase" id="addnewaddress-generate" @click="generateNewStealthMetaAddress" variant="primary">Generate</b-button>
          </b-form-group>
          <b-form-group v-if="newAccount.action == 'addCoinbase'" label="Attached Web3 Address:" label-for="addnewaddress-coinbase" label-size="sm" label-cols-sm="3" label-align-sm="right" :state="addNewAddressCoinbaseFeedback == null" :invalid-feedback="addNewAddressCoinbaseFeedback" class="mx-0 my-1 p-0">
            <b-form-input size="sm" readonly id="addnewaddress-coinbase" :value="coinbase" class="w-75"></b-form-input>
          </b-form-group>
          <b-form-group v-if="newAccount.action == 'addAddress'" label="Address:" label-for="addnewaddress-address" label-size="sm" label-cols-sm="3" label-align-sm="right" :state="!newAccount.address || addNewAddressAddressFeedback == null" :invalid-feedback="addNewAddressAddressFeedback" class="mx-0 my-1 p-0">
            <b-form-input size="sm" id="addnewaddress-address" v-model.trim="newAccount.address" placeholder="0x1234...6789" class="w-75"></b-form-input>
          </b-form-group>
          <b-form-group v-if="newAccount.action == 'addStealthMetaAddress'" label="Stealth Meta-Address:" label-for="addnewaddress-stealthmetaaddress" label-size="sm" label-cols-sm="3" label-align-sm="right" :state="!newAccount.stealthMetaAddress || addNewAddressStealthMetaAddressFeedback == null" :invalid-feedback="addNewAddressStealthMetaAddressFeedback" class="mx-0 my-1 p-0">
            <b-form-textarea size="sm" id="addnewaddress-stealthmetaaddress" v-model.trim="newAccount.stealthMetaAddress" placeholder="st:eth:0x1234...6789" rows="3" max-rows="4" class="w-100"></b-form-textarea>
          </b-form-group>
          <b-form-group v-if="newAccount.action == 'addStealthMetaAddress'" label="Linked To Address:" label-for="addnewaddress-linkedtoaddress" label-size="sm" label-cols-sm="3" label-align-sm="right" :state="!newAccount.linkedToAddress || addNewAddressLinkedToFeedback == null" :invalid-feedback="addNewAddressLinkedToFeedback" class="mx-0 my-1 p-0">
            <b-form-input size="sm" id="addnewaddress-linkedtoaddress" v-model.trim="newAccount.linkedToAddress" placeholder="0x1234...6789" class="w-75"></b-form-input>
          </b-form-group>
          <b-form-group v-if="newAccount.action == 'generateStealthMetaAddress'" label="Generated Stealth Meta-Address:" label-for="addnewaddress-generatedstealthmetaaddress" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
            <b-form-textarea size="sm" readonly id="addnewaddress-generatedstealthmetaaddress" v-model.trim="newAccount.stealthMetaAddress" placeholder="Click generate and sign the phrase with your web3 attached wallet" rows="3" max-rows="4" class="w-75"></b-form-textarea>
          </b-form-group>
          <b-form-group v-if="newAccount.action == 'generateStealthMetaAddress'" label="Linked To Address:" label-for="addnewaddress-generatedlinkedtoaddress" label-size="sm" label-cols-sm="3" label-align-sm="right" description="Attached web3 address" class="mx-0 my-1 p-0">
            <b-form-input size="sm" readonly id="addnewaddress-coinbase" :value="newAccount.linkedToAddress" class="w-75"></b-form-input>
          </b-form-group>
          <b-form-group v-if="newAccount.action == 'addAddress' || newAccount.action == 'addStealthMetaAddress'" label="Mine:" label-for="addnewaddress-mine" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
            <b-button size="sm" id="addnewaddress-mine" :pressed.sync="newAccount.mine" @click="saveSettings" variant="transparent"><b-icon :icon="newAccount.mine ? 'star-fill' : 'star'" shift-v="+1" font-scale="0.95" :variant="newAccount.mine ? 'warning' : 'secondary'"></b-icon></b-button>
          </b-form-group>
          <b-form-group label="Favourite:" label-for="addnewaddress-favourite" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
            <b-button size="sm" id="addnewaddress-favourite" :pressed.sync="newAccount.favourite" @click="saveSettings" variant="transparent"><b-icon :icon="newAccount.favourite ? 'heart-fill' : 'heart'" shift-v="+1" font-scale="0.95" variant="danger"></b-icon></b-button>
          </b-form-group>
          <b-form-group label="Name:" label-for="addnewaddress-name" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
            <b-form-input size="sm" id="addnewaddress-name" v-model.trim="newAccount.name" @change="saveSettings" placeholder="optional" class="w-50"></b-form-input>
          </b-form-group>
          <b-form-group label="" label-for="addnewaddress-submit" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
            <b-button size="sm" :disabled="!!addNewAddressFeedback" id="addnewaddress-submit" @click="addNewAddress" variant="primary">Add/Update</b-button>
          </b-form-group>
        </b-modal>

        <b-modal ref="modaladdress" id="modal-address" hide-footer body-bg-variant="light" size="lg">
          <template #modal-title>{{ account.type == 'stealthAddress' ? 'Stealth Address' : 'Address' }}</template>
          <b-form-group label="Address:" label-for="address-address" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
            <b-input-group size="sm" class="w-100">
              <b-form-input size="sm" plaintext id="address-address" v-model.trim="account.account" class="px-2"></b-form-input>
              <b-input-group-append>
                <div>
                  <b-button size="sm" :href="'https://sepolia.etherscan.io/address/' + account.account" variant="link" v-b-popover.hover="'View in explorer'" target="_blank" class="m-0 ml-1 p-0"><b-icon-link45deg shift-v="+1" font-scale="0.95"></b-icon-link45deg></b-button>
                </div>
              </b-input-group-append>
            </b-input-group>
          </b-form-group>
          <b-form-group v-if="false" label="ENS Name:" label-for="address-ensname" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
            <b-form-input size="sm" plaintext id="address-ensname" v-model.trim="account.ensName" class="px-2 w-75"></b-form-input>
          </b-form-group>
          <b-form-group label="Name:" label-for="address-name" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
            <b-input-group size="sm" class="w-75">
              <b-form-input size="sm" type="text" id="address-name" v-model.trim="account.name" @update="setAddressField(account.account, 'name', account.name)" debounce="600" placeholder="optional"></b-form-input>
              <b-input-group-append>
                <div>
                  <b-button size="sm" :pressed.sync="account.mine" @click="toggleAddressField(account.account, 'mine')" variant="transparent" v-b-popover.hover="addressTypeInfo[account.type || 'address'].name" class="m-0 ml-5 p-0"><b-icon :icon="account.mine ? 'star-fill' : 'star'" shift-v="+1" font-scale="0.95" :variant="addressTypeInfo[account.type || 'address'].variant"></b-icon></b-button>
                  <b-button size="sm" :pressed.sync="account.favourite" @click="toggleAddressField(account.account, 'favourite')" variant="transparent" v-b-popover.hover="'Favourite?'" class="m-0 ml-1 p-0"><b-icon :icon="account.favourite ? 'heart-fill' : 'heart'" shift-v="+1" font-scale="0.95" variant="danger"></b-icon></b-button>
                </div>
              </b-input-group-append>
            </b-input-group>
          </b-form-group>
          <!-- <b-form-group label="Mine:" label-for="address-mine" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
            <b-button size="sm" id="address-mine" :pressed.sync="account.mine" @click="toggleAddressField(account.account, 'mine')" variant="transparent"><b-icon :icon="account.mine ? 'star-fill' : 'star'" shift-v="+1" font-scale="0.95" :variant="account.mine ? 'warning' : 'secondary'"></b-icon></b-button>
          </b-form-group> -->
          <!-- <b-form-group label="Favourite:" label-for="address-favourite" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
            <b-button size="sm" id="address-favourite" :pressed.sync="account.favourite" @click="toggleAddressField(account.account, 'favourite')" variant="transparent"><b-icon :icon="account.favourite ? 'heart-fill' : 'heart'" shift-v="+1" font-scale="0.95" variant="danger"></b-icon></b-button>
          </b-form-group> -->
          <b-form-group label="Notes:" label-for="address-notes" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
            <b-form-textarea size="sm" id="address-notes" v-model.trim="account.notes" @update="setAddressField(account.account, 'notes', account.notes)" debounce="600" placeholder="..." class="w-100"></b-form-textarea>
          </b-form-group>
          <b-form-group label="Source:" label-for="address-source" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
            <b-form-input size="sm" plaintext id="address-source" :value="account.source && (account.source.substring(0, 1).toUpperCase() + account.source.slice(1))" class="px-2 w-25"></b-form-input>
          </b-form-group>
          <b-form-group label="" label-for="address-delete" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
            <b-button size="sm" @click="deleteAddress(account.account, 'modaladdress');" variant="link" v-b-popover.hover.top="'Delete account?'"><b-icon-trash shift-v="+1" font-scale="1.1" variant="danger"></b-icon-trash></b-button>
          </b-form-group>
        </b-modal>

        <b-modal ref="modalstealthmetaccount" id="modal-stealthmetaccount" hide-footer body-bg-variant="light" size="lg">
          <template #modal-title>Stealth Meta-Address</template>
          <b-form-group label="Address:" label-for="stealthmetaddress-address" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
            <b-form-textarea size="sm" plaintext id="stealthmetaddress-address" v-model.trim="stealthMetaAccount.account" rows="3" max-rows="4" class="px-2"></b-form-textarea>
          </b-form-group>
          <b-form-group label="Name:" label-for="stealthmetaddress-name" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
            <b-input-group size="sm" class="w-75">
              <b-form-input size="sm" id="stealthmetaddress-name" v-model.trim="stealthMetaAccount.name" @update="setAddressField(stealthMetaAccount.account, 'name', stealthMetaAccount.name)" debounce="600" placeholder="optional" class="w-50"></b-form-input>
              <b-input-group-append>
                <div>
                  <b-button size="sm" :pressed.sync="stealthMetaAccount.mine" @click="toggleAddressField(stealthMetaAccount.account, 'mine')" variant="transparent" v-b-popover.hover="addressTypeInfo['stealthMetaAddress'].name" class="m-0 ml-5 p-0"><b-icon :icon="stealthMetaAccount.mine ? 'star-fill' : 'star'" shift-v="+1" font-scale="0.95" :variant="addressTypeInfo['stealthMetaAddress'].variant"></b-icon></b-button>
                  <b-button size="sm" :pressed.sync="stealthMetaAccount.favourite" @click="toggleAddressField(stealthMetaAccount.account, 'favourite')" variant="transparent" v-b-popover.hover="'Favourite?'" class="m-0 ml-1 p-0"><b-icon :icon="stealthMetaAccount.favourite ? 'heart-fill' : 'heart'" shift-v="+1" font-scale="0.95" variant="danger"></b-icon></b-button>
                </div>
              </b-input-group-append>
            </b-input-group>
          </b-form-group>
          <!-- <b-form-group label="Mine:" label-for="stealthmetaddress-mine" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
            <b-button size="sm" id="stealthmetaddress-mine" :pressed.sync="stealthMetaAccount.mine" @click="toggleAddressField(stealthMetaAccount.account, 'mine')" variant="transparent"><b-icon :icon="stealthMetaAccount.mine ? 'star-fill' : 'star'" shift-v="+1" font-scale="0.95" :variant="stealthMetaAccount.mine ? 'warning' : 'secondary'"></b-icon></b-button>
          </b-form-group> -->
          <!-- <b-form-group label="Favourite:" label-for="stealthmetaddress-favourite" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
            <b-button size="sm" id="stealthmetaddress-favourite" :pressed.sync="stealthMetaAccount.favourite" @click="toggleAddressField(stealthMetaAccount.account, 'favourite')" variant="transparent"><b-icon :icon="stealthMetaAccount.favourite ? 'heart-fill' : 'heart'" shift-v="+1" font-scale="0.95" variant="danger"></b-icon></b-button>
          </b-form-group> -->
          <b-form-group label="Notes:" label-for="stealthmetaddress-notes" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
            <b-form-textarea size="sm" id="stealthmetaddress-notes" v-model.trim="stealthMetaAccount.notes" @update="setAddressField(stealthMetaAccount.account, 'notes', stealthMetaAccount.notes)" debounce="600" placeholder="..." class="w-100"></b-form-textarea>
          </b-form-group>
          <b-form-group label="Linked To Address:" label-for="stealthmetaddress-linkedtoaddress" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
            <b-input-group size="sm" class="w-100">
              <b-form-input size="sm" plaintext id="stealthmetaddress-linkedtoaddress" v-model.trim="stealthMetaAccount.linkedToAddress" class="px-2"></b-form-input>
              <b-input-group-append>
                <div>
                  <b-button size="sm" :href="'https://sepolia.etherscan.io/address/' + stealthMetaAccount.linkedToAddress" variant="link" v-b-popover.hover="'View in explorer'" target="_blank" class="m-0 ml-1 p-0"><b-icon-link45deg shift-v="+1" font-scale="0.95"></b-icon-link45deg></b-button>
                </div>
              </b-input-group-append>
            </b-input-group>
          </b-form-group>
          <b-form-group v-if="stealthMetaAccount.phrase" label="Phrase:" label-for="stealthmetaddress-phrase" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
            <b-form-input size="sm" plaintext id="stealthmetaddress-phrase" v-model.trim="stealthMetaAccount.phrase" class="px-2 w-100"></b-form-input>
          </b-form-group>
          <b-form-group v-if="stealthMetaAccount.phrase" label="Spending Private Key:" label-for="stealthmetaddress-spendingprivatekey" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
            <b-input-group size="sm" class="w-100">
              <b-form-input :type="stealthMetaAccount.spendingPrivateKey ? 'text' : 'password'" size="sm" plaintext id="stealthmetaddress-spendingprivatekey" :value="stealthMetaAccount.spendingPrivateKey ? stealthMetaAccount.spendingPrivateKey : 'a'.repeat(65) + 'h'" class="px-2"></b-form-input>
              <b-input-group-append>
                <b-button v-if="!stealthMetaAccount.spendingPrivateKey" :disabled="stealthMetaAccount.linkedToAddress != coinbase" @click="revealModalAddressSpendingPrivateKey();" variant="link" class="m-0 ml-2 p-0"><b-icon-eye shift-v="+1" font-scale="1.1"></b-icon-eye></b-button>
                <!-- <b-button v-if="modalAddress.spendingPrivateKey" @click="copyToClipboard(modalAddress.spendingPrivateKey ? modalAddress.spendingPrivateKey : '*'.repeat(66));" variant="link" class="m-0 ml-2 p-0"><b-icon-clipboard shift-v="+1" font-scale="1.1"></b-icon-clipboard></b-button> -->
              </b-input-group-append>
            </b-input-group>
          </b-form-group>
          <b-form-group v-if="stealthMetaAccount.phrase" label="Viewing Private Key:" label-for="stealthmetaddress-viewingprivatekey" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
            <b-form-input size="sm" plaintext id="stealthmetaddress-viewingprivatekey" v-model.trim="stealthMetaAccount.viewingPrivateKey" class="px-2 w-100"></b-form-input>
          </b-form-group>
          <b-form-group v-if="stealthMetaAccount.phrase" label="Spending Public Key:" label-for="stealthmetaddress-spendingpublickey" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
            <b-form-input size="sm" plaintext id="stealthmetaddress-spendingpublickey" v-model.trim="stealthMetaAccount.spendingPublicKey" class="px-2 w-100"></b-form-input>
          </b-form-group>
          <b-form-group v-if="stealthMetaAccount.phrase" label="Viewing Public Key:" label-for="stealthmetaddress-viewingpublickey" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
            <b-form-input size="sm" plaintext id="stealthmetaddress-viewingpublickey" v-model.trim="stealthMetaAccount.viewingPublicKey" class="px-2 w-100"></b-form-input>
          </b-form-group>
          <b-form-group label="Source:" label-for="stealthmetaddress-source" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
            <b-form-input size="sm" plaintext id="stealthmetaddress-source" :value="stealthMetaAccount.source && (stealthMetaAccount.source.substring(0, 1).toUpperCase() + stealthMetaAccount.source.slice(1))" class="px-2 w-25"></b-form-input>
          </b-form-group>
          <b-form-group label="" label-for="address-delete" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
            <b-button size="sm" @click="deleteAddress(stealthMetaAccount.account, 'modalstealthmetaccount');" variant="link" v-b-popover.hover.top="'Delete account?'"><b-icon-trash shift-v="+1" font-scale="1.1" variant="danger"></b-icon-trash></b-button>
          </b-form-group>
        </b-modal>

        <!-- :TOOLBAR -->
        <div class="d-flex flex-wrap m-0 p-0">
          <div v-if="false" class="mt-0 pr-1">
            <b-form-input type="text" size="sm" v-model.trim="settings.filter" @change="saveSettings" debounce="600" v-b-popover.hover.top="'Filter by address or ENS name fragment'" placeholder="🔍 address / ens name"></b-form-input>
          </div>
          <div v-if="false" class="mt-0 pr-1" style="max-width: 8.0rem;">
            <b-form-select size="sm" v-model="settings.accountTypeFilter" @change="saveSettings" :options="accountTypeFilters" v-b-popover.hover.top="'Filter by account types'"></b-form-select>
          </div>
          <!--
          <div class="mt-0 pr-1" style="max-width: 8.0rem;">
            <b-form-select size="sm" v-model="settings.myAccountsFilter" @change="saveSettings" :options="myAccountsFilterOptions" v-b-popover.hover.top="'My accounts filter'"></b-form-select>
          </div>
          -->
          <div v-if="false" class="mt-0 pr-1">
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
          <div v-if="false" class="mt-0 pr-1">
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
          <div class="mt-0 flex-grow-1">
          </div>
          <div v-if="sync.section == null" class="mt-0 pr-1">
            <b-button size="sm" :disabled="block == null" @click="viewModalAddAccount" variant="link" v-b-popover.hover.top="'Add new account'"><b-icon-plus shift-v="+1" font-scale="1.2"></b-icon-plus></b-button>
          </div>
          <div class="mt-0 flex-grow-1">
          </div>
          <div v-if="sync.section == null" class="mt-0 pr-1">
            <b-button size="sm" :disabled="block == null" @click="syncIt({ sections: ['all'], parameters: Object.keys(settings.selectedAccounts) })" variant="link" v-b-popover.hover.top="'Sync data from the blockchain'"><b-icon-cloud-download shift-v="+1" font-scale="1.2"></b-icon-cloud-download></b-button>
          </div>
          <div v-if="false && sync.section == null" class="mt-0 pr-1">
            <b-button size="sm" :disabled="block == null" @click="syncIt({ sections: ['syncBuildTokens', 'syncBuildTokenEvents'], parameters: Object.keys(settings.selectedAccounts) })" variant="link" v-b-popover.hover.top="'DEV BUTTON 1'"><b-icon-lightning shift-v="+1" font-scale="1.2"></b-icon-lightning></b-button>
          </div>
          <div v-if="false && sync.section == null" class="mt-0 pr-1">
            <b-button size="sm" :disabled="block == null" @click="syncIt({ sections: ['syncBlocksAndBalances'], parameters: Object.keys(settings.selectedAccounts) })" variant="link" v-b-popover.hover.top="'DEV BUTTON 2'"><b-icon-lightning shift-v="+1" font-scale="1.2"></b-icon-lightning></b-button>
          </div>
          <div v-if="false && sync.section == null" class="mt-0 pr-1">
            <b-button size="sm" @click="exportAccounts" variant="link" v-b-popover.hover.top="'Export accounts'"><b-icon-file-earmark-spreadsheet shift-v="+1" font-scale="1.2"></b-icon-file-earmark-spreadsheet></b-button>
          </div>
          <div class="mt-1" style="width: 200px;">
            <b-progress v-if="false && sync.section != null" height="1.5rem" :max="sync.total" show-progress :animated="sync.section != null" :variant="sync.section != null ? 'success' : 'secondary'" v-b-popover.hover.top="'Click the button on the right to stop. This process can be continued later'">
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
          <div class="mt-0 pr-1">
            <b-form-select size="sm" v-model="settings.sortOption" @change="saveSettings" :options="sortOptions" v-b-popover.hover.top="'Yeah. Sort'"></b-form-select>
          </div>
          <div class="mt-0 pr-1">
            <font size="-2" v-b-popover.hover.top="'# accounts'">{{ filteredSortedAddresses.length + '/' + totalAddresses }}</font>
          </div>
          <div class="mt-0 pr-1">
            <b-pagination size="sm" v-model="settings.currentPage" @input="saveSettings" :total-rows="filteredSortedAddresses.length" :per-page="settings.pageSize" style="height: 0;"></b-pagination>
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

        <b-table ref="accountsTable" small fixed striped responsive hover selectable select-mode="single" @row-selected='accountsRowSelected' :fields="accountsFields" :items="pagedFilteredSortedAddresses" show-empty empty-html="Click [+] above to add accounts" head-variant="light" class="m-0 mt-1">
          <template #empty="scope">
            <h6>{{ scope.emptyText }}</h6>
            <div v-if="totalAddresses == 0">
              <ul>
                <li>
                  Click <b-button size="sm" variant="link" class="m-0 p-0"><b-icon-plus shift-v="+1" font-scale="1.2"></b-icon-plus></b-button> above to either:
                  <ul>
                    <li>Add your attached web3 address</li>
                    <li>Add an address</li>
                    <li>Add a Stealth Meta-Address</li>
                    <li>Generate a Stealth Meta-Address</li>
                  </ul>
                </li>
              </ul>
            </div>
          </template>
          <!-- <template #head(number)="data">
            <b-dropdown size="sm" variant="link" v-b-popover.hover="'Toggle selection'">
              <template #button-content>
                <b-icon-check-square shift-v="+1" font-scale="0.9"></b-icon-check-square>
              </template>
              <b-dropdown-item href="#" @click="toggleSelectedAccounts(pagedFilteredSortedAddresses)">Toggle selection for all accounts on this page</b-dropdown-item>
              <b-dropdown-item href="#" @click="toggleSelectedAccounts(filteredSortedAddresses)">Toggle selection for all accounts on all pages</b-dropdown-item>
              <b-dropdown-item href="#" @click="clearSelectedAccounts()">Clear selection</b-dropdown-item>
            </b-dropdown>
          </template> -->
          <template #cell(number)="data">
            <!-- <b-form-checkbox size="sm" :checked="settings.selectedAccounts[data.item.account] ? 1 : 0" value="1" @change="toggleSelectedAccounts([data.item])"> -->
              {{ parseInt(data.index) + ((settings.currentPage - 1) * settings.pageSize) + 1 }}
            <!-- </b-form-checkbox> -->
          </template>
          <template #cell(image)="data">
            <!-- <div v-if="data.item.type == 'preerc721' || data.item.type == 'erc721' || data.item.type == 'erc1155'">
              <b-avatar rounded variant="light" size="3.0rem" :src="data.item.image" v-b-popover.hover="'ERC-721 collection'"></b-avatar>
            </div>
            <div v-else-if="data.item.type == 'eoa' && data.item.account != ensOrAccount(data.item.account)">
              <b-avatar rounded variant="light" size="3.0rem" :src="'https://metadata.ens.domains/mainnet/avatar/' + ensOrAccount(data.item.account)" v-b-popover.hover="'ENS avatar if set'"></b-avatar>
            </div>
            <div v-else-if="data.item.type == 'erc20'">
              <b-avatar rounded variant="light" size="3.0rem" :src="'https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/ethereum/assets/' + data.item.account + '/logo.png'" v-b-popover.hover="'ERC-20 logo if available'"></b-avatar>
            </div> -->
          </template>
          <template #cell(icons)="data">
            <b-button size="sm" :pressed.sync="data.item.mine" @click="toggleAddressField(data.item.account, 'mine')" variant="transparent" v-b-popover.hover="addressTypeInfo[data.item.type].name" class="m-0 ml-1 p-0"><b-icon :icon="data.item.mine ? 'star-fill' : 'star'" shift-v="+1" font-scale="0.95" :variant="addressTypeInfo[data.item.type].variant"></b-icon></b-button>
            <b-button size="sm" :pressed.sync="data.item.favourite" @click="toggleAddressField(data.item.account, 'favourite')" variant="transparent" v-b-popover.hover="'Favourite?'" class="m-0 ml-1 p-0"><b-icon :icon="data.item.favourite ? 'heart-fill' : 'heart'" shift-v="+1" font-scale="0.95" variant="danger"></b-icon></b-button>
          </template>
          <template #cell(account)="data">
            <div v-if="data.item.account.substring(0, 3) == 'st:'">
              {{ formatAddress(data.item.account) }}
            </div>
            <div v-else>
              <b-link size="sm" :href="'https://sepolia.etherscan.io/address/' + data.item.account" variant="link" v-b-popover.hover="'View in explorer'" target="_blank">{{ formatAddress(data.item.account) }}</b-link>
            </div>
          </template>
          <template #cell(name)="data">
            {{ data.item.name }}
            <br />
            <font size="-1">
              {{ data.item.notes || '&nbsp;' }}
            </font>
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
        selectedAccounts: {},
        currentPage: 1,
        pageSize: 10,
        sortOption: 'typenameasc',
        version: 0,
      },
      defaultPhrase: "I want to login into my stealth wallet on Ethereum mainnet.",
      newAccount: {
        action: 'addCoinbase',
        address: null,
        stealthMetaAddress: null,
        linkedToAddress: null,
        phrase: "I want to login into my stealth wallet on Ethereum mainnet.",
        mine: false,
        favourite: false,
        name: null,
        viewingPrivateKey: null,
        spendingPublicKey: null,
        viewingPublicKey: null,
      },

      account: {
        account: null,
        type: null,
        ensName: null,
        mine: null,
        favourite: null,
        name: null,
        notes: null,
        source: null,
      },

      stealthMetaAccount: {
          account: null,
          type: null,
          linkedToAddress: null,
          phrase: null,
          mine: null,
          favourite: null,
          name: null,
          notes: null,
          spendingPrivateKey: null,
          viewingPrivateKey: null,
          spendingPublicKey: null,
          viewingPublicKey: null,
          source: null,
      },

      newAccountActions: [
        { value: 'addCoinbase', text: 'Add Attached Web3 Address' },
        { value: 'addAddress', text: 'Add Address' },
        { value: 'addStealthMetaAddress', text: 'Add Stealth Meta-Address' },
        { value: 'generateStealthMetaAddress', text: 'Generate Stealth Meta-Address' },
      ],
      addressTypeInfo: {
        "address": { variant: "warning", name: "My Address" },
        "stealthAddress": { variant: "dark", name: "My Stealth Address" },
        "stealthMetaAddress": { variant: "success", name: "My Stealth Meta-Address" },
      },
      accountTypes: [
        { value: null, text: '(unknown)' },
        { value: 'address', text: 'Address' },
        { value: 'stealthAddress', text: 'Stealth Address' },
        { value: 'stealthMetaAddress', text: 'Stealth Meta-Address' },
        { value: 'erc20', text: 'ERC-20 Token Contract' },
        { value: 'erc721', text: 'ERC-721 Token Contract' },
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
        { value: 'typenameasc', text: '▲ Type, ▲ Name' },
        { value: 'typenamedsc', text: '▼ Type, ▲ Name' },
        { value: 'nameaddressasc', text: '▲ Name, ▲ Address' },
        { value: 'nameaddressdsc', text: '▼ Name, ▲ Address' },
        { value: 'addressasc', text: '▲ Address' },
        { value: 'addressdsc', text: '▼ Address' },
      ],
      accountsFields: [
        { key: 'number', label: '#', sortable: false, thStyle: 'width: 5%;', tdClass: 'text-truncate' },
        { key: 'icons', label: '', sortable: false, thStyle: 'width: 5%;', thClass: 'text-right', tdClass: 'text-right' },
        { key: 'account', label: 'Account', sortable: false, thStyle: 'width: 40%;', tdClass: 'text-truncate' },
        { key: 'name', label: 'Name', sortable: false, thStyle: 'width: 50%;', tdClass: 'text-truncate' },
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
    addresses() {
      return store.getters['data/addresses'];
    },
    pageSizes() {
      return store.getters['config/pageSizes'];
    },
    accountsInfo() {
      return store.getters['data/accountsInfo'];
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
    sync() {
      return store.getters['data/sync'];
    },
    coinbaseIncluded() {
      return this.addresses[this.coinbase] && true || false;
    },

    addNewAddressCoinbaseFeedback() {
      if (this.newAccount.action == 'addCoinbase') {
        if (!this.coinbase) {
          return "Waiting for your web3 attached account connection";
        }
      }
      return null;
    },

    addNewAddressAddressFeedback() {
      if (this.newAccount.action == 'addAddress') {
        if (!this.newAccount.address) {
          return "Enter Address";
        }
        try {
          const address = ethers.utils.getAddress(this.newAccount.address);
        } catch (e) {
          return "Invalid Address";
        }
      }
      return null;
    },

    addNewAddressStealthMetaAddressFeedback() {
      if (this.newAccount.action == 'addStealthMetaAddress') {
        if (!this.newAccount.stealthMetaAddress) {
          return "Enter Stealth Meta-Address";
        }
        if (!this.newAccount.stealthMetaAddress.match(/^st:eth:0x[0-9a-fA-F]{132}$/)) {
          return "Invalid Stealth Meta-Address";
        }
      }
      return null;
    },

    addNewAddressLinkedToFeedback() {
      if (this.newAccount.action == 'addStealthMetaAddress') {
        if (!this.newAccount.linkedToAddress) {
          return "Enter Linked To Address";
        }
        if (!this.newAccount.linkedToAddress.match(/^0x[0-9a-fA-F]{40}$/)) {
          return "Invalid Linked To Address";
        }
      }
      return null;
    },

    addNewAddressFeedback() {
      if (this.newAccount.action == 'addCoinbase') {
        if (!this.coinbase) {
          return "Waiting for your web3 attached account connection";
        }
        return null;
      } else if (this.newAccount.action == 'addAddress') {
        if (!this.newAccount.address) {
          return "Enter Address";
        }
        if (!this.newAccount.address.match(/^0x[0-9a-fA-F]{40}$/)) {
          return "Invalid Address";
        }
        return null;
      } else if (this.newAccount.action == 'addStealthMetaAddress') {
        if (!this.newAccount.stealthMetaAddress) {
          return "Enter Stealth Meta-Address";
        }
        if (!this.newAccount.stealthMetaAddress.match(/^st:eth:0x[0-9a-fA-F]{132}$/)) {
          return "Invalid Stealth Meta-Address";
        }
        if (!this.newAccount.linkedToAddress) {
          return "Enter Linked To Address";
        }
        if (!this.newAccount.linkedToAddress.match(/^0x[0-9a-fA-F]{40}$/)) {
          return "Invalid Linked To Address";
        }
        return null;
      } else if (this.newAccount.action == 'generateStealthMetaAddress') {
        if (!this.newAccount.stealthMetaAddress) {
          return "Enter Stealth Meta-Address";
        }
        if (!this.newAccount.stealthMetaAddress.match(/^st:eth:0x[0-9a-fA-F]{132}$/)) {
          return "Invalid Stealth Meta-Address";
        }
        if (!this.newAccount.linkedToAddress) {
          return "Enter Linked To Address";
        }
        if (!this.newAccount.linkedToAddress.match(/^0x[0-9a-fA-F]{40}$/)) {
          return "Invalid Linked To Address";
        }
        return null;
      }
      return "Aaargh";
    },

    totalAddresses() {
      return Object.keys(this.addresses).length;
    },
    filteredAddresses() {
      const results = [];
      const filterLower = this.settings.filter && this.settings.filter.toLowerCase() || null;
      for (const [account, accountData] of Object.entries(this.addresses)) {
        const accountName = accountData.name || null;
        let include = filterLower == null ||
          (account.toLowerCase().includes(filterLower)) ||
          (accountName && accountName.toLowerCase().includes(filterLower));
        if (include && this.settings.myAccountsFilter != null) {
          if (this.settings.myAccountsFilter == 'mine' && accountData.mine) {
          } else if (this.settings.myAccountsFilter == 'notmine' && !accountData.mine) {
          } else {
            include = false;
          }
        }
        if (include) {
          results.push({
            account,
            ...accountData,
          });
        }
      }
      return results;
    },
    filteredSortedAddresses() {
      const results = this.filteredAddresses;
      if (this.settings.sortOption == 'typenameasc') {
        results.sort((a, b) => {
          if (('' + a.type).localeCompare(b.type) == 0) {
            if (('' + a.name).localeCompare(b.name) == 0) {
              return ('' + a.account).localeCompare(b.account);
            } else {
              return ('' + a.name).localeCompare(b.name);
            }
          } else {
            return ('' + b.type).localeCompare(a.type);
          }
        });
      } else if (this.settings.sortOption == 'typenamedsc') {
        results.sort((a, b) => {
          if (('' + a.type).localeCompare(b.type) == 0) {
            if (('' + a.name).localeCompare(b.name) == 0) {
              return ('' + a.account).localeCompare(b.account);
            } else {
              return ('' + a.name).localeCompare(b.name);
            }
          } else {
            return ('' + a.type).localeCompare(b.type);
          }
        });
      } else if (this.settings.sortOption == 'nameaddressasc') {
        results.sort((a, b) => {
          if (('' + a.name).localeCompare(b.name) == 0) {
            return ('' + a.account).localeCompare(b.account);
          } else {
            return ('' + a.name).localeCompare(b.name);
          }
        });
      } else if (this.settings.sortOption == 'nameaddressdsc') {
        results.sort((a, b) => {
          if (('' + a.name).localeCompare(b.name) == 0) {
            return ('' + b.account).localeCompare(a.account);
          } else {
            return ('' + b.name).localeCompare(a.name);
          }
        });
      } else if (this.settings.sortOption == 'addressasc') {
        results.sort((a, b) => {
          return ('' + a.account).localeCompare(b.account);
        });
      } else if (this.settings.sortOption == 'addressdsc') {
        results.sort((a, b) => {
          return ('' + b.account).localeCompare(a.account);
        });
      }
      return results;
    },
    pagedFilteredSortedAddresses() {
      logInfo("Addresses", "filteredSortedAddresses - results[0..1]: " + JSON.stringify(this.filteredSortedAddresses.slice(0, 2), null, 2));
      return this.filteredSortedAddresses.slice((this.settings.currentPage - 1) * this.settings.pageSize, this.settings.currentPage * this.settings.pageSize);
    },
  },
  methods: {
    saveSettings() {
      logInfo("Addresses", "methods.saveSettings - addressesSettings: " + JSON.stringify(this.settings, null, 2));
      localStorage.addressesSettings = JSON.stringify(this.settings);
    },

    formatAddress(address) {
      const STEALTHMETAADDRESS_SEGMENT_LENGTH = 20;
      // <!-- const ADDRESS_SEGMENT_LENGTH = 8; -->
      if (address) {
        if (address.substring(0, 3) == "st:") {
          return address.substring(0, STEALTHMETAADDRESS_SEGMENT_LENGTH + 9) + '...' + address.slice(-STEALTHMETAADDRESS_SEGMENT_LENGTH);
        } else {
          return address;
          <!-- return address.substring(0, ADDRESS_SEGMENT_LENGTH + 2) + '...' + address.slice(-ADDRESS_SEGMENT_LENGTH); -->
        }
      }
      return null;
    },

    viewModalAddAccount() {
      logInfo("Addresses", "methods.viewModalAddAccount BEGIN: " + JSON.stringify(this.settings.newAccount, null, 2));
      this.newAccount.action = 'addCoinbase';
      this.newAccount.address = null;
      this.newAccount.stealthMetaAddress = null;
      this.newAccount.linkedToAddress = this.coinbase;
      this.newAccount.phrase = this.defaultPhrase;
      this.newAccount.mine = false;
      this.newAccount.favourite = false;
      this.newAccount.name = null;
      this.newAccount.viewingPrivateKey = null;
      this.newAccount.spendingPublicKey = null;
      this.newAccount.viewingPublicKey = null;
      this.$bvModal.show('modal-newaddress');
    },

    accountsRowSelected(item) {
      logInfo("Addresses", "methods.accountsRowSelected BEGIN: " + JSON.stringify(item, null, 2));
      if (item && item.length > 0) {
        const account = item[0].account;
        if (account.substring(0, 3) == "st:") {
          this.stealthMetaAccount.account = item[0].account;
          this.stealthMetaAccount.type = item[0].type;
          this.stealthMetaAccount.linkedToAddress = item[0].linkedToAddress;
          this.stealthMetaAccount.phrase = item[0].phrase;
          this.stealthMetaAccount.mine = item[0].mine;
          this.stealthMetaAccount.favourite = item[0].favourite;
          this.stealthMetaAccount.name = item[0].name;
          this.stealthMetaAccount.notes = item[0].notes;
          this.stealthMetaAccount.spendingPrivateKey = null;
          this.stealthMetaAccount.viewingPrivateKey = item[0].viewingPrivateKey || null;
          this.stealthMetaAccount.spendingPublicKey = item[0].spendingPublicKey || null;
          this.stealthMetaAccount.viewingPublicKey = item[0].viewingPublicKey || null;
          this.stealthMetaAccount.source = item[0].source;
          this.$bvModal.show('modal-stealthmetaccount');
        } else {
          this.account.account = item[0].account;
          this.account.type = item[0].type;
          this.account.ensName = item[0].ensName;
          this.account.mine = item[0].mine;
          this.account.favourite = item[0].favourite;
          this.account.name = item[0].name;
          this.account.notes = item[0].notes;
          this.account.source = item[0].source;
          this.$bvModal.show('modal-address');
        }
        this.$refs.accountsTable.clearSelected();
      }
    },

    async generateNewStealthMetaAddress() {
      logInfo("Addresses", "methods.generateNewStealthMetaAddress BEGIN: " + JSON.stringify(this.settings.newAccount, null, 2));
      logInfo("Addresses", "methods.generateNewStealthMetaAddress - coinbase: " + this.coinbase);
      const phraseInHex = ethers.utils.hexlify(ethers.utils.toUtf8Bytes(this.newAccount.phrase));
      logInfo("Addresses", "methods.generateNewStealthMetaAddress - phraseInHex: " + phraseInHex);
      const signature = await ethereum.request({
        method: 'personal_sign',
        params: [phraseInHex, this.coinbase],
      });
      const signature1 = signature.slice(2, 66);
      const signature2 = signature.slice(66, 130);
      // Hash "v" and "r" values using SHA-256
      const hashedV = ethers.utils.sha256("0x" + signature1);
      const hashedR = ethers.utils.sha256("0x" + signature2);
      const n = ethers.BigNumber.from(SECP256K1_N);
      // Calculate the private keys by taking the hash values modulo the curve order
      const privateKey1 = ethers.BigNumber.from(hashedV).mod(n);
      const privateKey2 = ethers.BigNumber.from(hashedR).mod(n);
      const keyPair1 = new ethers.Wallet(privateKey1.toHexString());
      const keyPair2 = new ethers.Wallet(privateKey2.toHexString());
      this.newAccount.viewingPrivateKey = keyPair2.privateKey;
      console.log("viewingPrivateKey: " + keyPair2.privateKey);
      // Vue.set(this.modalNewStealthMetaAddress, 'viewingPrivateKey', keyPair2.privateKey);
      const spendingPublicKey = ethers.utils.computePublicKey(keyPair1.privateKey, true);
      const viewingPublicKey = ethers.utils.computePublicKey(keyPair2.privateKey, true);
      const stealthMetaAddress = "st:eth:" + spendingPublicKey + viewingPublicKey.substring(2);
      console.log("stealthMetaAddress: " + stealthMetaAddress);
      this.newAccount.spendingPublicKey = spendingPublicKey;
      this.newAccount.viewingPublicKey = viewingPublicKey;
      this.newAccount.linkedToAddress = this.coinbase;
      // Vue.set(this.settings.newAccount, 'linkedToAddress', this.coinbase + 'x');
      this.newAccount.stealthMetaAddress = stealthMetaAddress;
      // Vue.set(this.modalNewStealthMetaAddress, 'spendingPublicKey', spendingPublicKey);
      // Vue.set(this.modalNewStealthMetaAddress, 'viewingPublicKey', viewingPublicKey);
      // Vue.set(this.modalNewStealthMetaAddress, 'stealthMetaAddress', stealthMetaAddress);
      // Vue.set(this.modalNewStealthMetaAddress, 'linkedTo', { address: this.coinbase });
      // let status;
      // if (stealthMetaAddress in this.addresses) {
      //   status = this.addresses[stealthMetaAddress].mine ? "mine" : "notmine";
      // } else {
      //   status = "doesnotexist";
      // }
      // Vue.set(this.modalNewStealthMetaAddress, 'status', status);
      // console.log("this.modalNewStealthMetaAddress: " + JSON.stringify(this.modalNewStealthMetaAddress, null, 2));
      logInfo("Addresses", "methods.generateNewStealthMetaAddress END: " + JSON.stringify(this.settings.newAccount, null, 2));
    },

    async revealModalAddressSpendingPrivateKey() {
      console.log(moment().format("HH:mm:ss") + " revealModalAddressSpendingPrivateKey - phrase: " + this.stealthMetaAccount.phrase);
      const phraseInHex = ethers.utils.hexlify(ethers.utils.toUtf8Bytes(this.stealthMetaAccount.phrase));
      const signature = await ethereum.request({
        method: 'personal_sign',
        params: [phraseInHex, this.coinbase],
      });
      const signature1 = signature.slice(2, 66);
      const signature2 = signature.slice(66, 130);
      // Hash "v" and "r" values using SHA-256
      const hashedV = ethers.utils.sha256("0x" + signature1);
      const hashedR = ethers.utils.sha256("0x" + signature2);
      const n = ethers.BigNumber.from(SECP256K1_N);
      // Calculate the private keys by taking the hash values modulo the curve order
      const privateKey1 = ethers.BigNumber.from(hashedV).mod(n);
      const privateKey2 = ethers.BigNumber.from(hashedR).mod(n);
      const keyPair1 = new ethers.Wallet(privateKey1.toHexString());
      const keyPair2 = new ethers.Wallet(privateKey2.toHexString());
      Vue.set(this.stealthMetaAccount, 'spendingPrivateKey', keyPair1.privateKey);
      const spendingPublicKey = ethers.utils.computePublicKey(keyPair1.privateKey, true);
      const viewingPublicKey = ethers.utils.computePublicKey(keyPair2.privateKey, true);
      const stealthMetaAddress = "st:eth:" + spendingPublicKey + viewingPublicKey.substring(2);
    },

    addNewAddress() {
      logInfo("Addresses", "methods.addNewAddress: " + JSON.stringify(this.newAccount, null, 2));
      this.$refs['modalnewaddress'].hide();
      store.dispatch('data/addNewAddress', this.newAccount);
    },
    addCoinbase() {
      logInfo("Addresses", "methods.addCoinbase - coinbase: " + this.coinbase);
      store.dispatch('data/addNewAddress', this.coinbase);
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
    // async toggleAccountInfoField(account, field) {
    //   store.dispatch('data/toggleAccountInfoField', { account, field });
    // },
    async toggleAddressField(account, field) {
      logInfo("Addresses", "methods.toggleAddressField - account: " + account + ", field: " + field);
      store.dispatch('data/toggleAddressField', { account, field });
    },
    async setAddressField(account, field, value) {
      logInfo("Addresses", "methods.setAddressField - account: " + account + ", field: " + field + ", value: " + value);
      store.dispatch('data/setAddressField', { account, field, value });
    },
    // async setAccountInfoField(account, field, value) {
    //   store.dispatch('data/setAccountInfoField', { account, field, value });
    // },
    async deleteAddress(account, modalRef) {
      this.$bvModal.msgBoxConfirm('Are you sure?')
        .then(value => {
          if (value) {
            store.dispatch('data/deleteAddress', account);
            this.$refs[modalRef].hide();
          }
        })
        .catch(err => {
          // An error occurred
        })
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
      for (const result of this.filteredSortedAddresses) {
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
      logDebug("Addresses", "timeoutCallback() count: " + this.count);
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
    logDebug("Addresses", "beforeDestroy()");
  },
  mounted() {
    logDebug("Addresses", "mounted() $route: " + JSON.stringify(this.$route.params));
    store.dispatch('data/restoreState');
    if ('addressesSettings' in localStorage) {
      const tempSettings = JSON.parse(localStorage.addressesSettings);
      if ('version' in tempSettings && tempSettings.version == 0) {
        this.settings = tempSettings;
        this.settings.currentPage = 1;
      }
    }
    this.reschedule = true;
    logDebug("Addresses", "Calling timeoutCallback()");
    this.timeoutCallback();
  },
  destroyed() {
    this.reschedule = false;
  },
};

const addressesModule = {
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
