import React, { useState, useEffect, useRef, useCallback } from 'react'
import axios from 'axios'
import CookieManager from '../../utils/CookieManager'

export default function ChatRoom() {
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState('')
  const [username, setUsername] = useState('')
  const [userId, setUserId] = useState('')
  const [currentPage, setCurrentPage] = useState(0)
  const [hasMoreMessages, setHasMoreMessages] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const websocketRef = useRef(null)
  const messageContainerRef = useRef(null)
  const shouldScrollToBottomRef = useRef(true)
  const reconnectTimeoutRef = useRef(null)
  const wsInitializedRef = useRef(false)

  // 获取身份验证令牌
  useEffect(() => {
    const authToken = CookieManager.getCookie('access_token') || ""
    setToken(authToken)
    const userinfo = localStorage.getItem('userinfo')
    if (userinfo) {
      const userinfoObj = JSON.parse(userinfo)
      setUsername(userinfoObj.username)
      setUserId(userinfoObj.id)
    }
  }, [])

  // 滚动到最新消息
  const scrollToBottom = useCallback(() => {
    if (messageContainerRef.current && shouldScrollToBottomRef.current) {
      setTimeout(() => {
        if (messageContainerRef.current) {
          messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight
        }
      }, 100) // 添加短暂延时确保DOM已更新
    }
  }, [])

  // 监听消息变化，自动滚动到底部
  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // 监听容器滚动事件，判断是否用户手动滚动以及是否需要加载更多消息
  useEffect(() => {
    const handleScroll = () => {
      if (messageContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = messageContainerRef.current
        // 如果用户滚动到接近底部，则恢复自动滚动
        const isNearBottom = scrollTop + clientHeight >= scrollHeight - 50
        shouldScrollToBottomRef.current = isNearBottom
        
        // 如果滚动到顶部附近，加载更多历史消息
        if (scrollTop < 50 && hasMoreMessages && !loadingMore) {
          loadMoreMessages()
        }
      }
    }

    const container = messageContainerRef.current
    if (container) {
      container.addEventListener('scroll', handleScroll)
      return () => container.removeEventListener('scroll', handleScroll)
    }
  }, [hasMoreMessages, loadingMore])

  // 添加排序功能，确保消息按照时间顺序显示
  const sortMessagesByTime = useCallback((msgs) => {
    return [...msgs].sort((a, b) => {
      const timeA = new Date(a.timestamp || a.date).getTime();
      const timeB = new Date(b.timestamp || b.date).getTime();
      return timeA - timeB; // 从早到晚排序
    })
  }, [])

  // 初始化WebSocket连接
  const initWebSocket = useCallback(() => {
    if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
      return websocketRef.current
    }

    try {
      // 获取身份验证令牌
      const authToken = token

      if (!authToken) {
        setError('未找到身份验证令牌，请先登录')
        setLoading(false)
        return null
      }

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const host = "localhost:10610"

      // 创建新的WebSocket连接
      const ws = new WebSocket(`${protocol}//${host}/api/chat?token=${authToken}`)
      websocketRef.current = ws

      ws.onopen = () => {
        setConnected(true)
        setError(null)
        setLoading(false)
        // 连接成功后确保滚动到底部
        shouldScrollToBottomRef.current = true
        scrollToBottom()
        // 清除可能存在的重连定时器
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current)
          reconnectTimeoutRef.current = null
        }
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)

          if (data.type === 'chat') {
            data.isSelf = data.clientId === userId || data.username === username

            // 移除可能存在的临时消息
            setMessages(prevMessages => {
              const filteredMessages = prevMessages.filter(m =>
                !(m.isTemp && m.content === data.content && m.username === data.username)
              )
              // 收到新消息时确保滚动到底部
              shouldScrollToBottomRef.current = true
              return sortMessagesByTime([...filteredMessages, data]);
            })
          } else if (data.type === 'history') {

            const historyMessages = data.messages.map(msg => ({
              ...msg,
              type: 'chat',
              timestamp: msg.timestamp || msg.date,
              isSelf: msg.username === username || msg.clientId === userId
            }))

            setMessages(prevMessages => {
              shouldScrollToBottomRef.current = true
              return sortMessagesByTime([...prevMessages, ...historyMessages]);
            })
          } else if (data.type === 'error') {
            setError(data.message)
            setTimeout(() => setError(null), 3000)
          }
        } catch (err) {
        }
      }

      ws.onclose = (event) => {
        setConnected(false)

        // 只有在组件仍然挂载时才尝试重连
        if (!wsInitializedRef.current) return

        // 避免在组件卸载后重连
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current)
        }

        // 尝试重新连接，使用递增的重连时间
        reconnectTimeoutRef.current = setTimeout(() => {
          initWebSocket()
        }, 3000)
      }

      ws.onerror = (err) => {
        setError('连接错误，请检查网络连接')
        setConnected(false)
        setLoading(false)
      }

      return ws
    } catch (err) {
      setError('连接错误，请检查网络连接')
      setLoading(false)
      return null
    }
  }, [token, userId, username, scrollToBottom, sortMessagesByTime])

  // 加载历史消息
  const fetchHistoryMessages = useCallback(async (page = 0, append = false) => {
    try {
      setLoadingMore(page > 0)
      const response = await axios.get(`/api/chat/history?page=${page}&pageSize=100`)

      if (response.status === 200 && response.data.status) {
        const formattedMessages = (response.data.data || []).map(msg => ({
          ...msg,
          type: 'chat',
          timestamp: msg.date,
          username: msg.username,
          isSelf: msg.username === username
        }))
        
        // 如果没有更多消息了
        if (formattedMessages.length === 0) {
          setHasMoreMessages(false)
          setLoadingMore(false)
          return
        }
        
        if (append) {
          // 保存当前滚动位置
          const scrollContainer = messageContainerRef.current
          const oldScrollHeight = scrollContainer ? scrollContainer.scrollHeight : 0
          
          setMessages(prevMessages => {
            const combinedMessages = sortMessagesByTime([...formattedMessages, ...prevMessages])
            
            // 在下一个渲染周期后恢复滚动位置
            setTimeout(() => {
              if (scrollContainer) {
                const newScrollHeight = scrollContainer.scrollHeight
                scrollContainer.scrollTop = newScrollHeight - oldScrollHeight
              }
            }, 10)
            
            return combinedMessages
          })
        } else {
          setMessages(sortMessagesByTime(formattedMessages))
          // 加载初始历史消息后确保滚动到底部
          shouldScrollToBottomRef.current = true
          scrollToBottom()
        }
        
        // 更新当前页码
        setCurrentPage(page)
      }
    } catch (err) {
      setError('加载历史消息失败')
      setTimeout(() => setError(null), 3000)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [username, sortMessagesByTime, scrollToBottom])

  // 加载更多历史消息
  const loadMoreMessages = useCallback(() => {
    if (hasMoreMessages && !loadingMore) {
      fetchHistoryMessages(currentPage + 1, true)
    }
  }, [currentPage, fetchHistoryMessages, hasMoreMessages, loadingMore])

  // 连接WebSocket和加载历史消息
  useEffect(() => {
    // 标记WebSocket已初始化
    wsInitializedRef.current = true

    if (token && username && userId) {
      initWebSocket()
      fetchHistoryMessages(0)
    }

    // 组件卸载时清理
    return () => {
      // 标记WebSocket未初始化
      wsInitializedRef.current = false

      // 清除重连定时器
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
        reconnectTimeoutRef.current = null
      }

      // 关闭WebSocket连接
      if (websocketRef.current) {
        websocketRef.current.onclose = null
        if (websocketRef.current.readyState === WebSocket.OPEN ||
          websocketRef.current.readyState === WebSocket.CONNECTING) {
          websocketRef.current.close()
        }
        websocketRef.current = null
      }
    };
  }, [token, username, userId, initWebSocket, fetchHistoryMessages]);

  // 发送消息
  const sendMessage = useCallback(() => {
    if (!inputMessage.trim() || !connected || !websocketRef.current) return

    try {
      // 发送消息
      websocketRef.current.send(JSON.stringify({
        type: 'chat',
        content: inputMessage,
        access_token: token
      }))

      const tempMessage = {
        type: 'chat',
        content: inputMessage,
        username: username,
        clientId: userId,
        isSelf: true,
        timestamp: new Date().toISOString(),
        isTemp: true
      }

      // 发送消息后确保滚动到底部
      shouldScrollToBottomRef.current = true
      setMessages(prev => sortMessagesByTime([...prev, tempMessage]))

      setInputMessage('')
    } catch (err) {
      setError('发送消息失败，请重试')
      setTimeout(() => setError(null), 3000)
    }
  }, [inputMessage, connected, token, username, userId, sortMessagesByTime])

  // 处理按键事件（按Enter发送消息）
  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }, [sendMessage])

  // 格式化时间戳
  const formatTimestamp = (timestamp) => {
    try {
      const date = new Date(timestamp)
      return date.toLocaleTimeString()
    } catch (err) {
      return ''
    }
  }

  // 手动滚动到底部的按钮处理函数
  const handleScrollToBottom = useCallback(() => {
    shouldScrollToBottomRef.current = true
    scrollToBottom()
  }, [scrollToBottom])

  if (loading && currentPage === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[90vh] bg-white p-4 rounded-lg shadow-md">

      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded-full mr-2 ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm text-gray-600">
            {connected ? `已连接(${username})` : '未连接'}
          </span>
        </div>


        <button
          onClick={handleScrollToBottom}
          className="text-sm text-gray-600 flex items-center hover:bg-green-500 hover:text-white rounded-md p-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
          滚动至最新消息
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
          {error}
        </div>
      )}

      <div
        ref={messageContainerRef}
        className="flex-1 overflow-y-auto mb-4 p-4 bg-white rounded-lg shadow-inner scroll-smooth"
      >
        {loadingMore && (
          <div className="flex justify-center py-2">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-green-500"></div>
          </div>
        )}
        
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            暂无消息，开始聊天吧
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`mb-4 ${message.isSelf ? 'flex justify-end' : 'flex justify-start'}`}
            >
              <div className="flex flex-col min-w-[60%] max-w-[80%]">
                <div className={`px-4 py-2 break-words rounded-lg ${message.isTemp ? 'opacity-70' : ''} ${message.isSelf
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-300 text-gray-800'
                  }`}>

                  <div>{message.content}</div>

                  <div className="flex justify-between items-center mt-1 text-xs">
                    <span className={`${message.isSelf ? 'text-green-200' : 'text-gray-600'}`}>
                      {message.username}
                    </span>
                    <span className="opacity-70">
                      {message.isTemp ? '发送中...' : formatTimestamp(message.timestamp || message.date)}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          ))
        )}
      </div>

      <div className="flex items-center gap-2">
        <textarea
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Message"
          className="flex-1 resize-none p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-0"
          rows="2"
          disabled={!connected}
        />
        <button
          onClick={sendMessage}
          disabled={!connected || !inputMessage.trim()}
          className={`px-4 py-2 rounded-lg ${connected && inputMessage.trim()
            ? 'bg-green-500 hover:bg-green-600 text-white'
            : 'bg-white text-green-500 cursor-not-allowed border border-green-500'
            } transition-colors`}
        >
          发送
        </button>
      </div>
      <div className="text-xs text-gray-500 mt-2 text-center">
        请友善交流，不要涉及政治、宗教、色情等敏感话题
      </div>
    </div>
  )
}
