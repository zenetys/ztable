<template>
    <v-card class="__object-card" :height="componentHeight">
        <v-container>
            <v-row dense v-for="(property, key) in computedObject" :key="key" class="__object-card--row">
                <v-col cols="3" class="__object-card--key-col">
                    <strong :title="key">{{ key }}</strong>
                </v-col>
                <v-col cols="9" class="__object-card--property-col">
                    <div v-if="property.isHtml" v-html="property.value"></div>
                    <div v-else>{{ property.value }}</div>
                </v-col>
            </v-row>
        </v-container>
    </v-card>
</template>

<style lang="scss" scoped>
.__object-card {
    height: 100%;
}

.__object-card--row {
    margin-bottom: 0.5vh;
    margin-top: 0 !important;
}

.__object-card--key-col {
    padding: 4px 10px !important;
    background: #1976d2;
    color: white;
    border-top-left-radius: 2px;
    border-bottom-left-radius: 2px;
}

.__object-card--property-col {
    padding: 4px 10px !important;
    border: 1px solid #1976d2;
    border-top-right-radius: 2px;
    border-bottom-right-radius: 2px;
}
</style>

<script>
import { formatContentForSubLinks } from '@/plugins/formatManager';

export default {
    name: 'auto-object',
    props: {
        /**
         * @prop {object} object - the object to display
         */
        object: {
            type: Object,
        },
    },
    data() {
        return {
            componentHeight: 'auto',
        };
    },
    computed: {
        /**
         * Format the property of an object to display
         * @computed
         * @returns {*} the formatted object to display in the view
         */
        computedObject() {
            const computedObject = { ...this.object };

            Object.keys(computedObject).forEach((key) => {
                const property = computedObject[key];
                computedObject[key] = formatContentForSubLinks(property, key);
            });
            return computedObject;
        },
    },
    methods: {
        /**
         * Calculate the height of the component
         */
        computeComponentHeight() {
            /* Calculate the height of the Breadcrumbs component */
            const breadcrumbsElement = document.getElementById('__breadcrumbs');
            const breadcrumbsHeight = breadcrumbsElement ? breadcrumbsElement.clientHeight : 0;

            this.componentHeight = window.innerHeight - breadcrumbsHeight;
        },
    },
    created() {
        window.addEventListener('resize', this.computeComponentHeight);
    },
    mounted() {
        this.computeComponentHeight();
    },
    updated() {
        this.computeComponentHeight();
    },
    destroyed() {
        window.removeEventListener('resize', this.computeComponentHeight);
    },
};
</script>
