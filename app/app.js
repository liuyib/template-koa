const Koa = require('koa')
const koaBody = require('koa-body')
const static = require('koa-static')
const dotenv = require('dotenv')

const catchError = require('~middleware/exception')
const init = require('~lib/init')

const app = new Koa()

// 必须在 init.config(app) 之前
app.use(koaBody())
app.use(catchError())

dotenv.config()
init.config(app)

// public 目录下的所有文件，都将被映射到路由中
// 使用示例：/public/avatar.jpg => https://yoursite.com/avatar.jpg
app.use(static(__CONFIG__.path.static))

app.listen(__CONFIG__.port)
