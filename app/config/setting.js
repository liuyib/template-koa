module.exports = {
  port: 3001,
  path: {
    // 项目根目录
    root: '/',
    // 配置文件
    config: '/app/config/index.js',
    // 静态资源文件
    static: '/public',
    // 路由文件
    api: '/app/api',
  },
  // 验证相关
  validate: {
    // 手机号验证
    mobilePhone: {
      // 验证手机号码时，允许验证的地区列表（默认中国大陆）
      // 详见：https://github.com/validatorjs/validator.js -> isMobilePhone
      locales: ['zh-CN'],
    },
  },
}
