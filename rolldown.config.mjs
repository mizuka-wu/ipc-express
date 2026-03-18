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
  {
    input: 'src/client-entry.ts',
    output: {
      file: 'build/cjs/client/index.js',
      format: 'cjs',
      sourcemap: true,
    },
    external: ['electron', 'nanoid', 'uuid'],
  },
  {
    input: 'src/client-entry.ts',
    output: {
      file: 'build/esm/client/index.js',
      format: 'es',
      sourcemap: true,
    },
    external: ['electron', 'nanoid', 'uuid'],
  },
  {
    input: 'src/server-entry.ts',
    output: {
      file: 'build/cjs/server/index.js',
      format: 'cjs',
      sourcemap: true,
    },
    external: ['electron', 'nanoid', 'uuid'],
  },
  {
    input: 'src/server-entry.ts',
    output: {
      file: 'build/esm/server/index.js',
      format: 'es',
      sourcemap: true,
    },
    external: ['electron', 'nanoid', 'uuid'],
  },
]
