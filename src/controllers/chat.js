const DatabaseManager = require('../utils/DatabaseManager')
const JwtManager = require('../utils/JwtManager')

// 聊天室状态管理
const room = {
  clients: new Map(), // 存储所有已连接的客户端
  messageHistory: [], // 消息历史，按时间从旧到新排序
  maxHistory: 100 // 最大历史消息数
}

// 广播消息到所有连接的客户端
function broadcastToRoom(message) {
  room.clients.forEach(client => {
    client.ws.send(JSON.stringify(message))
  })
}

// 分页获取历史消息
async function getHistoryMessages(page, pageSize) {
  try {
    // 修改SQL查询，按日期升序排序（从旧到新）
    const messages = await DatabaseManager.query(
      'SELECT username, content, date FROM messages ORDER BY date ASC LIMIT ?, ?',
      [page * pageSize, pageSize]
    )
    return messages
  } catch (error) {
    console.error('获取历史消息失败:', error)
    return []
  }
}

// 格式化日期为MySQL兼容格式
function formatDateForMySQL(date) {
  const d = date instanceof Date ? date : new Date(date)
  return d.toISOString().slice(0, 19).replace('T', ' ')
}

async function handleChat(ws, req) {
  const token = req.query.token
  if (!JwtManager.verify(token)) {
    ws.send(JSON.stringify({
      type: 'error',
      message: '登录信息无效'
    }))
    ws.close()
    return
  }

  const decoded = await JwtManager.decode(token)
  const clientId = decoded.id
  const username = decoded.username

  // 查询客户端是否存在
  const client = room.clients.get(clientId)
  if (client) {
    // 如果客户端存在，则关闭客户端连接
    client.ws.close()
    room.clients.delete(clientId)
  }

  // 保存客户端连接
  room.clients.set(clientId, { ws, username })

  // 加载最近的消息历史
  try {
    const messages = await getHistoryMessages(0, 100)
    room.messageHistory = messages.sort((a, b) => {
      return new Date(a.date) - new Date(b.date)
    })
    
    // 发送历史消息到新连接的客户端
    if (room.messageHistory.length > 0) {
      ws.send(JSON.stringify({
        type: 'history',
        messages: room.messageHistory
      }))
    }
  } catch (error) {
    console.error('加载消息历史失败:', error)
  }

  ws.on('message', async (data) => {
    try {
      const message = JSON.parse(data)
      const access_token = message.access_token
      if (!JwtManager.verify(access_token)) {
        ws.send(JSON.stringify({
          type: 'error',
          message: '登录信息无效'
        }))
        ws.close()
        return
      }
      const decoded = await JwtManager.decode(access_token)
      const clientId = decoded.id
      const username = decoded.username
      handleMessage(clientId, username, message)
    } catch (error) {
      console.error('消息解析错误:', error)
      ws.send(JSON.stringify({
        type: 'error',
        message: '消息格式错误'
      }))
    }
  })

  ws.on('close', () => {
    room.clients.delete(clientId)
  })

  ws.on('error', (error) => {
    console.error(`WebSocket错误 (${clientId}):`, error)
    room.clients.delete(clientId)
  })
}

// 消息处理函数
async function handleMessage(clientId, username, message) {
  const timestamp = new Date()
  const mysqlDatetime = formatDateForMySQL(timestamp)

  switch (message.type) {
    case 'chat':
      // 聊天消息
      const content = message.content.trim()

      if (!content) {
        return
      }

      const chatMessage = {
        type: 'chat',
        clientId: clientId,
        username: username,
        content: content,
        timestamp: timestamp.toISOString()
      }

      try {
        // 保存到数据库，使用格式化后的日期
        await DatabaseManager.query(
          'INSERT INTO messages (username, content, date) VALUES (?, ?, ?)',
          [username, content, mysqlDatetime]
        )

        room.messageHistory.push(chatMessage)
        if (room.messageHistory.length > room.maxHistory) {
          room.messageHistory.shift()
        }

        // 广播给所有用户
        broadcastToRoom(chatMessage)
      } catch (error) {
        console.error('保存消息失败:', error)
        // 通知发送者消息保存失败
        const client = room.clients.get(clientId)
        if (client) {
          client.ws.send(JSON.stringify({
            type: 'error',
            message: '消息发送失败，请重试',
            timestamp: timestamp.toISOString()
          }))
        }
      }
      break

    default:
      console.log(`未知消息类型: ${message.type}`)
  }
}

const handleHistoryMessages = async (req, res) => {
  try {
    let { page, pageSize } = req.query
    page = parseInt(page) || 0
    pageSize = parseInt(pageSize) || 100

    const messages = await getHistoryMessages(page, pageSize)
    res.status(200).json({
      status: true,
      message: '获取历史消息成功',
      data: messages
    })
  } catch (error) {
    console.error('获取历史消息失败:', error)
    res.status(500).json({
      status: false,
      message: '获取历史消息失败'
    })
  }
}

module.exports = {
  handleChat,
  handleHistoryMessages
}