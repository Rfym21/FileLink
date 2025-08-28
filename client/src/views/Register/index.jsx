import React, { useState } from 'react'
import ProgressSteps from '@/components/ProgressSteps'
import CookieManager from '@/utils/CookieManager.js'
import { Notification as notification } from "@douyinfe/semi-ui"
import register from '@/controllers/auth/register'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const Register = () => {

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [email, setEmail] = useState('')
  const [emailCode, setEmailCode] = useState('')
  const [privacyPolicy, setPrivacyPolicy] = useState(false)
  const [autoLogin, setAutoLogin] = useState(true)
  const [usernameCheck, setUsernameCheck] = useState(true)
  const [passwordCheck, setPasswordCheck] = useState(true)
  const [emailCheck, setEmailCheck] = useState(true)
  const [sendCode, setSendCode] = useState(false)
  const [sendCodeTime, setSendCodeTime] = useState(0)

  const [currentStep, setCurrentStep] = useState(1)

  const navigate = useNavigate()

  // 下一步 or 登录
  const handleButton = async () => {
    switch (currentStep) {
      case 1:
        if (checkUsername(username)) {
          setCurrentStep(currentStep + 1)
        } else if (username.trim() === "") {
          notification.error({
            content: '用户名不能为空!',
            duration: 2,
            placement: 'topLeft'
          })
        }
        break
      case 2:
        if (checkPassword(password) && password === password2) {
          setCurrentStep(currentStep + 1)
        } else if (password.trim() === "") {
          notification.error({
            content: '密码不能为空!',
            duration: 2,
            placement: 'topLeft'
          })
        } else if (password !== password2) {
          notification.error({
            content: '两次密码不一致!',
            duration: 2,
            placement: 'topLeft'
          })
        }
        break
      case 3:
        if (checkEmail(email) && privacyPolicy && emailCode.trim() !== "") {
          const result = await register(username, password, email, emailCode)
          if (result.status === true) {
            notification.success({
              content: '注册成功!',
              duration: 2,
              placement: 'topLeft'
            })
            // 自动登录
            autoLoginFunction(result.access_token)
            // 跳转登录页面
            navigate('/')
          } else {
            notification.error({
              content: result?.message,
              duration: 2,
              placement: 'topLeft'
            })
          }
        } else if (email.trim() === "") {
          notification.error({
            content: '邮箱不能为空!',
            duration: 2,
            placement: 'topLeft'
          })
        } else if (!privacyPolicy) {
          notification.error({
            content: '请先同意隐私协议!',
            duration: 2,
            placement: 'topLeft'
          })
        }
        break
      default:
        break
    }
  }

  // 上一步
  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // 自动登录逻辑
  const autoLoginFunction = (access_token) => {
    if (autoLogin) {
      // 如果开启自动登录，则设置有效期为30天
      CookieManager.setCookie('access_token', access_token, { path: '/', secure: true, sameSite: 'strict', maxAge: 2592000 })
    } else {
      // 如果关闭自动登录，则设置有效期为本次会话
      CookieManager.setCookie('access_token', access_token, { path: '/', secure: true, sameSite: 'strict' })
    }
  }

  // 检测用户名是否合法
  const checkUsername = (username) => {
    if (!username) {
      return false
    }
    // 用户名支持数字、字母、下划线，长度为6-16位
    const regex = /^[a-zA-Z0-9_]{6,16}$/
    setUsernameCheck(regex.test(username))
    return usernameCheck
  }

  // 检测密码是否合法
  const checkPassword = (password) => {
    if (!password) {
      return false
    }
    // 密码支持数字、字母、@#&*()@!%^，长度为8-32位
    const regex = /^[a-zA-Z0-9@#&*()@!%^]{8,32}$/
    setPasswordCheck(regex.test(password))
    return passwordCheck
  }

  // 检测邮箱是否合法
  const checkEmail = (email) => {
    if (!email) {
      return false
    }
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    setEmailCheck(regex.test(email))
    return emailCheck
  }

  // 发送验证码
  const sendCodeFunction = async () => {

    if (sendCodeTime > 0 || !emailCheck || email.trim() === "" || sendCode) {
      return
    }

    try {
      setSendCode(true)
      const result = await axios.post('/api/send-verification', { email })

      if (result.data.status === true) {
        setSendCodeTime(60)
        const timer = setInterval(() => {
          setSendCodeTime(prevTime => {
            if (prevTime <= 1) {
              clearInterval(timer)
              return 0
            }
            return prevTime - 1
          })
        }, 1000)
        notification.success({
          content: result.data.message,
          duration: 2,
          placement: 'topLeft'
        })
      } else {
        setSendCode(false)
        notification.error({
          content: result.data.message,
          duration: 2,
          placement: 'topLeft'
        })
      }
    } catch (error) {
      setSendCode(false)
      notification.error({
        content: '发送验证码失败',
        duration: 2,
        placement: 'topLeft'
      })
    }
  }

  return (
    <div className='h-screen flex items-center justify-center p-2'>
      <div className='flex flex-col items-center justify-center w-full p-4 mx-auto max-w-[480px]'>
        <h1 className='text-5xl font-bold text-center pb-4'>用户注册</h1>

        <ProgressSteps steps={['请输入用户名', '请输入密码', '请输入邮箱']} currentStep={currentStep} />

        <div className=' w-full p-4 '>

          {
            currentStep === 1 && (
              <div>
                <div className='text-gray-300 text-xl pb-2 px-2'>用户名</div>
                <input type="text" id="username" name="username" className={`w-full px-4 h-12 rounded-md border border-gray-100 bg-gray-100 placeholder:text-gray-50 ${usernameCheck === false ? 'border-red-500' : ''}`} placeholder='请输入用户名' onChange={(e) => { setUsername(e.target.value); checkUsername(e.target.value) }} value={username} onKeyDown={(e) => { if (e.key === 'Enter') { handleButton() } }} />
                <p className={`text-gray-500 text-sm pt-4 pl-2 ${usernameCheck === true ? 'text-gray-500' : 'text-red-500'}`}>用户名支持数字、字母、下划线，长度为6-16位</p>
                <p className='text-green-500 text-sm pt-4 pl-2'>用户名注册后不可修改，不区分大小写，请认真对待</p>
              </div>
            )
          }
          {
            currentStep === 2 && (
              <div>
                <div className='text-gray-300 text-xl pb-2 px-2'>密码</div>
                <input type="password" id="password" name="password" className={`w-full px-4 h-12 rounded-md border border-gray-100 bg-gray-100 placeholder:text-gray-50 ${passwordCheck === false ? 'border-red-500' : ''}`} placeholder='请输入密码' onChange={(e) => { setPassword(e.target.value); checkPassword(e.target.value) }} value={password} onKeyDown={(e) => { if (e.key === 'Enter') { handleButton() } }} />
                <p className={`text-gray-500 text-sm pt-4 pl-2 ${passwordCheck === true ? 'text-gray-500' : 'text-red-500'}`}>密码支持数字、字母、@#&*()@!%^，长度为8-32位</p>
                <p className='text-green-500 text-sm pt-4 pl-2 pb-2'>我们不会明文存储您的密码，请放心填写</p>
                <input type="password" id="password2" className={`w-full px-4 h-12 rounded-md border border-gray-100 bg-gray-100 placeholder:text-gray-50 ${passwordCheck === false ? 'border-red-500' : ''}`} placeholder='请再次输入密码' onChange={(e) => { setPassword2(e.target.value) }} value={password2} onKeyDown={(e) => { if (e.key === 'Enter') { handleButton() } }} />
                {
                  password !== password2 && password2.trim() !== "" && (
                    <p className='text-red-500 text-sm pt-4 pl-2'>两次密码不一致</p>
                  )
                }
              </div>
            )
          }

          {
            currentStep === 3 && (
              <div>
                <div className='text-gray-300 text-xl pb-2 px-2'>邮箱</div>
                <input type="email" id="email" name="email" className={`w-full px-4 h-12 rounded-md border border-gray-100 bg-gray-100 placeholder:text-gray-50 ${emailCheck === false ? 'border-red-500' : ''}`} placeholder='请输入邮箱' onChange={(e) => { setEmail(e.target.value); checkEmail(e.target.value) }} value={email} onKeyDown={(e) => { if (e.key === 'Enter') { handleButton() } }} />
                <p className={`text-gray-500 text-sm pt-4 pl-2 ${emailCheck === true ? 'text-gray-500' : 'text-red-500'}`}>{emailCheck === true ? "建议使用常用邮箱，我们不会向您发送垃圾邮件" : "邮箱格式错误，请重新输入"}</p>
                <p className='text-green-500 text-sm pt-4 pl-2'>邮箱可用于找回密码，注册后不可修改，请认真对待</p>
                {emailCheck && !sendCode && email.trim() !== "" && <button className='w-full bg-green-500 h-10 my-2 text-white rounded-md text-sm block' onClick={() => { sendCodeFunction() }}>发送验证码</button>}
                {sendCode && (<>
                  <input type="text" id="emailCode" name="emailCode" className={`w-full px-4 my-2 h-12 rounded-md border border-gray-100 bg-gray-100 placeholder:text-gray-50`} placeholder='请输入验证码' onChange={(e) => { setEmailCode(e.target.value)}} value={emailCode} onKeyDown={(e) => { if (e.key === 'Enter') { handleButton() } }} />
                  <button className='w-full bg-green-500 h-10 my-2 text-white rounded-md text-sm block' onClick={() => { setSendCode(false); setSendCodeTime(0); setEmailCode("") }} disabled={sendCodeTime > 0}>{sendCodeTime > 0 ? `${sendCodeTime}秒后可重新发送` : '重新发送验证码'}</button>
                </>)}
              </div>
            )
          }

        </div>

        {
          currentStep === 3 && (<div className='w-full px-4 flex flex-row justify-between'>
            <button onClick={() => { setPrivacyPolicy(!privacyPolicy) }} className={`px-4 py-1 rounded-md ${privacyPolicy ? 'bg-green-500' : 'bg-gray-200'}`}>
              <label htmlFor="privacyPolicy" className={`text-sm ${privacyPolicy ? 'text-white' : 'text-black'}`}>我同意 <span className='text-blue-700'>隐私协议</span></label>
            </button>

            <button onClick={() => { setAutoLogin(!autoLogin); console.log(autoLogin) }} className={`px-4 py-1 rounded-md ${autoLogin ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>
              <label htmlFor="autoLogin">自动登录</label>
            </button>
          </div>)
        }

        <div className='flex justify-center items-center gap-4 w-full pt-4'>
          {currentStep > 1 && <button id="button" className='bg-white text-black p-2 rounded-md w-[45%] border border-gray-300' onClick={handlePrevious}>上一步</button>}
          <button id="button" className={`bg-green-500 text-white p-2 rounded-md ${currentStep === 1 ? 'w-[90%]' : 'w-[45%]'}`} onClick={handleButton}>{currentStep === 3 ? '注册' : '下一步'}</button>
        </div>

        <div className='flex justify-center items-center flex-col w-full py-4'>
          <a id="backLoginButton" className={`bg-white text-black p-2 rounded-md ${currentStep === 1 ? 'w-[90%]' : 'w-[95%]'} text-center border border-gray-300`} href="/login">返回登录</a>
          <div className='text-gray-300 text-md py-2 px-2'>已有可用账户？</div>
        </div>

      </div>
    </div>
  )
}

export default Register