const fs = require("fs")
const path = require("path")
const multer = require("multer")
const DatabaseManager = require("../utils/DatabaseManager")
const { generateUUID } = require("../utils/Tools")

// 配置 multer 存储
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "..", "..", "uploads")
    // 确保上传目录存在
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    // 生成文件名：uuid + 原始扩展名
    const ext = path.extname(file.originalname)
    cb(null, Date.now() + ext)
  }
})

// 文件过滤器
const fileFilter = (req, file, cb) => {
  // 允许的文件类型
  // 图片 png jpg jpeg
  // 文档 pdf docx doc
  // 文本 txt md
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'text/markdown', 'application/octet-stream']
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('不支持的文件类型'), false)
  }
}

// 创建 multer 实例
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024
  }
})

// 处理单个文件上传
const uploadMiddleware = upload.single('file')

const Upload = async (req, res) => {
  // 使用 multer 中间件处理文件上传
  uploadMiddleware(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: "文件大小超过限制，最大允许10MB"
        })
      }
      return res.status(400).json({
        success: false,
        message: "文件上传失败，服务器内部错误"
      })
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: "文件上传失败，服务器内部错误"
      })
    }

    try {
      // 检查文件是否存在
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "文件上传失败，未找到文件"
        })
      }

      const { title, summary, file_name } = req.body
      if (!title || !summary || !file_name) {
        // 如果表单数据不完整，删除已上传的文件
        fs.unlinkSync(req.file.path)
        return res.status(400).json({
          success: false,
          message: "缺少必要的表单字段"
        })
      }

      const uuid = await generateUniqueId()
      if (!uuid) {
        // 如果生成UUID失败，删除已上传的文件
        fs.unlinkSync(req.file.path)
        return res.status(500).json({
          success: false,
          message: "生成唯一ID失败"
        })
      }

      const author_id = req.userinfo.id
      const created_at = new Date()
      const updated_at = new Date()
      const file_type = file_name.split('.')[1]

      // 重命名文件为UUID
      const newPath = path.join(path.dirname(req.file.path), uuid + '.' + file_type)
      fs.renameSync(req.file.path, newPath)

      // 保存到数据库
      const result = await DatabaseManager.query(`
        INSERT INTO documents (id, title, summary, file_name, author_id, created_at, update_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [uuid, title, summary, file_name, author_id, created_at, updated_at])

      if (result.affectedRows <= 0) {
        // 如果数据库插入失败，删除已上传的文件
        fs.unlinkSync(newPath)
        return res.status(400).json({
          success: false,
          message: "文件上传失败，数据库插入失败"
        })
      }

      res.status(200).json({
        success: true,
        message: "文件上传成功",
        data: {
          id: uuid,
          file_name: file_name,
          file_type: path.extname(req.file.originalname).slice(1)
        }
      })
    } catch (error) {
      // 如果发生错误，删除已上传的文件
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path)
      }
      console.error('文件上传处理失败:', error)
      res.status(500).json({
        success: false,
        message: "文件上传失败，服务器内部错误"
      })
    }
  })
}

/**
 * @function generateUniqueId 生成一个数据库不存在的uuid
 * @returns {string} uuid
 */
const generateUniqueId = async () => {
  for (let i = 0; i < 10; i++) {
    try {
      const uuid = generateUUID()
      const userinfo = await DatabaseManager.query(`
      SELECT * FROM documents WHERE id = ?
    `, [uuid])
      if (userinfo.length === 0) {
        return uuid
      }
    } catch (error) {
      console.error(`生成UUID失败：${error.message}`)
      return null
    }
  }
}

module.exports = Upload