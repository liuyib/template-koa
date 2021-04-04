const _ = require('lodash')
const uuid = require('uuid')
const dayjs = require('dayjs')
const path = require('path')
const crypto = require('crypto')
const config = require('~config/setting')
const util = require('~lib/util')

const rootDir = config.path.root

class LocalUploader {
  constructor({ uploadDir, baseUrl, rename, archive } = {}) {
    this.uploadDir = uploadDir || _.get(config, 'file.uploadDir')
    this.baseUrl = baseUrl || _.get(config, 'file.baseUrl')
    this.rename = rename || _.get(config, 'file.rename')
    this.archive = archive || _.get(config, 'file.archive')

    this.checkUploadDir()
  }

  async upload(files) {
    throw new Error('必须重载此函数')
  }

  getUploadPath(fileName) {
    const newName = this.genFilename(fileName)
    const { filePath, fullPath } = this.getArchiveDir()

    util.mkdirsSync(fullPath)

    return {
      filePath: path.join(filePath, newName),
      fullPath: path.join(fullPath, newName),
      newName,
    }
  }

  getArchiveDir() {
    const { uploadDir, baseUrl, archive, genFormatDate } = this
    let archivePath = baseUrl
    let archiveFullpath = path.join(rootDir, uploadDir)

    if (archive) {
      archivePath = path.join(archivePath, genFormatDate())
      archiveFullpath = path.join(archiveFullpath, genFormatDate())
    }

    return {
      filePath: archivePath,
      fullPath: archiveFullpath,
    }
  }

  genFilename(fileName) {
    if (!this.rename) return fileName

    const ext = path.extname(fileName)
    const uuidv4 = uuid.v4().replace(/[-]+/g, '')

    return `${uuidv4}${ext}`
  }

  genFormatDate() {
    return `${dayjs().format('YYYY/MM/DD')}`
  }

  genMd5(buffer) {
    const md5 = crypto.createHash('md5')
    return md5.update(buffer).digest('hex')
  }

  checkUploadDir() {
    if (!this.uploadDir) {
      throw new Error('请指定上传目录')
    }
  }
}

module.exports = LocalUploader
