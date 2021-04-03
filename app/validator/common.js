const { LinValidator, Rule } = require('~lib/validator')

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

class AddressValidator extends LinValidator {
  constructor() {
    super()
    this.contactProvince = [
      new Rule('isLength', '地址中【省/直辖市】不能为空', { min: 1 }),
    ]
    this.contactCity = [
      new Rule('isLength', '地址中【市】不能为空', { min: 1 }),
    ]
    this.contactCounty = [
      new Rule('isLength', '地址中【区/县】不能为空', { min: 1 }),
    ]
    this.contactDetail = [new Rule('isLength', '详细地址不能为空', { min: 1 })]
  }
}

module.exports = {
  PositiveIntegerValidator,
  NotEmptyValidator,
  PaginationValidator,
  AddressValidator,
}
