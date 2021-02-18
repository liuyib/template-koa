const path = require('path')
const fs = require('fs')
const jwt = require('jsonwebtoken')

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
  const totalCount = subData.length || 0
  const totalPage = Math.ceil(totalCount / count)

  const result = {
    data: subData,
    // 数据总量
    totalCount,
    // 总页数
    totalPage,
  }

  return result
}

module.exports = {
  readFile,
  genToken,
  success,
  pagination,
}
