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
            <AutoTable v-if="DataManager.tableData" :config="tableConfig" />
            <AutoObject v-if="DataManager.objectData" :object="DataManager.objectData" />
            <ConfigDialog />
            <v-btn
                elevation="2"
                color="primary"
                fab
                absolute
                bottom
                right
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

.__settings-btn {
    bottom: 2vh !important;
    right: 2vw !important;
}
</style>

<script>
import AutoTable from '../lib/AutoTable.vue';
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
    computed: {
        /**
         * Build the AutoTable config
         * @returns {Config} the current config
         */
        tableConfig() {
            return ({
                api: this.DataManager.dataPromise,
                path: this.DataManager.config.dataPath,
                columns: this.DataManager.columnDefinitions,
                paginated: true,
                height: 'auto',
                id: 'auto-table',
                customHeadersComputation: (headers) => {
                    /* Adding an index header */
                    const indexHeader = {
                        text: '#',
                        value: '__index',
                        sortable: false,
                        align: 'center',
                        width: '50px',
                    };
                    headers.push(indexHeader);
                    /** @TEMPORARY WORKAROUND UNTIL COLUMN DEFINITIONS' ORDER IS FUNCTIONAL */
                    /* Move the index column to the first position */
                    headers.unshift(headers.splice(headers.length - 1, 1)[0]);
                },
            });
        },
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
         */
        handleConfig(config, shouldFetchData) {
            if (config.dataUrl) {
                /* Fetch data from source URL */
                if (shouldFetchData) {
                    this.fetchDataAndInitComponents();
                    this.closeConfigDialog();
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
    created() {
        EventBus.$on('error', this.handleError);
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
                    newRoute.query?.config_url !== oldRoute.query.config_url
                ) {
                    /* If config has changed, update it in the DataManager
                    and assess whether or not to fetch data or custom config */
                    const config = DataManager.setConfigFromRoute(newRoute);

                    const pathHasChanged = newRoute.query?.path !== oldRoute?.query?.path;
                    const typeHasChanged = newRoute.query?.type !== oldRoute?.query?.type;
                    const shouldFetchData = newRoute.query?.source !== oldRoute?.query?.source;

                    this.handleConfig(config, shouldFetchData);

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
