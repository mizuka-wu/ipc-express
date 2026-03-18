export default [
  {
    input: 'src/index.ts',
    output: {
      file: 'build/cjs/index.js',
      format: 'cjs',
      sourcemap: true,
    },
    external: ['electron', 'nanoid', 'uuid'],
  },
  {
    input: 'src/index.ts',
    output: {
      file: 'build/esm/index.js',
      format: 'es',
      sourcemap: true,
    },
    external: ['electron', 'nanoid', 'uuid'],
  },
]
