const path = require('path')
const pp = require('preprocess')
const env = process.env.NODE_ENV
const srcPath = path.resolve(__dirname, './src')
const distPath = path.resolve(__dirname, './dist')

pp.preprocessFileSync(srcPath + '/index.html', distPath + '/index.html', { NODE_ENV: env }, {type: 'html'})
pp.preprocessFileSync(srcPath + '/index.js', distPath + '/index.js', { NODE_ENV: env }, {type: 'js'})
pp.preprocessFileSync(srcPath + '/index.css', distPath + '/index.css', { NODE_ENV: env }, {type: 'css'})
