const { LinValidator, Rule } = require('~lib/lin-validator-v2')
const { LOGIN_TYPE } = require('~lib/enum')
const { User } = require('~model/user')

class SignupValidator extends LinValidator {
  constructor() {
    super()
    this.nickname = [
      new Rule('isLength', '昵称长度必须 2~32 个字符', { min: 2, max: 32 }),
    ]
    this.email = [new Rule('isEmail', '请输入正确的邮箱')]
    this.password = [
      new Rule('isLength', '密码长度必须 6~32 个字符', { min: 6, max: 32 }),
      new Rule(
        'matches',
        ' 密码至少 6 位，必须包含大小写字母和数字，特殊字符只允许 !@#$%.',
        /^\S*(?=\S{6,})(?=\S*\d)(?=\S*[A-Z])(?=\S*[a-z])(?=\S*[!@#$%.])\S*$/,
      ),
    ]
  }

  validatePassword(req) {
    const { password, password2 } = req.body

    if (password !== password2) {
      throw new Error('两次输入的密码不相同')
    }
  }

  async validateEmail(req) {
    const { email } = req.body
    const ret = await User.getData({ email })

    if (ret) {
      throw new Error('该 Email 已经注册')
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
