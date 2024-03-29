<template>
    <div class="menu">
        <div
            @mouseenter="showIconsInternal = true"
            @mouseleave="showIconsInternal = false"
            class="icons-panel"
        >
            <div :style="iconsPanelVisibility">
                <v-tooltip bottom transition="none">
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn
                            elevation="0"
                            x-small
                            v-bind="attrs"
                            v-on="on"
                            @click="exportToCsv"
                            class="export_button color-white mr-1"
                        >
                            <v-icon color="primary" small>mdi-microsoft-excel</v-icon>
                        </v-btn>
                    </template>
                    <span>Export to CSV</span>
                </v-tooltip>
                <v-tooltip bottom transition="none">
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn
                            elevation="0"
                            x-small
                            v-bind="attrs"
                            v-on="on"
                            @click="enabled = !enabled"
                            class="menu_button color-white"
                        >
                            <v-icon color="primary" small>mdi-cog</v-icon>
                        </v-btn>
                    </template>
                    <span>Open columns settings</span>
                </v-tooltip>
            </div>
        </div>

        <aside
            v-show="enabled"
            class="menu_modal"
            @dragstart="onDragStart"
            @dragover="onDragOver"
            @dragend="onDragEnd"
            :style="`max-height: ${maxHeight}px;`"
        >
            <div class="menu_header">
                <div class="flex justify-between items-center">
                    <span></span>
                    <span class="font-weight-medium">Column</span>
                    <span class="font-weight-medium">Width</span>
                </div>
            </div>
            <div class="menu_rows_container">
                <div
                    v-for="header in items"
                    :key="header.value"
                    class="flex justify-between items-center menu_row"
                    draggable="true"
                >
                    <span>
                        <input
                            type="checkbox"
                            :checked="header.enabled"
                            @change="onColumnToggle(header)"
                        />
                    </span>
                    <span class="menu_header_name_container">
                        <p :data-col-name="header.value" v-if="header.text">{{ header.text }}</p>
                        <p :data-col-name="header.value" v-else class="font-italic">{{ header.value }}</p>
                    </span>
                    <span class="menu_input_container">
                        <input
                            type="number"
                            placeholder="none"
                            :value="getColumnWidth(header)"
                            :disabled="!header.enabled"
                            :class="(header.enabled ? '' : 'disabled ') + (hasFixedWidths ? '' : 'font-italic')"
                            class="text-right menu_input"
                            @change="onWidthChange(header, $event)"
                        />
                    </span>
                </div>
            </div>
            <div class="menu_footer">
                <div class="flex justify-between mt-3">
                    <v-btn
                        x-small
                        color="red"
                        class="primary_button"
                        @click="onResetButtonClicked"
                    >Reset</v-btn>
                    <v-btn
                        x-small
                        color="primary"
                        class="primary_button"
                        @click="enabled = false"
                    >Close</v-btn>
                </div>
            </div>
        </aside>
   </div>
</template>

<style scoped lang="scss">
.v-tooltip__content {
    font-size: 10px;
    padding: 0px 8px;
}
.icons-panel {
    position: absolute;
    right: 26px;
    top: 4px;
    z-index: 10;
}
.icons-panel > div {
    background-color: #fcfcfc;
    padding: 0 2px;
}
.v-btn.menu_button {
    width: 20px;
    min-width: inherit;
    top: -1px;
}
.menu_modal {
    background-color: rgba(255, 255, 255, 1);
    width: 175px;
    position: absolute;
    top: 35px;
    right: 26px;
    z-index: 10;

    filter: drop-shadow(0 4px 3px rgb(0 0 0 / 0.07)) drop-shadow(0 2px 2px rgb(0 0 0 / 0.06));
    overflow: scroll;

    .menu_header {
        font-size: 12px;
        padding: 0.5em 0.7em 0 0.7em;
        width: 100%;
        position: sticky;
        background: #fff;
        top: 0px;
        right: 0;
    }

    .menu_rows_container {
        overflow: scroll;
        padding: 0.5em 0.7em 0 0.7em;
    }

    .menu_footer {
        width: 100%;
        position: sticky;
        bottom: 0px;
        background: #fff;
        padding: 0 0.7em 0.5em 0.7em;
    }
}
.menu_header_name_container p, span {
    margin-bottom: 0px!important;
}
.menu_input_container {
    border-bottom: 1px dashed black;
}
.menu_input {
    min-width: 64px;
}
.menu-drag-class {
    background-color: rgba(0, 0, 0, 0.3)
}
.menu_row > span {
    font-size: 12px;
}
.menu_row > :nth-child(1) {
    width: 20%;
    height: 100%;
}
.menu_row > :nth-child(2) {
    width: 50%;
}
.menu_row > :nth-child(3) {
    width: 30%;
    text-align: right;
}
.v-btn.export_button {
    width: 20px;
    min-width: inherit;
    top: -1px;
}
.flex {
    display: flex;
}
.justify-between {
    justify-content: space-between;
}
.disabled {
    color: rgba(0, 0, 0, 0.5);
}
.items-center {
    align-items: center;
}
.color-white {
    background-color: #fcfcfc!important;
}
.v-btn.primary_button {
    background-color: #3f51b5;
    color: #ffffff;
    height: 23px;
}
p {
    margin: 0;
    font-size: inherit;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
}
button,
input {
    outline: none;
}
input[type="number"] {
    max-width: 70%;
    line-height: 1em;
    padding-right: 3px;
}
input[type="checkbox"] {
    accent-color: #0f6e84;
}
</style>

<script>
export default {
    name: 'AutoTableMenu',
    props: {
        items: [],
        hasFixedWidths: Boolean,
        showIcons: Boolean,
        maxHeight: Number,
    },
    emits: ['swap', 'toggle', 'export', 'reset'],
    data() {
        return {
            showIconsInternal: false,
            enabled: false,
            oldIndex: -1,
            newIndex: -1,
            nextEl: null,
            dragEl: null,
            measuredWidths: {},
        };
    },
    computed: {
        iconsPanelVisibility() {
            if (this.enabled || this.showIcons || this.showIconsInternal)
                return 'visibility: visible;';
            else
                return 'visibility: hidden;';
        },
    },
    watch: {
        enabled(cur) {
            if (cur)
                this.measureWidths();
        },
    },
    methods: {
        getColumnWidth(header) {
            const minWidth = 75;
            const maxWidth = 1000;
            
            let w = header.width ?? this.measuredWidths[header.value];
            return (typeof w === 'number' && !isNaN(w) && w < maxWidth && w >= minWidth) ? Math.round(w) : minWidth;
        },
        measureWidths() {
            this.measuredWidths = {};
            this.items.forEach((header) => {
                const colTh = this.$el?.parentElement?.querySelector('th.col_' + header.value);
                this.measuredWidths[header.value] = colTh?.getBoundingClientRect()?.width;
            });
        },
        exportToCsv() {
            this.$emit('export');
        },
        /**
         * The DragStart handler
         * assignes the dragEl from the event.target.
         * @param { Event } evt - the evenement from the dragstart event.
         */
        onDragStart(evt) {
            this.dragEl = evt.target.querySelector('p');

            this.oldIndex = this.items.findIndex((e) => {
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
            /* prevent animation seen on firefox on dragend */
            evt.preventDefault();

            if (this.nextEl) {
                this.nextEl.parentElement.classList.remove('menu-drag-class');
            }
            if (evt.target.nodeName == 'P') {
                this.nextEl = evt.target;
            }
            if (this.nextEl && this.nextEl !== this.dragEl) {
                this.nextEl.parentElement.classList.add('menu-drag-class');
            }
        },
        /**
         * The DragEnd handler
         * defines oldIndex and newIndex and perfoms the swap on new array, then saves it.
         * @param { Event } evt - the evenement from the dragend event.
         */
        onDragEnd() {
            if (this.nextEl) {
                this.newIndex = this.items.findIndex((e) => {
                    return e.value === this.nextEl.getAttribute('data-col-name');
                });
                this.nextEl.parentElement.classList.remove('menu-drag-class');

                if (this.newIndex !== -1 && this.oldIndex !== -1 &&
                    this.newIndex !== this.oldIndex) {
                    console.log('AutoTableMenu: Emit swap:', this.oldIndex, this.newIndex);
                    this.$emit('swap', this.oldIndex, this.newIndex);
                }
            }
            this.nextEl = null;
            this.dragEl = null;
            this.oldIndex = -1;
            this.newIndex = -1;
        },
        onResetButtonClicked() {
            console.log('AutoTableMenu: Emit reset');
            this.$emit('reset');
            this.enabled = false;
            this.$nextTick(function () { this.measureWidths(); });
        },
        onWidthChange(header, ev) {
            let width = parseInt(ev.target.value, 10);
            if (isNaN(width))
                width = 75;
            console.log('AutoTableMenu: Emit width:', header, width);
            this.$emit('width', header, width);
        },
        onColumnToggle(header) {
            const givenWidth = this.getColumnWidth(header);
            console.log('AutoTableMenu: Emit toggle:', header, givenWidth);
            this.$emit('toggle', header, givenWidth);
        },
    },
};
</script>
