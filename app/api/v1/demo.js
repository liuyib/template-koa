const Router = require('koa-router')
const router = new Router({ prefix: '/v1/demo' })
const { Auth } = require('~middleware/auth')
const { success } = require('~lib/util')

/**
 * Demo 测试接口（无需权限）
 */
router.get('/test', async (ctx) => {
  success({ msg: '请求成功' })
})

/**
 * Demo 测试接口（需要权限）
 */
router.get('/auth', new Auth(__AUTH__.USER).verify, async (ctx) => {
  success({ msg: '请求成功' })
})

module.exports = router
