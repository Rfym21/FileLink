import React, { useState, useEffect } from 'react'
import { Carousel, Typography, Space, Pagination, Empty, Spin, Notification } from '@douyinfe/semi-ui'
import axios from 'axios'
import DocumentCard from '@/components/DocumentCard'

export default function Documents() {
  const { Title, Paragraph } = Typography

  const [documents, setDocuments] = useState([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(6)
  const [pageTotal, setPageTotal] = useState(1)
  const [loading, setLoading] = useState(false)

  const style = {
    width: '100%',
    height: '350px',
  }

  const titleStyle = {
    position: 'absolute',
    top: '100px',
    left: '100px',
    color: '#1C1F23'
  }

  const colorStyle = {
    color: '#1C1F23'
  }

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

  const renderLogo = () => {
    return (
      <img src='https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/root-web-sites/semi_logo.svg' alt='semi_logo' style={{ width: 87, height: 31 }} />
    )
  }

  const imgList = [
    'https://lf3-static.bytednsdoc.com/obj/eden-cn/hjeh7pldnulm/SemiDocs/bg-1.png',
    'https://lf3-static.bytednsdoc.com/obj/eden-cn/hjeh7pldnulm/SemiDocs/bg-2.png',
    'https://lf3-static.bytednsdoc.com/obj/eden-cn/hjeh7pldnulm/SemiDocs/bg-3.png',
  ]

  const textList = [
    ['Semi 设计管理系统', '从 Semi Design，到 Any Design', '快速定制你的设计系统，并应用在设计稿和代码中'],
    ['Semi 物料市场', '面向业务场景的定制化组件，支持线上预览和调试', '内容由 Semi Design 用户共建'],
    ['Semi Template', '高效的 Design2Code 设计稿转代码', '海量 Figma 设计模板一键转为真实前端代码'],
  ]

  const deleteDocument = async (id) => {
    try {
      const res = await axios.post(`/api/documents/delete`, { id })
      if (res.data.status) {
        setDocuments(documents.filter((document) => document.id !== id))
        Notification.success({
          content: res.data.message || '删除成功',
          duration: 3
        })
        // 如果当前页面删除后没有数据，且不是第一页，则返回上一页
        if (documents?.length === 1 && page > 1) {
          setPage(page - 1)
        } else {
          // 否则重新获取当前页数据
          fetchDocuments()
        }
        // 重新获取总页数
        getDocumentsTotal()
      } else {
        Notification.error({
          content: res.data.message || '删除失败',
          duration: 3
        })
      }
    } catch (error) {
      console.error('删除文档失败:', error)
      Notification.error({
        content: '删除文档时发生错误',
        duration: 3
      })
    }
  }

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      const res = await axios.get(`/api/documents?page=${page}&pageSize=${pageSize}`)
      setDocuments(res.data.data)
    } catch (error) {
      console.error(`获取文档列表失败: `, error)
    } finally {
      setLoading(false)
    }
  }

  const getDocumentsTotal = async () => {
    try {
      const res = await axios.post(`/api/documents/total`, { pageSize })
      setPageTotal(res.data.data.page)
    } catch (error) {
      console.error(`获取文档总数失败: `, error)
    }
  }

  const handlePageChange = (pageNum) => {
    setPage(pageNum)
  }

  useEffect(() => {
    (async () => {
      await getDocumentsTotal()
      await fetchDocuments()
    })()
  }, [])

  useEffect(() => {
    fetchDocuments()
  }, [page, pageSize])


  return (
    <div className='w-full flex flex-col items-center'>
      <Carousel style={style} theme='dark' className='w-full'>
        {
          imgList.map((src, index) => {
            return (
              <div key={index} style={{ backgroundSize: 'cover', backgroundImage: `url('${src}')` }}>
                <Space vertical align='start' spacing='medium' style={titleStyle}>
                  {renderLogo()}
                  <Title heading={2} style={colorStyle}>{textList[index][0]}</Title>
                  <Space vertical align='start'>
                    <Paragraph style={colorStyle}>{textList[index][1]}</Paragraph>
                    <Paragraph style={colorStyle}>{textList[index][2]}</Paragraph>
                  </Space>
                </Space>
              </div>
            );
          })
        }
      </Carousel>

      <div className='w-full px-8 py-6'>
        <div className='max-w-7xl mx-auto'>
          <div className='flex items-center justify-between mb-6'>
            <Title heading={3}>文档库</Title>
            <div className='flex items-center space-x-2'>
              {/* 可以添加筛选、排序等控件 */}
            </div>
          </div>
          
          {loading ? (
            <div className="w-full flex justify-center py-12">
              <Spin size="large" />
            </div>
          ) : (
            <>
              {documents?.length > 0 ? (
                <div className='w-full flex flex-row flex-wrap'>
                  {documents.map((doc) => (
                    <DocumentCard 
                      key={doc.id} 
                      document={doc} 
                      cardStyle={cardStyle} 
                      cardHoverStyle={cardHoverStyle}
                      deleteDocument={deleteDocument}
                      role="user"
                    />
                  ))}
                </div>
              ) : (
                <div className="w-full py-16">
                  <Empty 
                    title="暂无文档" 
                    description="目前还没有可以展示的文档" 
                    style={{ padding: '32px' }}
                  />
                </div>
              )}
              
              {documents?.length > 0 && (
                <div className="w-full flex justify-center mt-8 mb-12">
                  <Pagination
                    total={pageTotal * pageSize}
                    pageSize={pageSize}
                    currentPage={page}
                    onPageChange={handlePageChange}
                    showSizeChanger
                    pageSizeOpts={[6, 9, 12, 15]}
                    onPageSizeChange={size => {
                      setPageSize(size);
                      setPage(1);
                    }}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}