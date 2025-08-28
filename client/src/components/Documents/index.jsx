import { useEffect, useState } from 'react'
import axios from 'axios'
import { Notification as notification, Spin, Empty, Pagination, Typography } from "@douyinfe/semi-ui"
import DocumentCard from '@/components/DocumentCard'

export default function Documents({ role }) {
  const { Title } = Typography
  const [documents, setDocuments] = useState([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(9)
  const [pageTotal, setPageTotal] = useState(1)
  const [loading, setLoading] = useState(false)
  const pageSizeOptions = [6, 9, 12, 15]

  // 卡片样式
  const cardStyle = {
    width: 'calc(33.33% - 24px)',
    margin: '12px',
    borderRadius: '12px',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  }

  const cardHoverStyle = {
    transform: 'translateY(-8px)',
  }

  useEffect(() => {
    (async () => {
      await getDocumentsTotal()
      await fetchDocuments()
    })()
  }, [])

  useEffect(() => {
    fetchDocuments()
  }, [page])

  useEffect(() => {
    // 当页面大小改变时，重置到第一页并重新获取数据
    setPage(1)
    getDocumentsTotal()
    fetchDocuments()
  }, [pageSize])

  const deleteDocument = async (id, file_name) => {
    const res = await axios.post(`/api/documents/delete`, { id, file_name })
    if (res.data.status) {
      setDocuments(documents.filter((document) => document.id !== id))
      notification.success({
        content: res.data.message,
        duration: 3
      })
      if (documents?.length === 1 && page > 1) {
        setPage(page - 1)
      } else {
        // 否则重新获取当前页数据
        fetchDocuments()
      }
      // 重新获取总页数
      getDocumentsTotal()
    } else {
      notification.error({
        content: res.data.message,
        duration: 3
      })
    }
  }

  const getDocumentsTotal = async () => {
    try {
      setLoading(true)
      const res = await axios.post(`/api/documents/total`, { pageSize })
      setPageTotal(res.data.data.page)
    } catch (error) {
      console.error(`获取文档总数失败: `, error)
    } finally {
      setLoading(false)
    }
  }

  const goToPage = (pageNum) => {
    setPage(pageNum)
  }

  const handlePageSizeChange = (size) => {
    setPageSize(size)
  }

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      const res = await axios.get(`/api/documents?page=${page}&pageSize=${pageSize}`)
      setDocuments(res.data.data)
    } catch (error) {
      console.error(`获取文档列表失败: `, error)
      setDocuments([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-start border-1 border-gray-200 rounded-2xl overflow-hidden">
      <div className='w-full p-4 flex flex-row items-center justify-between'>
        <Title heading={3}>文档管理</Title>
        <div className='flex items-center gap-3'>
          <span>每页显示:</span>
          <select
            className="border border-gray-300 rounded px-2 py-1"
            value={pageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
          >
            {pageSizeOptions.map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="w-full flex-1 flex items-center justify-center">
          <Spin size="large" />
        </div>
      ) : (
        <>
          {documents?.length > 0 ? (
            <div className='w-full flex-1 overflow-auto p-4'>
              <div className='w-full flex flex-row flex-wrap'>
                {documents.map((doc) => (
                  <DocumentCard
                    key={doc.id}
                    document={doc}
                    cardStyle={cardStyle}
                    cardHoverStyle={cardHoverStyle}
                    deleteDocument={deleteDocument}
                    role={role}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="w-full flex-1 flex items-center justify-center">
              <Empty title="暂无文档" description="目前还没有可以展示的文档" />
            </div>
          )}

          {documents?.length > 0 && (
            <div className="w-full flex justify-center py-4">
              <Pagination
                total={pageTotal * pageSize}
                pageSize={pageSize}
                currentPage={page}
                onPageChange={goToPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}
