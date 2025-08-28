const JsonWebToken = require('jsonwebtoken')
const config = require('../config/index.js')

const JwtManager = {
  sign: async (payload, expiresIn) => {
    return JsonWebToken.sign(payload, config.JsonWebToken.privateKey, { algorithm: 'RS256', expiresIn })
  },

  verify: async (token) => {
    try {
      const result = JsonWebToken.verify(token, config.JsonWebToken.publicKey, { algorithm: 'RS256' })
      if (result) {
        return true
      } else {
        return false
      }
    } catch (e) {
      return false
    }
  },

  decode: async (token) => {
    return JsonWebToken.decode(token)
  }


}

module.exports = JwtManager