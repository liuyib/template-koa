/**
 * 生成随机数字验证码
 * @param {number} length - 长度
 * @returns {string}
 */
const vcode = (length) => {
  return Math.random()
    .toFixed(length)
    .slice(-1 * length)
}

module.exports = {
  vcode,
}
