<template>
    <v-navigation-drawer stateless app :value="togglePanel">
        <v-treeview class="__tree" dense :open="openedItems" :items="formattedItems">
            <!-- Icon type slot -->
            <template v-slot:prepend="{ item }">
                <v-icon>
                    {{ item.icon }}
                </v-icon>
            </template>

            <!-- Label link slot -->
            <template v-slot:label="{ item }">
                <a :title="`Open '${item.name}' in view`" :href="item.href" :class="getItemClass(item)">
                    {{ item.name }}
                </a>
            </template>
        </v-treeview>
    </v-navigation-drawer>
</template>

<style lang="scss">
.__tree {
    .v-treeview-node__root {
        min-height: 30px !important;
        font-size: 14px !important;
    }
}

.__tree-item--last-open {
    text-decoration: underline !important;
}
</style>

<script>
import { generateUrlFromPath } from '@/plugins/utils';

export default {
    name: 'tree-panel',
    props: {
        /**
         * @prop {string} path - The current path of the data being viewed
         */
        path: {
            type: String,
        },
        /**
         * @prop {boolean} togglePanel - Whether the tree panel is open or closed
         */
        togglePanel: {
            type: Boolean,
        },
        /**
         * @prop {array, object} jsonData - The data to display in the tree
         */
        jsonData: {
            type: [Object, Array],
        },
    },
    data() {
        return {
            formattedItems: [],
            openedItems: [],
        };
    },
    methods: {
        /**
         * Handle new data to display in the tree and store the opened items.
         * @param {Array} data - the data to format
         * @returns {Array} the formatted items to display in the tree
         */
        handleNewData(data) {
            const splitPath = this.path.split('.');
            const formattedItems = this.formatDataLevelForTree(data);

            this.findOpenItemsFromPath(splitPath, formattedItems);

            this.formattedItems = formattedItems;
        },
        /**
         * Check whether some data is an array or an object.
         * @param {*} data - the data to check
         * @returns {boolean} true if array or object
         */
        isArrayOrObject(data) {
            return Array.isArray(data) || typeof data === 'object';
        },
        /**
         * Find which items from an array should be opened relative to a given path
         * @recursive
         * @param {Array<string>} pathArray - the current path split into an array
         * @param {Array} items - the items to check
         */
        findOpenItemsFromPath(pathArray, items) {
            let nextLevelPath = pathArray;

            if (nextLevelPath.length > 0) {
                items.forEach((item) => {
                    /* Look for the path element in the items */
                    if (pathArray?.length > 0 && String(item.name) === pathArray[0]) {
                        this.openedItems = [...this.openedItems, item.id];

                        /* Update path for next level */
                        nextLevelPath = nextLevelPath.slice(1);

                        /* Recursively call this function for the next level of children */
                        if (item.children?.length > 0) {
                            this.findOpenItemsFromPath(nextLevelPath, item.children);
                        }
                    }
                });
            }
        },
        /**
         * Format a data set to display in the tree, and its children recursively.
         * => Only display the data if it is an object or an array
         * @recursive
         * @param {Array, Object} dataSet - the data set to format
         * @param {string} parentPath - the parent path of the data set to generate a URL
         * @returns {Array} the formatted data to display in the tree
         */
        formatDataLevelForTree(dataSet, parentPath = '') {
            let formattedDataLevel = [];

            if (!dataSet || !this.isArrayOrObject(dataSet)) {
                return formattedDataLevel;
            } else {
                if (Array.isArray(dataSet)) {
                    /* if array, create tree level */
                    dataSet
                        .filter((data) => this.isArrayOrObject(data))
                        .map((data, index) => {
                            /* Set icon depending on data type */
                            const icon = Array.isArray(data) ? 'mdi-code-array' : 'mdi-code-json';
                            /* Set unique ID */
                            const id = this.$uuid.v4();
                            /* Compute the path of the current item */
                            const itemPath = parentPath ? parentPath + '.' + index : String(index);
                            /* Generate the URL from the path */
                            const href = generateUrlFromPath(itemPath);

                            const item = {
                                href,
                                id,
                                icon,
                                name: index,
                                children: this.formatDataLevelForTree(data, itemPath),
                            };
                            formattedDataLevel.push(item);
                        });
                } else {
                    /* if object, create tree level */
                    Object.keys(dataSet)
                        .filter((key) => this.isArrayOrObject(dataSet[key]))
                        .map((key) => {
                            /* Set icon depending on data type */
                            const icon = Array.isArray(dataSet[key]) ? 'mdi-code-array' : 'mdi-code-json';
                            /* Set unique ID */
                            const id = this.$uuid.v4();
                            /* Compute the path of the current item */
                            const itemPath = parentPath ? parentPath + '.' + key : String(key);
                            /* Generate the URL from the path */
                            const href = generateUrlFromPath(itemPath);

                            const item = {
                                href,
                                id,
                                icon,
                                name: key,
                                children: this.formatDataLevelForTree(dataSet[key], itemPath),
                            };
                            formattedDataLevel.push(item);
                        });
                }
            }

            return formattedDataLevel;
        },
        /**
         * Get the class of an item in the tree depending of its location in the path.
         * @param {Object} item - the item to get the class for
         * @returns {string} the class(es) to apply to the item
         */
        getItemClass(item) {
            if (!this.openedItems || this.openedItems.length === 0) {
                return '';
            } else {
                /* Get the last open item from the path */
                const lastOpen = this.openedItems[this.openedItems.length - 1];

                if (item.id === lastOpen) {
                    return '__tree-item--last-open';
                } else {
                    return '';
                }
            }
        },
    },
    watch: {
        jsonData: {
            immediate: true,
            handler(newData) {
                this.handleNewData(newData);
            },
        },
        path: {
            immediate: true,
            handler(newPath) {
                const splitPath = newPath.split('.');
                this.openedItems = [];
                this.findOpenItemsFromPath(splitPath, this.formattedItems);
            },
        },
    },
};
</script>
