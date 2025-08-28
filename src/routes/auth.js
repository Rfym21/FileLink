const JwtManager = require('../utils/JwtManager.js')

const authMiddleware = async (req, res, next) => {
  try {
    const cookies = req.headers.cookie
    if (!cookies) {
      return res.status(403).json({
        status: false,
        message: "未授权的访问!",
      })
    }

    const access_token = cookies.split('; ').find(cookie => cookie.startsWith('access_token='))
    if (!access_token) {
      return res.status(403).json({
        status: false,
        message: "未授权的访问!",
      })
    }

    const is_valid = await JwtManager.verify(access_token.replace('access_token=', ''))
    if (!is_valid) {
      return res.status(403).json({
        status: false,
        message: "未授权的访问!",
      })
    }

    const decoded = await JwtManager.decode(access_token.replace('access_token=', ''))
    if (!decoded) {
      return res.status(403).json({
        status: false,
        message: "未授权的访问!",
      })
    }

    req.userinfo = decoded
    next()
  } catch (error) {
    console.error(`服务器错误: `, error)
    return res.status(500).json({
      status: false,
      message: "服务器错误!",
    })
  }

}

module.exports = authMiddleware