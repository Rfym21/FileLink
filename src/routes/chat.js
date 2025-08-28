const express = require('express')
const router = express.Router()
const { handleHistoryMessages } = require('../controllers/chat')
router.get('/chat/history', handleHistoryMessages)

module.exports = router