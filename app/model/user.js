const bcrypt = require('bcryptjs')
const { Model, DataTypes } = require('sequelize')
const { sequelize } = require('~lib/db')

/**
 * 实体表 User
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
   * @param {Object} info - 要插入的数据
   * @returns {Object} User 模型的实例
   */
  static async setData(info) {
    return await User.create(info)
  }

  /**
   * 验证邮箱和密码
   * @param {string} email  - 邮箱
   * @param {string} secret - 密码
   * @returns {Object} User 模型的实例
   */
  static async verifyEmailSecret(email, secret) {
    const user = await User.getData({
      account: email,
    })

    if (!user) {
      throw new __ERROR__.AuthFailed('邮箱不存在')
    }

    const isPwdCorrect = bcrypt.compareSync(secret, user.secret)

    if (!isPwdCorrect) {
      throw new __ERROR__.AuthFailed('密码不正确')
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
      comment: '账号（邮箱、手机号、等）',
    },
    secret: {
      type: DataTypes.STRING,
      comment: '密码',
      /**
       * 观察者模式
       * 当 /signup 接口中设置数据时，就会执行这里的操作
       */
      set(val) {
        const salt = bcrypt.genSaltSync(10)
        const secret = bcrypt.hashSync(val, salt)
        this.setDataValue('secret', secret)
      },
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
