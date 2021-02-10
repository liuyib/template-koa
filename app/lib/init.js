const Router = require('koa-router')
const path = require('path')

const config = require('~config/setting')
const { readFile } = require('~lib/util')

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
    Init.loadRoute()
  }

  /**
   * 加载全局变量
   * @api private
   * @returns
   */
  static loadGlobalVar() {
    /* prettier-ignore */
    Object.assign(global, {
      __DEV__   : this.loadEnvDev(),
      __CONFIG__: this.loadConfig(),
      __ERROR__ : this.loadException(),
      __AUTH__  : this.loadAuth(),
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
   * @param {string} [filePath=''] 配置文件路径
   * @returns {Object} 配置的数据对象
   */
  static loadConfig(filePath = '') {
    const pathConfig = config.path

    pathConfig.root = path.join(process.cwd(), pathConfig.root)

    // 将 root 路径作为前缀，连接在其他路径上
    for (const [key, val] of Object.entries(pathConfig)) {
      if (key !== 'root') {
        pathConfig[key] = path.join(pathConfig.root, val)
      }
    }

    const normalized = path.normalize(filePath || pathConfig.config)
    return require(normalized)
  }

  /**
   * 加载异常类
   * @api private
   * @returns
   */
  static loadException() {
    return require('./http-exception')
  }

  static loadAuth() {
    const { AUTH_LEVEL } = require('~lib/enum')
    return AUTH_LEVEL
  }

  /**
   * 加载路由
   * @api private
   * @returns
   */
  static loadRoute() {
    const apiPaths = readFile(__CONFIG__.path.api)

    for (const apiPath of apiPaths) {
      const router = require(apiPath)

      if (router instanceof Router) {
        Init.app.use(router.routes())
      }
    }
  }
}

module.exports.config = Init.config
