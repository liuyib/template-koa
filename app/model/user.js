const bcrypt = require('bcryptjs')
const { uid } = require('uid/secure')
const { Model, DataTypes, Op } = require('sequelize')
const { sequelize } = require('~lib/db')
const { LOGIN_TYPE } = require('~lib/enum')
const { EmailService } = require('~service/email')

/**
 * 用户表（实体表）
 */
class User extends Model {
  /**
   * 获取数据
   * @param {Object} where - 获取数据的查询条件
   * @returns {Object} User 模型的实例（包含获取的数据）
   */
  static async getData(where) {
    return await User.findOne({ where })
  }

  /**
   * 添加数据
   * @param {Object} [option={}] - 可选参数（Key 应为数据库中的列）
   * @returns {Object} User 模型的实例
   */
  static async setData(option = {}) {
    const param = { account: '' }

    Object.assign(param, option)

    return User.create(param)
  }

  /**
   * 注册用户
   * @param {Object} param
   * @param {number} param.type        - 注册类型
   * @param {string} [param.email]     - 邮箱
   * @param {string} [param.telephone] - 手机号
   * @param {string} [param.secret]    - 密码
   * @returns
   */
  static async signup({ type, email, telephone, secret }) {
    const _type = parseInt(type, 10)

    if (_type === LOGIN_TYPE.ACCOUNT) {
      await User.setData({ email, secret })
    } else if (_type === LOGIN_TYPE.MOBILE_PHONE) {
      await User.setData({ telephone })
    } else {
      throw new __ERROR__.ParamException(`未定义 type: ${_type} 的处理函数`)
    }
  }

  /**
   * 向用户（邮箱、手机）发送验证码（并存入 Session 等待验证）
   * @param {Object} param
   * @param {number} param.type    - 登录类型
   * @param {string} param.account - 账号
   * @param {Object} param.session - Session
   * @returns {string} 验证码
   */
  static async sendVcode({ type, email, telephone, session }) {
    const _session = session.signup || {}
    const _type = parseInt(type, 10)
    const account = email || telephone
    let vcode = _session.vcode

    if (_session.account === account && vcode) {
      throw new __ERROR__.VcodeException(
        '验证码已发送。没有收到？请检查您的邮箱是否正确',
      )
    }

    try {
      if (_type === LOGIN_TYPE.ACCOUNT) {
        vcode = await User.sendEmailVcode(email)
      } else if (_type === LOGIN_TYPE.MOBILE_PHONE) {
        vcode = await User.sendPhoneVcode(telephone)
      }
    } catch (error) {
      throw new __ERROR__.VcodeException(`验证码发送失败。${error}`)
    }

    if (vcode) {
      session.signup = { account, vcode }
    }

    return vcode
  }

  /**
   * 向用户填写的邮箱发送验证码
   * @param {string} email - 用户邮箱
   * @returns {string} 验证码
   */
  static async sendEmailVcode(email) {
    const emailService = await new EmailService(email)
    const vcode = emailService.vcode

    await emailService.send()

    return vcode
  }

  static async sendPhoneVcode(telephone) {
    // TODO:
    return 123
  }

  /**
   * 验证账号和密码
   * @param {string} account - 账号
   * @param {string} secret  - 密码
   * @returns {Object} User 模型的实例
   */
  static async verifyAccountSecret(account, secret) {
    const user = await User.getData({
      [Op.or]: [{ email: account }, { telephone: account }],
    })
    let isVerifyPass = false

    if (user) {
      const isSecretValid = bcrypt.compareSync(secret, user.secret)

      if (isSecretValid) {
        isVerifyPass = true
      }
    }

    if (!isVerifyPass) {
      throw new __ERROR__.AuthFailed('账号或密码不正确')
    }

    return user
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    account: {
      type: DataTypes.STRING,
      unique: true,
      comment: '账号（通过 uid 生成）',
      set() {
        const { prefix, uidLength } = __CONFIG__.account
        const genRandomAccount = `${prefix}${uid(uidLength)}`
        this.setDataValue('account', genRandomAccount)
      },
    },
    secret: {
      type: DataTypes.STRING,
      comment: '密码',
      set(val) {
        if (!val) return

        const salt = bcrypt.genSaltSync(10)
        const secret = bcrypt.hashSync(val, salt)
        this.setDataValue('secret', secret)
      },
    },
    telephone: {
      type: DataTypes.STRING,
      unique: true,
      comment: '手机号',
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      comment: '邮箱',
    },
    nickname: {
      type: DataTypes.STRING,
      comment: '昵称',
    },
    openid: {
      type: DataTypes.STRING(64),
      unique: true,
      comment: '微信用户唯一标识 openid',
    },
  },
  {
    sequelize,
    tableName: 'user',
  },
)

module.exports = {
  User,
}
