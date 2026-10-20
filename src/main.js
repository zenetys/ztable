import Vue from 'vue';
import App from '@/App.vue';
import router from '@/router';
import vuetify from '@/plugins/vuetify';
import Store from '@/plugins/store';

Vue.config.productionTip = false;

Vue.prototype.$store = Store;

new Vue({
    router,
    vuetify,
    render: (h) => h(App),
}).$mount('#app');
