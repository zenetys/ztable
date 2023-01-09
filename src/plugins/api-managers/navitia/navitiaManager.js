const propertiesCallbacks = {
    data_source_file: formatDataSourceFile,
    geo: formatGeo,
};
const propertyClasses = {
    data_source_site: 'orange-text',
};

/* Will be added at a later stage */
// const itemClasses = {};
// const headerClasses = {};

export default {
    dataPath: 'data',
    /**
     * Get the classes of a cell from its header and item
     * @param {*} header the header of the column.
     * @param {*} item the value of the item.
     * @returns {string} the classes of the cell.
     */
    getCellClasses(header, item) {
        if (header?.value && item && propertyClasses[header.value]) {
            return propertyClasses[header.value];
        } else {
            return '';
        }
    },

    /**
     * Get the content of a table cell depending on the the raw value, the key and the table item.
     * @param {*} value the raw value of the item for a given key.
     * @param {*} item the data object for a table row.
     * @param {string} key the key of the column.
     * @returns {*} the content to display in the cell.
     */
    getCellContent(value, item, key) {
        const cellValue = {
            isHtml: false,
            value: null,
        };

        if (key && propertiesCallbacks[key]) {
            return propertiesCallbacks[key](item);
        } else {
            cellValue.value = value;
            return cellValue;
        }
    },
};

/**
 * Format the data source file field of a navitia item
 * @param {*} item
 * @returns {string} The formatted data source file field
 */
function formatDataSourceFile(item) {
    if (item?.data_source_file) {
        return {
            isHtml: true,
            value: `<a href="${item.data_source_file}" title="Download file" target="_blank">${item.data_source_file}</a>`,
        };
    } else {
        return '';
    }
}

/**
 * Format the geo field of a navitia item as lat & long values
 * @param {*} item The navitia item
 * @returns {string} The formatted geo field
 */
function formatGeo(item) {
    const formattedGeo = {
        isHtml: false,
        value: null,
    };

    if (Array.isArray(item?.geo) && item?.geo?.length === 2) {
        formattedGeo.value = `lat: ${item.geo[0]}, long: ${item.geo[1]}`;
    } else if (item?.geo?.value) {
        formattedGeo.value = item.geo.value || '';
    }

    return formattedGeo;
}
