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
     * Get the content of a table cell
     * @param {*} header the header of the column.
     * @param {*} item the data object of the row.
     * @returns {*} the content to display in the cell.
     */
    getCellContent(header, item) {
        if (header?.value && item && item[header.value] && propertiesCallbacks[header.value]) {
            return propertiesCallbacks[header.value](item);
        } else {
            return item[header.value] || '';
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
        return `<a href="${item.data_source_file}" title="Download file" target="_blank">${item.data_source_file}</a>`;
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
    if (item?.geo?.value?.length === 2) {
        return `lat: ${item.geo.value[0]}, long: ${item.geo.value[1]}`;
    } else {
        return item.geo || '';
    }
}
