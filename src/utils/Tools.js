const { v4: uuidv4 } = require('uuid')

/**
 * @function generateUUID 生成一个UUID
 * @returns {string} UUID
 */
const generateUUID = () => {
  return uuidv4()
}

/**
 * @function isSHA256 验证字符串是否为sha256
 * @param {string} str 字符串
 * @returns {boolean} 是否为sha256
 */
const isSHA256 = (str) => {
  return /^[a-f0-9]{64}$/.test(str)
}

module.exports = {
  generateUUID,
  isSHA256
}