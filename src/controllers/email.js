const mailer = require('../utils/mailer')

const CodeMap = new Map()

const sendEmailVerification = async (req, res) => {
  try {
    const { email } = req.body
    if (!email) {
      return res.json({
        status: false,
        message: '邮箱不能为空'
      })
    }

    if (CodeMap.has(email)) {
      return res.json({
        status: false,
        message: '邮箱已发送验证码，请稍后再试'
      })
    }

    const code = Math.floor(100000 + Math.random() * 900000)
    CodeMap.set(email, code)
    const html = `
    <h1>验证码</h1>
    <p>您的验证码是：${code}</p>
  `
    const result = await mailer.sendEmail(email, '在线文档系统验证码', html)
    res.json({
      status: true,
      message: '验证码已发送'
    })

    return setTimeout(() => {
      CodeMap.delete(email)
    }, 1000 * 60 * 1)
  } catch (error) {
    console.error(error)
    res.json({
      status: false,
      message: '验证码发送失败'
    })
  }
}

const verifyEmailCode = async (email, code) => {
  try {
    const savedCode = CodeMap.get(email)
    if (savedCode == code) {
      CodeMap.delete(email)
      return true
    } else {
      return false
    }
  } catch (error) {
    return false
  }
}

module.exports = {
  sendEmailVerification,
  verifyEmailCode
}