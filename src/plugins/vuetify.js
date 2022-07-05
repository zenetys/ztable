import Vue from 'vue';
import Vuetify from 'vuetify';
import 'vuetify/dist/vuetify.min.css';
import '@mdi/font/css/materialdesignicons.css';

Vue.use(Vuetify);

export default new Vuetify({
    theme: {
        themes: {
            light: {
                primary: '#1976D2',
                secondary: '#424242',
                accent: '#82B1FF',
                error: '#FF5252',
                info: '#2196F3',
                success: '#4CAF50',
                warning: '#FFC107',
                rowselect: '#bcd1f3',
                tableheadercolor: '#E0E0E0',
                cellstategreen: '#4fbb45',
                cellstatered: '#D33115',
                cellstateunknown: '#ADD0FF',
                cellstatewarning: '#FCC400',
            },
            dark: {
                rowselect: '#5d5155',
                tableheadercolor: '#616161',
                cellstategreen: '#479a40',
                cellstatered: '#D33115',
                cellstateunknown: '#ADD0FF',
                cellstatewarning: '#FCC400',
            },
        },
    },
});
