const _ = require('lodash')
const { HttpException, NotFound } = require('~lib/http-exception')

/**
 * 全局异常处理
 * @returns {Function} KOA 中间件函数
 */
const catchError = () => {
  return async (ctx, next) => {
    try {
      await next()

      if (ctx.status === 404) {
        throw new NotFound()
      }
    } catch (error) {
      const isDefinedException = error instanceof HttpException

      if (__DEV__ && !isDefinedException) {
        throw error
      }

      // 不需要包含在 response 中的字段
      const FILTER_KEYS = ['status']

      if (isDefinedException) {
        ctx.body = {
          ..._.omit(error, FILTER_KEYS),
          msg: error.msg,
          code: error.code,
          request: `${ctx.method} ${ctx.path}`,
        }
        ctx.status = error.status
      } else {
        ctx.body = {
          msg: '服务端出错啦',
          code: 10500,
          request: `${ctx.method} ${ctx.path}`,
        }
        ctx.status = 500
      }
    }
  }
}

module.exports = catchError
