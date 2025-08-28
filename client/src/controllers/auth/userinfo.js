import axios from 'axios'

const getUserInfo = async () => {
  try {
    const response = await axios.get('/api/auth/userinfo')
    return response.data
  } catch (error) {
    return error.response.data
  }
}

export default getUserInfo