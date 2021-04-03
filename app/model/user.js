const bcrypt = require('bcryptjs')
const { uid } = require('uid/secure')
const { Model, DataTypes, Op } = require('sequelize')
const { sequelize } = require('~lib/db')
const { LOGIN_TYPE } = require('~lib/enum')
const { snakeCaseObj } = require('~lib/util')
const { VcodeService } = require('~service/vcode')

/**
 * 用户表（实体表）
 */
class User extends Model {
  /**
   * 操作数据库时，只允许改动的字段（防止传入多余的字段引起报错）
   */
  static get fields() {
    return [
      'telephone',
      'email',
      'secret',
      'nickname',
      'sex',
      'avatar',
      'address_id',
    ]
  }

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
  static async addData(option = {}) {
    const param = { account: '' }

    Object.assign(param, option)

    return User.create(param)
  }

  /**
   * 修改数据
   * @param {Object} column - 要修改的数据列
   * @param {Object} transaction - 使用 Sequelize 事务时的参数
   * @returns
   */
  static async setData(column, transaction) {
    try {
      await User.update(snakeCaseObj(column), {
        where: { id: column.id },
        fields: User.fields,
        transaction,
      })
    } catch (error) {
      throw new __ERROR__.UserException()
    }
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
    if (type === LOGIN_TYPE.ACCOUNT) {
      await User.addData({ email, secret })
    } else if (type === LOGIN_TYPE.MOBILE_PHONE) {
      await User.addData({ telephone })
    } else {
      throw new __ERROR__.ParamException(`未定义 type: ${type} 的处理函数`)
    }
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

  /**
   * 验证用户是否存在
   * @param {number} id - 用户 ID
   * @returns
   */
  static async verifyExist(id) {
    const user = await User.getData({ id })

    if (!user) {
      throw new __ERROR__.NotFound(`[${__CODE__.USER_NOTFOUND}] 用户查询失败`)
    }

    return user
  }

  static async sendVcode(params) {
    return await VcodeService.sendVcode(params)
  }

  static async verifyVcode(params) {
    return await VcodeService.verifyVcode(params)
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
      type: DataTypes.STRING(12),
      comment: '昵称',
    },
    sex: {
      type: DataTypes.SMALLINT,
      comment: '性别',
    },
    avatar: {
      type: DataTypes.STRING,
      comment: '头像',
    },
    openid: {
      type: DataTypes.STRING(128),
      unique: true,
      comment: '微信用户唯一标识 openid',
    },
  },
  {
    sequelize,
    tableName: 'user',
  },
)

/**
 * TEMPLATE: 设置外键
 */
// const hasManyOption = {
//   onDelete: 'CASCADE',
//   onUpdate: 'CASCADE',
//   foreignKey: 'user_id',
// }

// User.hasMany(OtherModel, {
//   ...hasManyOption,
// })

module.exports = {
  User,
}
