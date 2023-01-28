import Vue from 'vue';
import axios from 'axios';
import { EventBus } from '@/plugins/eventBus';
import { getCellContent, loadApiSpecificStyle } from '@/plugins/formatManager';
import NavitiaManager from '@/plugins/api-managers/navitia/navitiaManager';

export default {
    _config: Vue.observable({
        dataUrl: '',
        dataPath: '',
        dataType: '',
        customConfigUrl: '',
    }),
    _getItemClassesFromHeaderConfig: null,
    _dataTypes: ['generic', 'navitia'],
    _jsonData: null,
    _headers: Vue.observable(null),
    _tableData: Vue.observable(null),
    _objectData: Vue.observable(null),
    _columnDefinitions: Vue.observable(null),

    /**
     * Get the value of columnDefinitions
     */
    get columnDefinitions() {
        return this._columnDefinitions;
    },
    /**
     * Change the value of columnDefinitions
     */
    set columnDefinitions(value) {
        this._columnDefinitions = value;
    },

    /**
     * Get the value of jsonData
     * @returns {array} the value of jsonData
     */
    get jsonData() {
        return this._jsonData;
    },
    /**
     * Change the value of jsonData
     * @param {array} value the new value of jsonData
     */
    set jsonData(value) {
        this._jsonData = value;
    },

    /**
     * Get the value of dataTypes
     * @returns {array} the value of dataTypes
     */
    get dataTypes() {
        return this._dataTypes;
    },
    /**
     * Change the value of dataTypes
     * @param {array} value the new value of dataTypes
     */
    set dataTypes(value) {
        this._dataTypes = value;
    },

    /**
     * Get the data config
     * @returns {{dataUrl: string, dataPath: string, datatype: string}} the data config
     */
    get config() {
        return this._config;
    },
    /**
     * Set the data config
     *  @param {{dataUrl: string, dataPath: string, datatype: string}} value the data config
     */
    set config(value) {
        this._config = value;
    },

    /**
     * Get the value of headers
     * @returns {array} the value of headers
     */
    get headers() {
        return this._headers;
    },
    /**
     * Change the value of headers
     * @param {array} value the new value of headers
     */
    set headers(value) {
        this._headers = value;
    },

    /**
     * Get the value of tableData
     * @returns {array} the value of tableData
     */
    get tableData() {
        return this._tableData;
    },
    /**
     * Change the value of tableData
     * @param {array} value the new value of tableData
     */
    set tableData(value) {
        this._tableData = value;
    },

    /**
     * Get the value of getItemClassesFromHeaderConfig
     * @returns {function} the value of getItemClassesFromHeaderConfig
     */
    get getItemClassesFromHeaderConfig() {
        return this._getItemClassesFromHeaderConfig;
    },
    /**
     * Set the value of getItemClassesFromHeaderConfig
     * @param {function} value the new value of getItemClassesFromHeaderConfig
     */
    set getItemClassesFromHeaderConfig(value) {
        this._getItemClassesFromHeaderConfig = value;
    },

    /**
     * Get the value of objectData
     * @returns {object} the value of objectData
     */
    get objectData() {
        return this._objectData;
    },
    /**
     * Change the value of objectData
     * @param {object} value the new value of objectData
     */
    set objectData(value) {
        this._objectData = value;
    },

    /**
     * Get the value of dataPromise
     * @returns {Promise} the value of dataPromise
     */
    get dataPromise() {
        return this._dataPromise;
    },
    /**
     * Change the value of dataPromise
     * @param {Promise} value the new value of dataPromise
     */
    set dataPromise(value) {
        this._dataPromise = value;
    },

    /**
     * Fetch data from an API
     * @returns {Promise} the promise of the fetch from the API
     */
    fetchApiData() {
        this.dataPromise = axios.get(this.config.dataUrl);

        return this.dataPromise
            .then((response) => {
                this.jsonData = response?.data || null;
                console.log('DataManager: data fetched from API: ', this.jsonData);
                return this.jsonData;
            })
            .catch((error) => {
                EventBus.$emit('error', error);
            });
    },
    /**
     * Generate an array of column definitions based on the table data.
     */
    generateColumnDefinitions() {
        let columns = {};

        if (this.tableData && this.tableData?.length > 0) {
            const firstRow = this.tableData[0];

            /* if the data is made of data objects, generate columns based on the data's unique fields */
            if (typeof firstRow === 'object' && !Array.isArray(firstRow)) {
                if (this.config.dataType === 'generic') {
                    /* In generic mode, add specific formatting for the index header for navigation */
                    const indexDefinition = {
                        formatHtml: (value, item) => getCellContent(value, item, '__index').value,
                        formatText: (value, item) => getCellContent(value, item, '__index').value,
                        getTitle: (value, item) => getCellContent(value, item, '__index').text,
                        isHtml: true,
                        label: '#',
                        order: -999,
                    };
                    Object.assign(columns, { __index: indexDefinition });
                }

                /* If the table is made of objects and not arrays, look for unique keys and create column definitions */
                this.tableData.forEach((item) => {
                    Object.keys(item).forEach((key) => {
                        if (!Object.prototype.hasOwnProperty.call(columns, key)) {
                            columns[key] = {
                                formatHtml: (value, item) => getCellContent(value, item, key).value,
                                formatText: (value, item) => getCellContent(value, item, key).value,
                                getTitle: (item) => getCellContent(null, item, key).text,
                                isHtml: () => getCellContent(null, item, key).isHtml,
                            };
                        }
                    });
                });
                /** @TODO handle specific data types formatting using custom managers */
            } else if (['string', 'number', 'boolean'].includes(typeof firstRow)) {
                /* If the data is an array of simple values, create index/value column definitions */
                /* The index header is simply the index of the item in the array ('__index') */
                const indexDefinition = {
                    formatHtml: (value, item) => getCellContent(value, item, '__index').value,
                    formatText: (value, item) => getCellContent(value, item, '__index').text,
                    getTitle: (value, item) => getCellContent(value, item, '__index').text,
                    isHtml: false,
                    label: '#',
                    order: -999,
                    divider: true,
                    enabled: true,
                    width: '5%',
                };

                const ValueDefinition = {
                    formatHtml: (value) => value,
                    formatText: (value) => value,
                    getTitle: (value) => value,
                    tooltip: (value) => value,
                    label: 'Value',
                    isHtml: false,
                };

                Object.assign(columns, { __index: indexDefinition, value: ValueDefinition });
            }

            this.columnDefinitions = columns;
        }
    },
    /**
     * Find the data in the API response with the provided data path
     * @returns {*} Either table data or object data depending on data found
     */
    findDataFromPath() {
        if (this.config.dataType !== 'generic') {
            /* If the data is not generic, load an API specific stylesheet */
            loadApiSpecificStyle(this.config.dataType);

            if (this.config.dataType === 'navitia') {
                this.config.dataPath = NavitiaManager.dataPath;
            }
        }

        /* Data starting point is the JSON data */
        let foundData = this.jsonData;
        let path = this.config.dataPath === '' ? null : this.config.dataPath.split('.');

        /* Try to find the data using the provided path */
        if (path) {
            for (let i = 0; i < path.length; i++) {
                if (foundData && foundData[path[i]]) {
                    foundData = foundData[path[i]];
                } else {
                    foundData = null;
                    break;
                }
            }
        }

        if (Array.isArray(foundData) && foundData.length > 0) {
            this.tableData = foundData;
            this.objectData = null;
            /* If the data is an array, generate new table headers based on data*/
            this.generateColumnDefinitions();
        } else if (typeof foundData === 'object') {
            this.objectData = foundData;
            this.tableData = null;
        } else {
            [this.tableData, this.objectData] = [null, null];
        }
        return this.tableData || this.objectData;
    },
    /**
     * Set values for the config object from a route's query params
     * @param {*} route
     * @returns {{dataUrl: string, dataPath: string, datatype: string}} the updated config object
     */
    setConfigFromRoute(route) {
        if (route?.query) {
            this.config = {
                dataUrl: route.query.source,
                dataPath: route.query.path || '',
                dataType: route.query.type || 'generic',
                customConfigUrl: route.query.config_url || '',
            };
        }
        return this.config;
    },
};
