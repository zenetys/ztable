<template>
    <v-card>
        <v-data-table
            :id="id"
            :headers="headers"
            :items="formattedTableItems"
            class="auto-table elevation-0"
            :item-class="itemClass"
            dense
            item-key="id"
            fixed-header
            :height="tableHeight"
            :footer-props="tableFooterProps"
            disable-sort
            mobile-breakpoint="0"
            :disable-pagination="!this.isPaginated"
            :hide-default-footer="!this.isPaginated">
            <template v-slot:body="{ items, headers }">
                <tbody>
                    <tr v-for="(item, itemIndex) in items" :key="itemIndex" :class="getRowClass(item)">
                        <td
                            v-for="(header, headerIndex) in headers"
                            :key="headerIndex"
                            :title="header.columnDefinition.getTitle(item)"
                            :class="getHeaderClassForItem(header, item)">
                            <span
                                v-if="header.columnDefinition.isHtml"
                                :title="header.columnDefinition.getTooltip(item[header.value], item)"
                                :style="header.columnDefinition.getStyle(item[header.value], item)"
                                v-html="header.columnDefinition.format(item[header.value], item)"></span>
                            <span
                                v-else
                                :title="header.columnDefinition.getTooltip(item[header.value], item)"
                                :style="header.columnDefinition.getStyle(item[header.value], item)"
                                >{{ header.columnDefinition.format(item[header.value], item) }}</span
                            >
                            <span
                                v-if="activeCopyCellContent && header.columnDefinition.format(item[header.value], item)"
                                class="cp-span mdi mdi-content-copy"
                                @click="copyCellContent(id, headerIndex, itemIndex, $event)">
                                <span class="cell-copied-tooltip">Copied!</span>
                            </span>
                        </td>
                    </tr>
                </tbody>
            </template>
        </v-data-table>

        <v-overlay :absolute="true" :opacity="0.5" color="#ffffff" :value="isLoading">
            <v-progress-circular indeterminate size="64" color="#a2a2a2"></v-progress-circular>
        </v-overlay>
    </v-card>
</template>

<style scoped lang="scss">
.auto-table * {
    font-size: 12.8px;
}
tbody .v-data-table__divider span {
    white-space: nowrap;
    display: block;
}

::v-deep {
    th {
        padding-left: 6px !important;
        background-color: #fcfcfc !important;
        border-top: thin solid rgba(0, 0, 0, 0.02);
    }

    tbody {
        .v-data-table__divider {
            padding: 1px 6px !important;
            height: auto !important;
            /* position relative needed for the copy button icon */
            position: relative;

            &:not(.nocp) {
                padding-right: 18px !important;
            }

            &:hover:not(.nocp) .cp-span {
                display: block;
            }

            .cp-span {
                position: absolute;
                display: none;
                right: 0;
                top: 0.7px;
                padding-top: 1px;
                padding-right: 2px;
                cursor: pointer;

                .cell-copied-tooltip {
                    visibility: hidden;
                    background-color: rgb(58, 57, 57);
                    color: #fff;
                    text-align: center;
                    border-radius: 2px;
                    padding: 0px 4px 0px 4px;
                    position: absolute;
                    top: 2px;
                    right: 17px;
                    font-size: 11px;
                }
            }
        }

        tr:hover:not(.v-data-table__expanded__content) {
            filter: grayscale(10%) brightness(95%);
        }
    }
}
</style>

<script>
import { VDataTable } from 'vuetify/lib';
import { copyToClipboard, unArray } from '@/plugins/utils';

const defaultColumnDefinition = {
    format: (v) => v,
    getStyle: () => '',
    getTooltip: () => '',
    isHtml: false,
    hidden: false,
    getClass: () => '',
    getTitle: () => '',
};

export default {
    name: 'AutoTable',
    props: {
        id: {
            type: String,
            default: 'auto-table',
        },
        api: {
            type: String,
            required: true,
        },
        arrayData: {
            type: String,
            default: '',
        },
        columnDefinition: {
            type: Object,
            default: () => ({}),
        },
        isPaginated: {
            type: Boolean,
            default: false,
        },
        height: {
            /* type String, Number, Function or undefined */
            type: [String, Number],
            default: 'auto',
        },
        heightOffsets: {
            type: Array,
            default: () => [],
            /* array of dom ids to substract of +/- numbers */
        },
        itemClass: {
            type: [String, Function],
            default: () => '',
        },
        customHeadersComputation: {
            type: Function,
            default: () => ({}),
        },
        activeCopyCellContent: {
            type: Boolean,
            default: true,
        },
    },
    components: {
        VDataTable,
    },
    computed: {
        /**
         * Headers extracted from table content and formatted
         */
        headers() {
            const headers = [];

            // Store every unique header key
            this.tableItems.forEach((item) => {
                Object.keys(item).forEach((key) => {
                    if (!headers.some((header) => header.value === key)) {
                        headers.push({ value: key });
                    }
                });
            });

            // Run custom processing of headers
            this.customHeadersComputation(headers);

            // Set up columns and potentially discard hidden ones (splice), hence the reverse loop
            let i = headers.length;
            while (i--) {
                const header = headers[i];
                const columnDefinition = Object.assign(
                    {},
                    defaultColumnDefinition,
                    this.$props.columnDefinition[header.value]
                );

                if (columnDefinition.hidden) {
                    headers.splice(i, 1);
                    continue;
                }

                header.text =
                    header.value === 'flag' ? '' : header.value.charAt(0).toUpperCase() + header.value.slice(1);
                header.divider = true;
                header.columnDefinition = columnDefinition;
            }

            return headers;
        },
        formattedTableItems() {
            return this.tableItems.map((item, index) => ({
                id: index,
                ...item,
            }));
        },
    },
    data() {
        return {
            tableItems: [],
            tableHeight: '',
            isLoading: false,
            tableFooterProps: { 'items-per-page-options': [50, 100, 150, -1] },
        };
    },
    watch: {
        api: {
            immediate: true,
            handler() {
                this.fetchTableItems();
            },
        },
    },
    methods: {
        /**
         * Fetch the data to display in a table from the API
         */
        fetchTableItems() {
            this.isLoading = true;

            this.$api
                .get(this.$props.api)
                .then((response) => {
                    const path = this.$props.arrayData.split('.');
                    let tableData = response.data;

                    if (unArray(path) !== '') {
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
                    }
                    this.tableItems = tableData;
                    this.isLoading = false;
                    this.$emit('error', {});
                })
                .catch((error) => {
                    this.$emit('error', {
                        type: 'error',
                        content: 'Cannot load data, problem with the query.',
                        error: error,
                    });
                });
        },
        getRowClass(item) {
            return typeof this.itemClass === 'function' ? this.itemClass(item) : this.itemClass;
        },
        getHeaderClassForItem(header, tableItem) {
            return header.columnDefinition.getClass(tableItem) + ' v-data-table__divider col_' + header.value;
        },
        setTableHeight() {
            if (this.$props.height === 'auto') {
                this.tableHeight = this.computeAutoTableHeight();
            } else if (this.$props.height) {
                this.tableHeight = this.$props.height;
            }
        },
        computeAutoTableHeight() {
            let tableHeight = 0;
            const table = document.getElementById(this.id);

            if (table) {
                const tableFooterElement = table.getElementsByClassName('v-data-footer');
                const footerHeight = tableFooterElement.length ? tableFooterElement[0].clientHeight : 0;

                if (table.parentElement && table.parentElement.style.height !== '') {
                    tableHeight += table.parentElement.style.height;
                } else {
                    const tableRect = table.getBoundingClientRect();
                    tableHeight += window.innerHeight - tableRect.top;
                }

                tableHeight -= footerHeight;

                if (this.heightOffsets) {
                    this.heightOffsets.forEach((offset) => {
                        if (typeof offset === 'number') {
                            tableHeight += offset;
                        } else {
                            const element = document.getElementById(offset);

                            if (element) {
                                tableHeight -= element.clientHeight;
                            }
                        }
                    });
                }
            }
            return tableHeight;
        },
        /**
         * Copy cell content to clipboard
         * @param {string} rootId - DOM id of the auto-table instance
         * @param {number} colIndex - Column index starting from 0
         * @param {number} rowIndex - Row index starting from 0
         */
        copyCellContent(rootId, colIndex, rowIndex) {
            const selector = `#${rootId} tbody > tr:nth-child(${rowIndex + 1}) > td:nth-child(${colIndex + 1})`;
            const elementToCopy = document.querySelector(selector);

            if (!elementToCopy || elementToCopy.innerText === undefined) {
                return; /* not found */
            }

            copyToClipboard(elementToCopy.innerText).then(() => {
                const tooltipElement = elementToCopy.querySelector('.cp-span:hover .cell-copied-tooltip');
                if (tooltipElement) {
                    tooltipElement.style = 'visibility:visible;';
                    setTimeout(() => {
                        tooltipElement.style = '';
                    }, 400);
                }
            });
        },
    },
    mounted() {
        this.setTableHeight();
        window.addEventListener('resize', this.setTableHeight);
    },
    destroyed() {
        window.removeEventListener('resize', this.setTableHeight);
    },
};
</script>
