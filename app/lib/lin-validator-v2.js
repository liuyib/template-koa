const validator = require('validator')
const { ParamException } = require('./http-exception')
const { get, last, set, cloneDeep } = require('lodash')

/**
 * 找到对象中的某些属性和方法
 * @param {Object} instance              - 类/构造函数的实例
 * @param {Object} options
 * @param {string} options.prefix        - 名称前缀
 * @param {Object} options.specifiedType - 指定数据类型
 * @param {Function} options.filter      - 过滤器（自定义查找规则）
 * @returns {string[]} 属性和方法名组成的数组
 */
const findMembers = function (instance, { prefix, specifiedType, filter }) {
  // 递归函数
  function step(instance) {
    const _prototype = Object.getPrototypeOf(instance)

    // 基线条件（跳出递归）
    if (_prototype === null) return []

    let names = Reflect.ownKeys(instance)

    names = names.filter((name) => {
      // 过滤掉不满足条件的属性或方法名
      return shouldKeep(name)
    })

    return [...names, ...step(_prototype)]
  }

  function shouldKeep(value) {
    if (filter && filter(value)) return true
    if (prefix && value.startsWith(prefix)) return true
    if (specifiedType && instance[value] instanceof specifiedType) return true
    return false
  }

  return step(instance)
}

class LinValidator {
  constructor() {
    this.data = {}
    this.parsed = {}
  }

  _assembleAllParams(ctx) {
    return {
      body: ctx.request.body,
      query: ctx.request.query,
      path: ctx.params,
      header: ctx.request.header,
    }
  }

  get(path, parsed = true) {
    if (parsed) {
      const value = get(this.parsed, path, null)
      if (value == null) {
        const keys = path.split('.')
        const key = last(keys)
        return get(this.parsed.default, key)
      }
      return value
    } else {
      return get(this.data, path)
    }
  }

  _findMembersFilter(key) {
    if (/validate([A-Z])\w+/g.test(key)) {
      return true
    }
    if (this[key] instanceof Array) {
      this[key].forEach((value) => {
        const isRuleType = value instanceof Rule
        if (!isRuleType) {
          throw new Error('验证数组必须全部为Rule类型')
        }
      })
      return true
    }
    return false
  }

  async validate(ctx, alias = {}) {
    this.alias = alias
    const params = this._assembleAllParams(ctx)
    this.data = cloneDeep(params)
    this.parsed = cloneDeep(params)

    const memberKeys = findMembers(this, {
      filter: this._findMembersFilter.bind(this),
    })

    const errorMsgs = []
    // const map = new Map(memberKeys)
    for (const key of memberKeys) {
      const result = await this._check(key, alias)

      if (result.isReturn) {
        throw new ParamException([result.msg])
      }
      if (!result.success) {
        errorMsgs.push(result.msg)
      }
    }
    if (errorMsgs.length !== 0) {
      throw new ParamException(errorMsgs)
    }
    ctx.v = this
    return this
  }

  async _check(key, alias = {}) {
    const isCustomFunc = typeof this[key] === 'function'
    let result
    if (isCustomFunc) {
      try {
        await this[key](this.data)
        result = new RuleResult({ pass: true })
      } catch (error) {
        result = new RuleResult({
          pass: false,
          msg: error.msg || error.message || '参数错误',
        })
      }
      // 函数验证
    } else {
      // 属性验证, 数组，内有一组Rule
      const rules = this[key]
      const ruleField = new RuleField(rules)
      // 别名替换
      key = alias[key] ? alias[key] : key
      const param = this._findParam(key)

      result = ruleField.validate(param.value)

      if (result.pass) {
        // 如果参数路径不存在，往往是因为用户传了空值，而又设置了默认值
        if (param.path.length === 0) {
          set(this.parsed, ['default', key], result.legalValue)
        } else {
          set(this.parsed, param.path, result.legalValue)
        }
      }
    }
    if (!result.pass) {
      const msg = `${isCustomFunc ? '' : `${key} `}${result.msg}`
      return {
        isReturn: result.isReturn,
        msg: msg,
        success: false,
      }
    }
    return {
      msg: 'ok',
      success: true,
    }
  }

  _findParam(key) {
    const params = ['query', 'body', 'path', 'header']
    let value

    for (const param of params) {
      value = get(this.data, [param, key])

      if (value !== null && value !== undefined) {
        return {
          value,
          path: ['query', key],
        }
      }
    }

    return {
      value: null,
      path: [],
    }
  }
}

class RuleResult {
  constructor({ pass = false, msg = '', isReturn = false }) {
    Object.assign(this, {
      pass,
      msg,
      isReturn,
    })
  }
}

class RuleFieldResult extends RuleResult {
  constructor({ pass = false, msg = '', legalValue = null, isReturn = false }) {
    super(pass, msg)
    this.legalValue = legalValue
    this.isReturn = isReturn
  }
}

class Rule {
  constructor(name, msg, ...params) {
    Object.assign(this, {
      name,
      msg,
      params,
    })
  }

  validate(field) {
    if (this.name === 'isReturn') {
      return new RuleResult({ pass: true, isReturn: true })
    }
    if (this.name === 'isOptional') {
      return new RuleResult({ pass: true })
    }
    if (!validator[this.name](field + '', ...this.params)) {
      return new RuleResult({
        pass: false,
        msg: this.msg || this.message || '参数错误',
      })
    }
    return new RuleResult({ pass: true })
  }
}

class RuleField {
  constructor(rules) {
    this.rules = rules
  }

  validate(field) {
    if (field == null) {
      // 如果字段为空
      const detect = this._detectEmpty()

      if (detect.isOptional) {
        return new RuleFieldResult({
          pass: true,
          legalValue: detect.default,
        })
      }

      return new RuleFieldResult({
        pass: false,
        msg: '字段是必填参数',
        isReturn: detect.isReturn,
      })
    }

    const filedResult = new RuleFieldResult({ pass: false })

    for (const rule of this.rules) {
      const result = rule.validate(field)

      if (result.isReturn) {
        filedResult.isReturn = true
      }
      if (!result.pass) {
        filedResult.msg = result.msg
        filedResult.legalValue = null

        if (rule.params[1]) {
          filedResult.isReturn = rule.params[1] === true
        }
        // 一旦一条校验规则不通过，则立即终止这个字段的验证
        return filedResult
      }
    }

    return new RuleFieldResult({
      pass: true,
      legalValue: this._convert(field),
    })
  }

  _convert(value) {
    for (const rule of this.rules) {
      if (rule.name === 'isInt') {
        return parseInt(value)
      }
      if (rule.name === 'isFloat') {
        return parseFloat(value)
      }
      if (rule.name === 'isBoolean') {
        return !!value
      }
    }
    return value
  }

  _detectEmpty() {
    const info = {
      default: '',
      isOptional: false,
      isReturn: false,
    }

    for (const rule of this.rules) {
      const defaultValue = rule.params[0]

      if (rule.name === 'isOptional') {
        info.default = defaultValue
        info.isOptional = true
      }
      if (rule.name === 'isReturn') {
        info.isReturn = true
      }
    }

    return info
  }
}

module.exports = {
  Rule,
  LinValidator,
}
