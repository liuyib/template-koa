const validator = require('validator')
const { LinValidator, Rule } = require('~lib/lin-validator-v2')
const { isEmpty } = require('~lib/util')
const { LOGIN_TYPE } = require('~lib/enum')
const { User } = require('~model/user')

class AuthValidator extends LinValidator {
  constructor() {
    super()
    this.type = [
      new Rule('isReturn'),
      new Rule('isLength', '不能为空', { min: 1 }),
      new Rule('isIn', '不合法的登录类型', Object.values(LOGIN_TYPE)),
    ]
    this.telephone = [
      new Rule('isOptional'),
      new Rule('isLength', '手机号不能为空', { min: 1 }),
      new Rule('isMobilePhone', '手机号不合法'),
    ]
    this.email = [
      new Rule('isOptional'),
      new Rule('isLength', '邮箱不能为空', { min: 1 }),
      new Rule('isEmail', '邮箱不合法'),
    ]
    this.account = [
      new Rule('isOptional'),
      new Rule('isLength', '账号不能为空', { min: 1 }),
    ]
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
      new Rule('isReturn'),
      new Rule('isOptional'),
      new Rule('isLength', '验证码不能为空', { min: 1 }),
      new Rule('isNumeric', '验证码只允许是数字', { no_symbols: true }),
    ]
  }

  isAccountType(type) {
    return type === LOGIN_TYPE.ACCOUNT
  }

  isMobilePhoneType(type) {
    return type === LOGIN_TYPE.MOBILE_PHONE
  }

  isEmail(val) {
    return validator.isEmail(val)
  }

  isPhone(val) {
    const { locales } = __CONFIG__.validate.mobilePhone

    return validator.isMobilePhone(val, locales)
  }
}

class VcodeValidator extends AuthValidator {}

class SignupValidator extends AuthValidator {
  constructor(ctx) {
    super()
    this.ctx = ctx
  }

  async validateAccount(req) {
    const { type, email, telephone, secret, vcode } = req.body
    const signup = this.ctx.session.signup || {}

    if (isEmpty(vcode)) {
      throw new Error('请传入验证码参数')
    }
    if (!signup.vcode) {
      throw new Error('还未获取验证码')
    }
    if (signup.vcode !== vcode) {
      throw new Error('验证码错误')
    }

    if (this.isAccountType(type)) {
      // 使用邮箱注册时，必须传密码
      if (isEmpty(secret)) {
        throw new Error('请传入密码参数')
      }
      if (!this.isEmail(email)) {
        throw new Error('请输入正确的邮箱')
      }

      const user = await User.getData({ email })

      if (user) {
        throw new Error('该邮箱已经注册')
      }
    } else if (this.isMobilePhoneType(type)) {
      if (!this.isPhone(telephone)) {
        throw new Error('请输入正确的手机号')
      }

      const user = await User.getData({ telephone })

      if (user) {
        throw new Error('该手机号已经注册')
      }
    }
  }
}

class LoginValidator extends AuthValidator {
  validateAccount(req) {
    const { type, account } = req.body

    if (!type || !account) return

    if (this.isAccountType(type)) {
      if (!this.isPhone(account) && !this.isEmail(account)) {
        throw new Error('请输入正确的手机号或邮箱')
      }
    } else if (this.isMobilePhoneType(type)) {
      if (!this.isPhone(account)) {
        throw new Error('请输入正确的手机号')
      }
    }
  }
}

module.exports = {
  VcodeValidator,
  SignupValidator,
  LoginValidator,
}
