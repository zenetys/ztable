process.env.VUE_APP_NAME = require('./package.json').name;
process.env.VUE_APP_VERSION = require('./package.json').version;

module.exports = {
    publicPath: '',
    chainWebpack: (config) => {
        if (config.target === 'lib') {
            config.externals({
                vue: 'Vue',
                vuetify: 'vuetify',
                vuetify: 'vuetify/lib',
            });
        }
    },
    css: {
        extract: false,
    },
};
