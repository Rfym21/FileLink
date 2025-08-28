const CookieManager = {
  /**
   * 获取指定 cookie 的值和属性
   * @param {string} key - cookie 名称
   * @returns {string|null} cookie 值或 null
   */
  getCookie(key) {
    if (!key || typeof key !== 'string') {
      return null
    }

    const encodedKey = encodeURIComponent(key)
    const cookies = document.cookie.split(';')

    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=')
      if (name === encodedKey) {
        return value
      }
    }

    return null
  },

  /**
   * 获取所有 cookies
   * @returns {object} 所有 cookies 的键值对
   */
  getAllCookies() {
    const cookies = []
    const cookieString = document.cookie

    if (!cookieString) {
      return cookies
    }

    cookieString.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=')
      if (name) {
        cookies.push({
          name: name,
          value: value
        })
      }
    })

    return cookies
  },

  /**
   * 设置 cookie
   * @param {string} key - cookie 名称
   * @param {string} value - cookie 值
   * @param {object} options - cookie 选项
   * @param {number} options.maxAge - 最大存活时间（秒）
   * @param {string|Date} options.expires - 过期时间
   * @param {string} options.path - 路径，默认 '/'
   * @param {string} options.domain - 域名
   * @param {boolean} options.secure - 是否仅 HTTPS，默认根据当前协议
   * @param {string} options.sameSite - SameSite 属性，默认 'lax'
   * @param {boolean} options.httpOnly - 是否仅服务端访问（注意：客户端设置无效）
   * @returns {boolean} 设置是否成功
   */
  setCookie(key, value, options = {}) {
    if (!key || typeof key !== 'string') {
      console.error('设置cookie失败，key不能为空')
      return false
    }

    if (value === undefined || value === null) {
      console.error('设置cookie失败，value不能为空')
      return false
    }

    try {

      const finalOptions = { ...options }

      // 构建 cookie 字符串
      let cookieString = `${encodeURIComponent(key)}=${encodeURIComponent(value)}`

      // 处理过期时间
      if (finalOptions.maxAge !== undefined) {
        cookieString += `; max-age=${finalOptions.maxAge}`
      } else if (finalOptions.expires) {
        // 如果过期时间不是Date类型，则转换为Date类型
        const expiresDate = finalOptions.expires instanceof Date
          ? finalOptions.expires
          : new Date(finalOptions.expires)
        cookieString += `; expires=${expiresDate.toUTCString()}`
      }

      // 处理路径
      if (finalOptions.path) {
        cookieString += `; path=${finalOptions.path}`
      }

      // 处理域名
      if (finalOptions.domain) {
        cookieString += `; domain=${finalOptions.domain}`
      }

      // 处理安全选项
      if (finalOptions.secure) {
        cookieString += `; secure`
      }

      // 处理 SameSite
      if (finalOptions.sameSite) {
        cookieString += `; samesite=${finalOptions.sameSite}`
      }

      // 设置 cookie
      document.cookie = cookieString

      // 验证是否设置成功
      return this.getCookie(key) !== null

    } catch (error) {
      console.error('Failed to set cookie:', error)
      return false
    }
  },

  /**
   * 删除指定的 cookie
   * @param {string} key - cookie 名称
   * @param {object} options - 删除选项（path 和 domain 必须与设置时相同）
   * @param {string} options.path - 路径，默认 '/'
   * @param {string} options.domain - 域名
   * @returns {boolean} 删除是否成功
   */
  removeCookie(key, options = {}) {
    if (!key || typeof key !== 'string') {
      console.error('删除cookie失败，key不能为空')
      return false
    }

    // 检查 cookie 是否存在
    if (this.getCookie(key) === null) {
      console.warn(`Cookie '${key}' 不存在`)
      return true
    }

    try {
      return this.setCookie(key, '', { ...options, expires: new Date(0), maxAge: -1 })

    } catch (error) {
      console.error('删除cookie失败:', error)
      return false
    }
  },

  /**
   * 清除所有 cookies（仅限当前路径和域名）
   * @param {object} options - 清除选项
   * @param {string} options.path - 路径，默认 '/'
   * @param {string} options.domain - 域名
   * @returns {number} 成功删除的 cookie 数量
   */
  clearAllCookies(options = {}) {
    const cookies = this.getAllCookies()
    let deletedCount = 0

    Object.keys(cookies).forEach(key => {
      if (this.removeCookie(key, options)) {
        deletedCount++
      }
    })

    return deletedCount
  }

}

export default CookieManager