const Router = require('koa-router')
const Uploader = require('~extension/file/uploader')
const { success } = require('~lib/util')

const router = new Router({ prefix: '/v1/file' })
const uploader = new Uploader()

router.post('/', async (ctx) => {
  const files = await ctx.multipart()
  const uploaded = await uploader.upload(files)

  success({
    data: uploaded,
    msg: '文件上传成功',
  })
})

module.exports = router
