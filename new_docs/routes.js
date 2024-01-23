const routes = [{
    path: '/config',
    component: Config,
    name: 'Config',
  // }, {
  //   path: '/mappings',
  //   component: Mappings,
  //   name: 'Mappings',
  // }, {
  //   path: '/account',
  //   component: Account,
  //   name: 'Account',
  }, {
    path: '/transfers',
    component: Transfers,
    name: 'Transfers',
  }, {
    path: '/registry',
    component: Registry,
    name: 'Registry',
  }, {
    path: '/addresses',
    component: Addresses,
    name: 'Addresses',
  // }, {
  //   path: '/assets',
  //   component: Assets,
  //   name: 'Assets',
  // }, {
  //   path: '/report/:contractOrTxOrBlockRange?',
  //   component: Report,
  //   name: 'Report',
  //   props: true,
  // }, {
  //   path: '/transactions',
  //   component: Transactions,
  //   name: 'Transactions',
  }, {
    path: '/data',
    component: Data,
    name: 'Data',
  // }, {
  //   path: '/docs/:section/:topic',
  //   component: Docs,
  //   name: 'Docs',
  }, {
    path: '*',
    component: Welcome,
    name: ''
  }
];
