const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['src/index.js'],
  bundle: true,
  outfile: 'public/dist/bundle.js',
  loader: { '.js': 'jsx' },
  sourcemap: true,
  minify: true,
  format: 'esm',
  target: ['chrome58', 'firefox57', 'safari11', 'edge18'],
  define: {
    'process.env.NODE_ENV': '"production"'
  }
}).catch(() => process.exit(1));