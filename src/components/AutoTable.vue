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
            :class="hasFixedWidths ? 'fixedWidth' : ''"
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
            :options="{ sortBy, sortDesc}"
        >
            <template v-slot:header="{ props: { headers } }">
                <thead id="autotable_header">
                    <tr
                        @dragstart="onDragStart"
                        @dragover="onDragOver"
                        @dragend.stop="onDragEnd"
                        :class="hasFixedWidths ? '' : 'sizable'"
                        v-if="headers.length > 0"
                    >
                        <th
                            class="v-data-table__divider"
                            :class="'header_' + header.value"
                            v-for="header in headers"
                            :key="header.value"
                            :draggable="true"
                            @mouseup="sortCol(header)"
                        >
                            <span>{{header.text}}<v-icon
                                v-if="header.columnDefinition.sortable"
                                style="margin-left: 1em"
                            >mdi-arrow-{{ header.sortDesc ? 'up' : 'down'}}</v-icon></span>
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
                        class="col_size"
                    >
                        <td
                            v-for="(header, headerIndex) in headers"
                            :key="headerIndex"
                            :title="header.columnDefinition.getTitle(item)"
                            :class="getCellClass(header, item)"
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
    cursor: w-resize;
    position: absolute;
    top: 0;
    right: 0;
    width: 10px;
    height: 100%;
    display: inline-block;
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

    .fixedWidth table {
        width: auto;
        position: relative;
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

            &.truncable {
                max-width: 0;
                > span:not(.cp-span) {
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
            }

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

.autotable-drag-border {
    border-left: 1px dashed black;
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
    sortable: true,
    truncable: true,
};

const defaultConfig = {
    id: 'autotable',
    api: undefined,
    height: undefined,
    itemClass: undefined,
    clickable: undefined,
    copyable: undefined,
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
        activeCopyCellContent() {
            return this.tableConfig.copyable || false;
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
            curCol: undefined,
            curColWidth: undefined,
            nextCol: undefined,
            pageX: undefined,
            curHeader: null,
            hasFixedWidths: false,
            dragEl: null,
            nextEl: null,
            oldIndex: 0,
            newIndex: 0,
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
                'sortable', 'clickable', 'truncable',
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
                ' v-data-table__divider col_' + header.value +
                (header.columnDefinition.truncable ? ' truncable' : '');
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
        sortCol(header) {
            if (this.curCol) {
                console.log('AutoTable: sortCol: Resize in progress, cancel event');
                return;
            }
            if (header.columnDefinition.sortable === false) {
                return;
            }
            this.sortBy = header.value;
            header.sortDesc = !header.sortDesc;
            this.sortDesc = header.sortDesc;
        },
        customSort(items, sortBy, isDesc) {
            function sortFunction(a, b, sortBy) {
                if (a[sortBy] > b[sortBy] || a[sortBy] === null && b[sortBy] !== null) {
                    return -1;
                }
                if (a[sortBy] < b[sortBy] || b[sortBy] === null && a[sortBy] !== null) {
                    return 1;
                }
                // a must be equal to b
                return 0;
            }

            const sort = this.sortableFunctions[sortBy] || sortFunction;
            return items.sort((a, b) => {
                const res = isDesc ? sort(a, b, sortBy) : sort(b, a, sortBy);
                return res;
            });
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
        /**
         * The DragStart handler
         * assignes the dragEl from the event.target.
         * @param { Event } evt - the evenement from the dragstart event.
         */
        onDragStart(evt) {
            this.dragEl = evt.target;

            this.oldIndex = this.headers.findIndex((e) => {
                return e.text === this.dragEl.textContent;
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
            if (!this.nextEl) {
                return;
            }

            this.newIndex = this.headers.findIndex((e) => {
                return e.text === this.nextEl.textContent;
            });

            if (this.nextEl) {
                this.nextEl.classList.remove('autotable-drag-border');
            }

            if (this.newIndex !== this.oldIndex) {
                /* Operate swap from oldIndex to newIndex */
                this.headers.splice(
                    this.newIndex < this.oldIndex ? this.newIndex : this.newIndex - 1,
                    0,
                    ...this.headers.splice(this.oldIndex, 1)
                );
            }
        },
        /**
         * Sets the mousedown listener for a th on mousedown
         * if mouse position is in the last 10px and sets the mousemove listener if so.
         * @param { HTMLElement } div - the div to set the listeners on.
         */
        onResizeMouseDown(e) {
            this.curCol = e.target.parentElement;
            this.nextCol = e.target.parentElement.nextElementSibling;
            this.nextCol.draggable = false;
            this.curCol.draggable = false;
            this.curHeader = this.headers.find((e) => {
                return e.text === this.curCol.textContent;
            });
            this.pageX = e.pageX;
            this.curColWidth = this.curCol.offsetWidth;

            window.addEventListener('mousemove', this.resizeCol, false);
            window.addEventListener('mouseup', this.onResizeMouseUp, false);
        },
        /**
         * Sets the new width if defined, and unsets related variables.
         * @param { Event } evt - the evenement from the onmove event.
         */
        onResizeMouseUp(e) {
            if (!this.curCol) {
                return;
            }

            if (this.pageX && this.curHeader) {
                this.curHeader.width = this.curColWidth + e.pageX - this.pageX;
                this.hasFixedWidths = true;
            }

            /* Resets Variables for next run */
            this.nextCol.draggable = true;
            this.curCol.draggable = true;
            this.nextCol = undefined;
            this.curCol = undefined;
            this.curHeader = null;
            this.curColWidth = 0;
            this.pageX = 0;

            window.removeEventListener('mousemove', this.resizeCol, false);
            window.removeEventListener('mouseup', this.onResizeMouseUp, false);
        },
        /**
         * Calculates diff and the new width and sets it ont the html dom.
         * @param { Event } evt - the evenement from the onmove event.
         */
        resizeCol(e) {
            if (!this.curCol || !this.curHeader) {
                return;
            }

            if (!this.hasFixedWidths) {
                const elsHeader = document.querySelectorAll('#' + this.tableConfig.id + ' th');
                elsHeader.forEach((el, i) => {
                    const width = el.offsetWidth;
                    this.headers[i].width = width;

                    el.style.width = width + 'px';
                    el.style.maxWidth = width + 'px';
                    el.style.minWidth = width + 'px';
                });
                this.hasFixedWidths = true;
                return;
            }
            const diffX = e.pageX - this.pageX;
            const width = this.curColWidth + diffX;

            if (width > 20) {
                this.curCol.style.width = width + 'px';
                this.curCol.style.minWidth = width + 'px';
                this.curCol.style.maxWidth = width + 'px';
            }
        }
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
