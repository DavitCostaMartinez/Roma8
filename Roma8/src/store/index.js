import { store } from 'quasar/wrappers'
import { createStore } from 'vuex'
import authModule from '../modules/auth/store/auth';
import incidentModule from '../modules/incident/store/incident';
import suggestionModule from '../modules/suggestions/store/suggestion';
import newsModule from '../modules/news/store/news';
import meetingModule from '../modules/meetings/store/meeting';
import suppliersModule from '../modules/suppliers/store/supplier';

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Store instance.
 */

export default store(function (/* { ssrContext } */) {
  const Store = createStore({
    modules: {
      authModule,
      incidentModule,
      suggestionModule,
      newsModule,
      meetingModule,
      suppliersModule
    },

    // enable strict mode (adds overhead!)
    // for dev mode and --debug builds only
    strict: process.env.DEBUGGING
  })

  return Store
})