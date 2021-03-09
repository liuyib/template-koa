const validator = require('validator')
const { LinValidator, Rule } = require('~lib/lin-validator-v2')
const { LOGIN_TYPE } = require('~lib/enum')
const { User } = require('~model/user')

class SignupValidator extends LinValidator {
  constructor() {
    super()
    this.account = [new Rule('isLength', '账号不能为空', { min: 1 })]
    this.secret = [
      new Rule('isLength', '密码长度必须 6~32 个字符', { min: 6, max: 32 }),
      new Rule(
        'matches',
        ' 密码至少 6 位，必须包含大小写字母和数字，特殊字符只允许 !@#$%.',
        /^\S*(?=\S{6,})(?=\S*\d)(?=\S*[A-Z])(?=\S*[a-z])(?=\S*[!@#$%.])\S*$/,
      ),
    ]
    this.nickname = [
      new Rule('isLength', '昵称长度必须 2~32 个字符', { min: 2, max: 32 }),
    ]
  }

  async validateAccount(req) {
    const { account } = req.body

    if (!account) return

    const { locales } = __CONFIG__.validate.mobilePhone
    const isEmail = validator.isEmail(account)
    const isMobilePhone = validator.isMobilePhone(account, locales)

    if (!isEmail && !isMobilePhone) {
      throw new Error('请输入正确的邮箱或手机号')
    }

    const ret = await User.getData({ account })

    if (ret) {
      if (isEmail) {
        throw new Error('该 Email 已经注册')
      } else if (isMobilePhone) {
        throw new Error('该手机号已经注册')
      }
    }
  }

  validateSecret(req) {
    const { secret, secret2 } = req.body

    if (secret !== secret2) {
      throw new Error('两次输入的密码不相同')
    }
  }
}

class LoginValidator extends LinValidator {
  constructor() {
    super()
    this.type = [
      new Rule('isIn', '不合法的登录类型', Object.values(LOGIN_TYPE)),
    ]
    this.account = [new Rule('isOptional')]
    this.secret = [
      new Rule('isOptional'),
      new Rule('isLength', '密码至少六位', {
        min: 6,
      }),
    ]
  }
}

module.exports = {
  SignupValidator,
  LoginValidator,
}
