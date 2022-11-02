<template>
    <v-card class="elevation-0">
        <v-data-table
            :id="id"
            :headers="headers"
            :items="formattedTableItems"
            :search="search"
            class="auto-table"
            :item-class="itemClass"
            dense
            item-key="id"
            fixed-header
            :height="tableHeight"
            :footer-props="tableFooterProps"
            disable-sort
            mobile-breakpoint="0"
            :disable-pagination="!isPaginated"
            :hide-default-footer="!isPaginated"
            :hide-default-header="true"
            :loading="isLoading"
        >
            <template v-slot:header="{ props: { headers } }">
                <thead id="autotable_header">
                    <tr v-if="headers.length > 0">
                        <th
                            class="sizable v-data-table__divider"
                            :class="'header_' + header.value"
                            v-for="header in headers"
                            :key="header.text">
                            <v-tooltip top>
                                <template v-slot:activator="{ on }">
                                    <span v-on="on">{{header.text}}</span>
                                </template>
                                <span>{{header.text}}</span>
                            </v-tooltip>
                        </th>
                    </tr>
                    <tr v-else>
                        <th></th>
                    </tr>
                </thead>
            </template>

            <template v-slot:body="{ items, headers }">
                <tbody>
                    <tr v-if="error" class="v-data-table__empty-wrapper">
                        <td :colspan="headers.length" class="pt-3 red--text">
                            <div>An error has occurred!</div>
                            <div>{{ error.message }}</div>
                        </td>
                    </tr>
                    <tr v-else-if="isLoading" class="v-data-table__empty-wrapper">
                        <td :colspan="headers.length" class="pt-3">Loading...</td>
                    </tr>
                    <tr v-else-if="items && items.length === 0" class="v-data-table__empty-wrapper">
                        <td :colspan="headers.length" class="pt-3">No data</td>
                    </tr>
                    <tr
                        v-else
                        v-for="(item, itemIndex) in items"
                        :key="itemIndex"
                        v-on="itemClick ? { click: (ev) => itemClick(item, ev) } : {}"
                        :class="getRowClass(item)"
                    >
                        <td
                            v-for="(header, headerIndex) in headers"
                            :key="headerIndex"
                            :title="header.columnDefinition.getTitle(item)"
                            :class="getHeaderClassForItem(header, item)"
                            :_call_format_only_once="(() => {
                                formatResult = header.columnDefinition.formatText(item[header.value], item);
                            })()"
                        >
                            <span
                                v-if="header.columnDefinition.isHtml"
                                :title="
                                    typeof header.columnDefinition.tooltip === 'function'
                                        ? header.columnDefinition.tooltip(item[header.value], item)
                                        : header.columnDefinition.tooltip
                                "
                                :style="header.columnDefinition.cssStyle(item[header.value], item)"
                                v-html="header.columnDefinition.formatHtml(item[header.value], item)"
                            ></span>
                            <span
                                v-else-if="typeof header.columnDefinition.slotName === 'string'"
                                :title="
                                    typeof header.columnDefinition.tooltip === 'function'
                                        ? header.columnDefinition.tooltip(item[header.value], item)
                                        : header.columnDefinition.tooltip
                                "
                                :style="header.columnDefinition.cssStyle(item[header.value], item)"
                            >
                                <slot
                                    :name="header.columnDefinition.slotName"
                                    v-bind:value="item[header.value]"
                                    v-bind:item="item"
                                />
                            </span>
                            <span
                                v-else
                                :title="
                                    typeof header.columnDefinition.tooltip === 'function'
                                        ? header.columnDefinition.tooltip(item[header.value], item)
                                        : header.columnDefinition.tooltip
                                "
                                :style="header.columnDefinition.cssStyle(item[header.value], item)"
                            >{{ formatResult }}</span>
                            <span
                                v-if="activeCopyCellContent && formatResult"
                                class="cp-span mdi mdi-content-copy"
                                @click="copyCellContent(id, headerIndex, itemIndex, $event)"
                            >
                                <span class="cell-copied-tooltip">Copied!</span>
                            </span>
                        </td>
                    </tr>
                </tbody>
            </template>
        </v-data-table>

        <v-overlay
            :value="isLoading"
            :absolute="true"
            :opacity="0.3"
            color="#ffffff"
        />
    </v-card>
</template>

<style scoped lang="scss">
/* XXX Style needs review and cleanup! At the moment, it is too difficult
 * XXX to override table style without using !important. */

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

    .v-progress-linear--absolute {
        left: 0;
        z-index: 1;
    }

    thead, tbody {
        .v-data-table__divider:last-child {
            border-right-style: none;
        }
    }

    thead {
        .v-progress-linear {
            height: 2px !important;
        }
    }

    tbody {
        .v-data-table__divider {
            border-bottom: thin solid rgba(0, 0, 0, 0.12);
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

        .v-data-table__empty-wrapper {
            text-align: left;
        }
    }

    .auto-table.v-data-table .v-data-footer {
        border-top-style: none;
    }

    .v-data-footer__select .v-select {
        margin-top: 6px;
        margin-bottom: 5px;

        .v-input__slot:before {
            bottom: 4px;
        }
        .v-input__slot:after {
            bottom: 4px;
        }
    }
}

#autotable_header {
    background-color: #fcfcfc !important;
    height: 32px !important;
}
</style>

<script>
import axios from 'axios';

const defaultColumnDefinition = {
    formatHtml: (value, item) => this.formatText(value, item),
    formatText: (value) => value,
    tooltip: () => '',
    getTitle: () => '',
    isHtml: false,
    enabled: true,
    cssClass: () => '',
    cssStyle: () => '',
    order: 999,
};

export function Config(params) {
    this.id = params.id || 'autotable';
    this.api = params.api;
    this.height = params.height;
    this.itemClass = params.itemClass;
    this.clickable = params.clickable;
    this.copyable = params.copyable;
    this.paginated = params.paginated;
    this.heightOffsets = params.heightOffsets;
    this.customHeadersComputation = params.customHeadersComputation;
    this.search = params.search;
    this.dataReady = params.dataReady || [];
    this.columns = params.columns;
    this.path = params.path || '';
}

export default {
    name: 'AutoTable',
    props: {
        config: {
            type: Config,
        },
    },
    computed: {
        id() {
            return this.$props.config.id || 'auto-table';
        },
        isPaginated() {
            return this.$props.config.paginated ? true : false;
        },
        search() {
            return this.$props.config.search || '';
        },
        itemClass() {
            return this.$props.config.itemClass || '';
        },
        itemClick() {
            return this.$props.config.clickable || null;
        },
        activeCopyCellContent() {
            return this.$props.config.copyable || false;
        },
        /**
         * Headers extracted from table content and formatted
         */
        computedHeaders() {
            return this.headers;
        },
        formattedTableItems() {
            return this.tableItems?.map((item, index) => ({
                id: index,
                ...item,
            }));
        },
    },
    data() {
        return {
            tableItems: undefined,
            tableHeight: '',
            isLoading: false,
            tableFooterProps: { 'items-per-page-options': [50, 100, 150, -1] },
            error: undefined,
            headers: [],
        };
    },
    watch: {
        'config.api': {
            immediate: true,
            handler() {
                this.fetchTableItems();
            },
        },
        tableItems: {
            immediate: true,
            handler() {
                this.extractHeadersFromData();
            },
        },
    },
    methods: {
        /**
         * Fetch data from an API and format it.
         */
        fetchTableItems() {
            const setup = (data) => {
                /* move data pointer to actual data */
                const path = this.$props.config.path.split('.');
                for (let i = 0; i < path.length; i++) {
                    if (path[i].length > 0) {
                        if (data[path[i]])
                            data = data[path[i]];
                        else
                            throw Error('Failed to resolve data path');
                    }
                }
                /* need an array */
                if (!Array.isArray(data))
                    throw Error('Data is not an array');

                for (let cb of this.$props.config.dataReady)
                    cb(data);
                this.tableItems = data;
            }

            const api = this.$props.config.api;

            /* it starts here */
            console.log('AutoTable: fetchTableItems: $props.config.api =', api);

            if (!api) {
                console.log('AutoTable: fetchTableItems: invalid url, set no data');
                this.tableItems = [];
                return;
            }

            this.isLoading = true;
            this.error = undefined;

            /* api is Promise<AxiasResponse|Error> or string-url */
            const promise = api instanceof Promise ? api : axios(api);

            promise
                .then((response) => setup(response.data))
                .catch((e) => { this.error = e; console.error(e); })
                .finally(() => { this.isLoading = false; });
        },
        /**
         * Get a class name depending an the item
         * @param {*} item - The item to get the class name for
         * @returns {string} - The class name
         */
        getRowClass(item) {
            const itemClass = this.$props.config.itemClass;
            return typeof itemClass === 'function' ? itemClass(item) : (itemClass || '');
        },
        /**
         * Get header classes for a provided item
         * @param {string} header - The header to get classes for
         * @param {object} tableItem - The related table item
         * @returns {string} - The header classes
         */
        getHeaderClassForItem(header, tableItem) {
            return header.columnDefinition.cssClass(tableItem) + ' v-data-table__divider col_' + header.value;
        },
        /**
         * Set the height of the table
         */
        setTableHeight() {
            const height = this.$props.config.height;
            if (height === 'auto') {
                this.tableHeight = this.computeAutoTableHeight();
            }
            else if (height) {
                this.tableHeight = height;
            }
        },
        /**
         * Calculate the height of the table
         * @returns {number} - The height of the table
         */
        computeAutoTableHeight() {
            let tableHeight = 0;
            const id = this.id;
            const table = document.getElementById(id);

            if (table) {
                const tableFooterElement = table.getElementsByClassName('v-data-footer');
                const footerHeight = tableFooterElement.length ? tableFooterElement[0].clientHeight : 0;

                if (table.parentElement && table.parentElement.style.height !== '') {
                    tableHeight += table.parentElement.style.height;
                }
                else {
                    const tableRect = table.getBoundingClientRect();
                    tableHeight += window.innerHeight - tableRect.top;
                }

                tableHeight -= footerHeight;

                if (this.$props.config.heightOffsets) {
                    this.$props.config.heightOffsets.forEach((offset) => {
                        if (typeof offset === 'number') {
                            tableHeight += offset;
                        }
                        else {
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

            this.$utils.copyToClipboard(elementToCopy.innerText).then(() => {
                const tooltipElement = elementToCopy.querySelector('.cp-span:hover .cell-copied-tooltip');
                if (tooltipElement) {
                    tooltipElement.style = 'visibility:visible;';
                    setTimeout(() => {
                        tooltipElement.style = '';
                    }, 400);
                }
            });
        },
        /**
         * Extract headers from tableItems, run the processing of headers,
         * and setup columns from the config in the headers
         */
        extractHeadersFromData() {
            if (!this.tableItems || this.tableItems.length == 0)
                return [{}]; /* no data */

            const headers = [];

            // Store every unique header key
            this.tableItems?.forEach((item) => {
                Object.keys(item).forEach((key) => {
                    if (!headers.some((header) => header.value === key)) {
                        headers.push({ value: key });
                    }
                });
            });

            // Run custom processing of headers
            if (typeof this.$props.config.customHeadersComputation === 'function')
                this.$props.config.customHeadersComputation(headers);

            // Set up columns and potentially discard hidden ones (splice),
            // hence the reverse loop
            let i = headers.length;
            while (i--) {
                const header = headers[i];
                const columnDefinition = Object.assign(
                    {},
                    defaultColumnDefinition,
                    this.$props.config.columns[header.value]
                );

                if (!columnDefinition.enabled) {
                    headers.splice(i, 1);
                    continue;
                }

                header.text ??= columnDefinition.label
                    ?? (header.value.charAt(0).toUpperCase() + header.value.slice(1));
                header.divider = true;
                header.columnDefinition = columnDefinition;
            }
            headers.sort((a, b) => a.columnDefinition.order - b.columnDefinition.order);
            this.headers = headers;
        },
    },
    mounted() {
        this.$nextTick(() => this.setTableHeight());
        window.addEventListener('resize', this.setTableHeight);
    },
    destroyed() {
        window.removeEventListener('resize', this.setTableHeight);
    },
};
</script>
