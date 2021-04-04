const { Model, DataTypes } = require('sequelize')
const { sequelize } = require('~lib/db')

/**
 * 文件表（实体表）
 */
class FileModel extends Model {
  static get fields() {
    return ['name', 'ext', 'size', 'path', 'sign']
  }

  /**
   * 获取数据
   * @param {Object} where - 查询条件
   * @returns {Object}
   */
  static async getData(where) {
    return FileModel.findOne({ where })
  }

  /**
   * 添加
   * @param {Object} column - 数据列
   */
  static async addData(column, transaction) {
    const file = await FileModel.create(column, {
      fields: FileModel.fields,
      transaction,
    })
    // 触发 defaultScope
    await file.reload()

    return file
  }
}

FileModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '文件名',
    },
    ext: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '文件扩展名',
    },
    size: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '文件大小',
    },
    path: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: '文件路径',
    },
    sign: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true,
      comment: '文件签名（防止文件篡改、上传重复文件、用于搜索）',
    },
  },
  {
    sequelize,
    tableName: 'file',
  },
)

module.exports = {
  FileModel,
}
