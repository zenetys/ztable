<template>
    <v-card>
        <v-data-table
            :id="id"
            :headers="headers"
            :items="tableData"
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
            :hide-default-footer="!this.isPaginated"
        >

        <template v-slot:body="{ items, headers }">
            <tbody>
                <template v-for="(item, index) in items">
                    <tr :key="index" :class="typeof itemClass=='function' ? itemClass(item) : itemClass">
                        <template v-for="(headerItem, headerIndex) in headers">
                            <td :key="headerIndex" :title="headerItem.cdef.tdTooltip(item[headerItem.value], item)" :class="headerItem.cdef.tdClass(item[headerItem.value], item) + ' v-data-table__divider col_' + headerItem.value">
                                <template v-if="headerItem.cdef.html">
                                    <span :key="headerItem.id" :title="headerItem.cdef.tooltip(item[headerItem.value], item)" :style="headerItem.cdef.style(item[headerItem.value], item)" v-html="headerItem.cdef.format(item[headerItem.value], item)"></span>
                                </template>
                                <template v-else>
                                    <span :key="headerItem.id" :title="headerItem.cdef.tooltip(item[headerItem.value], item)" :style="headerItem.cdef.style(item[headerItem.value], item)">{{headerItem.cdef.format(item[headerItem.value], item)}}</span>
                                </template>
                                <span v-if="activeCopyCellContent && headerItem.cdef.format(item[headerItem.value], item)" class="cp-span mdi mdi-content-copy" @click="copyCellContent('col_'+headerItem.value, index, $event)">
                                    <span class="cell-copied-tooltip">Copied!</span>
                                </span>
                            </td>
                        </template>
                    </tr>
                </template>
            </tbody>
        </template>

        </v-data-table>

        <v-overlay :absolute="true" :opacity="0.5" color="#ffffff" :value="loading">
            <v-progress-circular
                indeterminate
                size="64"
                color="#a2a2a2"
            ></v-progress-circular>
        </v-overlay>

    </v-card>
</template>

<style scoped>
.auto-table * {
    font-size: 12.8px;
}

::v-deep th {
    padding-left: 6px !important;
    background-color: #FCFCFC !important;
    border-top: thin solid rgba(0, 0, 0, 0.02);
}

::v-deep tbody .v-data-table__divider {
    padding: 1px 6px !important;
    height: auto !important;
    /* position relative needed for the copy button icon */
    position: relative;
}

::v-deep tbody .v-data-table__divider:not(.nocp) {
    padding-right: 18px !important;
}

tbody .v-data-table__divider span {
    white-space: nowrap;
    display: block;
}

::v-deep .v-data-table__divider .cp-span {
    position: absolute;
    display: none;
    right: 0;
    top: 0.7px;
    padding-top: 1px;
    padding-right: 2px;
    cursor: pointer;
}

::v-deep .v-data-table__divider:hover:not(.nocp) .cp-span {
    display: block;
}

::v-deep .v-data-table__divider .cp-span .cell-copied-tooltip {
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

::v-deep .v-data-table__wrapper tbody tr:hover:not(.v-data-table__expanded__content) {
    filter: grayscale(10%) brightness(95%);
}
</style>

<script>
import { VDataTable } from 'vuetify/lib';
import axios from 'axios';
import { copyToClipboard } from "@/plugins/misc";

const default_column_definition = {
    format: (v) => v,
    style: () => '',
    tooltip: () => '',
    html: false,
    hidden: false,
    tdClass: () => '',
    tdTooltip: () => '',
}

export default {
    name: 'AutoTable',
    props: {
        id: {
            type: String,
            default: 'auto-table',
        },
        api:{
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
        autoTableHeightExtra: {
            type: Array,
            default: () => ([]),
            /* array of dom ids to substract of +/- numbers */
        },
        itemClass: {
            type: [String, Function],
            default: () => (''),
        },
        headersComputation: {
            type: Function,
            default: () => ({}),
        },
        activeCopyCellContent: {
            type: Boolean,
            default: true,
        }
    },
    components: {
        VDataTable,
    },
    computed: {
        headers() {
            /* acquire header keys from data */
            let headers = [];
            let seenKeys = {};
            this.tableItems.forEach(element => {
                for (const key in element) {
                    if (seenKeys[key])
                        continue;
                    seenKeys[key] = true;
                    headers.push({ value: key });
                }
            });
            /* hook before final column setup */
            this.headersComputation(headers, this.items);
            /* setup columns and potentially discard hidden ones (splice), hence the reverse loop */
            let i = headers.length;
            while (i--) {
                let h = headers[i];
                let cdef = Object.assign({}, default_column_definition, this.$props.columnDefinition[h.value]);
                if (cdef.hidden) {
                    headers.splice(i, 1);
                    continue;
                }
                if (h.text === undefined)
                    h.text = h.value.charAt(0).toUpperCase() + h.value.slice(1);
                h.divider = true;
                h.cdef = cdef;
            }
            return headers;
        },
        tableData() {
            return this.tableItems.map((item, index) => ({
                id: index,
                ...item
            }));
        },
    },
    data() {
        return {
            tableItems: [],
            tableHeight: '',
            loading: false,
            tableFooterProps: {'items-per-page-options': [50, 100, 150, -1]},
        }
    },
    watch: {
        api() { this.getTableItems(); }
    },
    methods: {
        getTableItems() {
            console.log('autotable getItems apiUrl', this.$props.api)
            this.loading = true;
            axios({
                method: 'get',
                url: this.$props.api,
            })
            .then( (response) => {
                const path = this.$props.arrayData.split(".");
                let pointer = response.data;

                if (path != "") {
                    for (let i = 0; i < path.length; i++) {
                        if (pointer[path[i]]) {
                            pointer = pointer[path[i]];
                        } else {
                            pointer = null;
                            break;
                        }
                    }
                    if (pointer==null) {
                        this.$emit('error', 'Error occurs in data path.');
                    }
                }
                this.tableItems = pointer;
                this.loading = false;
                this.$emit('error', {});
            }).catch( (error) => {
                this.tableItems = [];
                console.log('data from autoTable error', error);
                this.$emit('error', { type: 'error', content: 'Cannot load data, problem with the query.', error: error });
            });
        },
        setTableHeight() {
            if (this.$props.height == 'auto')
                this.tableHeight = this.computeAutoTableHeight();
            else if (this.$props.height !== undefined)
                this.tableHeight = this.$props.height;
        },
        computeAutoTableHeight() {
            const table = document.getElementById(this.id);
            let tableHeight = 0;
            if (table) {
                const tableFooterElement = table.getElementsByClassName('v-data-footer');
                const footerHeight = tableFooterElement.length ? tableFooterElement[0].clientHeight : 0;
                if (table.parentElement && table.parentElement.style.height != '') {
                    tableHeight += table.parentElement.style.height;
                    console.log('mode parent', table.parentElement.style.height)
                }
                else {
                    const tableRect = table.getBoundingClientRect();
                    tableHeight += (window.innerHeight - tableRect.top);
                }
                tableHeight -= footerHeight;
                if (this.autoTableHeightExtra) {
                    for (let i of this.autoTableHeightExtra) {
                        if (typeof i == 'number')
                            tableHeight += i;
                        else {
                            i = document.getElementById(i);
                            if (i)
                                tableHeight -= i.clientHeight;
                        }
                    }
                }
            }
            console.log('auto-table computeAutoTableHeight()', tableHeight);
            return tableHeight;
        },
        /**
         * Copy cell content to clipboard
         * @param {string} value - Cell class name
         * @param {number} index - item index
         */
        copyCellContent(value, index) {
            let elCopy = document.getElementsByClassName(`${value}`)[index].innerText;
            copyToClipboard(elCopy)
                .then(() => {
                    const tooltipElement = document.querySelector('.cp-span:hover .cell-copied-tooltip');
                    if (tooltipElement) {
                        tooltipElement.style = "visibility:visible;";
                        setTimeout(() => { tooltipElement.style = ""; }, 400);
                    }
                });
        }
    },
    mounted() {
        this.getTableItems();
        this.setTableHeight();
        window.addEventListener('resize', this.setTableHeight);
    },
    destroyed() {
        window.removeEventListener('resize', this.setTableHeight);
    },
}
</script>
