const { isSHA256 } = require('../utils/Tools.js')
const DatabaseManager = require('../utils/DatabaseManager.js')

const changePassword = async (req, res) => {
  try {
    const { password } = req.body
    const id = req.userinfo.id
    const user_info = await DatabaseManager.query('SELECT * FROM users WHERE id = ?', [id])
    if (!user_info) {
      return res.status(400).json({
        status: false,
        message: '用户不存在!'
      })
    }
    // 检测密码是否为sha256加密文本
    if (!isSHA256(password)) {
      return res.status(400).json({
        status: false,
        message: '密码格式错误!'
      })
    }
    const result = await DatabaseManager.query('UPDATE users SET password = ? WHERE id = ?', [password, id])
    if (result.affectedRows === 0) {
      return res.status(400).json({
        status: false,
        message: '修改密码失败!'
      })
    }
    return res.status(200).json({
      status: true,
      message: '修改密码成功!'
    })

  } catch (error) {
    console.error(`修改密码失败: `, error)
    return res.status(500).json({
      status: false,
      message: '服务器错误!'
    })
  }
}

module.exports = {
  changePassword
}