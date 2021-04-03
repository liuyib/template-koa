const Koa = require('koa')
const dotenv = require('dotenv')

dotenv.config()

const config = require('~config/index')
const init = require('~lib/init')
const koaCors = require('@koa/cors')
const koaBody = require('koa-body')
const catchError = require('~middleware/exception')
const koaSession = require('~middleware/session')
const koaStatic = require('~middleware/static')

const app = new Koa()

// 必须在 init.config(app) 之前
app.use(catchError())
app.use(koaCors())
app.use(koaBody())
app.use(koaSession(app))
app.use(koaStatic())

init.config(app)

app.listen(config.port)
