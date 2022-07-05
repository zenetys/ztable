<template>
    <v-app>
        <v-main>
            <div class="ml-1 mr-2">
                <AutoTable v-if="tableData" :headers="headers" :items="tableData" />
            </div>
        </v-main>
    </v-app>
</template>

<style lang="scss">
a:link {
    text-decoration: none;
}
</style>

<script>
import AutoTable from '@/components/AutoTable';
import DataManager from '@/plugins/dataManager';
import { EventBus } from '@/plugins/eventBus';

export default {
    name: 'App',
    components: {
        AutoTable,
    },
    data() {
        return {
            appVersion: process.env.VUE_APP_VERSION,
            appName: process.env.VUE_APP_NAME,
            headers: null,
            apiData: null,
            tableData: null,
        };
    },
    methods: {
        /**
         * Fetch data from the provided API and initialise the table data using the DataManager
         */
        fetchDataAndInitTable() {
            DataManager.apiUrl = this.$apiConfig.apiUrl;
            DataManager.dataPath = this.$apiConfig.dataPath;
            DataManager.fetchApiData()
                .then((response) => {
                    this.apiData = response;
                    this.tableData = DataManager.generateTableData();
                    this.headers = DataManager.generateHeaders();

                    if (this.tableData) {
                        this.$emit('error', 'Error occurs in data path.');
                    }
                })
                .catch((error) => {
                    this.$emit('error', error);
                });
        },
        handleError(error) {
            console.log('Error: ', error);
        },
    },
    created() {
        EventBus.$on('error', this.handleError);
    },
    beforeDestroy() {
        EventBus.$off('error', this.handleError);
    },
    beforeMount() {
        this.fetchDataAndInitTable();
    },
};
</script>
    },
    beforeDestroy() {
        EventBus.$off('error', this.handleError);
    },
    beforeMount() {
        this.fetchDataAndInitTable();
    },
};
</script>
