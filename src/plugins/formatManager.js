import DataManager from '@/plugins/dataManager';
import NavitiaManager from '@/plugins/api-managers/navitia/navitia-manager';
import { EventBus } from '@/plugins/eventBus';

/**
 * Get the content of a table cell
 * @param {string} header the header of the column.
 * @param {string} item the data object of the row.
 * @returns {*} the content to display in the cell.
 */
export function getCellContent(header, item) {
    if (DataManager.config.dataType === 'generic') {
        return getGenericCellContent(header, item);
    } else {
        // Temporary - to be replaced by API specific methods
        return NavitiaManager.getCellContent(header, item);
    }
}

/**
 * Get the content of a table cell from a generic JSON object
 * @param {string} header the header of the column.
 * @param {string} item the data object of the row.
 * @returns {*} the content to display in the cell.
 */
function getGenericCellContent(header, item) {
    const cell = item[header.value];
    if (typeof cell === 'object' && cell.textVal) {
        return `<a href="#" title="${cell.value}">${cell.textVal}</a>`;
    } else {
        return String(cell);
    }
}

/**
 * Get the classes of a cell from its header and item
 * @param {*} header the header of the column.
 * @param {string} item the value of the item.
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
 * @param {object} item The item that represents one line in the table.
 * @returns {string} The classes for the item.
 */
export function getItemClasses(item) {
    if (item) {
        return '';
    }
    return '';
}

/**
 * Apply a custom sorting script to a given array of items.
 * @param {any[]} items the data array.
 * @param {string[]} index the sortBy value
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
