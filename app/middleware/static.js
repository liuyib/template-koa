const koaStatic = require('koa-static')
const config = require('../config/setting')
console.log(`config`, config)

// public 目录下的所有文件，都将被映射到路由中
// 使用示例：/public/avatar.jpg => https://yoursite.com/avatar.jpg
const assetsDir = config.path.static

const staticSource = () => {
  return koaStatic(assetsDir)
}

module.exports = staticSource
