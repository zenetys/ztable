import Vue from 'vue';
import axios from 'axios';
import { EventBus } from '@/plugins/eventBus';
import { getCellContent, getCellClasses, getSpecialFormatContent, loadApiSpecificStyle } from '@/plugins/formatManager';
import StorageConfigManager from '@/plugins/storageConfigManager';
import NavitiaManager from '@/plugins/api-managers/navitia/navitiaManager';

export default {
    defaultHeaderConfig: {
        divider: true,
        align: 'start',
        getCellContent,
        getCellClasses,
        visible: true,
    },
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
     * Get the value of apiPromise
     * @returns {Promise} the value of apiPromise
     */
    get apiPromise() {
        return this._apiPromise;
    },
    /**
     * Change the value of apiPromise
     * @param {Promise} value the new value of apiPromise
     */
    set apiPromise(value) {
        this._apiPromise = value;
    },

    /**
     * Fetch data from an API
     * @returns {Promise} the promise of the fetch from the API
     */
    fetchApiData() {
        this.apiPromise = axios.get(this.config.dataUrl);

        return this.apiPromise
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
     * Generate a set of headers from a remote data configuration
     * @returns {array} the array of generated headers
     */
    generateHeadersFromConfig() {
        const headers = [];

        if (Array.isArray(this.headersConfig)) {
            /** Header index */
            let hid = 0;

            /* In generic mode, add an item index header for navigation */
            if (this.config.dataType === 'generic') {
                const indexHeader = {
                    ...this.defaultHeaderConfig,
                    text: '#',
                    value: '__index',
                    width: '60px',
                    hid: hid++,
                };
                headers.push(indexHeader);
            }

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

        /* Data starting point is the API response */
        let foundData = this.apiData;
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
            /* If the data is an array, generate new table headers */
            if (this.config.headersUrl && this.config.dataType === 'generic') {
                /* If headers config url was set, fetch it and assign headers */
                this.fetchHeadersConfig();
            } else {
                /* Generate headers based on the data */
                this.generateColumnDefinitions();
            }
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
                    StorageConfigManager.loadStorageConfig();
                }

                return this.headersConfig;
            })
            .catch((error) => {
                EventBus.$emit('error', error);
            });
    },
};
