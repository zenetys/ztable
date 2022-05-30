<template>
    <div>
        <v-data-table
            v-if="headers && formattedTableItems"
            id="auto-table"
            :headers="headers"
            :items="formattedTableItems"
            class="elevation-2"
            dense
            :item-class="itemClasses"
            item-key="__zid"
            :search="search"
            fixed-header
            :height="tableHeight"
            :footer-props="tableFooterProps"
            mobile-breakpoint="0"
        >
            <template v-for="header in headers" v-slot:[`item.${header.value}`]="{ item }">
                <span
                    v-if="item[header.value] || item[header.value] === 0"
                    :key="header.hid"
                    :class="header.getCellClasses(header, item)"
                    :title="header.getCellContent(header, item)"
                    v-html="header.getCellContent(header, item)"
                ></span>
            </template>
        </v-data-table>
    </div>
</template>

<style lang="scss">
.v-data-table {
    tbody {
        // Transparent color on hover each table tr
        tr:hover:not(.v-data-table__expanded__content) {
            filter: grayscale(10%) brightness(95%);
            -webkit-filter: grayscale(10%) brightness(95%);
        }

        .v-data-table__divider {
            position: relative;

            span {
                position: absolute;
                top: 1px;
                left: 0;
                right: 0;
                bottom: 0;
                padding: 5px 5px 5px 5px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
        }
    }
}

.__settings-btn {
    bottom: 2vh !important;
    left: 2vw !important;
}
</style>

<script>
import { VDataTable } from 'vuetify/lib';
import { getItemClasses, customSortByColumn } from '../plugins/formatManager';

export default {
    name: 'auto-table',
    props: {
        /**
         * @prop {string} items - the table items to display
         */
        items: {
            type: Array,
        },
        /**
         * @prop {Array} headers - the table headers to display
         */
        headers: {
            type: Array,
        },
    },
    components: {
        VDataTable,
    },
    computed: {
        /**
         * Format the table items to display in the table
         * @computed
         * @returns {Array<{id: number, [key: string]: any}>} the formatted table items to display in the table
         */
        formattedTableItems() {
            return this.items?.map((item, index) => {
                const row = { ...item };

                Object.keys(row).forEach((property) => {
                    if (Array.isArray(row[property])) {
                        // If the property is an array, assign an object with a text value and the array as properties
                        row[property] = {
                            textVal: row[property].length + ' elements',
                            value: row[property],
                        };
                    } else if (typeof row[property] === 'object') {
                        // If the property is an object, assign an object with the object as properties
                        row[property] = {
                            text: 'Object',
                            value: row[property],
                        };
                    }
                });

                return {
                    __zid: index,
                    ...row,
                };
            });
        },
    },
    data() {
        return {
            selected: [],
            search: '',
            tableFooterProps: { 'items-per-page-options': [50, 100, 150, -1] },
            tableHeight: null,
        };
    },
    methods: {
        getItemClasses,
        customSortByColumn,
        /**
         * Calculate the height of the table
         */
        computeTableHeight() {
            const autoTableElement = document.querySelector('#auto-table');

            if (autoTableElement?.parentElement.style.height) {
                this.tableHeight = autoTableElement?.parentElement.style.height;
            } else {
                this.tableHeight = window.innerHeight - document.getElementsByClassName('v-data-footer')[0]?.clientHeight;
            }
        }
    },
    mounted() {
        this.computeTableHeight();
    },
    updated() {
        this.computeTableHeight();
    },
};
</script>
