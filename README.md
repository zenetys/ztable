# ztable

Ztable is a [vuetify](https://vuetifyjs.com/en/) table based panel to represent any data array of objects.
For example, consider the json below. It is a json api response.
You can represent automatically in a html table the "data" array in this json document.

``` json
{
    "page": 1,
    "per_page": 6,
    "total": 12,
    "total_pages": 2,
    "data": [
    {
        "id": 1,
        "name": "cerulean",
        "year": 2000,
    },
    {
        "id": 2,
        "name": "fuchsia rose",
        "year": 2001,
    },
    {
        "id": 3,
        "name": "true red",
        "year": 2002,
    },
    ]
}
```

## Properties
* ```config```: The config of the table.

## Usage
### Clone the projet

```git clone https://github.com/zenetys/ztable.git```

```cd ztable```

### Run the project

```npm run serve```

or

```yarn serve```

### Install from npm

* You must have a vue project and vuetify installed in it.
* In your vue project: ```npm install @zenetys/ztable```

* Import the component in your ```src/main.js``` as follow
``` js
import AutoTable from '@zenetys/ztable';

Vue.use(autoTable);
```
* Start using the library in any of your component
``` html
<AutoTable :config="config"></AutoTable>
```

#### Usage

To configure the table, you can do so via the config object.

```ts

type defaultConfig = {
    id: string, // the id props of the table html element
    api: string, // the url for fetching data
    height: number, // height of the table
    itemClass: function || string, // css class for an individual item
    clickable: function, // a function to define if an item is clickable
    copyable: boolean, // boolean to configure if an item is copyable
    paginated: boolean, // boolean to configure if table is paginated
    heightOffsets: number, // allows to add pading to the height of the table
    customHeadersComputation: function, // a function which allows to modify headers before display
    search: boolean, // boolean to define if search is allowed
    dataReady: function[], // array of function that runs after data fetch
    columns: ColumnConfig, // list of object to define  headers columns
    path: string, // path to extract data from
};
```

* Make a row color to been green light if item.status == 1
```js
config: {
    ...
    itemClass: (item, value) => {
        if (item.status==1) {
            return 'green lighten-4';
        }
        return '';
    }
}
```

To configure the columns we use a list of object named after the name of the header
```ts
type ColumnConfig = {
    formatHtml: function,
    formatText: function,
    tooltip: function,
    getTitle: function,
    isHtml: boolean,
    enabled: boolean,
    cssClass: function,
    cssStyle: function,
    order: number,
    sortable: function || boolean,
};
```

* Make a cell color to be green if the cell value is equal to 1

```js
config: {
    ...
    cssClass: (item, value) => {
        if (value == 1) {
            return 'greenClass';
        }
        return '';
    }
    cssStyle: (item, value) => {
        if (value == 1) {
            return 'background-color: green';
        }
        return '';
    }
}
```

* Show the string "Active" in a cell instead of the value, if the cell value is equal to 1

```js
config: {
    ...
    formatHtml: (item, value) => {
        if (value==1) {
            return "Active";
        } else {
            return '' + value;
        }
    }
}
```

* Make custom sort: ```column id => asc | desc```. (Assume here id is in integer).

``` js
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

### Usage via CDN
Copy the code below in your `index.html` file.
``` html
<!DOCTYPE html>
<html>
<head>
    <link href="https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700,900" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/@mdi/font@4.x/css/materialdesignicons.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/vuetify@2.x/dist/vuetify.min.css" rel="stylesheet">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, minimal-ui">
</head>
<body>
    <div id="mytable">
        <v-app>
            <v-main>
                <AutoTable :config="config"></AutoTable>
            </v-main>
        </v-app>
    </div>

<script src="https://cdn.jsdelivr.net/npm/vue@2.x/dist/vue.js"></script>
<script src="https://cdn.jsdelivr.net/npm/vuetify@2.x/dist/vuetify.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@zenetys/ztable@0.1.25/dist/z-table.umd.js"></script>
<script>
    new Vue({
        el: '#mytable',
        vuetify: new Vuetify(),
    })
</script>
</body>
</html>
```


### Build for lirary

```npm run build```

or

```yarn build```

Then you can pack the package to test it locally

``` npm pack ```

or

``` yarn pack ```

Then you can install it

``` npm install file:<path of the package>```

or

``` yarn add file:<path of the package>```

#### WARNING

If you use Vuetify with treeShaking, be sure to import the components required by Autotable:
- VDatatable
- VOverlay
- VBtn
- VTooltip
- VCard

To fix the problem, instead of:

```import Vuetify from 'vuetify/lib'```

use:

```import Vuetify from 'vuetify'```