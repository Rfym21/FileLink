const router = require('express').Router()
const { login } = require('../controllers/auth/login.js')

router.post('/login', login)

module.exports = router