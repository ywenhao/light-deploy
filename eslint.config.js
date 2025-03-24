import antfu from '@antfu/eslint-config'

export default antfu({
  markdown: false,
  rules: {
    'node/prefer-global/process': 'off',
  },
})
