const _ = require('lodash')
const asyncBusboy = require('async-busboy')
const path = require('path')
const config = require('~config/setting')

/**
 * 检测文件后缀是否被允许
 * （同时传入 include 和 exclude 参数时，只生效 include）
 * @param {Object} [option={}]
 * @param {string} [option.ext] - 文件后缀
 * @param {string[]} [option.include] - 允许哪些后缀
 * @param {string[]} [option.exclude] - 排除哪些后缀
 * @returns
 */
function checkFileExtension({ ext, include, exclude } = {}) {
  const includeExt = include || _.get(config, 'file.ext.include')
  const excludeExt = exclude || _.get(config, 'file.ext.exclude')
  let isValid = true

  if (Array.isArray(includeExt) && includeExt.length) {
    isValid = includeExt.includes(ext)
  } else if (Array.isArray(excludeExt) && excludeExt.length) {
    isValid = excludeExt.includes(ext)
  }

  if (!isValid) {
    throw new __ERROR__.ParamException(`不支持 ${ext} 类型的文件`)
  }
}

/**
 * 检测单个文件大小是否合法
 * @param {Object} [option={}]
 * @param {Object} [option.file] - 文件
 * @param {number} [option.singleLimit] - 限制大小
 * @returns
 */
function checkSingleFileSize({ file, singleLimit } = {}) {
  const limitSize = singleLimit || _.get(config, 'file.singleLimit')

  if (file.size > limitSize) {
    throw new __ERROR__.ParamException(`文件 ${file.filename} 的大小超出限制`)
  }
}

/**
 * 检测所有文件大小是否合法
 * @param {Object} [option={}]
 * @param {number} [option.totalSize] - 所有文件总大小
 * @param {number} [option.totalLimit] - 限制大小
 * @returns
 */
function checkTotalFileSize({ totalSize, totalLimit } = {}) {
  const limitSize = totalLimit || _.get(config, 'file.totalLimit')

  if (totalSize > limitSize) {
    throw new __ERROR__.ParamException(`所有文件的总大小超出限制`)
  }
}

/**
 * 检测文件数量是否合法
 * @param {Object} [option={}]
 * @param {number} [option.totalNum] - 文件总数
 * @param {number} [option.numLimit] - 限制数量
 * @returns
 */
function checkFileNums({ totalNum, numLimit } = {}) {
  const limitNum = numLimit || _.get(config, 'file.numLimit')

  if (totalNum > limitNum) {
    throw new __ERROR__.ParamException(`文件总数量超出限制（${limitNum} 个）`)
  }
}

const _1MB_ = 1 * 1024 * 1024

async function parseFile(opts = {}) {
  opts.encoding = opts.encoding || 'utf-8'
  opts.singleLimit =
    opts.singleLimit || _.get(config, 'file.singleLimit') || 2 * _1MB_
  opts.totalLimit =
    opts.totalLimit || _.get(config, 'file.totalLimit') || 20 * _1MB_
  opts.numLimit = opts.numLimit || _.get(config, 'file.numLimit') || 10

  if (!this.is('multipart')) {
    throw new __ERROR__.ParamException('Content-Type 必须是 multipart/*')
  }

  const filePromises = []
  const { fields } = await asyncBusboy(this.req, {
    // FIXME: 读取中文的文件名乱码
    async onFile(fieldName, file, filename, encoding, mimeType) {
      const filePromise = new Promise((resolve, reject) => {
        const buffers = []

        file
          .on('error', (err) => {
            file.resume()
            reject(err)
          })
          .on('data', (data) => {
            buffers.push(data)
          })
          .on('end', () => {
            const buffer = Buffer.concat(buffers)

            resolve({
              fieldName,
              buffer,
              filename,
              encoding: opts.encoding,
              mimeType,
              size: buffer.length,
            })
          })
      })

      filePromises.push(filePromise)
    },
  })

  const files = []
  let totalSize = 0

  for (const filePromise of filePromises) {
    let file = null

    try {
      file = await filePromise
    } catch (error) {
      throw new __ERROR__.ParamException('文件读取失败')
    }

    const ext = path.extname(file.filename)

    checkFileExtension({
      ext,
      include: opts.include,
      exclude: opts.exclude,
    })
    checkSingleFileSize({
      file,
      singleLimit: opts.singleLimit,
    })

    totalSize += file.size
    files.push(file)
  }

  checkFileNums({
    totalNum: files.length,
    numLimit: opts.numLimit,
  })
  checkTotalFileSize({
    totalSize,
    totalLimit: opts.totalLimit,
  })

  this.request.fields = fields

  return files
}

const multipart = () => {
  return async (ctx, next) => {
    ctx.multipart = parseFile

    await next()
  }
}

module.exports = multipart
