const { LOGIN_TYPE } = require('~lib/enum')
const { genToken } = require('~lib/util')
const { User } = require('~model/user')
const { WXService } = require('~service/wx')

/**
 * 抽象类 Token（用于统一处理 Token 相关的逻辑，保持接口文件中代码的简洁）
 */
class Token {
  /**
   * 获取 Token
   * @param {Object} login               - 登录信息
   * @param {(number|string)} login.type - 登录类型
   * @param {string} login.account       - 登录账户
   * @param {string} login.secret        - 登录密码
   * @returns {string} 颁发的 JWT
   */
  static async getData({ type, account, secret }) {
    const _type = parseInt(type, 10)
    let token = ''

    switch (_type) {
      case LOGIN_TYPE.ACCOUNT:
        token = await userAccountLogin(account, secret)
        break
      // TODO
      // case LOGIN_TYPE.MOBILE_PHONE:
      //   break
      case LOGIN_TYPE.MINI_PROGRAM:
        token = await userMinipgmLogin(account)
        break
      default:
        throw new __ERROR__.ParamException(`未定义 type: ${_type} 的处理函数`)
    }

    return token
  }
}

/**
 * 用户通过账号密码登录
 * @param {string} account - 账号
 * @param {string} secret  - 密码
 * @returns {string} 颁发的 JWT
 */
async function userAccountLogin(account, secret) {
  // 把接口验证逻辑分离到 Model 层
  const user = await User.verifyAccountSecret(account, secret)
  const token = genToken(user.id, __AUTH__.USER)
  return token
}

/**
 * 用户通过微信登录
 * @param {string} account - 微信用户的 openid
 * @returns {string} 颁发的 JWT
 */
async function userMinipgmLogin(account) {
  // 把接口验证逻辑分离到 Service 中（也是 Model 层）
  return await WXService.code2Token(account)
}

module.exports = {
  Token,
}
