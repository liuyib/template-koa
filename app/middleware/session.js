const koaSession = require('koa-session')
const config = require('~config/secure')

const session = (app) => {
  app.keys = config.session.keys

  return koaSession(config.session.options, app)
}

module.exports = session
