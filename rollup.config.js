import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import postcss from 'rollup-plugin-postcss';
import { readFileSync, readdirSync, statSync, mkdirSync, copyFileSync, existsSync } from 'fs';
import path from 'path';

// 读取package.json
const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));

// 拷贝文件或目录到目标路径
function copyRecursive(src, dest) {
  const stat = statSync(src);
  
  if (stat.isDirectory()) {
    // 创建目标目录
    if (!existsSync(dest)) {
      mkdirSync(dest, { recursive: true });
    }
    
    // 递归复制目录内容
    const entries = readdirSync(src);
    for (const entry of entries) {
      const srcPath = path.join(src, entry);
      const destPath = path.join(dest, entry);
      copyRecursive(srcPath, destPath);
    }
  } else {
    // 复制文件
    copyFileSync(src, dest);
  }
}

// 复制源文件到dist插件
function copySourcesPlugin() {
  return {
    name: 'copy-sources',
    buildEnd() {
      const componentsDir = path.join(process.cwd(), 'src');
      const destDir = path.join(process.cwd(), 'dist/src');
      
      // 确保目标目录存在
      if (!existsSync(destDir)) {
        mkdirSync(destDir, { recursive: true });
      }
      
      // 复制src目录到dist/src
      copyRecursive(componentsDir, destDir);
      console.log('所有源文件已成功复制到 dist/src 目录');
    }
  };
}

// 获取打包插件
const getPlugins = () => {
  return [
    peerDepsExternal(),
    resolve({
      extensions: ['.js', '.jsx']
    }),
    commonjs({
      include: 'node_modules/**',
    }),
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**',
      presets: ['@babel/preset-env', '@babel/preset-react'],
      extensions: ['.js', '.jsx'],
    }),
    postcss({
      modules: true,
      extract: false,
      minimize: true,
      sourceMap: true,
    }),
    terser()
  ];
};

export default {
  input: 'src/index.jsx',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      sourcemap: true,
      exports: 'named',
    },
    {
      file: pkg.module,
      format: 'esm',
      sourcemap: true,
      exports: 'named',
    },
  ],
  plugins: [...getPlugins(), copySourcesPlugin()],
  external: ['react', 'react-dom']
}; 