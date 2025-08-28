import React, { useState, useEffect } from 'react'


export default function Nav({ navigate, location, role, isLogin, navList, userInfo }) {

  const newNavList = navList.filter(item => item.permission.includes(role) || item.permission.includes('guest'))
  const [selectedKey, setSelectedKey] = useState('documents')
  const [isLoginLayout, setIsLoginLayout] = useState(false)

  const handleNavClick = (data) => {
    const { itemKey } = data
    setSelectedKey(itemKey)

    const routeMap = newNavList.map(item => {
      return {
        [item.itemKey]: item.path
      }
    })

    navigate(routeMap[itemKey] || newNavList[0].path, { replace: false })

  }

  const handleLogout = () => {
    document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    localStorage.removeItem('userinfo')
    navigate('/login')
  }

  useEffect(() => {
    const path = location.pathname
    setSelectedKey(newNavList.find(item => item.path === path)?.itemKey || 'documents')
  }, [location.pathname])


  return (
    <div className='h-full w-[268px] flex flex-col border-r border-solid border-gray-100 shadow-sm'>

      <div className='flex flex-row items-center justify-between h-24 p-4'>
        <h2 className='w-full pl-2 text-3xl font-bold text-green-500 text-center cursor-pointer' onClick={() => navigate('/')}>文件管理系统</h2>
      </div>

      <div className='flex-1 flex flex-col items-center overflow-y-auto py-8 px-4'>
        <ul className='w-full'>
          {newNavList.length > 0 && newNavList.map(item => (
            <li key={item.itemKey} className={`w-full h-16 flex flex-row items-center justify-start rounded-2xl ${selectedKey === item.itemKey ? 'bg-green-400' : ''}`} onClick={() => { handleNavClick(item); navigate(item.path) }}>
              <img src={item.icon} alt={item.text} className='w-12 h-12 p-2 ml-2' />
              <button className='text-xl p-2 font-extrabold'>{item.text}</button>
            </li>
          ))}
        </ul>
      </div>

      <div className='h-16 flex flex-row items-center justify-start px-4 py-2 relative' onMouseEnter={() => setIsLoginLayout(true)} onMouseLeave={() => setIsLoginLayout(false)}>
        <img src={isLogin ? "/public/images/user_default_avatar.svg" : "/public/images/guest_avatar.svg"} className='h-12 border-2 border-solid border-gray-300 rounded-full p-1' />

        {isLogin && <button className='text-xl ml-4'>{userInfo.username}</button>}
        {!isLogin && <button className='text-xl ml-4' onClick={() => navigate('/login')}>登录 / 注册</button>}

        <div className={`absolute left-0 top-[-100%] h-16 w-full pt-6 px-8 ${isLoginLayout && isLogin ? 'block' : 'hidden'}`}>
          <button className='text-md w-full font-extrabold block p-2 h-10 mx-auto text-red-600 hover:bg-red-600 hover:text-white rounded-xl' onClick={() => { handleLogout() }}>退出登录</button>
        </div>
      </div>

    </div>
  )
}