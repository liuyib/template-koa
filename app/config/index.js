const fs = require('fs')
const path = require('path')

const config = Object.create(null)

// 读取该目录下的其他配置文件，将配置合并后统一暴露出去
fs.readdirSync(path.join(__dirname, './')).forEach((filename) => {
  if (filename !== 'index.js') {
    Object.assign(config, require(`./${filename}`))
  }
})

module.exports = config
