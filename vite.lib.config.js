import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue2';

import alias from '@rollup/plugin-alias'
import { resolve } from 'path'

import libCss from 'vite-plugin-libcss';

const projectRootDir = resolve(__dirname);

export default defineConfig({
    plugins: [
        vue(),
        libCss()
    ],
    resolve: {
        alias: {
            '@': resolve(projectRootDir, 'src'),
        },
    },
    build: {
        lib: {
            entry: resolve(__dirname, 'lib/index.js'),
            name: '@zenetys/ztable',
            fileName: 'ztable',
        },
        copyPublicDir: false,
        cssCodeSplit: false,
        rollupOptions: {
            // make sure to externalize deps that shouldn't be bundled
            // into your library
            external: ['vue', 'axios', 'vuetify'],
            output: {
                // Provide global variables to use in the UMD build
                // for externalized deps
                globals: {
                    vue: 'Vue',
                    axios: 'axios',
                    vuetify: 'vuetify'
                }
            },
        }
    }
});
