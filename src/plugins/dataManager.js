import axios from 'axios';
import { EventBus } from '@/plugins/eventBus';
import { getCellContent, getCellClasses } from '@/plugins/formatManager';

export default {
    _apiData: null,
    _dataPath: '',
    _apiUrl: '',
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
     * Get the value of dataPath
     * @returns {string} the value of dataPath
     */
    get dataPath() {
        return this._dataPath;
    },
    /**
     * Change the value of dataPath
     * @param {string} value the new value of dataPath
     */
    set dataPath(value) {
        this._dataPath = value;
    },

    /**
     * Get the value of apiUrl
     * @returns {string} the value of apiUrl
     */
    get apiUrl() {
        return this._apiUrl;
    },
    /**
     * Change the value of apiUrl
     * @param {string} value the new value of apiUrl
     */
    set apiUrl(value) {
        this._apiUrl = value;
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
            .get(this.apiUrl)
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
     * Generate table data from the API response data and the provided data path
     * @returns {array} the array of table data
     */
    generateTableData() {
        let path = this.dataPath.split('.');
        let tableData = this.apiData;

        for (let i = 0; i < path.length; i++) {
            if (tableData[path[i]]) {
                tableData = tableData[path[i]];
            } else {
                tableData = null;
                break;
            }
        }

        this.tableData = tableData;
        return this.tableData;
    },
};
