# Overview

Reading and browsing JSON data can be a painful experience.

Ztable is a serverless, customisable, user-friendly, [vuetify](https://vuetifyjs.com/en/) based JSON Viewer and Browser.

You can give it any JSON data and, depending on data structure, **ztable** will make it readable and browsable :

-   either in an **object** View with simple `key - value` pairs,
-   or in a **table** view with auto-generated headers, pagination, and many formatting options.
    <br><br>

For example, consider the JSON data below. It's a JSON-formatted API response.

```json
{
    "page": 1,
    "per_page": 6,
    "total": 12,
    "total_pages": 2,
    "data": [
        {
            "id": 1,
            "name": "cerulean",
            "year": 2000
        },
        {
            "id": 2,
            "name": "fuchsia rose",
            "year": 2001
        },
        {
            "id": 3,
            "name": "true red",
            "year": 2002
        }
    ]
}
```

Opening up this data in **ztable** will show the **object** View, displaying its `key - value` pairs in a readable UI.

Additionally, since the `data` property of this JSON contains an array, it will display its content in a link to open this array, going a level deeper in the source JSON and opening the **array** View.<br><br>

# Installation

## Clone the projet

`$ git clone https://github.com/zenetys/ztable.git`

`$ cd ztable`<br><br>

## Run the project

`$ npm run serve`

or

`$ yarn serve`<br><br>

<!-- ### Install from npm (requires a Vue.js 2 project and Vuetify)

- In your vue project folder, run `$ npm install @zenetys/ztable`
- Import the component in your `src/main.js` as follow

```js
import AutoTable from '@zenetys/ztable';

Vue.use(autoTable);
```

-   Start using the library in any of your component -->

# Usage

## Startup

Upon first launch, you are prompted with a config form, where you can :

-   Set a **source URL** for remote JSON data\
    _This is the source of your data. Any API request that resolves in a JSON response will work._<br><br>
-   Set a pre-loaded **path** to a deeper level of data in the JSON file _(optional)_\
    _If you wish to display a deeper level of data within the JSON object from the start, you can specify its path here. You can always return to the **root level** of your JSON or navigate to any other level of depth in your data using the **Breadcrumbs** at the top of the App or the **Treeview** on the left pane._<br><br>
-   Select a data-type from a list of known specific APIs that may include specific formatting, styling, table\
    configurations, etc. **If unsure, leave on `generic`** _(optional)_<br><br>
-   Add a source URL to fetch an **AutoTable config** object from a remote API _(optional)_\
    _If you know what your JSON data will contain and are familiar with the **AutoTable**'s configuration (the table_\
    _component of this App), you can also set up an AutoTable config object on a remote API or server and set it here_\
    _so it gets fetched and applied._<br><br>

    **These configuration settings are stored in the URL, so sharing the URL will share your data and its configuration.**<br><br>

# How it works

Depending on the type of data found at the current path/level of your JSON, the app will juggle between two views :

-   the **AutoTable** which is the component responsible for table data
-   the **AutoObject** which is the component responsible for object data
    <br>

As their name suggest, they are autonomous components that extract their own configuration from
the data they are fed (like table headers, object fields, etc).

These two views are fed their data by a **DataManager** whose role is to handle the configuration of the App, fetch remote data and apply additional formatting to it with the help of a **FormatManager**.
<br><br>

## Layout

At the top, **Breadcrumbs** let you know the level of depth of the current data. It can also be used to navigate back to previous levels.

On the left pane, a browsable **Treeview** will show the structure of your JSON (only objects and arrays are represented). This can be toggled on/off using the button next to the **Breadcrumbs**.<br><br>

## Navigation

In **generic mode**, any object value or table cell value that contains an array or an object will show as a **link**. This link updates the current **path** to the target object/array, updating the view, depending on the type of data, along with the **Breadcrumbs**.<br><br>

## AutoTable

The AutoTable is a dedicated table component that automatically extracts its configuration from the data provided to it.

You can **resize columns** using a drag&drop on their edges, and **sort** them using the sorting arrows if their config allows it.

You can also **re-order** columns by using a drag&drop on their label and moving them around in the table header.

In the top-right of the table, you will find a **toolbar** containing a button to export all table data to a CSV file and a **columns option menu**.

Using this menu, you can **toggle columns on and off**, or resize them to accurate values in `%` or `px` (bear in mind that a minimum size is enforced by Vuetify's data table component).

These modifications will be **saved locally** using the browser's local storage.
<br>
<br>

The AutoTable's implementation is simple, check out `App.vue` :

```html
<AutoTable v-if="DataManager.tableData" :config="tableConfig" />
```

As long as the DataManager contains table data, it will be displayed in the AutoTable.

If you didn't specify a remote config URL in the settings, you can configure the table using the `config` prop.

Its available properties are the following :

```ts
/**
 * @param {Object} config - Config object
 * @param {string} config.id - ID of the table
 * @param {Promise<AxiosResponse|Error>|string} config.api - Either a url to fetch or a Promise to get the data
 * @param {number|string} config.height - Height of the table
 * @param {string|function} config.itemClass - CSS class(es) to apply to each row
 * available parameters: (item)
 * @param {function} config.itemClick - Callback handler on an item click
 * available parameters: (item, event)
 * @param {Boolean} config.copyable - Whether content can be copied to the clipboard
 * @param {Boolean} config.paginated - Whether the table is paginated
 * @param {Array.<number|string>} config.heightOffsets - Height offsets to apply to the table
 * @param {function} config.customHeadersComputation - Custom callback to call on table headers after their creation
 * available parameters: (headers)
 * @param {string} config.search - A pre-loaded search value for the table
 * @param {Array.<function>} config.dataReady - Callbacks to call when the table data is ready to be displayed
 * available parameters: (data)
 * @param {Object.<string, *>} config.columns - Object containing custom column definitions with the column name as key
 * @param {string} config.path - Path to the data in the response object from the "api" property
 */
```

<br>

### **Column Definitions**

The structure of a default column definition is as follows :

```ts
/**
 * Default column definition
 * @type {Object}
 * @property {function} formatHtml - Callback method to get the HTML-formatted value
 * Available parameters: (value, item)
 * @property {function} formatText - Callback method to format text-formatted value
 * Available parameters: (value, item)
 * @property {function} tooltip - Callback method to get the tooltip
 * Available parameters: (value, item)
 * @property {function} getTitle - Callback method to get the title
 * Available parameters: (item)
 * @property {boolean} isHtml - Whether the value is raw HTML or text
 * @property {boolean} enabled - Whether the column is enabled
 * @property {function} cssClass - Callback method to get the CSS class
 * Available parameters: (item)
 * @property {function} cssStyle - Callback method to get the CSS style
 * Available parameters: (value, item)
 * @property {number} order - Order of the column
 * @property {boolean} sortable - Whether the column is sortable
 */
const defaultColumnDefinition = {
    formatHtml: (value, item) => this.formatText(value, item),
    formatText: (value) => value,
    tooltip: () => '',
    getTitle: () => '',
    isHtml: false,
    enabled: true,
    cssClass: () => '',
    cssStyle: () => '',
    order: 999,
    sortable: true,
};
```

<br>

### **Examples**

-   Turn a row lightgreen if its status is 1

```js
config: {
    ...
    itemClass: (item) => {
        if (item.status === 1) {
            return 'green lighten-4';
        }
        return '';
    }
}
```

-   Turn a cell green if its value is 1

```js
columns: {
    ...
    columnName: {
        cssClass: (item) => {
            if (item[columnName] === 1) {
                return 'greenClass';
            }
            return '';
        }
        cssStyle: (value, item) => {
            if (value === 1) {
                return 'background-color: green';
            }
            return '';
        }
    }
}
```

-   Display "Active" in a cell instead of its value if this value is 1

```js
config: {
    ...
    columnName: {
        formatHtml: (value, item) => {
            if (value === 1) {
                return 'Active';
            } else {
                return String(value);
            }
        }
    }
}
```

-   Add a custom sorting function : `column id => asc | desc`. (Assume here id is an integer).

```js
id: {
    ...
    sortable: function(a, b, sortBy) {
        if (a[sortBy] > b[sortBy] || a[sortBy] === null && b[sortBy] !== null) {
            return -1;
        }
        if (a[sortBy] < b[sortBy] || b[sortBy] === null && a[sortBy] !== null) {
            return 1;
        }
        // a must be equal to b
        return 0;
    }
}
```

<br>

## AutoObject

The AutoObject is a dedicated object data component that extracts its properties and values from the object it is provided with.

Its implementation in `App.vue` is simple :

```html
<AutoObject v-if="DataManager.objectData" :object="DataManager.objectData" />
```

As long as the DataManager contains object data, it will be displayed in the AutoObject.
<br>
<br>

# Advanced Customisation

## Using the Format Manager

_The Format Manager is a work in progress. This documentation will update once the features are functional._
<br>
<br>

## Using a custom Data Type

If you only want to use **ztable** for one type of JSON file with a specific structure, you can create a custom data-type. It will give you access to more customisation options.

We're going to use the `navitia` data-type as an example.
<br>
<br>

### First, add it to the data-types in the `DataManager.js` :

```js
_dataTypes: ['generic', 'navitia'],
```

This will make it selectable in the app settings.
<br>
<br>

### Then add a custom stylesheet :

Under `src/plugins/api-managers`, create a folder with the same name as your custom data-type, and create a `style.scss` stylesheet. It will automatically be loaded into the app when you select your data-type.

Example : `src/plugins/api-managers/navitia/style.scss`.

In your AutoTable configuration, you can then use classes that are defined in your custom stylesheet to help you style your table.
<br>
<br>

### Add a custom formatting manager :

To go a step further in the customisation of your data table, you can create a custom manager that will have the power to override some of the default formatting logic of the App.

To do that just create a new manager called `{mydatatype}Manager.js` in your custom folder.

Example : `src/plugins/api-managers/navitia/navitiaManager.js`.

Using this Manager, you can :

-   Specify the static path to your data in your JSON, using the `dataPath` variable
-   Retrieve specific css classes for some table cells, using a callback named `getCellClasses(header, item)` **\*WIP\***

<br>

_Example : using the `navitia` data-type will add the `orange-text` class to `data_source_site` table cells_

```ts
const propertyClasses = {
    data_source_site: 'orange-text',
};

export default {
    /**
     * Get the classes of a cell from its header and item
     * @param {*} header the header of the column.
     * @param {*} item the value of the item.
     * @returns {string} the classes of the cell.
     */
    getCellClasses(header, item) {
        return header.value === 'data_source_site' ? 'orange-text' : '';
    },
};
```

<br>

-   Add specific formats to the content of some table cells, using a callback named `getCellContent(value, item, key)` **\*WIP\***

<br>

_Example : using the `navitia` data-type will format `data_source_file` cells to show a link to an url instead of raw text_

```ts
export default {
    /**
     * Get the content of a table cell depending on the the raw value, the key and the table item.
     * @param {*} value the raw value of the item for a given key.
     * @param {*} item the data object for a table row.
     * @param {string} key the key of the column.
     * @returns {*} the content to display in the cell.
     */
    getCellContent(value, item, key) {
        const cellValue = {
            isHtml: false,
            value: null,
        };

        if (header.value === 'data_source_file') {
            return formatDataSourceFile(item);
        } else {
            cellValue.value = value;
            return cellValue;
        }
    },
};

/**
 * Format the data source file field of a navitia item
 * @param {*} item
 * @returns {string} The formatted data source file field
 */
function formatDataSourceFile(item) {
    if (item?.data_source_file) {
        return {
            isHtml: true,
            value: `<a href="${item.data_source_file}" title="Download file" target="_blank">${item.data_source_file}</a>`,
        };
    } else {
        return {
            isHtml: false,
            value: '',
        };
    }
}
```
<br>

# Usage via CDN
In this section you will find information related to the usage of the AutoTable component as a standalone complete library that you can inject in any HTML file or template.

## Requirements
In order to operate on its own, the AutoTable requires a few stylesheets and JS tools : 

### CSS
-  A Google font named 'Roboto'
-  Material Design Icons
-  Vuetify 2's stylesheet
-  Ztable's CSS

### JavaScript
- Vue 2
- Axios (for fetching data or configs from remote URLs)
- Vuetify 2
- Ztable

Then, all you need is a small JS script in order to create a Vue instance, link the AutoTable component to it and set your table configuration.
<br>

## Example

Here's a basic snippet you can put in your HTML file or template :

```html
<!DOCTYPE html>
<html>
    <head>
        <!-- CSS REQUIREMENTS -->
        <!-- Roboto font -->
        <link href="https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700,900" rel="stylesheet" />
        <!-- Material Design icons -->
        <link href="https://cdn.jsdelivr.net/npm/@mdi/font@7.4.47/css/materialdesignicons.min.css" rel="stylesheet" />
        <!-- Vuetify CSS -->
        <link href="https://cdn.jsdelivr.net/npm/vuetify@2.7.2/dist/vuetify.min.css" rel="stylesheet" />
        <!-- Ztable CSS -->
        <link href="https://unpkg.com/@zenetys/ztable@2.x/dist/style.css" rel="stylesheet" />
    </head>

    <body>
        <!-- JS REQUIREMENTS -->
        <!-- Vue 2 -->
        <script src="https://cdn.jsdelivr.net/npm/vue@2.7.16/dist/vue.js"></script>
        <!-- Axios, for fetching remote URLs -->
        <script src="https://cdnjs.cloudflare.com/ajax/libs/axios/0.28.0/axios.min.js"></script>
        <!-- Vuetify -->
        <script src="https://unpkg.com/vuetify@2.7.2/dist/vuetify.min.js"></script>
        <!-- Ztable -->
        <script src="https://unpkg.com/@zenetys/ztable@2.x/dist/ztable.umd.cjs"></script>

        <div id="auto-table-container">
            <auto-table :config="config" />
        </div>

        <script>
            const autoTable = window['@zenetys/ztable'];

            new Vue({
                el: '#auto-table-container',
                vuetify: new Vuetify(),
                components: {
                    'auto-table': autoTable,
                },
                data: {
                    /** Basic config : 
                     * The source of your data here is 'api' property, set to a remote URL
                     * The path where to find the table data in the data array 
                     * */
                    config: { path: 'data', api: 'https://cdn.zenetys.com/api/v1/data.gouv.navitia.json' },
                },
            });
        </script>
    </body>
</html>
````
<br>

# Build for library

`npm run lib`

or

`yarn lib`

Then you can pack the package to test it locally

`npm pack`

or

`yarn pack`

Then you can install it

` npm install file:<path of the package>`

or

` yarn add file:<path of the package>`
