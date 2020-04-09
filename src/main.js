import Vue from 'vue';
import App from './App.vue';

import helper from "./helper";
Vue.prototype.$helper = helper;

Vue.config.productionTip = false;

new Vue({
  render: h => h(App),
}).$mount('#app');
