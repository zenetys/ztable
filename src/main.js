import Vue from 'vue';
import App from '@/App.vue';
import router from '@/router';
import vuetify from '@/plugins/vuetify';
import axios from 'axios';
import i18n from '@/plugins/i18n';
import VueSession from 'vue-session';
import store from '@/plugins/store';

Vue.config.productionTip = false;
Vue.use(VueSession);

Vue.prototype.$store = store;

// Global variable for api to call
// Vue.prototype.$typeApi = 'nagios';
// Vue.prototype.$api = '/nagios4/cgi-bin/statusjson.cgi?';

/* Global config to fetch data from an API */
Vue.prototype.$apiConfig = {
    apiUrl: 'https://cdn.zenetys.com/api/v1/data.gouv.navitia.json',
    dataPath: 'data',
    dataType: 'generic',
},

new Vue({
    router,
    vuetify,
    axios,
    i18n,
    render: (h) => h(App),
}).$mount('#app');
