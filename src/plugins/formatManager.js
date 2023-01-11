import DataManager from '@/plugins/dataManager';
import NavitiaManager from '@/plugins/api-managers/navitia/navitiaManager';
import { EventBus } from '@/plugins/eventBus';
import { generateLinkToSubPath, generateUrlFromPath } from '@/plugins/utils';

/**
 * Get the content of a table cell
 * @param {*} value the raw value of an item for a table cell.
 * @param {object} item the data object of the row.
 * @param {string} key the key to add to the path to navigate to if needed.
 * @returns {*} the content to display in the cell.
 */
export function getCellContent(value, item, key) {
    if (DataManager.config.dataType === 'generic') {
        return formatContentForSubLinks(value, key, item?.__index);
    } else {
        // Temporary - to be replaced by API specific methods
        return NavitiaManager.getCellContent(value, item, key);
    }
}

/**
 * Get the classes of a cell from its header and item
 * @param {*} header the header of the column.
 * @param {object} item the data object of the row.
 * @returns {string} the classes of the cell.
 */
export function getCellClasses(header, item) {
    let cellClasses = '';

    if (item) {
        const dataType = DataManager.config.dataType;

        switch (dataType) {
            case 'navitia':
                cellClasses = NavitiaManager.getCellClasses(header, item);
                break;
        }
    }

    return cellClasses;
}

/**
 * Get classes for a table item
 * @param {object} item the data object of the row.
 * @returns {string} the classes for the item.
 */
export function getItemClasses(item) {
    if (item) {
        return '';
    }
    return '';
}

/**
 * Apply a custom sorting script to a given array of items.
 * @param {array} items the data array.
 * @param {(number|string)} index the sortBy value
 * @param {boolean[]} isDesc the sortDesc value
 * @returns {array} the sorted array.
 */
export function customSortByColumn(items, index, isDesc) {
    items.sort((a, b) => {
        if (index === 'id') {
            if (isDesc[0]) {
                return b[index] - a[index];
            } else {
                return a[index] - b[index];
            }
        }
    });
    return items;
}

/**
 * Try to dynamicly load an API specific stylesheet.
 * @param {string} type the type of the API.
 */
export function loadApiSpecificStyle(type) {
    if (type) {
        import(`@/plugins/api-managers/${type}/style.scss`)
            .then()
            .catch((err) => EventBus.$emit('error', { message: `Error loading stylesheet for : ${type}`, err }));
    }
}

/**
 * Check if a cell value is an object or an array: if so, generate a link to the sub-path.
 * @param {string} value the value of the cell to format if needed.
 * @param {string} key the key to add to the path to navigate to.
 * @param {string} index the  index of the data we are currently viewing if in an array.
 * @returns {*} the formatted cell value, with a link if needed.
 */
export function formatContentForSubLinks(value, key, index = null) {
    const contentValue = {
        isHtml: false,
        value: null,
    };

    if (key === '__index') {
        /* For the index header, generate a simple link to the table item */
        const itemPath = DataManager.config.dataPath;
        const url = generateUrlFromPath(itemPath ? `${itemPath}.${index}` : `${index}`);
        const link = `<a href="${url}" title="Open table item">${index}</a>`;

        contentValue.isHtml = true;
        contentValue.value = link;
        contentValue.text = index;
    } else if (value && typeof value === 'object') {
        /* Check if the value is an array */
        const valueType = Array.isArray(value) && value.length > 0 ? 'array' : 'object';

        contentValue.isHtml = true;
        contentValue.value = generateLinkToSubPath(valueType, key, value, index);
        contentValue.text = valueType;
    } else {
        contentValue.value = value;
        contentValue.text = value;
    }

    return contentValue;
}
