'use strict'

class errorInfo {
  constructor() {
    this.util = require('util')

    this.UNKNOWN = { code: -1, data: '', msg: '未知错误' }
    this.ABNORMAL = { code: 0, data: '', msg: '处理异常' }
    this.NOTFOUND = { code: 400, data: '', msg: '未找到' }
    this.UNAUTHORIZED = { code: 401, data: '', msg: '权限认证失败' }
    this.SERVEREORROR = { code: 500, data: '', msg: '内部服务器错误' }
    this.NODATA = { code: 1000, data: '', msg: '没有相关数据' }
    this.REQUIRED = { code: 1001, data: '', msg: '%s不能为空' }
    this.FOUND = { code: 1002, data: '', msg: '%s已存在' }
    this.INVALID = { code: 1003, data: '', msg: '%s字段无效' }
    this.MISMATCH = { code: 1004, data: '', msg: '%s和%s不匹配' }
    this.UNEXIST = { code: 1005, data: '', msg: '%s不存在' }
    this.WRONGFORMAT = { code: 1006, data: '', msg: '%s格式有误' }
  }

  /**
   * 未知错误
   */
  unknown() {
    return this.UNKNOWN
  }

  /**
   * 未找到
   */
  notfound() {
    return this.NOTFOUND
  }

  /**
   * 权限认证失败
   */
  unauthorized() {
    return this.UNAUTHORIZED
  }

  /**
   * 内部服务器错误
   */
  serverError() {
    return this.SERVEREORROR
  }

  /**
   * 没有相关数据
   */
  nodata() {
    return this.NODATA
  }

  /**
   * 必填
   * @param {Strig} value 
   */
  required(value) {
    let _body = Object.assign({}, this.REQUIRED)
    _body.msg = this.util.format(_body.msg, value)
    return _body
  }

  /**
   * 已存在
   * @param {Strig} value 
   */
  found(value) {
    let _body = Object.assign({}, this.FOUND)
    _body.msg = this.util.format(_body.msg, value)
    return _body
  }

  /**
   * 字段无效
   * @param {Strig} value 
   */
  invalid(value) {
    let _body = Object.assign({}, this.INVALID)
    _body.msg = this.util.format(_body.msg, value)
    return _body
  }

  /**
   * 不匹配
   * @param {Strig} value1 
   * @param {Strig} value2 
   */
  unmatch(value1, value2) {
    let _body = Object.assign({}, this.MISMATCH)
    _body.msg = this.util.format(_body.msg, value1, value2)
    return _body
  }

  /**
   * 不存在
   * @param {Strig} value 
   */
  unexist(value) {
    let _body = Object.assign({}, this.UNEXIST)
    _body.msg = this.util.format(_body.msg, value)
    return _body
  }

  /**
   * 格式有误
   * @param {Strig} value 
   */
  wrongFormat(value) {
    let _body = Object.assign({}, this.WRONGFORMAT)
    _body.msg = this.util.format(_body.msg, value)
    return _body
  }
}

module.exports = new errorInfo()