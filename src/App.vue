<template>
    <v-app>
        <TreePanel
            v-if="DataManager.jsonData && DataManager.config.dataType === 'generic'"
            :path="DataManager.config.dataPath"
            :toggle-panel="$store.showTreePanel"
            :json-data="DataManager.jsonData"
        />
        <v-main>
            <Breadcrumbs
                v-if="DataManager.config"
                :path="DataManager.config.dataPath"
                :mode="computedBreadcrumbsMode"
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

.v-data-footer,
.v-data-footer__select {
    height: 44px;
}

.v-data-footer {
    position: absolute;
    top: -44px;
    right: 0;
    z-index: 5;
}
</style>

<script>
import AutoTable from '../lib/AutoTable.vue';
import AutoObject from '@/components/AutoObject.vue';
import ConfigDialog from '@/components/ConfigDialog.vue';
import Breadcrumbs from '@/components/Breadcrumbs.vue';
import TreePanel from '@/components/TreePanel.vue';
import DataManager from '@/plugins/dataManager';
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
                heightOffsets: [44],
            });
        },
        /**
         * Sets the breadcrumbs component's mode depending on the data type
         * @returns {string} the breadcrumbs mode
         */
        computedBreadcrumbsMode() {
            return this.DataManager.config.dataType === 'generic' ? 'standard' : 'readonly';
        },
    },
    methods: {
        /**
         * Fetch data from the provided API and initialise the table data using the DataManager
         */
        fetchDataAndInitComponents() {
            /* Fetch data from the API */
            DataManager.fetchDataFromSource()
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
         * @param {object} error - the error object
         */
        handleError(error) {
            console.error('ZTable Error: ', error);
        },
        /**
         * Handle the updated Data config
         * @param {object} config - the updated Data config from the DataManager
         * @param {Boolean} sourceHasChanged Wether the data needs to be refetched from an API URL
         */
        handleConfig(config, sourceHasChanged) {
            if (config.dataUrl) {
                /* Fetch data from source URL */
                if (sourceHasChanged) {
                    this.fetchDataAndInitComponents();
                    this.closeConfigDialog();
                }
            }
        },
        /**
         * Check if data was found at the provided path
         */
        checkIfDataWasFound() {
            const foundData = DataManager.findDataFromPath();

            if (!foundData) {
                EventBus.$emit('error', 'Error occurs in data path.');
            } else {
                this.closeConfigDialog();
            }
        },
        /**
         * Open the config form dialog with potential errors to highlight
         * @param {Array} errorTypes - the types of error to highlight in the config form
         */
        openConfigDialog(errorTypes) {
            if (errorTypes && Array.isArray(errorTypes)) {
                if (Array.isArray(this.$store.configErrors)) {
                    this.$store.configErrors = this.$store.configErrors.concat(errorTypes);
                } else {
                    this.$store.configErrors = errorTypes;
                }
            } else {
                this.$store.configErrors = [];
            }

            this.$store.showConfigDialog = true;
        },
        /**
         * Close the config form dialog and reset the errors
         */
        closeConfigDialog() {
            this.$store.configErrors = [];
            this.$store.showConfigDialog = false;
        },
        /**
         * Handle a new data type being selected.
         * @param {string} newType the new data type
         */
        handleNewDataType(newType) {
            /* If data type is API specific, load the API specific style,
            otherwise remove API specific style */
            if (newType !== 'generic') {
                loadApiSpecificStyle(newType);
            } else {
                /* Force page reload to remove API specific CSS files */
                this.$router.replace(this.$route).catch((err) => {
                    if (err.name !== 'NavigationDuplicated') {
                        throw err;
                    }
                });
            }
        },
    },
    created() {
        EventBus.$on('error', this.handleError);
        EventBus.$on('no-data-at-path', () => this.openConfigDialog(['no-data-at-path']));
    },
    beforeDestroy() {
        EventBus.$off('error', this.handleError);
        EventBus.$off('no-data-at-path', () => this.openConfigDialog(['no-data-at-path']));
    },
    watch: {
        $route: {
            handler(newRoute, oldRoute) {
                /**
                 * Route changes - especially the query parameters - are the biggest source of 
                 * truth for the configuration of the app. Watching for theses changes at the 
                 * root of the App is a good way to keep the app in sync with its configuration, 
                 * to then broadcast changes to the components and trigger handlers when needed.
                 */
                if (
                    !oldRoute ||
                    !oldRoute.query ||
                    newRoute.query?.source !== oldRoute.query.source ||
                    newRoute.query?.path !== oldRoute.query.path ||
                    newRoute.query?.type !== oldRoute.query.type ||
                    newRoute.query?.config_url !== oldRoute.query.config_url
                ) {
                    /* If config has changed, update it in the DataManager
                    and assess whether or not to fetch new data */
                    const config = DataManager.setConfigFromRoute(newRoute);
                    const pathHasChanged = newRoute.query?.path !== oldRoute?.query?.path;
                    const typeHasChanged = newRoute.query?.type !== oldRoute?.query?.type;
                    const sourceHasChanged = newRoute.query?.source !== oldRoute?.query?.source;

                    this.handleConfig(config, sourceHasChanged);

                    /* If the path changed but not the source, simply look for new data at the new path */
                    if (pathHasChanged && !sourceHasChanged) {
                        this.checkIfDataWasFound();
                    }

                    /* If the data type changed but not the source, simply handle the new data type */
                    if (typeHasChanged && !sourceHasChanged) {
                        this.handleNewDataType(newRoute.query.type, oldRoute?.query?.type);
                    }
                }
            },
            immediate: true,
        },
    },
};
</script>
