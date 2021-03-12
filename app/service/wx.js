const axios = require('axios')
const util = require('util')
const { User } = require('~model/user')
const { genToken } = require('~lib/util')

class WXService {
  /**
   * 通过微信登录（wx.login）时返回的 code，来获取微信用户 openid，
   * 并用“openid”和“用户权限标识”生成 JWT，返回给客户端
   * @param {string} code - 微信登录时返回的 code
   * @returns {string} JWT
   */
  static async code2Token(code) {
    const { appId, appSecret, loginUrl } = __CONFIG__.wx
    const url = util.format(loginUrl, appId, appSecret, code)

    try {
      const { data } = await axios.get(url)

      if (data.errcode && data.errcode !== 0) {
        throw new Error(`openid 获取失败，[${data.errcode}] ${data.errmsg}`)
      }

      const { openid } = data
      let user = await User.getData({ openid })

      if (!user) {
        user = await User.setData({ openid })
      }

      return genToken(user.id, __AUTH__.USER)
    } catch (error) {
      throw new __ERROR__.AuthFailed(error || 'openid 获取失败')
    }
  }
}

module.exports = {
  WXService,
}
