import CryptoJS from 'crypto-js'

export const sha256 = (str) => {
  return CryptoJS.SHA256(str).toString()
}