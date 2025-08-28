const JwtManager = require('../../utils/JwtManager.js')
const DatabaseManager = require('../../utils/DatabaseManager.js')
const logger = require('../../utils/loggerManager.js')

/**
 * @function login 用户登录
 * @param {Object} req 请求对象
 * @param {Object} res 响应对象
 */
const login = async (req, res) => {
  try {
    const username = req.body.username
    const password = req.body.password
    if (!username || !password) {
      return res.status(401).json({
        status: false,
        message: '用户名或密码不能为空！'
      })
    }

    // 查询用户
    const userinfo = await DatabaseManager.query(`
      SELECT * FROM users WHERE username = ?
    `, [username.toLowerCase()])
    // 验证用户名
    if (!userinfo || userinfo.length === 0) {
      return res.status(401).json({
        status: false,
        message: '用户名或密码错误！'
      })
    }
    // 验证密码
    const isPasswordValid = password === userinfo[0]?.password
    if (!isPasswordValid) {
      return res.status(401).json({
        status: false,
        message: '用户名或密码错误！'
      })
    }

    // 颁发JWT
    const access_token = await issueJwt({
      id: userinfo[0]?.id,
      username: userinfo[0]?.username?.toLowerCase(),
      role: userinfo[0]?.role,
      email: userinfo[0]?.email?.toLowerCase(),
    })

    // 设置响应头
    res.setHeader('Content-Type', 'application/json')

    logger.success(`用户 ${username} 登录成功！`)

    // 返回登录成功
    return res.status(200).json({
      access_token: access_token,
      message: '登录成功！',
      status: true,
    })
  } catch (error) {
    logger.error(`用户登录失败：${error.message}`)
    res.status(500).json({
      message: '服务器内部错误，请联系管理员或稍后重试！'
    })
  }
}

/**
 * @function issueJwt 用户登录成功颁发JWT
 * @param {Object} options 颁发JWT所需参数
 * @param {number} options.id 用户ID
 * @param {string} options.username 用户名
 * @param {string} options.role 用户角色
 */
const issueJwt = async (options) => {
  try {
    const { id, username, role, email } = options
    if (!id || !username || !role || !email) {
      throw new Error('Invalid options')
    }
    const payload = {
      id,
      username,
      role,
      create_time: new Date().toLocaleString(),
      email: email,
      expire_time: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleString()
    }
    // 颁发有效期为30天的JWT
    const access_token = await JwtManager.sign(payload, '30d')
    return access_token
  } catch (error) {
    logger.error(`颁发JWT失败：${error.message}`)
    return null
  }
}

module.exports = {
  login,
  issueJwt
}