import type { DeployOptions } from './types'
import { createWriteStream, existsSync } from 'node:fs'
import { mkdir, unlink } from 'node:fs/promises'
import path from 'node:path'
import archiver from 'archiver'
import consola from 'consola'
import { NodeSSH } from 'node-ssh'
import { configLoader } from './config'

// `${projectRoot}/node_modules/.cache/light-deploy`
let cacheDeployDir: string

async function zipFiles(config: DeployOptions) {
  const { zipFilename, distDir } = config.project

  consola.info(`${zipFilename} 打包中...`)
  await _deleteLocalZipFile(config)
  await makeDir()

  return new Promise<void>((resolve, reject) => {
    const archive = archiver('zip', {
      zlib: { level: 9 },
    }).on('error', (err) => {
      reject(err)
      process.exit(1)
    })

    const outputFilePath = path.resolve(cacheDeployDir, zipFilename!)
    const output = createWriteStream(outputFilePath)

    output.on('error', (err) => {
      if (err) {
        consola.error(`${zipFilename} 打包异常 ${err}`)
        reject(err)
        process.exit(1)
      }
    })

    output.on('close', () => {
      consola.success(`output-close--${zipFilename} 打包成功, ${archive.pointer()} bytes`)
      resolve()
    })

    archive.on('warning', (err) => {
      console.warn(err)
    })

    archive.pipe(output)
    archive.directory(distDir, false)
    archive.finalize()
  })
}

async function makeDir() {
  if (!existsSync(cacheDeployDir)) {
    await mkdir(cacheDeployDir, { recursive: true })
  }
}

async function createSSh(config: DeployOptions) {
  const ssh = new NodeSSH()
  try {
    await ssh.connect({
      ...config.ssh,
    })
    consola.success('ssh 连接成功')
    return ssh
  }
  catch (error) {
    consola.error('连接失败', error)
    process.exit(1)
  }
}

async function uploadFile(ssh: NodeSSH, config: DeployOptions) {
  const { serverWebDir, zipFilename } = config.project

  consola.info(`上传 ${zipFilename!} 至目录 ${config.project.serverWebDir}`)

  try {
    await ssh.putFile(path.resolve(cacheDeployDir, zipFilename!), path.join(serverWebDir, zipFilename!))
    consola.success('上传成功')
  }
  catch (error) {
    consola.error('上传失败', error)
    process.exit(1)
  }
}

async function unzipFile(ssh: NodeSSH, config: DeployOptions) {
  try {
    consola.info('开始解压zip包')
    const { serverWebDir, zipFilename } = config.project
    await ssh.execCommand(`cd ${serverWebDir}`, { cwd: serverWebDir })
    await ssh.execCommand(`unzip -o ${zipFilename} && rm -f ${zipFilename}`, { cwd: serverWebDir })
    consola.success('zip包解压成功')
  }
  catch (err) {
    consola.error(`zip包解压失败 ${err}`)
    process.exit(1)
  }
}

async function _deleteLocalZipFile(config: DeployOptions) {
  const { zipFilename } = config.project
  const zipFilePath = path.resolve(cacheDeployDir, zipFilename!)

  const isExists = existsSync(zipFilePath)
  if (!isExists)
    return

  await unlink(zipFilePath)
}

async function deleteLocalZipFile(config: DeployOptions) {
  const { zipFilename } = config.project
  try {
    await _deleteLocalZipFile(config)
    consola.success(`${zipFilename} 本地删除成功`)
  }
  catch (err) {
    consola.error(`${zipFilename} 本地删除失败 ${err}`)
    process.exit(1)
  }
}

async function main() {
  const loader = await configLoader.load()
  const config = loader.config as DeployOptions

  const projectRoot = path.resolve(loader.sources[0], '../')
  const distDir = path.resolve(projectRoot, config.project.distDir)
  cacheDeployDir = path.resolve(projectRoot, 'node_modules/.cache/light-deploy')

  config.project.distDir = distDir
  config.project.zipFilename ||= 'deploy_dist.zip'
  config.ssh.port ??= 22

  await zipFiles(config)
  const ssh = await createSSh(config)
  await uploadFile(ssh, config)
  await unzipFile(ssh, config)
  await deleteLocalZipFile(config)
  consola.success('部署完成')
  ssh.dispose()
}

main()
