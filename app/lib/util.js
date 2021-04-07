const path = require('path')
const fs = require('fs')
const jwt = require('jsonwebtoken')
const { isObject } = require('./isType')

/**
 * 递归读取文件夹中的所有文件
 * @param {string} filePath             - 路径
 * @param {string} [fileTrace=filePath] - 存储读取过的路径
 * @returns {string[]} 所有文件路径组成的数组
 */
function readFile(filePath, fileTrace = filePath) {
  if (!fs.lstatSync(filePath).isDirectory()) {
    return [fileTrace]
  }

  const dirs = fs.readdirSync(filePath)
  const paths = []

  dirs.forEach((dir) => {
    const nextPath = `${filePath}/${dir}`
    const nextTrace = `${fileTrace}/${dir}`

    if (fs.lstatSync(nextPath).isDirectory()) {
      const nextPaths = readFile(nextPath, nextTrace)
      paths.push(...nextPaths)
    } else {
      paths.push(path.normalize(nextTrace))
    }
  })

  return paths
}

/**
 * 递归创建文件夹
 * @param {string} dir - 文件目录
 * @returns {boolean}
 */
function mkdirsSync(dir) {
  if (fs.existsSync(dir)) {
    return true
  }

  if (mkdirsSync(path.dirname(dir))) {
    fs.mkdirSync(dir)
    return true
  }

  return false
}

/**
 * 生成 JWT
 * @param {(string|number)} uid - 用户唯一标识
 * @param {number} permission   - 用户权限标识（数值越大，权限越高）
 * @returns {string} JWT
 */
function genToken(uid, permission) {
  const { secretKey, expiresIn } = __CONFIG__.jwt
  const token = jwt.sign(
    // 携带数据
    { uid, permission },
    // 密钥
    secretKey,
    // 可选配置
    { expiresIn },
  )

  return token
}

/**
 * 生成随机字符串，可用于发送 6 位验证码（目前仅生成数字字符串）
 * @param {number} length - 生成长度
 * @returns {number}
 */
function genRandom(length) {
  return `${Math.random()
    .toFixed(length)
    .slice(-1 * length)}`
}

/**
 * 接口请求成功，返回给客户端的数据
 * 不传参数时，返回的数据包含 code, msg, request 属性
 * @param {(string|Object)} [param] - string: 设置 res.msg
 *                                  - Object: 用于设置 res.msg 以外的属性
 * @returns
 */
function success(param) {
  let succInfo = param || {}

  if (typeof param === 'string') {
    succInfo = { msg: param }
  }

  throw new __ERROR__.Success(succInfo)
}

/**
 * 处理数据，返回数据和分页信息
 * @param {Array} [data=[]]   - 数据
 * @param {number} [start=0]  - 开始索引
 * @param {number} [count=20] - 一页数量
 * @returns {Object}
 */
function pagination(data = [], start = 0, count = 20) {
  const subData = data.slice(start, start + count)
  const result = {
    data: subData,
    start,
    // 实际获取到的数量（如：期望获取 20 条，但实际可能只有 10 条数据）
    count: subData.length || 0,
    // 数据总量
    total: data.length || 0,
  }

  return result
}

/**
 * 将字符串从 camel case 风格转为 snake case 风格
 * @param {string} val
 * @returns {string}
 */
function camel2SnakeCase(val) {
  if (typeof val !== 'string') return ''

  return val.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
}

/**
 * 将对象的键、字符数组的项，全部转为 snake case 风格
 * @param {(Object|string[])} target
 * @returns {(Object|string[])}
 */
function snakeCaseObj(target) {
  let result = {}

  if (isObject(target)) {
    for (const key in target) {
      if (Object.hasOwnProperty.call(target, key)) {
        const snakeCaseKey = camel2SnakeCase(key)
        result[snakeCaseKey] = target[key]
      }
    }
  } else if (Array.isArray(target)) {
    result = target.map((item) => camel2SnakeCase(item))
  }

  return result
}

module.exports = {
  readFile,
  mkdirsSync,
  genToken,
  genRandom,
  success,
  pagination,
  camel2SnakeCase,
  snakeCaseObj,
}
