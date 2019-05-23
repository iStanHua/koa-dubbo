'use strict'

import crypto from 'crypto'

class Secret {
  /**
   *  @param {String|Buffer} key  密钥
   */
  constructor(key) {
    this.key = key
  }

  /**
   * 加密
   * @param {String|Buffer} data 数据
   * @param {String}        algorithm   算法  ['md5', 'sha1', 'sha224', 'sha256', 'sha384', 'sha512']
   */
  Encrypt(data, algorithm) {
    let c = null
    if (this.key) {
      c = crypto.createHmac(algorithm, this.key)
    } else {
      c = crypto.createHash(algorithm)
    }
    c.update(data)
    return c.digest('hex')
  }
  /**
   * 签名
   * @param {String|Buffer} data 数据
   */
  Sign(data) {
    return data + '.' + this.Encrypt(data, 'sha256', this.key)
  }
  /**
   * 反向签名
   * @param {String|Buffer} data 数据
   */
  Unsign(data) {
    let temp = data.slice(0, data.lastIndexOf('.'))
    let mac = this.Sign(temp, this.key)
    return mac == data ? temp : false
  }
  /**
   * MD5加密
   * @param {String|Buffer} data 数据
   * @param {String}        salt
   */
  MD5(data, salt) {
    if (salt)
      data += salt
    return this.Encrypt(data, 'md5', this.key)
  }
  /**
   * ASE加密
   * @param {String|Buffer} data 数据
   */
  ASE_Encrypt(data) {
    let cipher = crypto.createCipheriv('aes-128-ecb', this.key, Buffer.alloc(0))
    return cipher.update(data, 'utf8', 'hex') + cipher.final('hex')
  }
  /**
   * ASE解密
   * @param {String|Buffer} data 数据
   */
  ASE_Decrypt(data) {
    let cipher = crypto.createDecipheriv('aes-128-ecb', this.key, Buffer.alloc(0))
    return cipher.update(data, 'hex', 'utf8') + cipher.final('utf8')
  }

  /**
   * 创建token
   * @param {String|Buffer} publicKey   公钥         
   * @param {String|Buffer} privateKey  私钥      
   * @param {String|Buffer} ts          
   */
  createToken(publicKey, privateKey, ts) {
    return this.Encrypt(`${publicKey}:${privateKey}:${ts}`, 'sha1')
  }

  /**
   * 验证token
   * @param {String|Buffer} publicKey   公钥         
   * @param {String|Buffer} privateKey  私钥      
   * @param {String|Buffer} ts             
   * @param {String|Buffer} signOrigin  token       
   */
  validToken(publicKey, privateKey, ts, signOrigin) {
    let sign = this.CreateToken(publicKey, privateKey, ts)
    return (sign === signOrigin)
  }
}

export default Secret