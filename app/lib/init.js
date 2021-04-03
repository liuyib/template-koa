const Router = require('koa-router')
const config = require('~config/index')
const { readFile } = require('~lib/util')
const { AUTH_LEVEL, HTTP_CODE } = require('~lib/enum')

class Init {
  /**
   * 初始化项目核心设置
   * @api public
   * @param {Object} app Koa 实例
   * @returns
   */
  static config(app) {
    Init.app = app
    Init.loadGlobalVar()
    Init.loadSession()
    Init.loadRoute()
  }

  /**
   * 加载全局变量
   * @api private
   * @returns
   */
  static loadGlobalVar() {
    Object.assign(global, {
      __DEV__: this.loadEnvDev(),
      __CONFIG__: this.loadConfig(),
      __ERROR__: this.loadException(),
      __AUTH__: this.loadAuth(),
      __CODE__: this.loadHttpCode(),
    })
  }

  /**
   * 判断环境变量 env.NODE_ENV 是否存在
   * @api private
   * @returns {boolean}
   */
  static loadEnvDev() {
    return process.env.NODE_ENV === 'development'
  }

  /**
   * 加载配置
   * @api private
   * @returns {Object} 配置的数据对象
   */
  static loadConfig() {
    const configFilePath = config.path.config
    return require(configFilePath)
  }

  /**
   * 加载异常类
   * @api private
   * @returns {Object}
   */
  static loadException() {
    return require('./http-exception')
  }

  /**
   * 加载权限常量
   * @api private
   * @returns {Object}
   */
  static loadAuth() {
    return AUTH_LEVEL
  }

  /**
   * 加载 HTTP 业务码
   * @api private
   * @returns {Object}
   */
  static loadHttpCode() {
    return HTTP_CODE
  }

  /**
   * 加载 Session
   * @api private
   * @returns {Object}
   */
  static loadSession() {
    Init.app.use(async (ctx, next) => {
      global.__SESSION__ = ctx.session
      await next()
    })
  }

  /**
   * 加载路由
   * @api private
   * @returns
   */
  static loadRoute() {
    const apiDir = config.path.api
    const apiPaths = readFile(apiDir)

    for (const apiPath of apiPaths) {
      const router = require(apiPath)

      if (router instanceof Router) {
        Init.app.use(router.routes())
      }
    }
  }
}

module.exports.config = Init.config
