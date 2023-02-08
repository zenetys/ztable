import Vue from 'vue';
import App from '@/App.vue';
import router from '@/router';
import vuetify from '@/plugins/vuetify';
import Store from '@/plugins/store';
import UUID from 'vue-uuid';

Vue.config.productionTip = false;
Vue.use(UUID);

Vue.prototype.$store = Store;

new Vue({
    router,
    vuetify,
    render: (h) => h(App),
}).$mount('#app');
