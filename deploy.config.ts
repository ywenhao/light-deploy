import { defineConfig } from './src'

export default defineConfig({
  ssh: {
    host: '172.16.20.150',
    username: 'root',
    password: 'xxxxxxx',
    port: 22,
  },
  project: {
    distDir: 'dist',
    serverWebDir: '/root/test',
  },
})
