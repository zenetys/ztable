import Vue from 'vue';
import axios from 'axios';
import { EventBus } from '@/plugins/eventBus';
import { getCellContent, getCellClasses } from '@/plugins/formatManager';

export default {
    _config: Vue.observable({
        dataUrl: '',
        dataPath: '',
        dataType: '',
    }),
    _dataTypes: ['generic', 'navitia'],
    _apiData: null,
    _headers: null,
    _tableData: null,

    /**
     * Get the value of apiData
     * @returns {array} the value of apiData
     */
    get apiData() {
        return this._apiData;
    },
    /**
     * Change the value of apiData
     * @param {array} value the new value of apiData
     */
    set apiData(value) {
        this._apiData = value;
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
     * Fetch data from an API
     * @returns {Promise} the promise of the fetch from the API
     */
    fetchApiData() {
        return axios
            .get(this.config.dataUrl)
            .then((response) => {
                this.apiData = response?.data || null;
                console.log('DataManager: data fetched from API: ', this.apiData);
                return this.apiData;
            })
            .catch((error) => {
                EventBus.$emit('error', error);
            });
    },
    /**
     * Generate an array of unique headers from the current table data
     * @returns {array} the array of headers
     */
    generateHeaders() {
        const headers = [];

        this.tableData?.forEach((item) => {
            Object.keys(item).forEach((key) => {
                let textVal = String(key.charAt(0).toUpperCase() + key.slice(1));

                if (!headers.some((header) => header.value === key)) {
                    headers.push({
                        text: textVal,
                        value: key,
                        divider: true,
                        align: 'start',
                        getCellContent,
                        getCellClasses,
                    });
                }
            });
        });

        this.headers = headers;
        return headers;
    },
    /**
     * Find the data in the API response with the provided data path
     * @returns {array} the array of table data
     */
    findDataFromPath() {
        let path = this.config.dataPath === '' ? null : this.config.dataPath.split('.');
        let tableData = null;

        if (path) {
            for (let i = 0; i < path.length; i++) {
                if (this.apiData[path[i]]) {
                    tableData = this.apiData[path[i]];
                } else {
                    tableData = null;
                    break;
                }
            }
        } else {
            tableData = Array.isArray(this.apiData) ? this.apiData : [];
        }

        this.tableData = tableData;
        return this.tableData;
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
            };
        }
        return this.config;
    },
};
