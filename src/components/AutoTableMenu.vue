<template>
    <div class="menu">
        <v-tooltip bottom transition="none">
            <template v-slot:activator="{ on, attrs }">
                <v-btn
                    elevation="0"
                    absolute
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

        <v-tooltip bottom transition="none">
            <template v-slot:activator="{ on, attrs }">
                <v-btn
                    elevation="0"
                    absolute
                    x-small
                    v-bind="attrs"
                    v-on="on"
                    @click="exportToCsv"
                    class="export_button color-white"
                >
                    <v-icon color="primary" small>mdi-microsoft-excel</v-icon>
                </v-btn>
            </template>
            <span>Export to CSV</span>
        </v-tooltip>

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
                <span><input type="checkbox" v-model="header.enabled" /></span>
                <span v-if="header.text">{{ header.text }}</span>
                <span v-else class="font-italic">{{ header.value }}</span>
                <span>
                    <input
                        v-model="header.width"
                        :disabled="!header.columnDefinition.enabled"
                        :class="!header.columnDefinition.enabled ? 'disabled' : ''"
                        class="text-right"
                        style="border-bottom: 1px dashed black;"
                        @change="toggleFixedWidth(true)"
                    />
                </span>
            </div>
            <div class="flex justify-between mt-3">
                <v-btn
                    x-small
                    color="red"
                    class="primary_button"
                    :disabled="!hasFixedWidths"
                    @click="hasFixedWidths ? toggleFixedWidth(false) : ''"
                >Reset</v-btn>
                <v-btn
                    small
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
.v-btn.menu_button {
    position: absolute;
    top: 6px;
    right: 26px;
    z-index: 10;
    width: 20px;
    min-width: inherit;
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
        show: Boolean,
    },
    emits: ['swapped', 'toggle', 'export'],
    data() {
        return {
            enabled: false,
            oldIndex: 0,
            newIndex: 0,
            nextEl: null,
            dragEl: null,
        };
    },
    watch: {
        show: {
            handler(newValue, oldValue) {
                this.enabled = newValue === false ? false : oldValue;
            },
        },
    },
    methods: {
        exportToCsv() {
            this.$emit('export');
        },
        toggleFixedWidth(value) {
            if (this.$props.hasFixedWidths === value) {
                return;
            }
            this.$emit('toggle', value);
        },
        /**
         * The DragStart handler
         * assignes the dragEl from the event.target.
         * @param { Event } evt - the evenement from the dragstart event.
         */
        onDragStart(evt) {
            this.dragEl = evt.target.querySelector('p');

            this.oldIndex = this.items.findIndex((e) => {
                return e.value === this.dragEl.textContent;
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
            else {
                this.nextEl = evt.target.querySelector('p');
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
            if (!this.nextEl) {
                return;
            }
            this.newIndex = this.items.findIndex((e) => {
                return e.value === this.nextEl.textContent;
            });

            if (this.nextEl) {
                this.nextEl.parentElement.classList.remove('menu-drag-class');
            }

            if (this.newIndex !== this.oldIndex) {
                /* Operate swap from oldIndex to newIndex */

                const { oldIndex, newIndex } = this;
                this.$emit('swapped', { oldIndex, newIndex });
                this.nextEl = null;
                this.dragEl = null;
                this.oldIndex = 0;
                this.newIndex = 0;
            }
        },
    },
};
</script>
