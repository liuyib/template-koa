const { LinValidator, Rule } = require('~lib/lin-validator-v2')
const { NotEmptyValidator } = require('~validator/validator')
const { verifyType } = require('./_util')
const { LOGIN_TYPE } = require('~lib/enum')

class TokenValidator extends LinValidator {
  constructor() {
    super()
    this.account = [
      new Rule('isLength', '至少 4 个字符，至多 128 个字符', {
        min: 4,
        max: 128,
      }),
    ]
    // 密码不是所有登录方式都需要，传统 Web 登录需要，而小程序登录不需要，因此该字段是可选的
    this.secret = [
      new Rule('isOptional'),
      new Rule('isLength', '至少 6 个字符，至多 128 个字符', {
        min: 6,
        max: 128,
      }),
    ]
    this.validateTokenType = verifyType(LOGIN_TYPE)
  }
}

class VerifyValidator extends NotEmptyValidator {}

module.exports = {
  TokenValidator,
  VerifyValidator,
}
