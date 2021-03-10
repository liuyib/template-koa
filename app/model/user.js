const bcrypt = require('bcryptjs')
const { uid } = require('uid/secure')
const { Model, DataTypes } = require('sequelize')
const { sequelize } = require('~lib/db')
const { LOGIN_TYPE } = require('~lib/enum')

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
   * 插入数据
   * @param {Object} param
   * @param {string} param.account  - 账号
   * @param {string} [param.secret] - 密码
   * @returns {Object} User 模型的实例
   */
  static async setData({ type, account, secret = '' }) {
    const _type = parseInt(type, 10)

    switch (_type) {
      case LOGIN_TYPE.ACCOUNT:
        break
      case LOGIN_TYPE.MOBILE_PHONE:
        break
      case LOGIN_TYPE.MINI_PROGRAM:
        break
      default:
        throw new __ERROR__.ParamException(`未定义 type: ${_type} 的处理函数`)
    }

    return await User.create({
      account,
      secret,
    })
  }

  /**
   * 验证账号和密码
   * @param {string} account - 账号
   * @param {string} secret  - 密码
   * @returns {Object} User 模型的实例
   */
  static async verifyAccountSecret(account, secret) {
    const user = await User.getData({ account })
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
      set(val) {
        if (!val) return

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
      comment: '手机号',
    },
    email: {
      type: DataTypes.STRING,
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
