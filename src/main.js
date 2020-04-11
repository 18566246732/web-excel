import Vue from 'vue';
import App from './App.vue';

import helper from "./helper";
// 引入element ui 样式
import 'element-ui/lib/theme-chalk/index.css';

import { Button } from "element-ui";

[Button].forEach(component => {
  Vue.use(component);
});

Vue.prototype.$helper = helper;

Vue.config.productionTip = false;

new Vue({
  render: h => h(App),
}).$mount('#app');
