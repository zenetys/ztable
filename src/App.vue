<template>
    <v-app>
        <v-main>
            <div class="ml-1 mr-2">
                <AutoTable v-if="tableData" :headers="headers" :items="tableData" />
                <ConfigDialog />
                <v-btn
                    elevation="2"
                    color="primary"
                    fab
                    absolute
                    bottom
                    left
                    class="__settings-btn"
                    @click="openConfigDialog"
                >
                    <v-icon>mdi-wrench</v-icon>
                </v-btn>
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
import ConfigDialog from '@/components/ConfigDialog';
import DataManager from '@/plugins/dataManager';
import { loadApiSpecificStyle } from '@/plugins/formatManager';
import { EventBus } from '@/plugins/eventBus';

export default {
    name: 'App',
    components: {
        AutoTable,
        ConfigDialog,
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
                        this.$store.showConfigDialog = true;
                    }
                })
                .catch((error) => {
                    EventBus.$emit('error', error);
                    this.openConfigDialog();
                });
        },
        /**
         * Handle any error that occurs
         * @param {Object} error
         */
        handleError(error) {
            console.error('ZTable Error: ', error);
        },
        /**
         * Handle config data
         * @param {Object} config
         */
        handleConfig(config) {
            if (config.dataUrl) {
                this.fetchDataAndInitTable();
                this.$store.showConfigDialog = false;
            } else {
                this.closeConfigDialog();
            }
        },
        /**
         * Open the config form dialog
         */
        openConfigDialog() {
            this.$store.showConfigDialog = true;
        },
        /**
         * Close the config form dialog
         */
        closeConfigDialog() {
            this.$store.showConfigDialog = false;
        },
    },
    beforeDestroy() {
        EventBus.$off('error', this.handleError);
    },
    watch: {
        $route: {
            handler(newRoute, oldRoute) {
                if (
                    newRoute.query?.source !== oldRoute?.query?.source ||
                    newRoute.query?.path !== oldRoute?.query?.path ||
                    newRoute.query?.type !== oldRoute?.query?.type
                ) {
                    const config = DataManager.setConfigFromRoute(newRoute);
                    this.handleConfig(config);
                }
            },
            immediate: true,
        },
    },
};
</script>
