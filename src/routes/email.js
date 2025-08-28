const router = require('express').Router()

const { sendEmailVerification } = require('../controllers/email')

router.post('/send-verification', sendEmailVerification)

module.exports = router