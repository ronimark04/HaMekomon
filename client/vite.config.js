import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import svgr from 'vite-plugin-svgr'

const backendPort = process.env.VITE_BACKEND_PORT || '8181';
const backendTarget = `http://localhost:${backendPort}`;

export default defineConfig({
    plugins: [react(), svgr()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        proxy: {
            '/areas': { target: backendTarget, changeOrigin: true },
            '/artists': { target: backendTarget, changeOrigin: true },
            '/artist-votes': { target: backendTarget, changeOrigin: true },
            '/comments': { target: backendTarget, changeOrigin: true },
            '/comment-votes': { target: backendTarget, changeOrigin: true },
            '/users': { target: backendTarget, changeOrigin: true },
            '/contact': { target: backendTarget, changeOrigin: true },
        },
    },
}) 