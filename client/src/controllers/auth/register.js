import axios from 'axios'
import { sha256 } from '@/utils/ToolsManager'

const register = async (username, password, email, code) => {
  try {
    // 将密码取sha256哈希值
    const hashedPassword = sha256(password)
    const response = await axios.post('/api/auth/register', {
      username,
      password: hashedPassword,
      email,
      code
    })
    return response.data
  } catch (error) {
    return error.response.data
  }
}

export default register