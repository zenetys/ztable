import Router from '@/router';

/**
 * Generate a link to navigate through the API data, updating the "path" param in the URL
 * @param {string} type the type of data on the destination : either "array" or "object".
 * @param {string} key the key to add to the path to navigate to.
 * @param {*} value the raw value of the cell.
 * @param {?string} index the  index of the data we are currently viewing if in an array.
 * @returns {string} the HTML link to navigate to the updated path.
 */
export function generateLinkToSubPath(type, key, value, index = null) {
    /**
     * Recursively generate a string exposing the content of the data contained in an array or object.
     * @recursive
     * @param {Array, Object} value the data to expose.
     * @returns {string} the stringified data.
     */
    function stringify(value) {
        let output = '';

        if (Array.isArray(value)) {
            // If the value is an array, we stringify each element of the array.
            for (const inc in value) {
                if (limit === 0) {
                    return '[' + output + (output ? ', ' : '') + '...]';
                }
                output += output ? ', ' : '';
                output += stringify(value[inc]);
            }
            return `[${output}]`;
        } else if (typeof value === 'object') {
            // If the value is an object, we stringify each key/value pair.
            for (const key in value) {
                if (limit === 0) {
                    return '{' + output + (output ? ', ' : '') + '...}';
                }
                output += (output ? ', ' : '') + `"${key}": `;
                output += stringify(value[key]);
            }
            return `{${output}}`;
        }
        limit--;
        return JSON.stringify(value);
    }

    const route = Router.currentRoute;

    /* Updating query params with the new path parameter */
    let newPath = route.query?.path;
    newPath = route.query.path ? route.query.path + '.' : '';
    newPath += index !== null ? `${index}.${key}` : `${key}`;
    let label = '';
    let limit = 10;

    // If the subpath contains an array or object, stringify its value as the link label.
    if (['array', 'object'].includes(type)) {
        label = stringify(value);
    }

    const url = generateUrlFromPath(newPath);
    const labelp = label.replace(/"/g, '&quot;');
    return `<a href="${url}" title="${labelp}" class="__sub-level-label">${label}</a>`;
}

/**
 * Check whether an object input is empty or not
 * @param {object} obj the object to check
 * @returns {boolean} true if the object is empty, false otherwise.
 */
export function isEmptyObject(obj) {
    return Object.keys(obj).length === 0;
}

/**
 * Generate a URL with an updated dataPath from a given path
 * @param {string} newPath the new path to add to the URL
 * @returns {string} the URL with the updated path
 */
export function generateUrlFromPath(newPath) {
    const route = Router.currentRoute;

    const newQueryParams = {
        ...route.query,
        path: newPath,
    };

    const updatedRoute = {
        query: newQueryParams,
    };

    if (!isEmptyObject(route.params)) {
        updatedRoute.params = route.params;
        updatedRoute.name = route.name || '';
    }

    return Router.resolve(updatedRoute).href;
}

/**
 * Swap two elements in an array, given their relative indexes
 * @param {array} array the array to modify
 * @param {number} index1 the index of the first element to swap
 * @param {number} index2 the index of the second element to swap
 * @returns {array} the modified array
 */
export function swapElementsInArray(array, index1, index2) {
    const items = [...array];
    const item1 = items[index1];
    const item2 = items[index2];
    items[index1] = item2;
    items[index2] = item1;

    return items;
}
