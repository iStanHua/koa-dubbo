'use strict'

import crypto from 'crypto'

class WXBizDataCrypt {
  /**
   * 加密数据解密算法
   * @param {String} appId       小程序唯一标识
   * @param {String} sessionKey  会话密钥
   */
  constructor(appId, sessionKey) {
    this.appId = appId
    this.sessionKey = sessionKey
  }
  /**
   * 
   * @param {String} encryptedData   包括敏感数据在内的完整用户信息的加密数据
   * @param {String} iv              加密算法的初始向量
   */
  decryptData(encryptedData, iv) {
    // base64 decode
    var sessionKey = new Buffer(this.sessionKey, 'base64')
    encryptedData = new Buffer(encryptedData, 'base64')
    iv = new Buffer(iv, 'base64')

    try {
      // 解密
      var decipher = crypto.createDecipheriv('aes-128-cbc', sessionKey, iv)
      // 设置自动 padding 为 true，删除填充补位
      decipher.setAutoPadding(true)
      var decoded = decipher.update(encryptedData, 'binary', 'utf8')
      decoded += decipher.final('utf8')

      decoded = JSON.parse(decoded)

    } catch (err) {
      throw new Error('Illegal Buffer')
    }

    if (decoded.watermark.appid !== this.appId) {
      throw new Error('Illegal Buffer')
    }

    return decoded
  }
}

export default WXBizDataCrypt
