const { Model, DataTypes } = require('sequelize')
const { sequelize } = require('~lib/db')

class Demo extends Model {
  static async getData() {
    const demo = Demo.create({ foo: 1, bar: 2, baz: 3 })
    return demo
  }
}

Demo.init(
  {
    foo: DataTypes.INTEGER,
    bar: DataTypes.INTEGER,
    baz: DataTypes.INTEGER,
  },
  {
    sequelize,
    tableName: 'demo',
  },
)

module.exports = {
  Demo,
}
