import React, { useState } from 'react'
import { RouterProvider } from 'react-router-dom'
import router from '@/routes/index.jsx'
import ChatRoom from '@/components/ChatRoom'

const App = () => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <>
      <RouterProvider router={router} />


      <button onClick={() => { setIsOpen(!isOpen) }} className='fixed bottom-4 right-4 p-2 z-12 hover:scale-110 transition-all duration-300'>
        <img src="https://cdn.skyimg.net/up/2025/6/18/2aab5037.webp" alt="chat" className='w-12 h-12' />
      </button>
      <div className={`fixed top-0 right-0 w-1/2 h-2/3 bg-white rounded-lg box-shadow-lg border-1 border-gray-200 ${isOpen ? 'block' : 'hidden'} z-50`}>
        <button className='absolute top-4 left-6 bg-red-500 text-white py-1 px-2 rounded-lg opacity-0 hover:opacity-100 z-10' onClick={() => { setIsOpen(false) }}> 关闭聊天室 </button>
        <ChatRoom className='w-full h-full' />
      </div >
    </>
  )
}

export default App