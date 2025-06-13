export function getArgv(key: string) {
  const modeIdx = process.argv.indexOf(`--${key}`)

  if (modeIdx !== -1) {
    const mode = process.argv[modeIdx + 1]
    if (mode) {
      return mode
    }
    throw new Error(`请指定 --${key} 参数`)
  }
}
