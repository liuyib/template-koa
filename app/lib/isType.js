/**
 * 判断是否为空（undefined 或 null）
 * @param {*} val
 * @returns {boolean}
 */
function isEmpty(val) {
  return val === undefined || val === null
}

/**
 * 判断是否为对象
 * @param {Object} val
 * @returns {boolean}
 */
function isObject(val) {
  return Object.prototype.toString.call(val) === '[object Object]'
}

module.exports = {
  isEmpty,
  isObject,
}
