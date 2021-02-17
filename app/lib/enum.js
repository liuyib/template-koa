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
  // 用户   - 小程序
  USER_MINI_PROGRAM: 100,
  // 用户   - 邮箱
  USER_EMAIL: 101,
  // 用户   - 手机号
  USER_MOBILE: 102,
  // 管理员 - 邮箱
  ADMIN_EMAIL: 200,
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
  HTTP_EXCEPTION: 10001,
  // 参数错误
  PARAM_EXCEPTION: 10400,
  // 资源未找到
  NOT_FOUND: 10404,
  // 禁止访问
  FORBBIDEN: 10403,
  // 授权失败
  AUTH_FAILED: 10401,
  // 点赞失败
  LIKE_EXCEPTION: 60001,
  // 取消点赞失败
  DISLIKE_EXCEPTION: 60002,
}

module.exports = {
  LOGIN_TYPE,
  AUTH_LEVEL,
  HTTP_CODE,
}
