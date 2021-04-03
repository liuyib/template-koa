/**
 * ============================================
 *         ！！！请不要移动该文件！！！
 * ============================================
 */

const path = require('path')

/**
 * 将所有路径转换为完整的绝对路径
 * @example { api: '/app/api' } => { api: 'E://your_project_root_path/app/api' }
 * @param {Object} target - 要代理的对象
 * @param {string} [root=rootDir] - 根路径
 * @param {string[]} [include=[]] - 包括的字段（只代理的字段）
 * @param {string[]} [exclude=[]] - 排除的字段（不代理的字段）
 * @returns {Object}
 */
const pathProxy = ({ target, root = '/', include = [], exclude = [] }) => {
  return new Proxy(target, {
    get(target, key) {
      if (include && include.length) {
        if (include.includes(key)) {
          return path.join(root, target[key])
        }
      } else if (exclude && exclude.length) {
        if (!exclude.includes(key)) {
          return path.join(root, target[key])
        }
      }
    },
  })
}

/**
 * 路径相关的配置
 */
const pathConfig = {
  root: path.join(__dirname, '../../'),
  // 配置文件
  config: '/app/config/index.js',
  // 路由文件
  api: '/app/api',
  // 静态资源文件
  static: '/public',
}

module.exports = {
  port: 3001,
  path: pathProxy({
    target: pathConfig,
    root: pathConfig.root,
    exclude: ['root'],
  }),
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
