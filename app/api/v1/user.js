const Router = require('koa-router')
const router = new Router({ prefix: '/v1/user' })
const { SignupValidator, LoginValidator } = require('~validator/user')
const { User } = require('~model/user')
const { Token } = require('~model/token')
const { success } = require('~lib/util')

/**
 * 用户注册
 */
router.post('/signup', async (ctx) => {
  const v = await new SignupValidator().validate(ctx)

  await User.setData(v.get('body'))
  success({
    msg: '注册成功',
  })
})

/**
 * 用户登录
 */
router.post('/login', async (ctx) => {
  const v = await new LoginValidator().validate(ctx)
  // 登录成功后，颁发 token
  const token = await Token.getData(v.get('body'))

  success({
    data: token,
    msg: '登录成功',
  })
})

module.exports = router
