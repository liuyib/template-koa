const Router = require('koa-router')
const router = new Router({ prefix: '/v1/demo' })
const { Auth } = require('~middleware/auth')
const { Demo } = require('~model/demo')
const { success } = require('~lib/util')

/**
 * Demo 测试接口（无需权限）
 */
router.get('/test', async (ctx) => {
  success({
    msg: '请求成功',
    data: {
      'demo1-1': '见：/v1/demo/test/include',
      'demo1-2': '见：/v1/demo/test/exclude',
    },
  })
})

/**
 * 指定返回结果仅包含某些字段
 */
router.get('/test/include', async (ctx) => {
  const demo = await Demo.getData()

  demo.include = ['foo', 'bar']

  success({ msg: '', data: demo })
})

/**
 * 指定返回结果仅排除某些字段
 */
router.get('/test/exclude', async (ctx) => {
  const demo = await Demo.getData()

  demo.exclude = ['created_at', 'updated_at', 'deleted_at']

  success({ msg: '', data: demo })
})

/**
 * Demo 测试接口（需要权限）
 */
router.get('/auth', new Auth(__AUTH__.USER).verify, async (ctx) => {
  success({ msg: '请求成功' })
})

module.exports = router
