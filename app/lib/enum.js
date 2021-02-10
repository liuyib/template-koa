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

module.exports = {
  LOGIN_TYPE,
  AUTH_LEVEL,
}
