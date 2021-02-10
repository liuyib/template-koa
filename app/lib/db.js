const Sequelize = require('sequelize')

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

module.exports = {
  sequelize,
}
