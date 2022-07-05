<template>
    <v-app>
        <v-main>
            <div class="ml-1 mr-2">
                <AutoTable v-if="tableData" :headers="headers" :items="tableData" />
            </div>
        </v-main>
    </v-app>
</template>

<style lang="scss">
a:link {
    text-decoration: none;
}
</style>

<script>
import AutoTable from '@/components/AutoTable';
import DataManager from '@/plugins/dataManager';
import { loadApiSpecificStyle } from '@/plugins/formatManager';
import { EventBus } from '@/plugins/eventBus';

export default {
    name: 'App',
    components: {
        AutoTable,
    },
    data() {
        return {
            appVersion: process.env.VUE_APP_VERSION,
            appName: process.env.VUE_APP_NAME,
            headers: null,
            apiData: null,
            tableData: null,
        };
    },
    methods: {
        /**
         * Fetch data from the provided API and initialise the table data using the DataManager
         */
        fetchDataAndInitTable() {
            /* If data type is API specific, load the API specific style */
            if (DataManager.config.dataType !== 'generic') {
                loadApiSpecificStyle(DataManager.config.dataType);
            }

            DataManager.fetchApiData()
                .then((response) => {
                    this.apiData = response;
                    this.tableData = DataManager.findDataFromPath();
                    this.headers = DataManager.generateHeaders();

                    if (!this.tableData) {
                        EventBus.$emit('error', 'Error occurs in data path.');
                    }
                })
                .catch((error) => {
                    EventBus.$emit('error', error);
                });
        },
        handleError(error) {
            console.error('ZTable Error: ', error);
        },
        handleConfig(config) {
            if (config.dataUrl) {
                this.fetchDataAndInitTable();
            } else {
                // prompt values
            }
        },
    },
    created() {
        const config = DataManager.setConfigFromRoute(this.$route);
        this.handleConfig(config);
        EventBus.$on('error', this.handleError);
    },
    beforeDestroy() {
        EventBus.$off('error', this.handleError);
    },
};
</script>
