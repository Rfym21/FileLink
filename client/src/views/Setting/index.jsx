import react, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { sha256 } from '@/utils/ToolsManager'
import getUserInfo from '@/controllers/auth/userinfo'
import { Notification as notification } from "@douyinfe/semi-ui"

export default function Setting() {

  const [userInfo, setUserInfo] = useState(null)
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(false)
  const [isChangePassword, setIsChangePassword] = useState(false)
  const [password2, setPassword2] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchUserInfo = async () => {
      const user_info = await getUserInfo()
      if (user_info.status) {
        setUserInfo(user_info.data)
        setIsLogin(true)
      }
    }
    fetchUserInfo()

  }, [])


  const handleLogout = () => {
    document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    localStorage.removeItem('userinfo')
    notification.success({
      content: '退出登录成功',
      duration: 2,
      placement: 'topLeft'
    })
    navigate('/login')
  }

  // 检测密码是否合法
  const checkPassword = (password) => {
    if (!password) {
      return false
    }
    // 密码支持数字、字母、@#&*()@!%^，长度为8-32位
    const regex = /^[a-zA-Z0-9@#&*()@!%^]{8,32}$/
    return regex.test(password)
  }

  const handleChangePassword = async (password2) => {
    try {

      if (!checkPassword(password)) {
        notification.error({
          content: '密码格式错误',
          duration: 2,
          placement: 'topLeft'
        })
        return
      }

      const result = await axios.post('/api/auth/changePassword', { password: sha256(password) })
      if (result.status) {
        notification.success({
          content: '修改密码成功',
          duration: 2,
          placement: 'topLeft'
        })
        handleLogout()
      }
    } catch (error) {
      console.error('修改密码失败: ', error)
      notification.error({
        content: '修改密码失败',
        duration: 2,
        placement: 'topLeft'
      })
    }
  }

  return (
    <>
      <div className={`w-[720px] mx-auto h-full flex flex-col items-center justify-center ${isLogin ? 'block' : 'hidden'}`}>
        <h1 className='text-5xl font-bold pb-2'>用户信息</h1>
        <p className='text-sm font-bold text-red-500 pb-10'>依据注册协议，您不可修改用户名和邮箱</p>

        <div className='w-full flex flex-col items-center justify-start'>
          {
            userInfo && (
              <div className='w-[360px] h-full flex flex-col items-center justify-start gap-4'>
                <div className='w-full px-4'>
                  <p className='text-lg font-bold text-gray-500 p-1'>用户名</p>
                  <input type="text" value={userInfo.username} readOnly className='text-gray-400 border-1 border-gray-200 rounded-lg p-2 px-4 w-full bg-gray-100 block' />
                </div>
                <div className='w-full px-4'>
                  <p className='text-lg font-bold text-gray-500 p-1'>邮箱</p>
                  <input type="text" value={userInfo.email} readOnly className='text-gray-400 border-1 border-gray-200 rounded-lg p-2 px-4 w-full bg-gray-100' />
                </div>
                <div className='w-full px-4'>
                  <p className='text-lg font-bold text-gray-500 p-1'>密码</p>
                  <input type="password" className='border-1 border-gray-200 rounded-lg p-2 px-4 w-full bg-white' value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
              </div>
            )
          }
        </div>

        <div className='w-[360px] flex flex-col items-center justify-center gap-4 pt-10 px-4'>
          <button className='w-full h-12 bg-green-500 text-white rounded-lg border-1 border-green-500 text-lg hover:bg-white hover:text-green-500' onClick={() => {
            if (!checkPassword(password)) {
              notification.error({
                content: '密码格式错误',
                duration: 2,
                placement: 'topLeft'
              })
              return
            }
            setIsChangePassword(true)
          }}>
            修改密码
          </button>
          {
            isChangePassword && (
              <div className='fixed top-0 left-0 bottom-0 right-0 w-full h-full bg-[rgba(0,0,0,0.5)] flex flex-col z-100' onClick={() => setIsChangePassword(false)}>

                <div className='w-[360px] mx-auto my-auto flex flex-col items-center justify-center gap-4 bg-white rounded-lg p-4 z-1000' onClick={(e) => e.stopPropagation()}>
                  <h3 className='text-4xl font-bold text-black text-center p-1'>确认密码</h3>
                  <input type="password" className='border-1 border-gray-200 rounded-lg p-2 px-4 w-full bg-white' value={password2} onChange={(e) => setPassword2(e.target.value)} />
                  <button className='w-full h-12 bg-green-500 text-white rounded-lg border-1 border-green-500 text-lg hover:bg-white hover:text-green-500' onClick={() => {
                    if (password !== password2) {
                      notification.error({
                        content: '两次密码不一致',
                        duration: 2,
                        placement: 'topLeft'
                      })
                      setIsChangePassword(false)
                      return
                    } else {
                      handleChangePassword(password2)
                    }
                  }}>
                    确认修改
                  </button>
                </div>

              </div>
            )
          }

          <button className='w-full h-12 bg-red-500 text-white rounded-lg border-1 border-red-500 text-lg hover:bg-white hover:text-red-500' onClick={handleLogout}>
            退出登录
          </button>
        </div>

      </div>

      <div className={`w-[720px] mx-auto h-full flex flex-col items-center justify-center ${!isLogin ? 'block' : 'hidden'}`}>
        <h1 className='text-5xl font-bold pb-20'>您还未登录 </h1>
        <button className='w-[240px] h-12 bg-green-500 text-white rounded-lg border-1 border-green-500 text-lg hover:bg-white hover:text-green-500' onClick={() => navigate('/login')}>
          登录
        </button>
      </div>
    </>
  )
}