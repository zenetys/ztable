import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue2';

import { resolve } from 'path'

const projectRootDir = resolve(__dirname);

export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            '@': resolve(projectRootDir, 'src'),
        },
    },
    base: './',
});
