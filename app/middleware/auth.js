const basicAuth = require('basic-auth')
const jwt = require('jsonwebtoken')

class Auth {
  /**
   * @param {number} level - 权限等级
   */
  constructor(level) {
    this.level = level || 1
  }

  /**
   * 1. 通过 HTTP Basic Authorization 方式验证 JWT
   * 2. 第 1 步通过后，验证接口权限
   * 3. 第 2 步通过后，将 JWT 中携带的信息返回给客户端
   * @returns {Function} KOA 中间件函数
   */
  get verify() {
    return async (ctx, next) => {
      // { name: '账号', pass: '密码' }
      const auth = basicAuth(ctx.req)
      let errMsg = 'jwt 不合法'

      if (!auth || !auth.name) {
        throw new __ERROR__.Forbbiden(errMsg)
      }

      let userAuth = null

      try {
        const { secretKey } = __CONFIG__.jwt
        userAuth = jwt.verify(auth.name, secretKey)
      } catch (error) {
        if (error.name === 'TokenExpiredError') {
          errMsg = 'jwt 已过期'
        }

        throw new __ERROR__.Forbbiden(errMsg)
      }

      // 用户权限 < 接口权限
      if (userAuth.permission < this.level) {
        errMsg = '权限不足'
        throw new __ERROR__.Forbbiden(errMsg)
      }

      ctx.auth = userAuth
      await next()
    }
  }

  /**
   * 验证 JWT 是否合法
   * @param {string} token - JWT
   * @returns {boolean}
   */
  static verifyToken(token) {
    try {
      const { secretKey } = __CONFIG__.jwt
      jwt.verify(token, secretKey)
    } catch (error) {
      throw new __ERROR__.ParamException('token 不合法')
    }
  }
}

module.exports = {
  Auth,
}
