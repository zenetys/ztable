process.env.VUE_APP_NAME = require('./package.json').name;
process.env.VUE_APP_VERSION = require('./package.json').version;

module.exports = {
    chainWebpack: config => {
        if(process.env.NODE_ENV !== 'development') {
            config.externals({
                'vue': 'Vue',
                'vuetify': 'vuetify',
                'vuetify': 'vuetify/lib'
            })
        }
    },
    css: {
        extract: false
    }
}