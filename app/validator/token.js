const { NotEmptyValidator } = require('~validator/common')
const { LoginValidator } = require('~validator/user')

class TokenValidator extends LoginValidator {}

class VerifyValidator extends NotEmptyValidator {}

module.exports = {
  TokenValidator,
  VerifyValidator,
}
