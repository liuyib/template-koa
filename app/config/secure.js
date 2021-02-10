const { env } = process

module.exports = {
  db: {
    dialect: 'mariadb',
    name: env.DB_NAME,
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASS,
    // 默认是 console.log，设置 false 关闭 log。详见：
    // https://sequelize.org/master/manual/getting-started.html#logging
    logging: false,
    timezone: '+08:00',
  },
  jwt: {
    secretKey: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()',
    expiresIn: 60 * 60,
  },
  wx: {
    appId: env.WX_APP_ID,
    appSecret: env.WX_APP_SECRET,
    loginUrl:
      'https://api.weixin.qq.com/sns/jscode2session?appid=%s&secret=%s&js_code=%s&grant_type=authorization_codeF',
  },
}
