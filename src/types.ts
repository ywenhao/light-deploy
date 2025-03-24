export interface SShConfig {
  host: string
  username: string
  password?: string
  port?: number
  privateKey?: string
  privateKeyPath?: string
}

export interface DeployOptions {
  ssh: SShConfig
  project: {
    /**
     * @description 项目打包文件所在的目录
     */
    distDir: string
    /**
     * @default 'deploy_dist.zip'
     */
    zipFilename?: string
    /**
     * @description 项目在服务器对应的路径
     */
    serverWebDir: string
  }
}
