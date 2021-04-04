const path = require('path')
const fs = require('fs')
const config = require('~config/setting')
const LocalUploader = require('~core/local-uploader')
const { FileModel } = require('~model/file')

class Uploader extends LocalUploader {
  async upload(files) {
    const uploaded = []

    for (const file of files) {
      const md5 = this.genMd5(file.buffer)
      const exist = await FileModel.getData({ sign: md5 })

      if (exist) {
        uploaded.push({
          ...exist.dataValues,
          url: `${config.host}:${config.port}${exist.path}`,
        })
      } else {
        const { filePath, fullPath, newName } = this.getUploadPath(
          file.filename,
        )
        const ext = path.extname(newName)
        const stream = fs.createWriteStream(fullPath)

        await stream.write(file.buffer)

        const saved = await FileModel.addData({
          path: filePath,
          name: newName,
          ext,
          size: file.size,
          sign: md5,
        })

        uploaded.push({
          ...saved.dataValues,
          url: `${config.host}:${config.port}${saved.path}`,
        })
      }
    }

    return uploaded
  }
}

module.exports = Uploader
