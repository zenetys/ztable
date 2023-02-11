import DataManager from '@/plugins/dataManager';

export default {
    /**
     * Fetch config array from local storage.
     * @returns {array} the config array
     */
    getStorageConfigs() {
        return JSON.parse(localStorage.getItem('storage-configs')) || [];
    },
    /**
     * Find a config in the config array and return its index.
     * @param {array} configs the config array
     * @returns {number} the index of the config
     */
    getStorageConfigIndex(configs) {
        return configs.findIndex(
            (config) =>
                config.dataUrl === DataManager.config.dataUrl &&
                config.dataPath === DataManager.config.dataPath &&
                config.dataType === DataManager.config.dataType
        );
    },
    /**
     * Update a config file in local storage with new Column Options.
     * @param {object} column the column to update
     * @param {string} field (optional) the field to update
     */
    updateStorageColumnOptions(column, field = null) {
        const storageConfigs = this.getStorageConfigs();
        const storageConfigIndex = this.getStorageConfigIndex(storageConfigs);
        let config = null;

        if (storageConfigIndex > -1) {
            config = storageConfigs[storageConfigIndex];
        }

        let columnOptions = config?.columnOptions;

        columnOptions = columnOptions || {};
        columnOptions[column.value] = columnOptions[column.value] || {};

        if (field) {
            /* Only update the field */
            columnOptions[column.value][field] = column[field];
        } else {
            /* Update the whole options object */
            columnOptions[column.value] = {
                ...columnOptions[column.value],
                visible: column.visible,
                width: column.width,
            };
        }

        /* Does config exist in storage ? */
        if (storageConfigIndex === -1) {
            storageConfigs.push({
                dataUrl: DataManager.config.dataUrl,
                dataPath: DataManager.config.dataPath,
                dataType: DataManager.config.dataType,
                columnOptions,
            });
        } else {
            storageConfigs[storageConfigIndex].columnOptions = columnOptions;
        }

        localStorage.setItem('storage-configs', JSON.stringify(storageConfigs));
    },
    /**
     * Look for a config object in local storage matching the current data and apply it.
     */
    loadStorageColumnOptions() {
        const storageConfigs = this.getStorageConfigs();
        const storageConfigIndex = this.getStorageConfigIndex(storageConfigs);
        const config = storageConfigs[storageConfigIndex];
        const columnOptions = config?.columnOptions;
        const headers = DataManager.headers;

        if (columnOptions) {
            headers.forEach((column) => {
                const columnOption = columnOptions[column.value];
                if (columnOption) {
                    if (Object.prototype.hasOwnProperty.call(columnOption, 'visible')) {
                        column.visible = columnOption.visible;
                    } else {
                        /* Make column visible by default if it has no visibility option */
                        column.visible = true;
                    }

                    if (columnOption.width) {
                        column.width = columnOption.width;
                    }
                }
            });

            DataManager.headers = headers;
        }
    },
};
