const { LOGIN_TYPE } = require('~lib/enum')
const config = require('~config/setting')
const { EmailService } = require('./email')

const VCODE_SESSION_KEY = config.vcode.sessionKey

class VcodeService {
  /**
   * 向用户（邮箱、手机）发送验证码（并存入 Session 等待验证）
   * @param {Object} param
   * @param {number} param.type    - 登录类型
   * @param {string} param.account - 账号
   * @param {Object} param.session - Session
   * @returns {string} 验证码
   */
  static async sendVcode({ type, email, telephone }) {
    const session = __SESSION__[VCODE_SESSION_KEY] || {}
    const account = email || telephone
    let vcode = session.vcode

    VcodeService._verifyInterval({ session, account, vcode })

    try {
      if (type === LOGIN_TYPE.ACCOUNT) {
        vcode = await VcodeService._sendEmailVcode(email)
      } else if (type === LOGIN_TYPE.MOBILE_PHONE) {
        vcode = await VcodeService._sendPhoneVcode(telephone)
      }
    } catch (error) {
      throw new __ERROR__.VcodeException(`验证码发送失败。${error.msg || ''}`)
    }

    if (vcode) {
      VcodeService._storeVcode({ account, vcode })
    }

    return vcode
  }

  static async verifyVcode({ type, account, vcode, userId }) {
    const session = __SESSION__[VCODE_SESSION_KEY]

    if (!session) {
      throw new __ERROR__.VcodeException('还未获取验证码')
    }

    const { account: a, vcode: v } = __SESSION__[VCODE_SESSION_KEY]

    if (a !== account || v !== vcode) {
      throw new __ERROR__.VcodeException('验证码错误')
    }

    // 验证通过后，将数据（绑定的邮箱或手机号）存入数据库
    await VcodeService._saveAccount({ userId, type, account })
  }

  static _verifyInterval({ session = {}, account, vcode }) {
    if (session.account !== account || !vcode) return

    const INTERVAL_TIME = __CONFIG__.vcode.interval
    const intervalTime = Math.ceil((Date.now() - session.timestamp) / 1000)

    if (intervalTime < INTERVAL_TIME) {
      throw new __ERROR__.VcodeException(
        `请 ${INTERVAL_TIME - intervalTime} 秒后重新发送验证码`,
      )
    }
  }

  static _storeVcode({ account, vcode }) {
    __SESSION__[VCODE_SESSION_KEY] = {
      account,
      vcode,
      timestamp: Date.now(),
    }
  }

  /**
   * 向用户填写的邮箱发送验证码
   * @param {string} email - 用户邮箱
   * @returns {string} 验证码
   */
  static async _sendEmailVcode(email) {
    const emailService = await new EmailService(email)
    const vcode = emailService.vcode

    await emailService.send()

    return vcode
  }

  /**
   * 向用户填写的手机发送验证码
   * @param {string} telephone - 用户手机号
   * @returns {string} 验证码
   */
  static async _sendPhoneVcode(telephone) {
    // TODO: 验证逻辑暂未实现
    return telephone
  }

  static async _saveAccount({ type, account, userId }) {
    const { User } = require('~model/user')

    try {
      if (type === LOGIN_TYPE.ACCOUNT) {
        await User.setData({
          id: userId,
          email: account,
        })
      } else if (type === LOGIN_TYPE.MOBILE_PHONE) {
        await User.setData({
          id: userId,
          telephone: account,
        })
      }
    } catch (error) {
      throw new __ERROR__.VcodeException(`验证码校验失败。${error.msg || ''}`)
    }
  }
}

module.exports = {
  VcodeService,
}
