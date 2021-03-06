<template>
    <v-app>
        <TreePanel
            v-if="DataManager.apiData && DataManager.config.dataType === 'generic'"
            :path="DataManager.config.dataPath"
            :toggle-panel="$store.showTreePanel"
            :api-data="DataManager.apiData"
        />
        <v-main>
            <Breadcrumbs
                v-if="DataManager.config && DataManager.config.dataType === 'generic'"
                :path="DataManager.config.dataPath"
            />
            <AutoTable v-if="DataManager.tableData" :headers="DataManager.headers" :items="DataManager.tableData" />
            <AutoObject v-if="DataManager.objectData" :object="DataManager.objectData" />
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
        </v-main>
    </v-app>
</template>

<style lang="scss">
a:link {
    text-decoration: none;
}
</style>

<script>
import AutoTable from '@/components/AutoTable.vue';
import AutoObject from '@/components/AutoObject.vue';
import ConfigDialog from '@/components/ConfigDialog.vue';
import Breadcrumbs from '@/components/Breadcrumbs.vue';
import TreePanel from '@/components/TreePanel.vue';
import DataManager from '@/plugins/dataManager';
import StorageConfigManager from '@/plugins/storageConfigManager';
import { loadApiSpecificStyle } from '@/plugins/formatManager';
import { EventBus } from '@/plugins/eventBus';

export default {
    name: 'App',
    components: {
        AutoTable,
        AutoObject,
        ConfigDialog,
        Breadcrumbs,
        TreePanel,
    },
    data() {
        return {
            DataManager,
            StorageConfigManager,
        };
    },
    methods: {
        /**
         * Fetch data from the provided API and initialise the table data using the DataManager
         */
        fetchDataAndInitComponents() {
            /* Fetch data from the API */
            DataManager.fetchApiData()
                .then(() => {
                    this.checkIfDataWasFound();
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
         * Handle the updated Data config
         * @param {Object} config - the updated Data config from the DataManager
         * @param {Boolean} shouldFetchData Wether or not the data needs to be refetched from an API URL
         * @param {Boolean} shouldFetchHeaders Wether or not the headers config needs to be refetched from an API URL
         */
        handleConfig(config, shouldFetchData, shouldFetchHeaders) {
            if (config.dataUrl) {
                if (shouldFetchData) {
                    /* Fetch data from source URL */
                    this.fetchDataAndInitComponents();
                    this.closeConfigDialog();
                } else if (shouldFetchHeaders) {
                    /* Fetch headers config from remote URL */
                    DataManager.fetchHeadersConfig()
                        .then(() => {
                            this.closeConfigDialog();
                        })
                        .catch((err) => {
                            EventBus.$emit('ZTable Error : fetching remote headers', err);
                            this.openConfigDialog();
                        });
                }
            } else {
                /* Show form again */
                console.log('ZTable Error: No data URL provided');
                this.openConfigDialog();
            }
        },
        /**
         * Check if data was found at the provided path
         */
        checkIfDataWasFound() {
            const foundData = DataManager.findDataFromPath();

            if (!foundData) {
                EventBus.$emit('error', 'Error occurs in data path.');
                this.openConfigDialog();
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
                    !oldRoute ||
                    !oldRoute.query ||
                    newRoute.query?.source !== oldRoute.query.source ||
                    newRoute.query?.path !== oldRoute.query.path ||
                    newRoute.query?.type !== oldRoute.query.type ||
                    newRoute.query?.headers !== oldRoute.query.headers
                ) {
                    /* If config has changed, update it in the DataManager
                    and assess whether or not to fetch data or custom headers */
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
