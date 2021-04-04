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
 * @param {string[]} [exclude=[]] - 排除的字段（不代理的字段，会被原样返回）
 * @returns {Object}
 */
const pathProxy = ({ target, root = '/', include = [], exclude = [] }) => {
  return new Proxy(target, {
    get(target, key) {
      if (Array.isArray(include) && include.length) {
        if (include.includes(key)) {
          return path.join(root, target[key])
        }
      } else if (Array.isArray(exclude) && exclude.length) {
        if (exclude.includes(key)) {
          return target[key]
        } else {
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
  host: 'http://localhost',
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
  // 验证码相关
  vcode: {
    // 验证码允许发送的间隔时间（单位 s）
    interval: 60,
    sessionKey: 'vcode#auth',
  },
  file: {
    // 文件上传目录。可以是完整路径、相对路径
    uploadDir: '/public/upload',
    // 访问文件时的路径前缀
    baseUrl: '/upload',
    // 是否使用 UUID 重命名文件
    rename: true,
    // 是否按年月日新建文件夹来分类保存
    archive: true,
    // 单个文件大小限制（2M）
    singleLimit: 2 * 1024 * 1024,
    // 文件上传总大小限制（20M）
    totalLimit: 20 * 1024 * 1024,
    // 一次上传的文件数量限制
    numLimit: 10,
    // 文件后缀
    ext: {
      // 允许的文件后缀，设为空数组则表示包含所有
      // 示例：['.png', '.txt']
      include: [],
      // 排除的文件后缀，设为空数组则表示包含所有
      exclude: [],
    },
  },
}
