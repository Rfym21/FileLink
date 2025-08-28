const DatabaseManager = require('../../utils/DatabaseManager.js')
const logger = require('../../utils/loggerManager.js')
const { generateUUID, isSHA256 } = require('../../utils/Tools.js')
const { issueJwt } = require('./login.js')
const { verifyEmailCode } = require('../email.js')

const register = async (req, res) => {
  try {
    const { username, password, email, code } = req.body
    if (!username || !password || !email) {
      return res.status(400).json({
        status: false,
        message: '用户名、密码、邮箱不能为空！'
      })
    }

    // 检查用户名是否存在
    const isUserExists = await checkUserExists(username)
    if (isUserExists) {
      return res.status(400).json({
        status: false,
        message: '用户名已存在！'
      })
    }

    // 检查邮箱验证码
    const isEmailCodeValid = await verifyEmailCode(email, code)
    if (!isEmailCodeValid) {
      return res.status(400).json({
        status: false,
        message: '邮箱验证码不正确！'
      })
    }

    // 检查用户名是否合法
    if (username.length < 6 || username.length > 20) {
      // 只允许6-20个字符，且只能包含字母、数字、下划线
      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        return res.status(400).json({
          status: false,
          message: '用户名只能包含字母、数字、下划线！'
        })
      }

      return res.status(400).json({
        status: false,
        message: '用户名长度不正确！'
      })
    }

    // 检查邮箱是否合法
    if (!email.includes('@') || !email.includes('.')) {
      return res.status(400).json({
        status: false,
        message: '邮箱格式不正确！'
      })
    }

    // 检查邮箱是否存在
    const isEmailExists = await checkEmailExists(email.toLowerCase())
    if (isEmailExists) {
      return res.status(400).json({
        status: false,
        message: '邮箱已存在！'
      })
    }

    // 检查密码是否为sha256
    if (!isSHA256(password)) {
      return res.status(400).json({
        status: false,
        message: '密码格式不正确！'
      })
    }

    // 生成一个数据库不存在的uuid
    const uuid = await generateUniqueId()
    if (!uuid) {
      return res.status(400).json({
        status: false,
        message: '注册失败，请稍后重试！'
      })
    }

    // 插入数据库，用户名和邮箱都转换为小写
    const result = await DatabaseManager.query(`
      INSERT INTO users (id, username, password, email) VALUES (?, ?, ?, ?)
    `, [uuid, username.toLowerCase(), password, email.toLowerCase()])
    if (result?.affectedRows === 0) {
      return res.status(400).json({
        status: false,
        message: '注册失败，请稍后重试！'
      })
    }

    // 颁发JWT
    const access_token = await issueJwt({
      id: uuid,
      username: username?.toLowerCase(),
      email: email?.toLowerCase(),
      role: 'user'
    })

    // 设置响应头
    res.setHeader('Content-Type', 'application/json')

    // 返回注册成功
    return res.status(200).json({
      access_token: access_token,
      status: true,
      message: '注册成功！'
    })

  } catch (error) {
    logger.error(`注册失败：${error.message}`)
    res.status(500).json({
      message: '服务器内部错误，请联系管理员或稍后重试！'
    })
  }
}

/**
 * @function generateUniqueId 生成一个数据库不存在的uuid
 * @returns {string} uuid
 */
const generateUniqueId = async () => {
  for (let i = 0; i < 10; i++) {
    try {
      const uuid = generateUUID()
      const userinfo = await DatabaseManager.query(`
      SELECT * FROM users WHERE id = ?
    `, [uuid])
      if (userinfo.length === 0) {
        return uuid
      }
    } catch (error) {
      logger.error(`生成UUID失败：${error.message}`)
      return null
    }
  }
}

/**
 * @function checkUserExists 查询数据库中是否存在该用户
 * @param {string} username 用户名
 * @returns {boolean} 是否存在
 */
const checkUserExists = async (username) => {
  try {
    if (!username) {
      return false
    }
    const userinfo = await DatabaseManager.query(`
    SELECT * FROM users WHERE username = ?
  `, [username])
    return userinfo?.length > 0 ? true : false
  } catch (error) {
    logger.error(`查询用户失败：${error.message}`)
    return null
  }
}

/**
 * @function checkEmailExists 查询数据库中是否存在该邮箱
 * @param {string} email 邮箱
 * @returns {boolean} 是否存在
 */
const checkEmailExists = async (email) => {
  try {
    if (!email) {
      return false
    }
    const userinfo = await DatabaseManager.query(`
      SELECT * FROM users WHERE email = ?
    `, [email])
    return userinfo?.length > 0 ? true : false
  } catch (error) {
    logger.error(`查询邮箱失败：${error.message}`)
    return null
  }
}

module.exports = {
  register,
  generateUniqueId
}