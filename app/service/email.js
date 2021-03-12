const nodemailer = require('nodemailer')
const { vcode } = require('./vcode')

const email = __CONFIG__.email

class EmailService {
  constructor(emailTo) {
    this.emailTo = emailTo
    this.vcode = this.genVcode()
    this.transporter = this.init()
  }

  init() {
    // 全部配置的详情见：https://nodemailer.com/
    return nodemailer.createTransport({
      // 内置的邮件服务。详见：https://nodemailer.com/smtp/well-known/
      service: 'QQ',
      port: 465,
      // true：465 端口，false：其他端口
      secure: true,
      auth: {
        // 发邮件的邮箱
        user: email.authUser,
        // 授权码（并非邮箱登录密码）
        pass: email.authPass,
      },
    })
  }

  async send() {
    const { transporter, emailTo, vcode } = this

    try {
      const info = await transporter.sendMail({
        // 邮件来源（任意字符）
        from: `"${email.from}" <${email.authUser}>`,
        // 接收列表（可以是多个邮箱，每个邮箱之间用半角逗号分隔）
        to: emailTo,
        // 邮件主题（标题）
        subject: email.subject,
        // 不支持 HTML 解析的邮箱，将会应用 text 中的内容
        text: `您的验证码是 ${vcode}，验证码十分钟内有效。`,
        // 支持 HTML 解析的邮箱，将会应用 html 中的内容
        html: `您的验证码是 <b>${vcode}</b>，验证码十分钟内有效。`,
      })

      return info
    } catch (error) {
      throw new __ERROR__.VcodeException()
    }
  }

  genVcode(length = 6) {
    return vcode(length)
  }
}

module.exports = {
  EmailService,
}
