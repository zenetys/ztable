<template>
    <v-app>
        <v-main>
            <div class="ml-1 mr-2">
                <AutoTable v-if="DataManager.tableData" :headers="DataManager.headers" :items="DataManager.tableData" />
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
            DataManager,
            apiData: null,
            tableData: null,
        };
    },
    methods: {
        /**
         * Fetch data from the provided API and initialise the table data using the DataManager
         */
        fetchDataAndInitComponents() {
            /* Fetch data from the API */
            DataManager.fetchApiData()
                .then((response) => {
                    this.apiData = response;
                    this.tableData = DataManager.findDataFromPath();

                    /* If headers config url was entered, fetch it and generate headers */
                    if (DataManager.config.headersUrl) {
                        DataManager.fetchHeadersConfig().then((headersResponse) => {
                            const headersConfig = headersResponse?.data || headersResponse;

                            if (headersConfig) {
                                DataManager.generateHeadersFromConfig(headersConfig);
                            } else {
                                DataManager.generateHeaders();
                            }
                        });
                    } else {
                        DataManager.generateHeaders();
                    }

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
        /**
         * Handle a new data type being selected.
         * @param {String} newType the new data type
         */
        handleNewDataType(newType) {
            if (newType !== 'generic') {
                DataManager.generateHeaders();
            } else if (DataManager.config.headersUrl) {
                if (DataManager.headersConfig && DataManager.headersConfig.length) {
                    DataManager.generateHeadersFromConfig();
                } else {
                    DataManager.fetchHeadersConfig();
                }
            }

            /* If data type is API specific, load the API specific style,
            otherwise remove API specific style */
            if (newType !== 'generic') {
                loadApiSpecificStyle(newType);
            } else {
                /* Force page reload to remove API specific CSS files */
                this.$router.replace(this.$route).catch(() => {});
            }
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
                    newRoute.query?.type !== oldRoute?.query?.type ||
                    newRoute.query?.headers !== oldRoute?.query?.headers
                ) {
                    const config = DataManager.setConfigFromRoute(newRoute);

                    const pathHasChanged = newRoute.query?.path !== oldRoute?.query?.path;
                    const typeHasChanged = newRoute.query?.type !== oldRoute?.query?.type;
                    const shouldFetchData = newRoute.query?.source !== oldRoute?.query?.source;
                    const shouldFetchHeaders =
                        newRoute.query?.headers !== oldRoute?.query?.headers &&
                        newRoute.query?.headers &&
                        newRoute.query?.type === 'generic';

                    this.handleConfig(config, shouldFetchData, shouldFetchHeaders);

                    /* If path changed but not the source URL, only look for new data at the new path */
                    if (pathHasChanged && !shouldFetchData) {
                        this.checkIfDataWasFound();
                    }

                    if (typeHasChanged && !shouldFetchData) {
                        this.handleNewDataType(newRoute.query.type, oldRoute?.query?.type);
                    }
                }
            },
            immediate: true,
        },
    },
};
</script>
