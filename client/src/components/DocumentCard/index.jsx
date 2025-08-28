import { Typography, Tooltip } from '@douyinfe/semi-ui'
import { useState, useRef, forwardRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconCalendar, IconFile } from '@douyinfe/semi-icons'

// 创建带ref的Typography组件
const ForwardedTitle = forwardRef((props, ref) => {
  const { Title } = Typography;
  return <Title ref={ref} {...props} />;
});

const ForwardedParagraph = forwardRef((props, ref) => {
  const { Paragraph } = Typography;
  return <Paragraph ref={ref} {...props} />;
});

export default function DocumentCard({ document = {}, cardStyle, cardHoverStyle, deleteDocument, role }) {
  const [hover, setHover] = useState(false)
  const { Title, Paragraph } = Typography
  const navigate = useNavigate()
  const cardRef = useRef(null)
  const titleRef = useRef(null)
  const paragraphRef = useRef(null)

  // 检查document是否存在
  if (!document) {
    return null
  }

  // 根据文件扩展名选择背景颜色
  const getFileColor = (fileName) => {
    if (!fileName) return '#2E7D32'; // 默认绿色

    const extension = fileName.split('.').pop().toLowerCase()
    const colorMap = {
      'pdf': '#C62828',  // 红色
      'doc': '#1565C0',  // 蓝色
      'docx': '#1565C0', // 蓝色
      'xls': '#2E7D32',  // 绿色
      'xlsx': '#2E7D32', // 绿色
      'ppt': '#FF8F00',  // 橙色
      'pptx': '#FF8F00', // 橙色
      'txt': '#5E35B1',  // 紫色
      'jpg': '#00695C',  // 青色
      'jpeg': '#00695C', // 青色
      'png': '#00695C',  // 青色
    };

    return colorMap[extension] || '#455A64'
  }

  // 格式化日期
  const formatDate = (dateString) => {
    if (!dateString) return '无日期'
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // 获取文件图标
  const getFileIcon = (fileName) => {
    if (!fileName) return null

    const extension = fileName.split('.').pop().toLowerCase()
    return extension
  }

  const fileColor = getFileColor(document.file_name || '')
  const fileExtension = getFileIcon(document.file_name || '')

  // 处理卡片点击，默认导航到文档详情页
  const handleCardClick = (e) => {
    if (e.target.closest('.action-button')) {
      e.stopPropagation()
      return
    }

    if (document.id) {
      navigate(`/dashboard/${document.id}`)
    }
  }

  // 合并样式
  const combinedStyle = {
    ...cardStyle,
    ...(hover ? cardHoverStyle : {}),
    transition: 'all 0.3s ease',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    overflow: 'hidden',
    boxShadow: hover ? '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' : '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  }

  return (
    <div
      ref={cardRef}
      className="bg-white"
      style={combinedStyle}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={handleCardClick}
    >
      <div className="flex flex-row p-4">
        <div className="min-w-[80px] flex items-center justify-center">
          <div
            className="w-16 h-16 rounded-lg flex items-center justify-center text-white font-bold text-xl"
            style={{ backgroundColor: fileColor }}
          >
            {fileExtension ? fileExtension.toUpperCase() : 'DOC'}
          </div>
        </div>
        <div className="flex-1 p-3">
          <Tooltip content={document.title || '无标题'}>
            <ForwardedTitle 
              ref={titleRef}
              heading={5} 
              ellipsis={{ rows: 1 }} 
              style={{ marginBottom: '8px' }}
            >
              {document.title || document.file_name || '无标题'}
            </ForwardedTitle>
          </Tooltip>
          <ForwardedParagraph 
            ref={paragraphRef}
            ellipsis={{ rows: 2 }} 
            style={{ color: 'rgba(0, 0, 0, 0.6)', fontSize: '14px' }}
          >
            {document.summary || '暂无摘要信息'}
          </ForwardedParagraph>
          <div className="mt-3 flex items-center justify-between relative">
            <div className="flex items-center text-xs text-gray-500 space-x-4">
              <div className="flex items-center">
                <IconCalendar size="small" style={{ marginRight: '4px' }} />
                {formatDate(document.created_at)}
              </div>
              <div className="flex items-center">
                <IconFile size="small" style={{ marginRight: '4px' }} />
                {document.file_name || '无文件名'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {role === 'admin' && deleteDocument && document.id && (
        <div className='flex flex-row items-center justify-center gap-4 mt-2 px-4 pb-4'>
          <button 
            className='bg-red-300 text-white w-1/2 rounded-md h-8 action-button' 
            onClick={(e) => {
              e.stopPropagation()
              deleteDocument(document.id, document.file_name)
            }}
          >
            删除文件
          </button>
          <button 
            className='bg-green-500 text-white w-1/2 rounded-md h-8 action-button' 
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/dashboard/${document.id}`)
            }}
          >
            预览文件
          </button>
        </div>
      )}
    </div>
  )
}