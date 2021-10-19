/**
 * 
 * @param {string} cellValue the content of the cell.
 * @returns {string}
 */
export function cellContent(cellValue) {
    return ''+cellValue;
}

/**
 * 
 * @param {string} cellValue the content of the cell.
 * @returns {string}
 */
export function cellColor(cellValue) {
    if (cellValue) {
        return '';
    }
    return '';
}


/**
 * 
 * @param {object} item The item that represents one lign in the table.
 * @returns {string}
 */
export function rowColor(item) {
    if (item) {
        return '';
    }
    return '';
}


/**
 *
 * @param {any[]} items The data array
 * @param {string[]} index The sortBy value
 * @param {boolean[]} isDesc The sortDesc value
 * @returns {array}
 */
export function customSortByColumn(items, index, isDesc) {
    items.sort((a, b) => {
        if (index=="id") {
            if (isDesc[0]) {
                return b[index] - a[index];
            } else {
                return a[index] - b[index];
            }
        }
    })
    return items;
}