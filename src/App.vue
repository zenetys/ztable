<template>
    <v-app>
        <v-main>
            <div class="ml-1 mr-2">
                <AutoTable api="https://cdn.zenetys.com/api/v1/data.gouv.navitia.json" arrayData="data" />
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
        };
    },
    mounted() {},
    methods: {
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
};
</script>
