const { Sequelize, Model } = require('sequelize')
const _ = require('lodash')

const {
  dialect,
  name,
  host,
  port,
  user,
  password,
  logging,
  timezone,
} = __CONFIG__.db

const sequelize = new Sequelize(name, user, password, {
  dialect,
  host,
  port,
  logging,
  timezone,
  define: {
    // create_time(createdAt), update_time(updatedAt)
    timestamps: true,
    // delete_time(deletedAt)
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    underscored: true,
    scopes: {
      no_timestamp: {
        attributes: {
          exclude: ['created_at', 'updated_at', 'deleted_at'],
        },
      },
    },
  },
})

// 根据模型创建数据库表
sequelize.sync({
  force: false,
})

/**
 * 通过控制序列化行为，来控制返回结果“包含/排除”某些字段
 * 原理：Koa 会对 ctx.body 中的结果进行序列化，而 JS 对象上的 toJSON 方法控制了序列化的行为，
 *       因此，修改 Sequelize 的 Model 上的 toJSON 方法，就可以实现上面的需求
 *
 * @example
 *
 * router.get('/test', async (ctx) => {
 *   const data = { ... }
 *
 *   data.include = ['foo', 'bar']
 *   // 如果指定了 include，则 exclude 不会生效
 *   // data.exclude = ['baz']
 *
 *   ctx.body = data
 * })
 */
Model.prototype.toJSON = function () {
  let data = Object.assign(this.dataValues)
  const include = this.include

  if (Array.isArray(include) && include.length) {
    data = _.pick(data, include)
  } else {
    const exclude = this.exclude

    if (Array.isArray(exclude)) {
      for (const key of exclude) {
        _.unset(data, key)
      }
    }
  }

  return data
}

module.exports = {
  sequelize,
}
