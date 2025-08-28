import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { MarkdownRender } from '@douyinfe/semi-ui'
import axios from 'axios'

export default function DocumentView() {
  const { id } = useParams()
  const [fileUrl, setFileUrl] = useState('')
  const [contentType, setContentType] = useState('')
  const [fileName, setFileName] = useState('')
  const [documentContent, setDocumentContent] = useState('')

  useEffect(() => {
    getDocumentURL()
  }, [id])

  useEffect(() => {
    if (fileUrl && (contentType === 'txt' || contentType === 'md')) {
      getDocumentContent()
    }
  }, [fileUrl, contentType])

  const getDocumentContent = async () => {
    try {
      const res = await axios.get(fileUrl)
      setDocumentContent(res.data)
    } catch (error) {
    }
  }

  const getDocumentURL = async () => {
    try {
      const res = await axios.post('/api/documents/url', { id })
      if (res.data.status) {
        const { file_url, content_type, file_name } = res.data
        setFileUrl(file_url)
        setContentType(content_type)
        setFileName(file_name)
      }
    } catch (error) {
    }
  }

  return (
    <div className='w-full h-full'>
      {
        (contentType === 'png' || contentType === 'jpg' || contentType === 'jpeg') && (
          <div className='w-full h-full p-6'>
            <img src={fileUrl} alt={fileName} className='w-full' />
          </div>
        )
      }

      {
        (contentType === 'txt' || contentType === 'md') && (
          <div className='w-full h-full'>
            <MarkdownRender raw={documentContent} className='w-full h-full' format="md" />
          </div>
        )
      }

      {
        contentType === 'pdf' && (
          <div className='w-full h-full'>
            <iframe
              src={fileUrl}
              title={fileName}
              className='w-full h-screen'
              frameBorder="0"
            />
          </div>
        )
      }

      {
        (contentType === 'doc' || contentType === 'docx') && (
          <div className='w-full h-full'>
            <iframe
              src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`}
              title={fileName}
              className='w-full h-screen'
              frameBorder="0"
            />
          </div>
        )
      }
    </div>
  )
}