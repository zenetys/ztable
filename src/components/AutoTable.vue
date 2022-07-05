<template>
    <v-data-table
        id="auto-table"
        :headers="headers"
        :items="formattedTableItems"
        class="elevation-2"
        dense
        :item-class="getItemClasses"
        item-key="id"
        :search="search"
        fixed-header
        :height="tableHeight"
        :footer-props="tableFooterProps"
        mobile-breakpoint="0"
    >
        <template v-for="header in headers" v-slot:[`item.${header.value}`]="{ item }">
            <span
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
import axios from 'axios';
import { VDataTable } from 'vuetify/lib';
import { getCellContent, getCellClasses, getItemClasses, customSortByColumn } from '@/plugins/formatManager';

export default {
    name: 'auto-table',
    props: {
        /**
         * @prop {string} api - The API endpoint to fetch data from
         */
        api: {
            type: String,
        },
        /**
         * @prop {string} arrayData - The location of the data to display in the API response object
         */
        arrayData: {
            type: String,
        },
    },
    components: {
        VDataTable,
    },
    computed: {
        /**
         * Generate formatted headers from the table items
         * @computed
         * @returns {any[]} the formatted headers to display in the table
         */
        headers() {
            const headers = [];

            this.items?.forEach((item) => {
                Object.keys(item).forEach((key) => {
                    let textVal = String(key.charAt(0).toUpperCase() + key.slice(1));

                    if (!headers.some((header) => header.value === key)) {
                        headers.push({
                            text: textVal,
                            value: key,
                            divider: true,
                            align: 'start',
                            getCellContent,
                            getCellClasses,
                        });
                    }
                });
            });

            return headers;
        },
        /**
         * Format the table items to display in the table
         * @computed
         * @returns {Array<{id: number, [key: string]: any}>} the formatted table items to display in the table
         */
        formattedTableItems() {
            return this.items?.map((item, index) => ({
                id: index,
                ...item,
            }));
        },
    },
    data() {
        return {
            items: [],
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
         * Fetch data from the API endpoint,
         * and locate the data to display in the table
         */
        fetchItems() {
            axios
                .get(this.$props.api)
                .then((response) => {
                    let path = this.$props.arrayData.split('.');
                    let tableData = response.data;

                    for (let i = 0; i < path.length; i++) {
                        if (tableData[path[i]]) {
                            tableData = tableData[path[i]];
                        } else {
                            tableData = null;
                            break;
                        }
                    }
                    if (tableData === null) {
                        this.$emit('error', 'Error occurs in data path.');
                    }

                    this.items = tableData;
                })
                .catch((error) => {
                    this.$emit('error', error);
                });
        },
        /**
         * Calculate the height of the table
         */
        setTableHeight() {
            if (document.querySelector('#auto-table').parentElement.style.height !== '') {
                this.tableHeight = document.querySelector('#auto-table').parentElement.style.height;
            } else {
                this.tableHeight =
                    window.innerHeight - document.getElementsByClassName('v-data-footer')[0].clientHeight;
            }
        },
    },
    mounted() {
        this.fetchItems();
        this.setTableHeight();
    },
};
</script>
