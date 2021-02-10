/**
 * Http 错误信息基类
 */
class HttpException extends Error {
  constructor(msg = '自定义错误', code = 10001, status = 400) {
    super()
    this.msg = msg
    this.code = code
    this.status = status
  }
}

/**
 * 参数错误类
 */
class ParamException extends HttpException {
  constructor(msg = '参数错误', code = 10400) {
    super(msg, code, 400)
  }
}

class NotFound extends HttpException {
  constructor(msg = '资源未找到', code = 10404) {
    super(msg, code, 404)
  }
}

class Forbbiden extends HttpException {
  constructor(msg = '禁止访问', code = 10403) {
    super(msg, code, 403)
  }
}

class AuthFailed extends HttpException {
  constructor(msg = '授权失败', code = 10401) {
    super(msg, code, 401)
  }
}

class Success extends HttpException {
  constructor({ msg = '请求成功', code = 0, ...data }) {
    super(msg, code, 200)
    Object.assign(this, data)
  }
}

module.exports = {
  HttpException,
  ParamException,
  NotFound,
  Forbbiden,
  AuthFailed,
  Success,
}
