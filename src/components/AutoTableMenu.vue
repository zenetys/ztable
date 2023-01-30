<template>
    <div class="menu">
    <v-tooltip top>
         <template v-slot:activator="{ on, attrs }">
            <v-btn
                elevation="0"
                absolute
                small
                v-bind="attrs"
                v-on="on"
                @click="enabled = !enabled"
                class="menu_icon color-white"
            >
                <v-icon color="primary" small>mdi-cog</v-icon>
            </v-btn>
        </template>
        <span style="font-size: 12px;">Open columns settings</span>
    </v-tooltip>

    <v-tooltip bottom>
         <template v-slot:activator="{ on, attrs }">
             <v-btn class="export_button color-white" small v-bind="attrs" v-on="on" @click="exportToCsv">
                 <span class=""><v-icon color="primary" small >mdi-microsoft-excel</v-icon></span>
             </v-btn>
        </template>
        <span style="font-size: 12px;">Export to csv</span>
    </v-tooltip>

        <aside :class="enabled ? '' : 'hidden'" class="menu_modal" @dragstart="onDragStart" @dragover="onDragOver" @dragend="onDragEnd">
            <div class="flex justify-between menu_header">
                <strong>Visible</strong>
                <strong>Column</strong>
                <strong>Width</strong>
            </div>
            <div v-for="header in items" :key="header.value" class="flex justify-between items-center menu_item" draggable="true">
                <input type="checkbox" v-model="header.columnDefinition.enabled">
                <div class="" style="width: 50%">
                    <p class="text-left capitalize">{{ header.value }}</p>
                </div>
                <input
                    v-model="header.width"
                    :disabled="!header.columnDefinition.enabled"
                    :class="!header.columnDefinition.enabled ? 'disabled' : ''"
                    style="border-bottom: 1px dashed black;"
                    @change="toggleFixedWidth(true)"
                >
            </div>
            <div class="flex justify-between mt-3">
                <v-btn
                    small
                    color="primary"
                    class="primary_button"
                    :disabled="!hasFixedWidths"
                    @click="hasFixedWidths ? toggleFixedWidth(false) : ''"
                >Reset</v-btn>
                <v-btn small color="primary" class="primary_button" @click="enabled = false">Close</v-btn>
            </div>
        </aside>
   </div>
</template>

<style scoped lang="scss">
::v-deep {
    .v-btn:not(.v-btn--round).v-size--small {
        height: auto;
        padding: 0.5em 0.75em;
        min-width: 0!important;
        box-shadow: none;
        background: none;
    }
}
.menu {
    position: relative
}
.menu_icon {
    position: absolute;
    top: 2px;
    right: 26px;
    z-index: 10;
}
.menu_modal {
    background-color: rgba(255, 255, 255, 1);
    width: 175px;
    position: absolute;
    top: 35px;
    right: 30px;
    z-index: 10;
    padding: 1em;
    filter: drop-shadow(0 4px 3px rgb(0 0 0 / 0.07)) drop-shadow(0 2px 2px rgb(0 0 0 / 0.06));
}
.menu-drag-class {
    background-color: rgba(0, 0, 0, 0.3)
}
.menu_header {
    padding-bottom: 0.25em;
}
.menu_item:not(:last-child) {
    margin-bottom: 0.25em;
}
.export_button {
    position: absolute;
    top: 2px;
    right: 60px;
    z-index: 10;
}
.flex {
    display: flex;
}
.justify-between {
    justify-content: space-between;
}
.hidden {
    display: none;
}
.disabled {
    color: rgba(0, 0, 0, 0.5);
}
.items-center {
    align-items: center;
}
.text-left {
    text-align: left;
}
.capitalize {
    text-transform: capitalize;
}
.color-white {
    background-color: #fcfcfc!important;
}
.primary_button {
    background-color: #3f51b5;
    color: #ffffff;
    padding: 0.25em 0.75em;
}
button,
input {
    outline: none;
}
input {
    max-width: 2em;
}
p {
    margin: 0!important;
}
p,
strong,
input,
button {
    font-size: 12px;
    font-family: 'Roboto';
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
