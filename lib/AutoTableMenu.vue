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
        >
            <div class="flex justify-between items-center menu_row">
                <span></span>
                <span class="font-weight-medium">Column</span>
                <span class="font-weight-medium">Width</span>
            </div>
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
                <span>
                    <p :data-col-name="header.value" v-if="header.text">{{ header.text }}</p>
                    <p :data-col-name="header.value" v-else class="font-italic">{{ header.value }}</p>
                </span>
                <span>
                    <input
                        type="text"
                        placeholder="none"
                        :value="getColumnWidth(header)"
                        :disabled="!header.enabled"
                        :class="(header.enabled ? '' : 'disabled ') + (hasFixedWidths ? '' : 'font-italic')"
                        class="text-right"
                        @change="onWidthChange(header, $event)"
                    />
                </span>
            </div>
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
        </aside>
   </div>
</template>

<style scoped lang="scss">
.v-tooltip__content {
    font-size: 10px;
    padding: 0px 8px;
}
.menu {
    position: relative
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
    padding: 0.7em;
    filter: drop-shadow(0 4px 3px rgb(0 0 0 / 0.07)) drop-shadow(0 2px 2px rgb(0 0 0 / 0.06));
}
.menu-drag-class {
    background-color: rgba(0, 0, 0, 0.3)
}
.menu_row {
    margin-bottom: 0.20em;
}
.menu_row > span {
    font-size: 12px;
}
.menu_row > :nth-child(1) {
    width: 20%;
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
input[type="text"] {
    max-width: 70%;
    line-height: 1em;
    border-bottom: 1px dashed black;
    padding-right: 3px;
}
input[type="checkbox"] {
    accent-color: #0f6e84;
    position: relative;
    top: 2px;
}
</style>

<script>
export default {
    name: 'AutoTableMenu',
    props: {
        items: [],
        hasFixedWidths: Boolean,
        showIcons: Boolean,
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
            let w = header.width ?? this.measuredWidths[header.value];
            return (typeof w === 'number' && !isNaN(w)) ? Math.round(w) : undefined;
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
                width = undefined;
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
