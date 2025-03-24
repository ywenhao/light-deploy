import { createConfigLoader } from 'unconfig'

export const configLoader = createConfigLoader({
  sources: [
    {
      files: 'deploy.config',
      extensions: ['ts', 'mts'],
    },
  ],
  merge: false,
})
