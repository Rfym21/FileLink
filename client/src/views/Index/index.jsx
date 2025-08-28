import { useNavigate } from 'react-router-dom'

export default function Index() {
  const navigate = useNavigate()

  return (
    <div className='w-full flex justify-center flex-col items-center'>

      <footer className='w-full fixed top-0 left-0 right-0 h-16 bg-[rgba(255,255,255,0.1)] backdrop-blur-sm'>
        <div className='w-full h-full flex flex-row justify-between items-center'>
          <div className='h-full flex flex-row items-center'>
            <img src="/public/favicon.svg" alt="logo" className='h-full p-2 pl-4 hover:scale-105 transition-all duration-300' />
            <h2 className='text-green-500 text-2xl font-bold hover:scale-105 transition-all duration-300'>WebDocSystem</h2>
          </div>

          <div className='h-full flex flex-row items-center
          px-4 py-3'>
            <button className="block h-full bg-green-500 text-white px-4 py-2 rounded-md hover:scale-105 transition-all duration-300">
              <span className='text-white text-md font-bold' onClick={() => navigate('/dashboard/documents')}>Dashboard</span>
            </button>
          </div>
        </div>
      </footer>

      <div className='w-full h-[80vh] pt-16 flex flex-row justify-center items-center'>

        <div className='w-3/5 h-full relative'>
          <img src="/public/images/docx.png" alt="" className='h-full mx-auto absolute left-1/2 -translate-x-1/2 top-1/6' />
        </div>

        <div className='w-2/5 h-full'>
          <h2 className="inline-block text-6xl font-bold text-left pt-[20%] hover:scale-110 transition-all duration-300">在线文档系统</h2>
          <p className='text-lg text-left pt-10 pr-16 w-3/4'>在线文档系统是一个基于云端的协作办公平台，支持多人实时编辑、版本管理和权限控制。系统提供自动保存、历史记录追踪、评论批注等特性，确保文档安全性和协作效率。适用于团队项目管理、会议记录、知识库建设等场景，有效提升工作协同效率。</p>

          <div className='flex flex-row justify-start items-center gap-4'>
         <button className='block h-12 w-40 mt-20 hover:bg-white hover:text-green-500 border border-green-500 bg-green-500 text-white px-4 py-2 rounded-md hover:scale-105 transition-all duration-300'>
            <span className='block w-full text-center text-white text-md font-bold hover:text-green-500' onClick={() => navigate('/register')}>立即注册</span>
          </button>

          <button className='block h-12 w-40 mt-20 hover:bg-white hover:text-green-500 border border-green-500 bg-green-500 text-white px-4 py-2 rounded-md hover:scale-105 transition-all duration-300'>
            <span className='block w-full text-center text-white text-md font-bold hover:text-green-500' onClick={() => navigate('/login')}>立即登录</span>
          </button>
         </div>

        </div>

      </div>

      <div className='w-full h-[20vh] bg-green-500'>

      </div>

    </div>
  )
}