import { defineConfig } from 'vite'
import cesium from 'vite-plugin-cesium'
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig({
  plugins: [
    cesium(),
    viteStaticCopy({
      targets: [
        { src: 'data/*.geojson', dest: '.' },
        { src: 'data/*.json', dest: '.' }
      ]
    })
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: ['192.168.100.200']
  }
})
