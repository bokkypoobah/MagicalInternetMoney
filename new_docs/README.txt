## Dependencies

25/05/2020

### Bootstrap Vue v2.15.0

* https://bootstrap-vue.org/docs
  * Vue.js v2.6 is required, v2.6.11 is recommended
  * Bootstrap v4.3.1 is required, v4.5.0 is recommended
  * Popper.js v1.16 is required for dropdowns (and components based on dropdown), tooltips, and popovers. v1.16.1 is recommended
  * PortalVue v2.1 is required by Toasts, v2.1.7 is recommended
  * jQuery is not required

<!-- Load required Bootstrap and BootstrapVue CSS -->
* Bootstrap v4.5.0
  * <link type="text/css" rel="stylesheet" href="//unpkg.com/bootstrap/dist/css/bootstrap.min.css" />

* BootstrapVue 2.15.0
  * <link type="text/css" rel="stylesheet" href="//unpkg.com/bootstrap-vue@latest/dist/bootstrap-vue.min.css" />

* Polyfill service v3.89.4
  * <!-- Load polyfills to support older browsers -->
  * <script src="//polyfill.io/v3/polyfill.min.js?features=es2015%2CIntersectionObserver" crossorigin="anonymous"></script>

* Vue.js v2.6.11
  * <!-- Load Vue followed by BootstrapVue -->
  * <script src="//unpkg.com/vue@latest/dist/vue.min.js"></script>

* BootstrapVue 2.15.0
  * <script src="//unpkg.com/bootstrap-vue@latest/dist/bootstrap-vue.min.js"></script>

* BootstrapVueIcons 2.15.0
  * <!-- Load the following for BootstrapVueIcons support -->
  * <script src="//unpkg.com/bootstrap-vue@latest/dist/bootstrap-vue-icons.min.js"></script>
  * //unpkg.com/bootstrap-vue@latest/dist/bootstrap-vue-icons.min.css

* Popperjs/core v2.4.0
  * https://popper.js.org/
  * wget https://unpkg.com/@popperjs/core@2
  * renamed to popper.js

* PortalVue 2.1.7
  * https://portal-vue.linusb.org/guide/installation.html#npm
  * http://unpkg.com/portal-vue
  * Renamed to portal-vue.js

### Vuex

* vuex v3.4.0
  * https://vuex.vuejs.org/installation.html
  * https://unpkg.com/vuex@3.4.0/dist/vuex.js

### Vue Router

* vue-router v3.2.0
  * https://router.vuejs.org/installation.html#direct-download-cdn
  * https://unpkg.com/vue-router@3.2.0/dist/vue-router.js

### Vuex Router Sync

* https://github.com/vuejs/vuex-router-sync
* Using earlier copy-pasted version

### Vue Apollo
* https://apollo.vuejs.org/guide/
* https://github.com/vuejs/vue-apollo
* https://www.jsdelivr.com/package/npm/vue-apollo


### Highlight.js
https://highlightjs.org/

<link rel="stylesheet"
      href="//cdnjs.cloudflare.com/ajax/libs/highlight.js/10.1.1/styles/default.min.css"> renamed to highlight.min.css
<script src="//cdnjs.cloudflare.com/ajax/libs/highlight.js/10.1.1/highlight.min.js"></script>

https://github.com/highlightjs/highlightjs-solidity
https://raw.githubusercontent.com/highlightjs/highlightjs-solidity/master/solidity.js

<script type="text/javascript" src="/path/to/highlight.pack.js"></script>
<script type="text/javascript" src="/path/to/highlightjs-solidity/solidity.js"></script>
<script type="text/javascript">
    hljs.registerLanguage('solidity', window.hljsDefineSolidity);
    hljs.initHighlightingOnLoad();
</script>


bignumber.js 4.0.2
from package.json https://github.com/ethereum/web3.js/blob/1.x/package.json#L106

https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.24.0/moment-with-locales.min.js
https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.24.0/moment.min.js

npm install vue bootstrap-vue bootstrap

+ bootstrap-vue@2.0.0-rc.28
+ bootstrap@4.3.1
+ vue@2.6.10
+ vue-router@3.1.3


Options

Base
  -> [DAI, ETH, priceFeedAdaptor, options]
   -> [Expiry, Strike, Type]
     -> []
