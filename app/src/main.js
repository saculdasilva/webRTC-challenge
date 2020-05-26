import Vue from "vue";
import store from "./store";
import App from "./App.vue";
import VueSocketIOExt from "vue-socket.io-extended";
import io from "socket.io-client";

const socket = io("192.168.1.5:3000");

Vue.use(VueSocketIOExt, socket);

Vue.config.productionTip = false;

new Vue({
  store,
  render: h => h(App)
}).$mount("#app");
