import { createConfigLoader } from 'unconfig'
import { getArgv } from './argv'

const mode = getArgv('mode')

export const configLoader = createConfigLoader({
  sources: [
    {
      files: mode ? `deploy.config.${mode}` : 'deploy.config',
      extensions: ['ts', 'mts'],
    },
  ],
  merge: false,
})
