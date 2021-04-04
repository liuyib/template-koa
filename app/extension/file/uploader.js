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
      const host = `${config.host}:${config.port}`

      if (exist) {
        uploaded.push({
          ...exist.dataValues,
          url: new URL(`${host}${exist.path}`).href,
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
          url: new URL(`${host}${saved.path}`).href,
        })
      }
    }

    return uploaded
  }
}

module.exports = Uploader
