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
    this.start = [
      new Rule('isOptional'),
      new Rule('isInt', '不符合规范', {
        min: 0,
        max: Number.MAX_SAFE_INTEGER,
      }),
    ]
    this.count = [
      new Rule('isOptional'),
      new Rule('isInt', '不符合规范', {
        min: 0,
        max: 20,
      }),
    ]
  }
}

module.exports = {
  PositiveIntegerValidator,
  NotEmptyValidator,
  PaginationValidator,
}
