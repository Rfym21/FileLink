const DatabaseManager = require("../utils/DatabaseManager")
const path = require('path')
const fs = require('fs')
const config = require('../config')

/**
 * 获取文档
 * @param {Object} req 请求对象
 * @param {Object} res 响应对象
 * @returns {Object} 返回文档列表
 */
const getDocuments = async (req, res) => {
  try {
    let { page, pageSize } = req.query

    page = parseInt(page) || 1
    pageSize = parseInt(pageSize) || 10

    const documents = await getDocumentFromDatabase(page, pageSize)

    return res.status(200).json({
      status: true,
      message: "获取文档成功!",
      data: documents
    })

  } catch (error) {
    console.error(`服务器错误: `, error)
    return res.status(500).json({
      status: false,
      message: "服务器错误!",
    })
  }
}

/**
 * 从数据库中获取文档
 * @param {number} page 页码
 * @param {number} pageSize 每页数量
 * @returns {Object} 返回文档列表
 */
const getDocumentFromDatabase = async (page, pageSize) => {
  try {
    const offset = (page - 1) * pageSize; // Calculate the correct offset
    const result = await DatabaseManager.query(`
    SELECT * FROM documents
    ORDER BY created_at DESC
    LIMIT ?, ?
  `, [offset, pageSize])
    return result
  } catch (error) {
    console.error(`数据库查询错误: `, error)
    return null
  }
}


/**
 * 获取七天内每天上传的文档数量
 * @param {Object} req 请求对象
 * @param {Object} res 响应对象
 * @returns {Object} 返回七天内每天上传的文档数量
 */
const getDocumentsCount = async (req, res) => {
  try {
    const role = req.userinfo.role
    if (role !== 'admin') {
      return res.status(403).json({
        status: false,
        message: "无权限访问!"
      })
    }
    const result = await DatabaseManager.query(`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM documents
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at)
    `)

    const currentDay = new Date().getFullYear() + '-' + (new Date().getMonth() + 1) + '-' + new Date().getDate()
    const dayMap = {}
    // 初始化七天的数据
    for (let i = 6; i >= 0; i--) {
      let date_tmp = new Date(currentDay).getTime() - i * 24 * 60 * 60 * 1000
      const date_tmp_ = new Date(date_tmp)
      const day = date_tmp_.getFullYear() + '-' + (date_tmp_.getMonth() + 1) + '-' + date_tmp_.getDate()
      dayMap[day] = 0
    }

    for (let item of result) {
      const date = new Date(item.date)
      const count = item.count
      const day = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()
      dayMap[day] = count
    }

    return res.status(200).json({
      status: true,
      message: "获取文档数量成功!",
      data: Object.keys(dayMap).map(key => {
        return {
          time: key,
          count: dayMap[key]
        }
      })
    })

  } catch (error) {
    console.error(`数据库查询错误: `, error)
    return null
  }
}

/**
 * 根据id删除文档
 * @param {Object} req 请求对象
 * @param {Object} res 响应对象
 * @returns {Object} 返回删除文档结果
 */
const deleteDocument = async (req, res) => {
  try {
    const { id } = req.body

    const role = req.userinfo.role
    if (role !== 'admin') {
      return res.status(403).json({
        status: false,
        message: "无权限访问!"
      })
    }
    const result = await DatabaseManager.query(`
      DELETE FROM documents WHERE id = ?
    `, [id])

    // 删除本地文件
    const content_type = req.body.file_name.split('.')[1]
    const filePath = path.join(__dirname, '..', '..', 'uploads', id + '.' + content_type)
    fs.unlinkSync(filePath)
    return res.status(200).json({
      status: true,
      message: "删除文档成功!",
    })
  } catch (error) {
    console.error(`数据库查询错误: `, error)
    return res.status(500).json({
      status: false,
      message: "服务器错误!",
    })
  }
}

// 返回文件总数和每页数量及页数
const getDocumentsTotal = async (req, res) => {
  try {
    const { pageSize } = req.body
    const result = await DatabaseManager.query(`
      SELECT COUNT(*) as total FROM documents
    `)
    return res.status(200).json({
      status: true,
      message: "获取文档总数成功!",
      data: {
        // 文件总数
        total: result[0].total,
        // 总页数
        page: Math.ceil(result[0].total / pageSize),
        // 每页数量
        pageSize: pageSize
      }
    })
  } catch (error) {
    console.error(`数据库查询错误: `, error)
    return res.status(500).json({
      status: false,
      message: "服务器错误!",
    })
  }
}

const getDocumentURL = async (req, res) => {
  try {
    const { id } = req.body
    const result = await DatabaseManager.query(`
      SELECT file_name FROM documents WHERE id = ?
    `, [id])
    const file_name = result[0].file_name
    const content_type = file_name.split('.')[1]
    const url = `${config.Service.url}/uploads/${id}.${content_type}`
    return res.status(200).json({
      status: true,
      message: "获取文档URL成功!",
      file_url: url,
      file_name: file_name,
      content_type: content_type
    })
  } catch (error) {
    console.error(`数据库查询错误: `, error)
    return res.status(500).json({
      status: false,
      message: "服务器错误!",
    })
  }
}
module.exports = {
  getDocuments,
  getDocumentsCount,
  deleteDocument,
  getDocumentsTotal,
  getDocumentURL
}