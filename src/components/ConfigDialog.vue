<template>
    <v-row justify="center">
        <v-dialog v-model="$store.showConfigDialog" persistent max-width="600px">
            <v-card>
                <v-card-title>
                    <span class="text-h5">Configuration</span>
                </v-card-title>
                <v-card-text>
                    <v-tabs v-model="selectedTab">
                        <v-tabs-slider color="primary"></v-tabs-slider>
                        <v-tab>API</v-tab>
                    </v-tabs>
                    <v-tabs-items v-model="selectedTab">
                        <!-- API CONFIG TAB CONTENT -->
                        <v-tab-item>
                            <v-container>
                                <v-row>
                                    <v-col cols="12">
                                        <v-text-field
                                            label="Data source URL *"
                                            v-model="dataUrl"
                                            required
                                        ></v-text-field>
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
                                    <v-col cols="12">
                                        <v-text-field
                                            label="Headers config URL"
                                            v-model="headersUrl"
                                            hint="Source URL to a configuration file for the headers."
                                        ></v-text-field>
                                    </v-col>
                                </v-row>
                            </v-container>
                            <small>*indicates required field</small>
                        </v-tab-item>
                    </v-tabs-items>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn text :disabled="!DataManager.tableData && !DataManager.objectData" @click="cancelDialogForm"
                        >Close</v-btn
                    >
                    <v-btn color="primary" @click="submitDialogData">Save</v-btn>
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
        headersUrl: '',
        selectedTab: null,
    }),
    methods: {
        /**
         * Hide the config form dialog
         */
        hideConfigDialog() {
            this.$store.showConfigDialog = false;
        },
        /**
         * Cancel modifications and close the dialog
         */
        cancelDialogForm() {
            /* Reassign config Form with values from the DataManager */
            this.updateConfigData();
            /* Close dialog */
            this.hideConfigDialog();
        },
        /**
         * Submit the config form data & handle the input values
         */
        submitDialogData() {
            let shouldRedirect = false;

            /* Update the URL with new config data if it was changed */
            if (
                this.dataUrl !== DataManager.config.dataUrl ||
                this.dataPath !== DataManager.config.dataPath ||
                this.dataType !== DataManager.config.dataType ||
                this.headersUrl !== DataManager.config.headersUrl
            ) {
                shouldRedirect = true;
            }

            /* Redirect to the new URL if necessary */
            if (shouldRedirect) {
                const updatedQuery = {
                    source: this.dataUrl,
                    path: this.dataPath,
                    type: this.dataType,
                    headers: this.headersUrl,
                };

                this.$router.push({ query: updatedQuery });
            }

            this.hideConfigDialog();
        },
        /**
         * Update the local config models with the values from the DataManager
         */
        updateConfigData() {
            [this.dataUrl, this.dataPath, this.dataType, this.headersUrl] = [
                DataManager.config.dataUrl,
                DataManager.config.dataPath,
                DataManager.config.dataType,
                DataManager.config.headersUrl,
            ];
        },
    },
    watch: {
        '$store.showConfigDialog': {
            immediate: true,
            handler(newVal) {
                if (newVal) {
                    // When the dialog is shown, load the config data from the data manager
                    this.updateConfigData();
                }
            },
        },
        'DataManager.config': {
            immediate: true,
            handler(newVal) {
                if (newVal) {
                    // When the config data changes, update the form values
                    this.updateConfigData();
                }
            },
        },
    },
};
</script>
