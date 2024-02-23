// https://stackoverflow.com/questions/44171210/what-is-vuex-router-sync-for
// vuex-router-sync source code pasted here because no proper cdn service found
function sync(store, router, options) {
  var moduleName = (options || {}).moduleName || 'route'

  store.registerModule(moduleName, {
    namespaced: true,
    state: cloneRoute(router.currentRoute),
    mutations: {
      'ROUTE_CHANGED': function(state, transition) {
        store.state[moduleName] = cloneRoute(transition.to, transition.from)
      }
    }
  })

  var isTimeTraveling = false
  var currentPath

  // sync router on store change
  store.watch(
    function(state) {
      return state[moduleName]
    },
    function(route) {
      if (route.fullPath === currentPath) {
        return
      }
      isTimeTraveling = true
      var methodToUse = currentPath == null ?
        'replace' :
        'push'
      currentPath = route.fullPath
      router[methodToUse](route)
    }, {
      sync: true
    }
  )

  // sync store on router navigation
  router.afterEach(function(to, from) {
    if (isTimeTraveling) {
      isTimeTraveling = false
      return
    }
    currentPath = to.fullPath
    store.commit(moduleName + '/ROUTE_CHANGED', {
      to: to,
      from: from
    })
  })
}

function cloneRoute(to, from) {
  var clone = {
    name: to.name,
    path: to.path,
    hash: to.hash,
    query: to.query,
    params: to.params,
    fullPath: to.fullPath,
    meta: to.meta
  }
  if (from) {
    clone.from = cloneRoute(from)
  }
  return Object.freeze(clone)
}


// exports.sync = function (store, router, options) {
//   var moduleName = (options || {}).moduleName || 'route'
//
//   store.registerModule(moduleName, {
//     namespaced: true,
//     state: cloneRoute(router.currentRoute),
//     mutations: {
//       'ROUTE_CHANGED': function ROUTE_CHANGED (state, transition) {
//         store.state[moduleName] = cloneRoute(transition.to, transition.from)
//       }
//     }
//   })
//
//   var isTimeTraveling = false
//   var currentPath
//
//   // sync router on store change
//   var storeUnwatch = store.watch(
//     function (state) { return state[moduleName]; },
//     function (route) {
//       var fullPath = route.fullPath;
//       if (fullPath === currentPath) {
//         return
//       }
//       if (currentPath != null) {
//         isTimeTraveling = true
//         router.push(route)
//       }
//       currentPath = fullPath
//     },
//     { sync: true }
//   )
//
//   // sync store on router navigation
//   var afterEachUnHook = router.afterEach(function (to, from) {
//     if (isTimeTraveling) {
//       isTimeTraveling = false
//       return
//     }
//     currentPath = to.fullPath
//     store.commit(moduleName + '/ROUTE_CHANGED', { to: to, from: from })
//   })
//
//   return function unsync () {
//     // On unsync, remove router hook
//     if (afterEachUnHook != null) {
//       afterEachUnHook()
//     }
//
//     // On unsync, remove store watch
//     if (storeUnwatch != null) {
//       storeUnwatch()
//     }
//
//     // On unsync, unregister Module with store
//     store.unregisterModule(moduleName)
//   }
// }
//
// function cloneRoute (to, from) {
//   var clone = {
//     name: to.name,
//     path: to.path,
//     hash: to.hash,
//     query: to.query,
//     params: to.params,
//     fullPath: to.fullPath,
//     meta: to.meta
//   }
//   if (from) {
//     clone.from = cloneRoute(from)
//   }
//   return Object.freeze(clone)
// }
//
