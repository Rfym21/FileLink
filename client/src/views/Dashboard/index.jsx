import React, { useState, useEffect, useRef } from 'react'
import { Layout } from '@douyinfe/semi-ui'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import CookieManager from '@/utils/CookieManager.js'
import getUserInfo from '@/controllers/auth/userinfo'
import NavComponent from '@/components/Nav'

const Dashboard = () => {
  const { Sider, Content } = Layout
  const navigate = useNavigate()
  const location = useLocation()
  const [isLogin, setIsLogin] = useState(false)
  const [role, setRole] = useState('guest')
  const [userInfo, setUserInfo] = useState({})

  const navList = useRef([
    { itemKey: 'documents', text: '文档分享', icon: "/public/images/document_share.svg", path: '/dashboard/documents', permission: ['user', 'admin', 'guest'] },
    { itemKey: 'manager', text: '文档管理', icon: "/public/images/document_manager.svg", path: '/dashboard/manager', permission: ['admin'] },
    { itemKey: 'setting', text: '个人信息', icon: "/public/images/user_setting.svg", path: '/dashboard/setting', permission: ['user', 'admin'] }
  ])

  useEffect(() => {

    (async () => {
      const access_token = CookieManager.getCookie('access_token')
      if (access_token) {
        setIsLogin(true)
        const user_info = await getUserInfo()
        if (user_info.status) {
          setRole(user_info.data.role)
          localStorage.setItem("userinfo", JSON.stringify(user_info.data))
          setUserInfo(user_info.data)
        } else {
          console.log(user_info.status)
          setIsLogin(false)
          setRole('guest')
          CookieManager.removeCookie('access_token')
        }
      }
    })([isLogin, role])

  }, [isLogin, role])

  return (
    <Layout style={{ border: '1px solid var(--semi-color-border)', height: '100vh', overflow: 'hidden' }} className='w-full'>

      <Sider style={{ backgroundColor: 'var(--semi-color-bg-1)' }} >
        <NavComponent navigate={navigate} location={location} role={role} isLogin={isLogin} navList={navList.current} userInfo={userInfo} />
      </Sider>

      <Layout className='h-screen overflow-hidden'>
        <Content className='overflow-auto'>
          <Outlet />
        </Content>
      </Layout>

    </Layout>
  )
}

export default Dashboard