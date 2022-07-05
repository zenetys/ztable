<template>
    <div id="__table-container">
        <!-- COLUMN OPTIONS MENU -->
        <v-menu
            offset-y
            transition="slide-y-transition"
            :close-on-content-click="false"
            min-width="400"
            v-if="headers && formattedTableItems"
        >
            <template v-slot:activator="{ on: menu, attrs }">
                <v-tooltip bottom>
                    <template v-slot:activator="{ on: tooltip }">
                        <v-btn
                            elevation="0"
                            color="secondary"
                            absolute
                            small
                            icon
                            v-bind="attrs"
                            v-on="{ ...tooltip, ...menu }"
                            id="__column-options-button"
                            :class="computedColumnButtonClasses"
                        >
                            <v-icon>mdi-application-cog</v-icon>
                        </v-btn>
                    </template>
                    <span>Open columns settings</span>
                </v-tooltip>
            </template>
            <v-list dense>
                <v-list-item>
                    <v-row>
                        <v-col cols="6">
                            <strong>Column</strong>
                        </v-col>
                        <v-col cols="3">
                            <strong>Visible</strong>
                        </v-col>
                        <v-col cols="3" class="text-center">
                            <strong>Width</strong>
                        </v-col>
                    </v-row>
                </v-list-item>
                <v-divider></v-divider>
                <v-list-item v-for="header in headers" :key="header.value" class="__column-menu">
                    <v-row>
                        <v-col cols="6" align-self="center">
                            {{ header.text }}
                        </v-col>
                        <v-col cols="3" class="__column-menu--visible-switch">
                            <v-switch
                                v-model="header.visible"
                                dense
                                hide-details
                                @change="StorageConfigManager.updateStorageColumnOptions(header, 'visible')"
                            ></v-switch>
                        </v-col>
                        <v-col cols="3" class="__column-menu--width-field">
                            <v-text-field
                                v-model="header.width"
                                :disabled="!header.visible"
                                @input="saveUpdatedWidth(header)"
                                dense
                                hide-details
                                type="number"
                            ></v-text-field>
                        </v-col>
                    </v-row>
                </v-list-item>
            </v-list>
        </v-menu>

        <!-- DATA TABLE -->
        <v-data-table
            v-if="computedHeaders && formattedTableItems"
            id="auto-table"
            :headers="computedHeaders"
            :items="formattedTableItems"
            class="elevation-2"
            dense
            :item-class="itemClasses"
            item-key="__zid"
            :search="search"
            fixed-header
            :height="tableHeight"
            :footer-props="tableFooterProps"
            mobile-breakpoint="0"
        >
            <template v-for="header in computedHeaders" v-slot:[`item.${header.value}`]="{ item }">
                <span
                    v-if="item[header.value] || item[header.value] === 0"
                    :key="header.hid"
                    :class="header.getCellClasses(header, item)"
                    :title="header.getCellContent(header, item)"
                    v-html="header.getCellContent(header, item)"
                ></span>
            </template>
        </v-data-table>
    </div>
</template>

<style lang="scss">
#__table-container {
    position: relative;
}

#__column-options-button {
    z-index: 7;
    right: 8px;
}

.__column-options-button--offset-top {
    top: -37px;
}

.v-data-table-header th {
    white-space: nowrap;
}

.v-data-footer {
    margin-right: 0 !important;
}

.__column-menu {
    .col {
        padding: 6px 12px;

        .v-input--switch {
            margin-top: 0;
        }
    }
}

.__column-menu--width-field input {
    text-align: center;
}

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
                top: 1px;
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

.__settings-btn {
    bottom: 2vh !important;
    left: 2vw !important;
}
</style>

<script>
import DataManager from '@/plugins/dataManager';
import StorageConfigManager from '@/plugins/storageConfigManager';
import { VDataTable } from 'vuetify/lib';
import { getItemClasses, customSortByColumn } from '@/plugins/formatManager';

export default {
    name: 'auto-table',
    props: {
        /**
         * @prop {string} items - the table items to display
         */
        items: {
            type: Array,
        },
        /**
         * @prop {Array} headers - the table headers to display
         */
        headers: {
            type: Array,
        },
    },
    components: {
        VDataTable,
    },
    computed: {
        /**
         * Format the table items to display in the table
         * @computed
         * @returns {Array<{id: number, [key: string]: any}>} the formatted table items to display in the table
         */
        formattedTableItems() {
            return this.items?.map((item, index) => {
                const row = { ...item };

                Object.keys(row).forEach((property) => {
                    if (Array.isArray(row[property])) {
                        // If the property is an array, assign an object with a text value and the array as properties
                        row[property] = {
                            text: row[property].length + ' elements',
                            value: row[property],
                        };
                    } else if (typeof row[property] === 'object') {
                        // If the property is an object, assign an object with the object as properties
                        row[property] = {
                            text: 'Object',
                            value: row[property],
                        };
                    }
                });

                return {
                    __zid: index,
                    ...row,
                };
            });
        },
        /**
         * Filter the table headers to only display the selected
         * @computed
         * @returns {Array} the filtered table headers to display in the table
         */
        computedHeaders() {
            return this.headers.filter((header) => header.visible);
        },
        /**
         * Get classes for the table items depending on headers config
         * @computed
         * @returns {*} the classes for the table items depending on headers config
         */
        itemClasses() {
            return DataManager.config.dataType === 'generic' && DataManager.config.headersUrl
                ? DataManager.getItemClassesFromHeaderConfig
                : getItemClasses;
        },
        computedColumnButtonClasses() {
            return DataManager.config.dataType === 'generic' ? '__column-options-button--offset-top' : '';
        },
    },
    data() {
        return {
            StorageConfigManager,
            selected: [],
            search: '',
            tableFooterProps: { 'items-per-page-options': [50, 100, 150, -1] },
            tableHeight: null,
            inputTimeout: null,
        };
    },
    methods: {
        getItemClasses,
        customSortByColumn,
        /**
         * Calculate the height of the table
         */
        computeTableHeight() {
            const autoTableElement = document.querySelector('#auto-table');

            if (autoTableElement?.parentElement.style.height) {
                this.tableHeight = autoTableElement?.parentElement.style.height;
            } else {
                this.tableHeight =
                    window.innerHeight - document.getElementsByClassName('v-data-footer')[0]?.clientHeight;
            }
        },
        /**
         * Update the width a header in the table and save its config in local storage
         */
        saveUpdatedWidth(header) {
            if (this.inputTimeout) {
                clearTimeout(this.inputTimeout);
            }
            this.inputTimeout = setTimeout(() => {
                const headers = [...DataManager.headers];
                const updatedHeader = headers.find((h) => h.value === header.value);
                /* Update header's width in the table */
                updatedHeader.width = header.width;
                DataManager.headers = headers;
                /* Save the column options in storage */
                this.StorageConfigManager.updateStorageColumnOptions(header, 'width');
            }, 400);
        },
    },
    mounted() {
        this.computeTableHeight();
    },
    updated() {
        this.computeTableHeight();
    },
};
</script>
