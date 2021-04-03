/**
 * 检查某值是否包含在对象中
 * @param {(number|string)} val 待检查的值
 * @returns {boolean}
 */
function isType(val) {
  for (const key in this) {
    if (this[key] === val) {
      return true
    }
  }

  return false
}

/**
 * 登录类型
 */
const LOGIN_TYPE = {
  // 小程序登录
  MINI_PROGRAM: 100,
  // 账号 + 密码登录（账号可以是：邮箱、手机号）
  ACCOUNT: 101,
  // 手机号 + 验证码登录
  MOBILE_PHONE: 102,
  isType,
}

/**
 * 权限等级（接口权限分级控制）
 * -> [8 , 16) 普通用户   - USER
 * -> [16, 32) 管理员     - ADMIN
 * -> [32, +∞) 超级管理员 - SUPER
 *
 * 注意：这个变量会被挂载到全局变量 __AUTH__ 上，见 ./init.js -> loadAuth()
 */
const AUTH_LEVEL = {
  USER: 8,
  ADMIN: 16,
  SUPER: 32,
}

/**
 * 自定义 HTTP 业务码
 */
const HTTP_CODE = {
  // 成功
  SUCCESS: 0,
  // 自定义错误
  HTTP_ERROR: 10001,
  // 参数错误
  PARAM_ERROR: 10400,
  // 授权失败
  AUTH_FAILED: 10401,
  // 禁止访问
  FORBBIDEN: 10403,
  // 资源未找到
  NOT_FOUND: 10404,
  // 服务器错误
  SERVER_ERROR: 10500,

  /**
   * 自定义业务错误码
   */
  // 用户不存在
  USER_NOTFOUND: 10904,
  // 用户相关逻辑失败（用户不存在除外）
  USER_FAILED: 10900,
  // 资源上传失败
  ASSETS_FAILED: 10920,
  // 验证码发送失败
  VCODE_FAILED: 11001,
  // 账号注册失败
  SIGNUP_FAILED: 11011,
  // 收货地址相关逻辑失败
  ADDRESS_FAILED: 11030,
}

module.exports = {
  LOGIN_TYPE,
  AUTH_LEVEL,
  HTTP_CODE,
}
