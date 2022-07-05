/**
 * Get the content of a cell from the value of its item
 * @param {string} itemValue the value of the item.
 * @returns {string} the content of the cell.
 */
export function getCellContent(itemValue) {
    return String(itemValue);
}

/**
 * Get the classes of a cell from its header and item
 * @param {*} header the header of the column.
 * @param {string} item the value of the item.
 * @returns {string} the classes of the cell.
 */
export function getCellClasses(header, item) {
    if (item) {
        return '';
    }
    return '';
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
