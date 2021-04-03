const validator = require('validator')
const { LinValidator, Rule } = require('~lib/validator')
const config = require('~config/setting')
const { isEmpty } = require('~lib/isType')
const { LOGIN_TYPE } = require('~lib/enum')
const { User } = require('~model/user')

const VCODE_SESSION_KEY = config.vcode.sessionKey
const { locales } = __CONFIG__.validate.mobilePhone

class UtilValidator extends LinValidator {
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
    return validator.isMobilePhone(val, locales)
  }

  verifyType(req) {
    const { type, email, telephone } = req.body

    if (typeof type !== 'number') {
      throw new __ERROR__.ParamException('type 参数只能是数字')
    }
    if (this.isAccountType(type)) {
      if (isEmpty(email)) {
        throw new __ERROR__.ParamException(`请传入 email 参数`)
      }
    } else if (this.isMobilePhoneType(type)) {
      if (isEmpty(telephone)) {
        throw new __ERROR__.ParamException('请传入 telephone 参数')
      }
    } else {
      throw new __ERROR__.ParamException(`未定义 type: ${type} 的处理逻辑`)
    }
  }
}

class AuthValidator extends UtilValidator {
  constructor() {
    super()
    this.type = [
      new Rule('isReturn'),
      new Rule('isLength', '不能为空', { min: 1 }),
      new Rule('isIn', '不合法的登录类型', Object.values(LOGIN_TYPE)),
    ]
    this.telephone = [
      new Rule('isReturn'),
      new Rule('isOptional'),
      new Rule('isLength', '手机号不能为空', { min: 1 }),
      new Rule('isMobilePhone', '手机号不合法', locales),
    ]
    this.email = [
      new Rule('isReturn'),
      new Rule('isOptional'),
      new Rule('isLength', '邮箱不能为空', { min: 1 }),
      new Rule('isEmail', '邮箱不合法'),
    ]
    this.account = [
      new Rule('isReturn'),
      new Rule('isOptional'),
      new Rule('isLength', '账号不能为空', { min: 1 }),
    ]
    this.secret = [
      new Rule('isOptional'),
      new Rule('isLength', '密码长度必须 6~32 个字符', { min: 6, max: 32 }),
      new Rule(
        'matches',
        '密码必须包含大小写字母、数字和特殊字符，特殊字符只允许 !@#$%.',
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
}

/**
 * 获取验证码
 * 1. 邮箱注册：传 type + email 参数
 * 2. 手机号注册：传 type + telephone 参数
 */
class VcodeValidator extends AuthValidator {
  validateAccount(req) {
    this.verifyType(req)
  }
}

/**
 * 验证验证码。传 type + vcode 参数
 */
class VcodeVerifyValidator extends AuthValidator {
  constructor() {
    super()
    this.vcode = [
      new Rule('isLength', '验证码不能为空', { min: 1 }),
      new Rule('isNumeric', '验证码只允许是数字'),
    ]
  }

  validateAccount(req) {
    const { type, account } = req.body

    if (type === LOGIN_TYPE.ACCOUNT && !this.isEmail(account)) {
      throw new __ERROR__.ParamException('请输入正确的邮箱')
    } else if (type === LOGIN_TYPE.MOBILE_PHONE && !this.isPhone(account)) {
      throw new __ERROR__.ParamException('请输入正确的手机号')
    }
  }
}

/**
 * 注册
 * 1. 邮箱注册：传 type + email + secret + vcode 参数
 * 2. 手机号注册：传 type + telephone + vcode 参数
 */
class SignupValidator extends AuthValidator {
  constructor(ctx) {
    super()
    this.ctx = ctx
  }

  async validateParams(req) {
    const { type, email, telephone, secret, vcode } = req.body
    const signup = __SESSION__[VCODE_SESSION_KEY] || {}

    this.verifyType(req)

    if (this.isAccountType(type)) {
      if (isEmpty(secret)) {
        throw new __ERROR__.ParamException('请传入 secret 参数')
      }
    }
    if (isEmpty(vcode)) {
      throw new __ERROR__.ParamException('请传入验证码参数')
    }

    if (this.isAccountType(type)) {
      if (await User.getData({ email })) {
        throw new __ERROR__.SignupException('该邮箱已经注册')
      }
    } else if (this.isMobilePhoneType(type)) {
      if (await User.getData({ telephone })) {
        throw new __ERROR__.SignupException('该手机号已经注册')
      }
    }

    if (!signup.vcode) {
      throw new __ERROR__.SignupException('还未获取验证码')
    }
    if (signup.vcode !== vcode) {
      throw new __ERROR__.VcodeException('验证码错误')
    }
  }
}

/**
 * 1. 账户密码登录: 传 type + account + secret 参数
 * 2. 手机验证码登录：传 type + account + vcode 参数
 * 3. 微信小程序登录：传 type + account 参数（将 openid 作为 account 传入）
 */
class LoginValidator extends AuthValidator {
  validateAccount(req) {
    const { type, account, secret, vcode } = req.body

    if (isEmpty(account)) {
      throw new __ERROR__.ParamException('请传入 account 参数')
    }

    switch (type) {
      case LOGIN_TYPE.ACCOUNT:
        if (isEmpty(secret)) {
          throw new __ERROR__.ParamException('请传入 secret 参数')
        }
        if (!this.isPhone(account) && !this.isEmail(account)) {
          throw new __ERROR__.ParamException('请输入正确的手机号或邮箱')
        }
        break
      case LOGIN_TYPE.MOBILE_PHONE:
        if (isEmpty(vcode)) {
          throw new __ERROR__.ParamException('请传入 vcode 参数')
        }
        if (!this.isPhone(account)) {
          throw new __ERROR__.ParamException('请输入正确的手机号')
        }
        break
      case LOGIN_TYPE.MINI_PROGRAM:
        break
      default:
        break
    }
  }
}

module.exports = {
  VcodeValidator,
  VcodeVerifyValidator,
  SignupValidator,
  LoginValidator,
}
