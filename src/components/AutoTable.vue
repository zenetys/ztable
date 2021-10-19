<template>
        <v-data-table
            id="auto-table"
            :headers="headers"
            :items="data"
            class="elevation-2"
            dense
            :item-class="rowColor"
            show-select
            item-key="id"
            :search="search"
            fixed-header
            :height="tableHeight"
            :footer-props="{
                'items-per-page-options': [50, 100, 150]
            }"
            mobile-breakpoint="0"
        >
        <template v-for="h, in headers" v-slot:[`item.${h.value}`]="{ item }">
                <span :key="h.id" :class="h.shape(item[h.value])" :title="h.render(item[h.value])" v-html="h.render(item[h.value])"></span>
        </template>
        </v-data-table>
</template>

<style lang="scss">

    tbody .v-data-table__divider {
        position: relative;
    }

    tbody .v-data-table__divider span {
        position: absolute;
        top: 1;
        left: 0;
        right: 0;
        bottom: 0;
        padding: 5px 5px 5px 5px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    // Transparent color on hover each table tr
    .v-data-table tbody tr:hover:not(.v-data-table__expanded__content) {
        filter: grayscale(10%) brightness(95%);
        -webkit-filter:  grayscale(10%) brightness(95%);
    }
</style>

<script>

import { VDataTable } from 'vuetify/lib';
import axios from 'axios';
import { cellContent, cellColor, rowColor, customSortByColumn } from "../plugins/formatManager";

export default {
    name: 'auto-table',
    props:{
        api:{
            type: String,
        },
        array_data: {
            type: String,
        },
    },
    components: {
        VDataTable,
    },
    computed: {
        headers() {
            let headerArray = [];

            this.items.forEach(element => {
                for (const key in element) {
                    let textVal = String(key.charAt(0).toUpperCase() + key.slice(1));
                    if (headerArray.findIndex(el => el.text == textVal)==-1) {
                        headerArray.push({text:textVal, value:key, divider:true, align:'start', render: cellContent, shape: cellColor });
                    }
                }
            });
            
            return headerArray;
        },
        data() {
            return this.items.map((item, index) => ({
                id: index,
                ...item
            }));
        }
    },
    data() {
        return {
            items: [],
            selected: [],
            search: "",
            tableHeight: 0,
        }
    },
    methods: {
        rowColor,
        getItems() {
            axios.get(this.$props.api)
                .then( (response) => {
                    let path = this.$props.array_data.split(".");
                    let ptr = response.data;

                    for (let i = 0; i < path.length; i++) {
                        if (ptr[path[i]]) {
                            ptr = ptr[path[i]];
                        } else {
                            ptr = null;
                            break;
                        }
                    }
                    if (ptr==null) {
                        this.$emit('error', 'Error occurs in data path.');
                    }
                    
                    this.items = ptr;
                }).catch( (error) => {
                    this.$emit('error', error);
                });
        },
        customSort(items, index, isDesc) {
            return customSortByColumn(items, index, isDesc);
        },
        setTableHeight() {
            if (document.querySelector('#auto-table').parentElement.style.height!="") {
                this.tableHeight = document.querySelector('#auto-table').parentElement.style.height;
            } else {
                this.tableHeight = window.innerHeight - document.getElementsByClassName('v-data-footer')[0].clientHeight;
            }
        }

    },
    mounted() {
        this.getItems();
        this.setTableHeight();
    },
    
}
</script>