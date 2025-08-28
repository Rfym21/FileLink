const router = require("express").Router()
const authMiddleware = require("./auth.js")
const Upload = require("../controllers/upload.js")

router.post("/upload", authMiddleware, Upload)

module.exports = router