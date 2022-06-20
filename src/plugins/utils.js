import Router from '@/router';

/**
 * Generate a link to navigate through the API data, updating the "path" param in the URL
 * @param {string} type the type of data on the destination : either "array" or "object".
 * @param {string} key the key to add to the path to navigate to.
 * @param {string} index the  index of the data we are currently viewing if in an array.
 * @returns {string} the HTML link to navigate to the updated path.
 */
export function generateLinkToSubPath(type, key, index = null) {
    const route = Router.currentRoute;

    /* Updating query params with the new path parameter */
    let newPath = route.query?.path;
    newPath = route.query.path ? route.query.path + '.' : '';
    newPath += index !== null ? `${index}.${key}` : `${key}`;

    const label = type === 'object' ? 'Object' : 'Array';

    const url = generateUrlFromPath(newPath);

    return `<a href="${url}" title="Open sub-level">${label}</a>`;
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
