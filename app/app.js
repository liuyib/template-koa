const Koa = require('koa')
const koaBody = require('koa-body')
const koaStatic = require('koa-static')
const dotenv = require('dotenv')

dotenv.config()

const config = require('~config/index')
const init = require('~lib/init')
const catchError = require('~middleware/exception')
const koaSession = require('~middleware/session')

const app = new Koa()

// 必须在 init.config(app) 之前
app.use(koaBody())
app.use(catchError())
app.use(koaSession(app))
// public 目录下的所有文件，都将被映射到路由中
// 使用示例：/public/avatar.jpg => https://yoursite.com/avatar.jpg
app.use(koaStatic(config.path.static))

init.config(app)

app.listen(config.port)
