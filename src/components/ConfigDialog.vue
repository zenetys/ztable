<template>
    <v-row justify="center">
        <v-dialog
            v-model="$store.showConfigDialog"
            persistent
            scrollable
            max-width="600px"
            @keydown.esc="$store.showConfigDialog = false"
        >
            <v-card>
                <v-card-title>
                    <span class="text-h5">Configuration</span>
                </v-card-title>
                <v-card-text>
                    <div class="__config-section-container">
                        <h3>Data Source</h3>
                        <v-tabs v-model="selectedTab">
                            <v-tabs-slider color="primary"></v-tabs-slider>
                            <v-tab>API</v-tab>
                            <v-tab>FILE</v-tab>
                            <v-tab>TEXT</v-tab>
                        </v-tabs>
                        <br />
                        <v-tabs-items v-model="selectedTab">
                            <!-- API CONFIG TAB CONTENT -->
                            <v-tab-item>
                                <v-row no-gutters>
                                    <v-col cols="12">
                                        <v-text-field
                                            label="Data source URL *"
                                            v-model="dataUrl"
                                            required
                                            hint="URL to a JSON file or API endpoint."
                                            :error="$store.configErrors?.includes('no-url')"
                                        ></v-text-field>
                                    </v-col>
                                </v-row>
                            </v-tab-item>
                            <!-- FILE CONFIG TAB CONTENT -->
                            <v-tab-item>
                                <v-row no-gutters>
                                    <v-col cols="12">
                                        <v-file-input
                                            label="Data source file *"
                                            v-model="dataFile"
                                            required
                                            accept="application/json"
                                        ></v-file-input>
                                    </v-col>
                                </v-row>
                            </v-tab-item>
                            <!-- TEXT CONFIG TAB CONTENT -->
                            <v-tab-item>
                                <v-row no-gutters>
                                    <v-col cols="12" no-gutters>
                                        <v-textarea
                                            class="__config-textarea"
                                            outlined
                                            name="input-7-4"
                                            label="Data source text *"
                                            v-model="dataText"
                                            clearable
                                            required
                                        ></v-textarea>
                                    </v-col>
                                </v-row>
                            </v-tab-item>
                        </v-tabs-items>
                    </div>
                    <div class="__config-section-container">
                        <h3>Options</h3>
                        <v-row no-gutters>
                            <v-col cols="12" sm="6">
                                <v-text-field
                                    label="Data path (optional)"
                                    v-model="dataPath"
                                    hint="Leave blank if the data is at root level."
                                    :disabled="dataType !== 'generic'"
                                    hightlight
                                    :error="$store.configErrors?.includes('no-data-at-path')"
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
                                    label="Custom config URL (optional)"
                                    v-model="customConfigUrl"
                                    hint="Source URL to a custom configuration file."
                                    :disabled="dataType !== 'generic'"
                                ></v-text-field>
                            </v-col>
                        </v-row>
                        <small>*indicates required field</small>
                    </div>
                </v-card-text>
                <v-card-actions class="mb-1">
                    <v-spacer></v-spacer>
                    <v-btn
                        text
                        :disabled="!DataManager.tableData && !DataManager.objectData"
                        @click="cancelDialogForm"
                    >Cancel</v-btn>
                    <v-btn
                        color="primary"
                        @click="submitDialogData"
                        :disabled="computedSourceIsEmpty"
                    >Save</v-btn>
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
        customConfigUrl: '',
        selectedTab: 0,
        dataFile: null,
        dataText: null,
    }),
    computed: {
        /**
         * @computed
         * Check if the source is empty
         */
        computedSourceIsEmpty() {
            if (this.selectedTab === 0 && !this.dataUrl) {
                return true;
            } else if (this.selectedTab === 1 && !this.dataFile) {
                return true;
            } else if (this.selectedTab === 2 && !this.dataText) {
                return true;
            } else {
                return false;
            }
        },
    },
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
            /* Restore the previously selected tab */
            this.selectedTab = this.previouslySelectedTab;
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

            /* Update the previously selected tab if needed */
            this.previouslySelectedTab = this.selectedTab;

            const optionsHaveChanged =
                this.dataPath !== DataManager.config.dataPath ||
                this.dataType !== DataManager.config.dataType ||
                this.customConfigUrl !== DataManager.config.customConfigUrl;

            /* Update the URL query params with new source if it's not a local source */
            if (this.selectedTab === 0 && this.dataUrl !== DataManager.config.dataUrl) {
                /* New source is an url */
                shouldRedirect = true;
                this.dataFile = null;
                this.dataText = null;
            } else if (this.selectedTab === 1) {
                /* New source is a file => load its content in the App */
                this.dataText = null;
                this.dataUrl = null;
                DataManager.config.dataFile = this.dataFile;
                DataManager.loadFileData();
                shouldRedirect = false;
            } else if (this.selectedTab === 2) {
                /* New source is a JSON in text format => parse it and load it in the App */
                this.dataFile = null;
                this.dataUrl = null;
                DataManager.config.dataText = this.dataText;
                DataManager.loadTextData();
                shouldRedirect = false;
            }

            if (optionsHaveChanged) {
                shouldRedirect = true;
            }

            /* Redirect to the new URL if necessary */
            if (shouldRedirect) {
                const updatedQuery = {
                    source: this.dataUrl,
                    path: this.dataPath,
                    type: this.dataType,
                    config_url: this.customConfigUrl,
                };

                this.$router.push({ query: updatedQuery }).catch((err) => {
                    if (err.name !== 'NavigationDuplicated') {
                        throw err;
                    }
                });
            }

            this.hideConfigDialog();
        },
        /**
         * Update the local config models with the values from the DataManager
         */
        updateConfigData() {
            [this.dataUrl, this.dataPath, this.dataType, this.customConfigUrl] = [
                DataManager.config.dataUrl,
                DataManager.config.dataPath,
                DataManager.config.dataType,
                DataManager.config.customConfigUrl,
            ];
        },
    },
    watch: {
        '$store.showConfigDialog': {
            immediate: true,
            handler(newVal) {
                this.previouslySelectedTab = this.previouslySelectedTab || 0;
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

<style lang="scss">
.__config-section-container {
    h3 {
        color: #1976d2;
        font-weight: 500;
        margin-bottom: 1rem;
    }
    padding: 1rem;
}

.__config-textarea {
    margin-top: 1rem !important;
}
</style>
