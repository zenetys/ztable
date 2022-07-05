import Vue from 'vue';
import axios from 'axios';
import { EventBus } from '@/plugins/eventBus';
import { getCellContent, getCellClasses, getSpecialFormatContent, loadApiSpecificStyle } from '@/plugins/formatManager';
import StorageConfigManager from '@/plugins/storageConfigManager';
import NavitiaManager from '@/plugins/api-managers/navitia/navitiaManager';

export default {
    _config: Vue.observable({
        dataUrl: '',
        dataPath: '',
        dataType: '',
        headersUrl: '',
    }),
    _getItemClassesFromHeaderConfig: null,
    _headersConfig: {},
    _dataTypes: ['generic', 'navitia'],
    _apiData: null,
    _headers: Vue.observable(null),
    _tableData: null,
    defaultHeaderConfig: {
        divider: true,
        align: 'start',
        getCellContent,
        getCellClasses,
        hidden: false,
    },

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
     * Get the headers config
     * @returns {Object} the headers config
     */
    get headersConfig() {
        return this._headersConfig;
    },
    /**
     * Set the headers config
     * @param {Object} value the headers config
     */
    set headersConfig(value) {
        this._headersConfig = value;
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
        let hid = 0;

        this.tableData?.forEach((item) => {
            Object.keys(item).forEach((key) => {
                let label = String(key.charAt(0).toUpperCase() + key.slice(1));

                if (!headers.some((header) => header.value === key)) {
                    headers.push({
                        ...this.defaultHeaderConfig,
                        text: label,
                        value: key,
                        hid,
                        visible: true,
                    });

                    hid++;
                }
            });
        });

        this.headers = headers;
        /* Once headers are set, check if there's any column configuration in storage and apply it */
        StorageConfigManager.loadStorageColumnOptions();
    },
    /**
     * Generate a set of headers from a configuration array
     * @param {object[]} headersConfig the configuration array
     * @returns {array} the array of generated headers
     */
    generateHeadersFromConfig() {
        const headers = [];
        let hid = 0;

        if (Array.isArray(this.headersConfig)) {
            this.headersConfig.forEach((h) => {
                if (h.value === '_row' && h.class) {
                    /* Configuration for the entire row (table item) */
                    if (h.class.body && h.class.arguments) {
                        this.getItemClassesFromHeaderConfig = new Function(h.class.arguments, h.class.body);
                    } else if (typeof h.class === 'string') {
                        this.getItemClassesFromHeaderConfig = () => h.class;
                    }
                } else {
                    let label = String(h.value.charAt(0).toUpperCase() + h.value.slice(1));

                    if (!headers.some((header) => header.value === h.value)) {
                        const formattedHeader = {
                            ...this.defaultHeaderConfig,
                            text: label,
                            value: h.value,
                            hid,
                            visible: true,
                        };

                        /** Header config has class directives :
                         * if string => add classes to the header
                         * if method => build method add it to the header
                         */
                        if (h.class) {
                            if (typeof h.class === 'string') {
                                formattedHeader.getCellClasses = () => h.class;
                            } else if (typeof h.class === 'object' && h.class.body) {
                                formattedHeader.getCellClasses = new Function(h.class.arguments || '', h.class.body);
                            }
                        }

                        if (h.label) {
                            formattedHeader.text = h.label;
                        }

                        /* If a custom format was specified for a header, get its formatting method */
                        if (h.format) {
                            formattedHeader.getCellContent = getSpecialFormatContent(h.format);
                        }

                        headers.push(formattedHeader);
                        hid++;
                    }
                }
            });
        }

        this.headers = headers;
        return this.headers;
    },
    /**
     * Find the data in the API response with the provided data path
     * @returns {array} the array of table data
     */
    findDataFromPath() {
        if (this.config.dataType !== 'generic') {
            /* If the data is not generic, load an API specific stylesheet */
            loadApiSpecificStyle(this.config.dataType);

            if (this.config.dataType === 'navitia') {
                this.config.dataPath = NavitiaManager.dataPath;
            }
        }

        /* Data starting point is the API response */
        let foundData = this.apiData;
        let path = this.config.dataPath === '' ? null : this.config.dataPath.split('.');

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
                headersUrl: route.query.headers || '',
            };
        }
        return this.config;
    },
    /**
     * Fetch headers configuration from a distant API URL
     * @returns {Promise} The axios get promise
     */
    fetchHeadersConfig() {
        return axios
            .get(this.config.headersUrl)
            .then((response) => {
                this.headersConfig = response?.data || response || [];
                console.log('DataManager: headers config fetched from API: ', this.headersConfig);

                if (this.headersConfig) {
                    this.generateHeadersFromConfig();
                    /* Once headers are set, check if there's any column configuration in storage and apply it */
                    StorageConfigManager.loadStorageColumnOptions();
                }

                return this.headersConfig;
            })
            .catch((error) => {
                EventBus.$emit('error', error);
            });
    },
};
