<template>
    <v-data-table
        id="auto-table"
        :headers="headers"
        :items="formattedTableItems"
        class="elevation-2"
        dense
        :item-class="getItemClasses"
        item-key="__zid"
        :search="search"
        fixed-header
        :height="tableHeight"
        :footer-props="tableFooterProps"
        mobile-breakpoint="0"
    >
        <template v-for="header in headers" v-slot:[`item.${header.value}`]="{ item }">
            <span
                v-if="item[header.value]"
                :key="header.id"
                :class="header.getCellClasses(header, item)"
                :title="header.getCellContent(item[header.value])"
                v-html="header.getCellContent(item[header.value])"
            ></span>
        </template>
    </v-data-table>
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
                top: 1;
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
            return this.items?.map((item, index) => ({
                __zid: index,
                ...item,
            }));
        },
    },
    data() {
        return {
            selected: [],
            search: '',
            tableHeight: 0,
            tableFooterProps: { 'items-per-page-options': [50, 100, 150, -1] },
        };
    },
    methods: {
        getItemClasses,
        customSortByColumn,
        /**
    },
};
</script>
