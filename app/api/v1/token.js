const Router = require('koa-router')
const router = new Router({ prefix: '/v1/token' })
const { Auth } = require('~middleware/auth')
const { TokenValidator, VerifyValidator } = require('~validator/token')
const { Token } = require('~model/token')
const { success } = require('~lib/util')

/**
 * 获取 Token
 */
router.post('/', async (ctx) => {
  const v = await new TokenValidator().validate(ctx)
  const token = await Token.getData(v.get('body'))

  success({
    data: token,
    msg: 'token 获取成功',
  })
})

/**
 * 验证 Token
 */
router.post('/verify', async (ctx) => {
  const v = await new VerifyValidator().validate(ctx, { key: 'token' })
  Auth.verifyToken(v.get('body.token'))

  success({
    msg: 'token 合法',
  })
})

module.exports = router
