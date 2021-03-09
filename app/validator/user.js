const validator = require('validator')
const { LinValidator, Rule } = require('~lib/lin-validator-v2')
const { LOGIN_TYPE } = require('~lib/enum')
const { User } = require('~model/user')

class AuthValidator extends LinValidator {
  constructor() {
    super()
    this.type = [
      new Rule('isLength', '不能为空', { min: 1 }),
      new Rule('isIn', '不合法的登录类型', Object.values(LOGIN_TYPE)),
    ]
    this.account = [new Rule('isLength', '账号不能为空', { min: 1 })]
    this.secret = [
      new Rule('isOptional'),
      new Rule('isLength', '密码长度必须 6~32 个字符', { min: 6, max: 32 }),
      new Rule(
        'matches',
        ' 密码至少 6 位，必须包含大小写字母和数字，特殊字符只允许 !@#$%.',
        /^\S*(?=\S{6,})(?=\S*\d)(?=\S*[A-Z])(?=\S*[a-z])(?=\S*[!@#$%.])\S*$/,
      ),
    ]
    // 验证码（verification code => vcode）
    this.vcode = [
      new Rule('isOptional'),
      new Rule('isLength', '验证码不能为空', { min: 1 }),
      new Rule('isNumeric', '验证码只允许是数字', { no_symbols: true }),
    ]
  }

  _isAccountType(type) {
    return type === LOGIN_TYPE.ACCOUNT
  }

  _isMobilePhoneType(type) {
    return type === LOGIN_TYPE.MOBILE_PHONE
  }

  _isEmail(val) {
    return validator.isEmail(val)
  }

  _isPhone(val) {
    const { locales } = __CONFIG__.validate.mobilePhone

    return validator.isMobilePhone(val, locales)
  }
}

class SignupValidator extends AuthValidator {
  async validateAccount(req) {
    const { type, account } = req.body

    if (!type || !account) return

    if (this._isAccountType(type)) {
      if (!this._isEmail(account)) {
        throw new Error('请输入正确的邮箱')
      }
    } else if (this._isMobilePhoneType(type)) {
      if (!this._isPhone(account)) {
        throw new Error('请输入正确的手机号')
      }
    }

    const user = await User.getData({ account })

    if (user) {
      if (this._isAccountType(type)) {
        throw new Error('该邮箱已经注册')
      } else if (this._isMobilePhoneType(type)) {
        throw new Error('该手机号已经注册')
      }
    }
  }
}

class LoginValidator extends AuthValidator {
  validateAccount(req) {
    const { type, account } = req.body

    if (!type || !account) return

    if (this._isAccountType(type)) {
      if (!this._isPhone(account) && !this._isEmail(account)) {
        throw new Error('请输入正确的手机号或邮箱')
      }
    } else if (this._isMobilePhoneType(type)) {
      if (!this._isPhone(account)) {
        throw new Error('请输入正确的手机号')
      }
    }
  }
}

module.exports = {
  SignupValidator,
  LoginValidator,
}
