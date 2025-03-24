# 轻量级部署工具

## 使用

### 安装
```shell
pnpm i @bmjs/light-deploy -D

pnpm approve-builds
```

### 配置
```ts
// deploy.config.ts

import { defineConfig } from '@bmjs/light-deploy'

export default defineConfig({
  ssh: {
    host: '172.16.20.150',
    username: 'root',
    password: 'xxx',
    port: 22
  },
  project: {
    // 本地项目根目录
    distDir: 'dist',
    // 对应服务器上项目所在目录
    serverWebDir: '/root/test'
  }
})
```

```json
// package.json
{
  "scripts": {
    "deploy": "light-deploy"
  }
}