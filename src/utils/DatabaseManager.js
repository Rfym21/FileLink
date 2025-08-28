const mysql = require('mysql2/promise')
const config = require('../config/index.js')

class DatabaseManager {
  constructor() {
    // 如果已经存在实例，则返回实例
    if (DatabaseManager.instance) {
      return DatabaseManager.instance
    }
    // 初始化实例
    DatabaseManager.instance = this
    // 初始化连接池
    this.pool = this.init_pool(config.Database)
    return this
  }

  init_pool() {
    return mysql.createPool({
      host: config.Database.host,
      port: config.Database.port,
      user: config.Database.user,
      password: config.Database.password,
      database: config.Database.database
    })
  }

  /**
   * @function query 执行SQL语句
   * @param {string} sql SQL语句
   * @param {Array} params SQL语句参数
   * @returns {Promise<Array>} 查询结果
   */
  async query(sql, params) {
    try {
      // 建立连接
      const connection = await this.pool.getConnection()
      // 执行sql语句
      const [rows] = await connection.query(sql, params)
      // 释放连接
      this.pool.releaseConnection(connection)
      return Promise.resolve(rows)
    } catch (error) {
      return Promise.reject(error)
    }
  }

}

module.exports = new DatabaseManager()
