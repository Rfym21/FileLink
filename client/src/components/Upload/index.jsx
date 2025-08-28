import React, { useState, useRef } from 'react'
import { Notification as notification } from "@douyinfe/semi-ui"
import axios from 'axios'

const DragDropUpload = () => {
  // 文件列表
  const [files, setFiles] = useState(null)
  // 是否拖拽中
  const [isDragging, setIsDragging] = useState(false)
  // 文件输入框
  const fileInputRef = useRef(null)
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')

  // 处理拖拽进入
  const handleDragEnter = (e) => {
    // 阻止默认事件
    e.preventDefault()
    // 阻止事件冒泡
    e.stopPropagation()
    setIsDragging(true)
  }

  // 处理拖拽离开
  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  // 处理拖拽悬停
  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  // 处理文件放下
  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const droppedFiles = Array.from(e.dataTransfer.files)
    handleFiles(droppedFiles[0])
  }

  // 处理文件选择
  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0]
    handleFiles(selectedFile)
  }

  // 统一处理文件
  const handleFiles = (newFiles) => {
    setFiles(newFiles)
  }

  // 点击上传区域
  const handleClick = () => {
    fileInputRef.current?.click()
  }

  // 上传文件
  const uploadFiles = async () => {
    const formData = new FormData()
    formData.append('file', files)
    formData.append('file_name', files.name)
    formData.append('title', title)
    formData.append('summary', summary)

    try {
      const response = await axios.post('/api/upload', formData)
      if (response.status === 200) {
        notification.success({
          content: `${files.name} 上传成功`,
          duration: 2,
          placement: 'topLeft'
        })
        setFiles(null)
        setTitle('')
        setSummary('')
        window.location.reload()
      } else {
        notification.error({
          content: `${files.name} 上传失败`,
          duration: 2,
          placement: 'topLeft'
        })
      }
    } catch (error) {
      notification.error({
        content: `${files.name} 上传错误:`,
        duration: 2,
        placement: 'topLeft'
      })
    }
  }

  return (
    <div className='w-full h-full flex flex-col items-center justify-start border-1 border-gray-200 rounded-2xl'>
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
        className='w-3/4 h-2/5 my-2 rounded-2xl border-4 border-gray-300 border-dashed cursor-pointer bg-gray-100 text-center box-shadow-lg shadow-white]'
      >

        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        {!files ? (<div className='w-full h-full flex items-center justify-center'>
          {isDragging ? (
            <p className='text-gray-500 text-lg'>松开鼠标上传文件</p>
          ) : (
            <p className='text-gray-500 text-lg'>拖拽文件到此处或点击选择文件</p>
          )}
        </div>) : (
          <div className='w-full h-full flex flex-col items-center justify-center'>
            <h3 className='text-xl font-bold'>已选择文件</h3>
            <p className='text-gray-500 text-lg'>{files.name} ({(files.size / 1024).toFixed(2)} KB)</p>
          </div>
        )}

      </div>

      <div className='h-7/12 w-3/4 flex flex-col items-center justify-start pt-2'>

        <div className='w-full flex flex-col h-3/4 items-center justify-start'>
          <div className='w-full flex flex-col items-start justify-start'>
            <p className='text-gray-500 text-lg'>标题</p>
            <input type="text" className='w-full h-10 rounded-2xl border-1 border-gray-300 text-gray-700 text-md px-4' placeholder='请输入标题' value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className='w-full flex flex-col items-start justify-start'>
            <p className='text-gray-500 text-lg'>摘要</p>
            <input type="text" className='w-full h-10 rounded-2xl border-1 border-gray-300 text-gray-700 text-md px-4' placeholder='请输入摘要' value={summary} onChange={(e) => setSummary(e.target.value)} />
          </div>
        </div>

        <div className='w-full flex flex-row h-5/12 items-center justify-center gap-8 pb-2'>
          <button
            onClick={uploadFiles}
            className="block w-full h-3/4 rounded-2xl bg-green-500 text-white text-lg"
          >
            上传文件
          </button>

          <button
            onClick={() => setFiles(null)}
            className="block w-full h-3/4 rounded-2xl border-1 border-gray-300 text-gray-700 text-lg"
          >
            清空文件
          </button>

        </div>
      </div>
    </div>
  )
}

export default DragDropUpload