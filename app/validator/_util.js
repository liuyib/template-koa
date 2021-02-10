/**
 * 一些 validator 专用的 util 函数
 */
const verifyType = (types) => {
  return (req) => {
    const type = parseInt(req.body.type || req.path.type, 10)

    if (!type) {
      throw new Error('type 不能为空')
    }
    if (!types.isType(type)) {
      throw new Error('type 参数不合法')
    }
  }
}

module.exports = {
  verifyType,
}
