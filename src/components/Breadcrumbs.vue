<template>
    <div>
        <v-btn title="Open Tree-view" icon color="primary" id="__panel-toggle-button" @click="toggleTreePanel">
            <v-icon>
                mdi-file-tree
            </v-icon>
        </v-btn>
        <v-breadcrumbs id="__breadcrumbs" :items="computedItems" divider=">"></v-breadcrumbs>
        <hr />
    </div>
</template>

<style lang="scss">
#__panel-toggle-button {
    display: inline-block;
    border-right: 1px solid grey;
    border-radius: 0;
    padding: 0 2vw;
}

#__breadcrumbs {
    display: inline-block;
    font-weight: bold;
    padding: 1vh 2vw;
    background: white;
}
</style>

<script>
import { generateUrlFromPath } from '@/plugins/utils';
export default {
    name: 'breadcrumbs',
    props: {
        /**
         * @prop {string} path - The current path of the data being viewed
         */
        path: {
            type: String,
        },
    },
    computed: {
        /**
         * Formatted items for the breadcrumbs
         * @computed
         * @returns {Array<{text: string, disabled: boolean}>} - The formatted items
         */
        computedItems() {
            const splitPath = this.path.split('.');
            const rootItem = {
                text: 'Root',
                disabled: false,
                href: generateUrlFromPath(''),
            };

            if (splitPath && splitPath.length === 1 && splitPath[0] === '') {
                /* Path is a the root of the data */
                return [rootItem];
            } else {
                const formattedItems = splitPath.map((level, index) => {
                    return {
                        text: level,
                        disabled: false,
                        href: this.getPathUpdateURL(index),
                    };
                });
                return [rootItem, ...formattedItems];
            }
        },
    },
    methods: {
        /**
         * Get a URL to update the path to the provided index
         * @param {number} index - The index of the path to update to
         * @returns {string} - The generated URL
         */
        getPathUpdateURL(index) {
            const splitPath = this.path.split('.');
            const newPath = splitPath.slice(0, index + 1).join('.');
            return generateUrlFromPath(newPath);
        },
        /**
         * Toggle the tree panel
         */
        toggleTreePanel() {
            this.$store.showTreePanel = !this.$store.showTreePanel;
        },
    },
};
</script>
