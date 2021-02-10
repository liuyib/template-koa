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
  // v.get('body') <=> ctx.request.body
  const token = await Token.getData(v.get('body'))

  success({ msg: 'token 获取成功', data: token })
})

/**
 * 验证 Token
 */
router.post('/verify', async (ctx) => {
  const v = await new VerifyValidator().validate(ctx, {
    key: 'token',
  })
  const isTokenValid = Auth.verifyToken(v.get('body.token'))

  if (isTokenValid) {
    success({ msg: 'token 合法' })
  } else {
    throw new __ERROR__.ParamException('token 不合法')
  }
})

module.exports = router
