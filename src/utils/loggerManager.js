const fs = require("fs")
const path = require("path")

class LoggerManager {
  static _instance = null

  constructor(root_path) {
    this.root_path = root_path
    this.colors = {
      white: "\x1b[37m",
      green: "\x1b[32m",
      yellow: "\x1b[33m",
      red: "\x1b[31m",
      blue: "\x1b[34m",
      magenta: "\x1b[35m",
      cyan: "\x1b[36m",
      reset: "\x1b[0m"
    }

    this.emojis = {
      info: "📝",
      success: "✅",
      warning: "⚠️ ",
      error: "❌",
      debug: "🔍",
      system: "⚙️ ",
      network: "🌐",
      database: "🗄️ ",
      security: "🔒",
      user: "👤",
      time: "⏱️ "
    }

    if (!fs.existsSync(this.root_path)) {
      fs.mkdirSync(this.root_path, { recursive: true })
    }
  }

  static createLogger(root_path) {
    if (!LoggerManager._instance) {
      LoggerManager._instance = new LoggerManager(root_path)
    }
    return LoggerManager._instance
  }

  _getTimestamp() {
    const now = new Date()
    return now.toISOString().replace(/T/, ' ').replace(/\..+/, '')
  }

  _getDateInfo() {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const hour = String(now.getHours()).padStart(2, '0')

    const dateStr = `${year}${month}${day}`
    return { dateStr, hour }
  }

  _writeToFile(level, message) {
    const timestamp = this._getTimestamp()
    const { dateStr, hour } = this._getDateInfo()

    // 确保日期目录存在
    const dateDir = path.join(this.root_path, dateStr)
    if (!fs.existsSync(dateDir)) {
      fs.mkdirSync(dateDir, { recursive: true })
    }

    // 按小时存放日志文件
    const logFile = path.join(dateDir, `${hour}.log`)
    const logMessage = `[${timestamp}][${level}] ${message}\n`

    fs.appendFileSync(logFile, logMessage)
  }

  _formatConsoleOutput(level, message, color) {
    const timestamp = this._getTimestamp()
    const emoji = this.emojis[level] || "🔹"
    const levelPadded = level.toUpperCase().padEnd(7, ' ')

    return `${this.colors[color]}${emoji} [${timestamp}] ${levelPadded}: ${JSON.stringify(message)}${this.colors.reset}`
  }

  log(message, color = "white") {
    console.log(this._formatConsoleOutput("info", message, color))
    this._writeToFile("info", message)
  }

  success(message) {
    console.log(this._formatConsoleOutput("success", message, "green"))
    this._writeToFile("success", message)
  }

  warn(message) {
    console.log(this._formatConsoleOutput("warning", message, "yellow"))
    this._writeToFile("warning", message)
  }

  error(message) {
    console.log(this._formatConsoleOutput("error", message, "red"))
    this._writeToFile("error", message)
  }

  debug(message) {
    console.log(this._formatConsoleOutput("debug", message, "cyan"))
    this._writeToFile("debug", message)
  }

  system(message) {
    console.log(this._formatConsoleOutput("system", message, "magenta"))
    this._writeToFile("system", message)
  }

  network(message) {
    console.log(this._formatConsoleOutput("network", message, "blue"))
    this._writeToFile("network", message)
  }
}

module.exports = LoggerManager.createLogger('logs')