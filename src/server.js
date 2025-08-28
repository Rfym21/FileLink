require('dotenv').config()
const express = require('express')
const cors = require('cors')
const config = require('./config')
const logger = require('./utils/loggerManager.js')
const expressWs = require('express-ws')
const path = require('path')

// 创建express实例
const app = express()
// 添加WebSocket支持
expressWs(app)
// 解析JSON请求体,设置请求体大小
app.use(express.json({ limit: '10mb' }))
// 解析URL编码的请求体,设置请求体大小
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

// 路由
const loginRouter = require('./routes/login.js')
const registerRouter = require('./routes/register.js')
const userinfoRouter = require('./routes/userinfo.js')
const uploadRouter = require('./routes/upload.js')
const documentRouter = require('./routes/document.js')
const chatRouter = require('./routes/chat.js')
const emailRouter = require('./routes/email.js')
const { handleChat } = require('./controllers/chat')

// 挂载路由
app.use('/api/auth', loginRouter)
app.use('/api/auth', registerRouter)
app.use('/api/auth', userinfoRouter)
app.use('/api', uploadRouter)
app.use('/api', documentRouter)
app.use('/api', chatRouter)
app.use('/api', emailRouter)

app.ws('/api/chat', handleChat)

// 挂载静态文件
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')))
// 挂载前端文件
// app.use(express.static(path.join(__dirname, '../public')))

// app.get(/^(?!\/api|\/uploads).*$/, (req, res) => {
//   res.sendFile(path.join(__dirname, '../public/index.html'))
// })

app.listen(config.Service.port, () => {
  logger.success(`Server is running on port ${config.Service.port}`)
})