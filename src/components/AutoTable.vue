<template>
    <v-card class="elevation-0">
        <div class="showIcons" @mouseover="showIcons = true" @mouseleave="showIcons = false">
            <AutoTableMenu
                :style="showIcons === true ? 'display: block' : 'display: none'"
                :show="showIcons"
                :items="headers"
                :hasFixedWidths="hasFixedWidths"
                @swapped="swapHeadersPositions($event)"
                @toggle="changeFixedWidth($event)"
                @export="exportToCsv(tableItems)"
            />
        </div>
        <v-data-table
            :id="id"
            :headers="computedHeaders"
            :items="formattedTableItems"
            :search="search"
            class="auto-table"
            :class="hasFixedWidths ? '' : 'sizable'"
            :item-class="itemClass"
            dense
            item-key="id"
            fixed-header
            :height="tableHeight"
            :footer-props="tableFooterProps"
            mobile-breakpoint="0"
            :disable-pagination="!isPaginated"
            :hide-default-footer="!isPaginated"
            :hide-default-header="true"
            :custom-sort="customSort"
            :loading="isLoading"
            :options="{ sortBy, sortDesc }"
        >
            <template v-slot:header="{ props: { headers } }">
                <thead id="autotable_header">
                    <tr
                        @dragstart="onDragStart"
                        @dragover="onDragOver"
                        @dragend.stop="onDragEnd"
                        v-if="headers.length > 0"
                    >
                        <th
                            class="v-data-table__divider"
                            :class="'col_' + header.value"
                            v-for="header in headers"
                            :key="header.value"
                            :draggable="true"
                            :style="getHeaderFixedWidthStyle(header)"
                            @mouseup="sortCol(header)"
                            :data-col-name="header.value"
                        >
                            <span>{{ header.text }}<template
                                v-if="header.columnDefinition.sortable">
                                    <v-icon
                                        v-if="sortBy === header.value"
                                        class="header-sort-icon"
                                    >mdi-arrow-{{ sortDesc ? 'up' : 'down' }}</v-icon>
                                    <v-icon
                                        v-else
                                        class="header-sort-icon header-sort-icon--inactive"
                                    >mdi-arrow-down</v-icon>
                                </template>
                            </span>
                            <div @mousedown.stop="onResizeMouseDown" @click.stop class="resizeElement"></div>
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
                            :class="getCellClass(header, item)"
                            v-on="header.columnDefinition.copyable
                                ? { mouseenter: onMouseEnterBodyCell, mouseleave: onMouseLeaveBodyCell }
                                : {}
                            "
                        >
                            <span
                                v-if="header.columnDefinition.formatHtml"
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
                                v-else-if="header.columnDefinition.formatText"
                                :title="
                                    typeof header.columnDefinition.tooltip === 'function'
                                        ? header.columnDefinition.tooltip(item[header.value], item)
                                        : header.columnDefinition.tooltip
                                "
                                :style="header.columnDefinition.cssStyle(item[header.value], item)"
                                v-text="header.columnDefinition.formatText(item[header.value], item)"
                            />
                            <span v-else>No render</span>
                            <span
                                v-if="header.columnDefinition.copyable"
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
.showIcons {
    width: 200px;
    height: 50px;
    position: absolute;
    top: 0;
    right: 15px;
    z-index: 9;
}
/* XXX Style needs review and cleanup! At the moment, it is too difficult
 * XXX to override table style without using !important. */
.resizeElement {
    content: '';
    cursor: ew-resize;
    position: absolute;
    top: 0;
    right: 0;
    width: 10px;
    height: 100%;
    display: inline-block;
}
.resizeElement:hover {
    background-color: #e2e2e2;
}

.auto-table * {
    font-size: 12.8px;
}
tbody .v-data-table__divider span {
    white-space: nowrap;
    display: block;
}

::v-deep {
    .v-menu__content * {
        padding: 0;
    }

    .v-data-table:not(.sizable) table {
        width: auto;
    }

    .v-data-table__divider {
        &.truncable {
            max-width: 0;
            > span:not(.cp-span) {
                overflow: hidden;
                text-overflow: ellipsis;
            }
        }
    }

    th {
        padding-left: 6px !important;
        background-color: #fcfcfc !important;
        border-top: thin solid rgba(0, 0, 0, 0.02);
        & > span {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            display: block;
            width: 100%;
        }

        .header-sort-icon {
            margin-left: 0.8em;
        }
        .header-sort-icon--inactive {
            color: transparent;
        }
        &:hover .header-sort-icon--inactive {
            color: #d2d2d2;
        }
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

            &.copyable {
                padding-right: 18px !important;
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
                    font-size: 10px;
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

.autotable-drag-border {
    border-left: 1px dashed red;
}

#__column-options-button {
    z-index: 7;
    right: 20px;
}

#autotable_header {
    background-color: #fcfcfc !important;
    height: 32px !important;
}

.__column-options-button--offset-top {
    top: 0px;
}
</style>

<script>
import axios from 'axios';
import AutoTableMenu from '@/components/AutoTableMenu.vue';

/**
 * Helpers independant of the component instance that may be exported with
 * the component under <component>.utils.
 **/

function cmpDefault(a, b) {
    return a > b ? 1 : (a < b ? -1 : 0);
}

function makeCmpNumeric(ignoreRegex, parseFn, base) {
    return function (a, b) {
        /* try to be generic as possible without too much complexity */
        if (typeof(a) !== 'string')
            a = String(a ?? '');
        if (typeof(b) !== 'string')
            b = String(b ?? '');

        a = a.split(ignoreRegex).map((e) => parseFn(e, base));
        b = b.split(ignoreRegex).map((e) => parseFn(e, base));

        for (let i = 0, len = Math.max(a.length, b.length); i < len; i++) {
            /* isNaN(undefined) => true */
            if (isNaN(a[i])) {
                if (!isNaN(b[i]))
                    return -1;
            }
            else if (isNaN(b[i]))
                return 1;
            else {
                let cmp = a[i] - b[i];
                if (cmp != 0)
                    return cmp;
            }
        }
        return 0;
    }
}

const cmpInt = makeCmpNumeric(/[^0-9]+/, parseInt, 10);
const cmpFloat = makeCmpNumeric(/[^0-9.]+/, parseFloat, 10);

function cmpString(a, b) {
    if (typeof(a) !== 'string')
        a = String(a ?? '').toLowerCase();
    if (typeof(b) !== 'string')
        b = String(b ?? '').toLowerCase();
    return a > b ? 1 : (a < b ? -1 : 0);
}

function makeCmpFn(fn, asc /* -1 or 1 */, cmpFn) {
    cmpFn ||= cmpDefault;
    return (a, b) => cmpFn(fn(a), fn(b)) * (asc || 1);
}

function makeCmpKey(key, asc /* -1 or 1 */, cmpFn) {
    cmpFn ||= cmpDefault;
    return (a, b) => cmpFn(a[key], b[key]) * (asc || 1);
}

function makeCmpMultiFn(spec /* [ { asc: 1 or -1, fn: <func(a,b)> }, ... ] */) {
    return (a, b) => {
        for (let s of spec) {
            let cmp = s.fn(a, b) * (s.asc || 1);
            if (cmp != 0)
                return cmp;
        }
        return 0;
    }
}

/**
 * Wrapper to navigator.clipboard.writeText() with fallback tentative
 * for non-secure contexts.
 * Source: https://stackoverflow.com/a/65996386
 * Author: drmrbrewer
 */
function copyToClipboard(textToCopy) {
    /* navigator clipboard api needs an https secure context */
    if (navigator.clipboard && window.isSecureContext)
        return navigator.clipboard.writeText(textToCopy);

    /* fallback to text area method */
    const textArea = document.createElement('textarea');
    textArea.value = textToCopy;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    return new Promise((res, rej) => {
        document.execCommand('copy') ? res() : rej();
        textArea.remove();
    });
}

const defaultColumnDefinition = {
    formatHtml: undefined,
    formatText: (value) => value,
    tooltip: () => '',
    getTitle: () => '',
    enabled: true,
    cssClass: () => '',
    cssStyle: () => '',
    order: 999,
    sortable: true,
    truncable: true,
    copyable: true,
};

const defaultConfig = {
    id: 'autotable',
    api: undefined,
    height: undefined,
    itemClass: undefined,
    clickable: undefined,
    paginated: undefined,
    heightOffsets: undefined,
    customHeadersComputation: undefined,
    search: undefined,
    dataReady: [],
    columns: undefined,
    path: '',
};

export default {
    name: 'AutoTable',
    components: {
        AutoTableMenu,
    },
    props: {
        config: {
            type: [ Object, String ],
        },
    },
    computed: {
        id() {
            return this.tableConfig.id || 'auto-table';
        },
        isPaginated() {
            return this.tableConfig.paginated ? true : false;
        },
        search() {
            return this.tableConfig.search || '';
        },
        itemClass() {
            return this.tableConfig.itemClass || '';
        },
        itemClick() {
            return this.tableConfig.clickable || null;
        },
        formattedTableItems() {
            return this.tableItems?.map((item, index) => ({
                id: index,
                ...item,
            }));
        },
        computedHeaders() {
            return this.headers.filter((header) => header.columnDefinition.enabled);
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
            resizeCurCol: undefined,
            resizeNextCol: undefined,
            resizeInitialX: undefined,
            resizeCurHeader: null,
            hasFixedWidths: false,
            dragEl: null,
            nextEl: null,
            oldIndex: -1,
            newIndex: -1,
            preferences: {},
            sortableFunctions: {},
            sortDesc: false,
            sortBy: '',
            tableConfig: {
                api: '',
                height: 'auto',
            },
            showIcons: false,
        };
    },
    watch: {
        config: {
            immediate: true,
            handler() {
                this.loadConfig();
            },
            deep: true,
        },
        'tableConfig.api': {
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
        headers: {
            handler() {
                this.savePreferences();
            },
            deep: true,
        },
    },
    methods: {
        /**
         * Fetch data from an API and format it.
         */
        fetchTableItems() {
            const setup = (data) => {
                /* move data pointer to actual data */
                const path = this.tableConfig.path.split('.');
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

                for (let cb of this.tableConfig.dataReady)
                    cb(data);
                this.tableItems = data;
            }

            const api = this.tableConfig.api;

            /* it starts here */
            console.log('AutoTable: fetchTableItems: tableConfig.api =', api);

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
        async loadConfig() {
            if (typeof this.$props.config == "object") {
                this.tableConfig = Object.assign({}, defaultConfig, this.$props.config);
                console.log('AutoTable: tableConfig =', this.tableConfig);
                return;
            }

            /* Assume this.$props.config type String for the remaining of this
             * function due to the type contraint on the prop. */
            let config = null;

            if (this.$props.config.startsWith('http'))
                config = await this.fetchConfig(this.$props.config)
            else
                config = JSON.parse(this.$props.config)

            const elements = [
                'cssClass', 'cssStyle', 'formatText', 'formatHtml', 'tooltip',
                'sortable', 'clickable', 'truncable', 'copyable',
            ];

            Object.keys(config.columns).forEach((header) => {
                const column = config.columns[header];
                Object.keys(column).forEach((key) => {
                    if (elements.includes(key)) {
                        const text = column[key]
                        let func = null
                        if (text.startsWith('{'))
                            func = eval('(value, item) => ' + text);
                        else if (text.startsWith('@'))
                            func = this[text.slice(1)];
                        else
                            func = () => text;
                        column[key] = func;
                    }
                });
            });

            this.tableConfig = Object.assign({}, defaultConfig, config);
            console.log('AutoTable: tableConfig =', this.tableConfig);
        },
        async fetchConfig(url) {
            const res = await axios(url);
            return res.data;
        },
        /**
         * Get a class name depending an the item
         * @param {*} item - The item to get the class name for
         * @returns {string} - The class name
         */
        getRowClass(item) {
            const itemClass = this.tableConfig.itemClass;
            return typeof itemClass === 'function' ? itemClass(item) : (itemClass || '');
        },
        /**
         * Get CSS class list of a body cell
         * @param {string} header - Header (column) to get classes for
         * @param {object} tableItem - Data for this row
         * @returns {string} - CSS class list for the body cell matching the
         *      given header (column) and row object.
         */
        getCellClass(header, tableItem) {
            return header.columnDefinition.cssClass(tableItem) +
                ' v-data-table__divider col_' + header.value + ' cell_' + header.value +
                (header.columnDefinition.truncable ? ' truncable' : '') +
                (header.columnDefinition.copyable ? ' copyable' : '');
        },
        getHeaderFixedWidthStyle(hEl) {
            let style = ''
            if (this.hasFixedWidths && hEl.width !== undefined) {
                style += 'width: ' + hEl.width + 'px;';
                style += ' min-width: ' + hEl.width + 'px;';
                style += ' max-width: ' + hEl.width + 'px;';
            }
            return style;
        },
        /**
         * Set the height of the table
         */
        setTableHeight() {
            const height = this.tableConfig.height;
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

                if (this.tableConfig.heightOffsets) {
                    this.tableConfig.heightOffsets.forEach((offset) => {
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
        sortCol(header) {
            if (this.resizeCurCol) {
                console.log('AutoTable: sortCol: Resize in progress, cancel event');
                return;
            }
            if (header.columnDefinition.sortable === false) {
                return;
            }
            /* Better to fix columns width in case we are in auto sizing mode,
             * because columns would adjust depending on the (new) shortest / longest
             * content displayed on the page after the sort. The resulting effect may
             * confuse the user. */
            this.fixColumnsWidth();

            /* toggle direction only if sort column has changed */
            if (this.sortBy === header.value)
                this.sortDesc = !this.sortDesc;
            else
                this.sortDesc = false;
            /* set sort column */
            this.sortBy = header.value;
        },
        customSort(items, sortBy, isDesc) {
            const cmpFn = this.sortableFunctions[sortBy] || cmpString;
            return items.sort((a, b) => cmpFn(a[sortBy], b[sortBy]) * (isDesc ? -1 : 1));
        },
        savePreferences() {
            this.headers.forEach((header, i) => {
                const data = {
                    width: header.width || null,
                    enabled: header.columnDefinition.enabled,
                    order: i,
                };
                this.preferences[header.value] = data;
            });
            localStorage.setItem(this.tableConfig.id, JSON.stringify(this.preferences));
        },
        exportToCsv(data) {
            const csv = [];
            data.forEach((item, i) => {
                const line = [];
                this.headers.forEach(header => {
                    let content = " ";

                    content = (i != 0) ? header.columnDefinition.formatText(item[header.value], item) : header.value;

                    if (header.columnDefinition.enabled === false) {
                        return;
                    }

                    if (typeof content === 'string' && (content.includes('"') || content.includes(','))) {
                        if (content.includes('"')) {
                            content = content.replaceAll('"', '""');
                        }
                        content = '"' + content + '"';
                    }

                    line.push(content);
                })
                const str = line.join(",");
                csv.push(str);
            });
            const blob = new Blob([csv.join('\n')], { type: 'text/csv' });

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');

            const date = new Date();
            const title = `export-${date.toISOString().replace(/\D/g, '')}`;

            a.setAttribute('href', url);
            a.setAttribute('download', `${title}.csv`);
            a.click();
        },
        changeFixedWidth($event) {
            this.hasFixedWidths = $event;
            this.preferences['hasFixedWidths'] = $event;
            this.savePreferences()
        },
        /**
         * Swap two headers positions in the table order and save the config in local storage.
         * @param {number} position1 - the position of the first header
         * @param {number} position2 - the position of the second header
         */
        swapHeadersPositions(e) {
            let {oldIndex, newIndex} = e
            newIndex = newIndex < oldIndex ? newIndex : newIndex - 1
            this.headers.splice(newIndex, 0, ...this.headers.splice(oldIndex, 1));
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
            if (typeof this.tableConfig.customHeadersComputation === 'function')
                this.tableConfig.customHeadersComputation(headers);

            if (localStorage.getItem(this.tableConfig.id)) {
                const preferences = JSON.parse(localStorage.getItem(this.tableConfig.id));
                this.preferences = preferences;
            }

            // Set up columns and potentially discard hidden ones (splice),
            // hence the reverse loop
            let i = headers.length;
            while (i--) {
                const header = headers[i];
                const preference = this.preferences[header.value];
                const columnDefinition = Object.assign(
                    {},
                    defaultColumnDefinition,
                    this.tableConfig.columns[header.value],
                );

                header.text ??= columnDefinition.label
                    ?? (header.value.charAt(0).toUpperCase() + header.value.slice(1));
                header.divider = true;
                header.columnDefinition = columnDefinition;
                header.width  = 'auto';
                if (typeof header.columnDefinition.sortable === "function") {
                    this.sortableFunctions[header.value] = header.columnDefinition.sortable;
                }

                if (preference) {
                    header.width = preference.width;
                    header.columnDefinition.order = preference.order;
                    if (typeof preference.enabled === "boolean")
                        header.columnDefinition.enabled = preference.enabled;
                }
            }
            headers.sort((a, b) => a.columnDefinition.order - b.columnDefinition.order);
            headers.map((el, i) => el.columnDefinition.order = el.columnDefinition.order === 999 ? i : el.columnDefinition.order);
            this.headers = headers;
            if (this.preferences['hasFixedWidths']) {
                this.hasFixedWidths = true;
            }
        },

        /* COLUMN MOVE / DRAG */

        /**
         * The DragStart handler
         * assignes the dragEl from the event.target.
         * @param { Event } evt - the evenement from the dragstart event.
         */
        onDragStart(evt) {
            this.dragEl = evt.target;

            this.oldIndex = this.headers.findIndex((e) => {
                return e.value === this.dragEl.getAttribute('data-col-name');
            });

            /* Limiting the movement type */
            evt.dataTransfer.effectAllowed = 'move';
        },
        /**
         * The DragOver handler
         * only assignes the nextEl if the event.target is different from the dragEl.
         * @param { Event } evt - the evenement from the dragover event.
         */
        onDragOver(evt) {
            if (this.nextEl) {
                this.nextEl.classList.remove('autotable-drag-border');
            }
            if (evt.target && evt.target !== this.dragEl && evt.target.nodeName == 'TH') {
                this.nextEl = evt.target;
                this.nextEl.classList.add('autotable-drag-border');
            }
        },
        /**
         * The DragEnd handler
         * defines oldIndex and newIndex and perfoms the swap on new array, then saves it.
         * @param { Event } evt - the evenement from the dragend event.
         */
        onDragEnd() {
            this.newIndex = this.headers.findIndex((e) => {
                return e.value === this.nextEl.getAttribute('data-col-name');
            });

            if (this.nextEl) {
                this.nextEl.classList.remove('autotable-drag-border');
            }

            if (this.oldIndex != -1 && this.newIndex != -1 &&
                this.newIndex !== this.oldIndex) {

                /* Operate swap from oldIndex to newIndex */
                this.headers.splice(
                    this.newIndex < this.oldIndex ? this.newIndex : this.newIndex - 1,
                    0,
                    ...this.headers.splice(this.oldIndex, 1)
                );
            }

            /* reset for next run */
            this.dragEl = null;
            this.nextEl = null;
            this.oldIndex = -1;
            this.newIndex = -1;
        },

        /* COLUMN RESIZE */

        fixColumnsWidth() {
            this.headers.forEach((el, i) => {
                const colTh = document.querySelector('#' + this.tableConfig.id + ' th.col_'+el.value);
                if (colTh) {
                    const measuredWidth = colTh.getBoundingClientRect().width;
                    console.log('AutoTable: fixColumnsWidth: i=', i, ', el=', el, ', headerWidth=', el.width,
                        ', measuredWidth=', measuredWidth, ', cssWidth=', colTh.style.width);
                    this.$set(el, 'width', measuredWidth);
                }
                else {
                    console.log('AutoTable: fixColumnsWidth: i=', i, ', el=', el, ', headerWidth=', el.width,
                        ', HIDDEN');
                }
            });
            this.hasFixedWidths = true;
        },
        /**
         * Event handler triggered on mousedown on a column edge, marking the
         * start of a resize. It first measures and fix columns current widths
         * to disable auto sizing. Here are set the mouse move/down event
         * listeners for the <th> corresponding to the column being resized.
         * @param {Event} e - DOM event triggered on mousedown on the edge of
         *      the column to resize.
         */
        onResizeMouseDown(e) {
            if (!this.hasFixedWidths) {
                this.fixColumnsWidth();
            }

            this.resizeCurCol = e.target.parentElement;
            this.resizeNextCol = e.target.parentElement.nextElementSibling;
            if (this.resizeNextCol)
                this.resizeNextCol.draggable = false;
            this.resizeCurCol.draggable = false;
            this.resizeCurHeader = this.headers.find((e) => {
                return e.value === this.resizeCurCol.getAttribute('data-col-name');
            });
            this.resizeInitialX = e.pageX;

            window.addEventListener('mousemove', this.onResizeMouseMove, false);
            window.addEventListener('mouseup', this.onResizeMouseUp, false);
        },
        /**
         * Event handler triggered on mouseup to end the resize of a column.
         * It commits the updated column width to Vue state and releases the
         * mouse move/up event handlers.
         * @param {Event} e - DOM event triggered on mouseup, marking the end
         *      of a column resize.
         */
        onResizeMouseUp(e) {
            if (!this.resizeCurCol) {
                return;
            }

            if (this.resizeInitialX && this.resizeCurHeader) {
                /* commit updated width to the header object */
                const diffX = e.pageX - this.resizeInitialX;
                const width = this.resizeCurHeader.width + diffX;
                console.log('AutoTable: onResizeMouseUp, column=', this.resizeCurHeader.value,
                    ', initialWidth=', this.resizeCurHeader.width, ', initialPageX=', this.resizeInitialX,
                    ', e.pageX=', e.pageX, ', newWidth=', width);
                this.resizeCurHeader.width = width;
            }

            /* Resets variables for next run */
            if (this.resizeNextCol)
                this.resizeNextCol.draggable = true;
            this.resizeCurCol.draggable = true;
            this.resizeNextCol = undefined;
            this.resizeCurCol = undefined;
            this.resizeCurHeader = null;
            this.resizeInitialX = 0;

            window.removeEventListener('mousemove', this.onResizeMouseMove, false);
            window.removeEventListener('mouseup', this.onResizeMouseUp, false);
        },
        /**
         * Event handler triggered on mousemove during the resize of a column.
         * It updates the column width style (DOM) during resize so that the
         * updated width gets visible to the user, but without modifying Vue
         * state variables to prevent multiple unnecessary refresh the
         * component.
         * @param {Event} e - DOM event triggered on mousemove when dragging
         *      a column edge to resize it.
         */
        onResizeMouseMove(e) {
            if (!this.resizeCurCol || !this.resizeCurHeader) {
                return;
            }

            const diffX = e.pageX - this.resizeInitialX;
            const width = this.resizeCurHeader.width + diffX;

            if (width > 20) {
                this.resizeCurCol.style.width = width + 'px';
                this.resizeCurCol.style.minWidth = width + 'px';
                this.resizeCurCol.style.maxWidth = width + 'px';
            }
        },

        /* CELL CONTENT COPY BUTTON */

        /**
         * Handle mouse enter on a cell of the table body.
         * Used to display the copy icon if the cell content is not empty.
         * @param {MouseEvent} ev - DOM event object
         */
        onMouseEnterBodyCell(ev) {
            /* do not display the copy icon on empty cells */
            const spanContent = ev.target.querySelector('span:first-child');
            if (spanContent && spanContent.textContent === '')
                return;

            const spanCopyIcon = ev.target.querySelector('span.cp-span');
            if (spanCopyIcon)
                spanCopyIcon.classList.add('d-block');
        },
        /**
         * Handle mouse leave from a cell of the table body.
         * Used to hide the copy icon.
         * @param {MouseEvent} ev - DOM event object
         */
        onMouseLeaveBodyCell(ev) {
            const spanCopyIcon = ev.target.querySelector('span.cp-span');
            if (spanCopyIcon)
                spanCopyIcon.classList.remove('d-block');
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
                    setTimeout(() => { tooltipElement.style = ''; }, 400);
                }
            });
        },
    },
    mounted() {
        this.$nextTick(() => this.setTableHeight());
        window.addEventListener('resize', this.setTableHeight);
    },
    destroyed() {
        window.removeEventListener('resize', this.setTableHeight);
    },

    /* EXPORTED HELPERS */

    utils: {
        cmpDefault,
        cmpFloat,
        cmpInt,
        cmpString,
        makeCmpFn,
        makeCmpKey,
        makeCmpMultiFn,
    },
};
</script>
