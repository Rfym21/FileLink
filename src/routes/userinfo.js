const router = require('express').Router()
const authMiddleware = require('./auth.js')
const { changePassword } = require('../controllers/changePassword.js')

router.get("/userinfo", authMiddleware, (req, res) => {
  res.json({
    status: true,
    message: "获取用户信息成功!",
    data: req.userinfo
  })
})

router.post("/changePassword", authMiddleware, changePassword)

module.exports = router