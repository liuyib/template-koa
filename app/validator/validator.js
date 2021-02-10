const { LinValidator, Rule } = require('~lib/lin-validator-v2')

class PositiveIntegerValidator extends LinValidator {
  constructor() {
    super()
    this.key = [new Rule('isInt', '需要是正整数', { min: 1 })]
  }
}

class NotEmptyValidator extends LinValidator {
  constructor() {
    super()
    this.key = [new Rule('isLength', '不能为空', { min: 1 })]
  }
}

class PaginationValidator extends LinValidator {
  constructor() {
    super()
    this.currPage = [new Rule('isInt', '需要是正整数', { min: 1 })]
    this.pageSize = [new Rule('isInt', '需要是正整数', { min: 1 })]
  }
}

module.exports = {
  PositiveIntegerValidator,
  NotEmptyValidator,
  PaginationValidator,
}
