<template>
    <v-row justify="center">
        <v-dialog v-model="$store.showConfigDialog" persistent max-width="600px">
            <v-card>
                <v-card-title>
                    <span class="text-h5">Configuration</span>
                </v-card-title>
                <v-card-text>
                    <v-container>
                        <v-row>
                            <v-col cols="12">
                                <v-text-field label="Data source URL *" v-model="dataUrl" required></v-text-field>
                            </v-col>
                            <v-col cols="12" sm="6">
                                <v-text-field
                                    label="Data path"
                                    v-model="dataPath"
                                    hint="Leave blank if the data is at root level."
                                ></v-text-field>
                            </v-col>
                            <v-col cols="12" sm="6">
                                <v-select
                                    :items="DataManager.dataTypes"
                                    v-model="dataType"
                                    label="Data type"
                                ></v-select>
                            </v-col>
                        </v-row>
                    </v-container>
                    <small>*indicates required field</small>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="submitDialogData"> Save </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-row>
</template>

<script>
import DataManager from '@/plugins/dataManager';
export default {
    data: () => ({
        DataManager,
        dataUrl: '',
        dataPath: '',
        dataType: 'generic',
    }),
    methods: {
        /**
         * Hide the config form dialog
         */
        hideDialog() {
            this.$store.showConfigDialog = false;
        },
        /**
         * Submit the config form data and redirect to update query params
         */
        submitDialogData() {
            const updatedQuery = {
                source: this.dataUrl,
                path: this.dataPath,
                type: this.dataType,
            };

            this.$router.push({ name: 'MainView', query: updatedQuery });
            this.hideDialog();
        },
    },
};
</script>
