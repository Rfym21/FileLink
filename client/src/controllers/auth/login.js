import axios from 'axios'
import { sha256 } from '@/utils/ToolsManager'

const login = async (username, password, email) => {
  try {
    // 将密码取sha256哈希值
    const hashedPassword = sha256(password)
    const response = await axios.post('/api/auth/login', {
      username,
      password: hashedPassword,
    })
    return response.data
  } catch (error) {
    return error.response.data
  }
}

export default login