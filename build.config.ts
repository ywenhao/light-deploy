import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/index',
    'src/cli',
  ],
  externals: ['node-ssh', 'unconfig'],
  rollup: {
    inlineDependencies: true,
    // json: {
    //   compact: true,
    //   namedExports: false,
    //   preferConst: false,
    // },
    commonjs: {
      requireReturnsDefault: 'auto',
    },
    dts: {
      respectExternal: false,
    },
  },
  clean: true,
  declaration: 'node16',
})
