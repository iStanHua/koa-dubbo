'use strict'

import Secret from '../extends/secret'
import Validate from '../extends/validate'
import ErrorInfo from '../extends/errorInfo'

class Controller {
  constructor() {
    this.secret = new Secret()
    this.validate = Validate
    this.errorInfo = ErrorInfo
  }

  /**
   * 权限值
   * @param {Context} ctx
   */
  getAuth(ctx) {
    return ctx.get('Authorization')
  }

  /**
   * 后台管理验证权限
   */
  async checkAuthA(ctx) {
    return await ctx.redisA.get(this.getAuth(ctx))
  }
  /**
   * 移动端验证权限
   */
  async checkAuthM(ctx) {
    return await ctx.redisM.get(this.getAuth(ctx))
  }

  /**
   * 输出格式化
   * @param {Context} ctx
   * @param {Object} options
   */
  success(ctx, options) {
    ctx.body = {
      code: options.code,
      data: options.data,
      msg: options.msg
    }
  }

  /**
   * 通用
   * @param {Context} ctx
   * @param {Object} msg
   */
  common(ctx, msg) {
    let _body = { code: 1002, data: '', msg: msg }
    return this.success(ctx, _body)
  }

  /**
   * 长度区间
   * @param {Context} ctx
   * @param {String} value
   * @param {Number} min
   * @param {Number} max
   */
  rangeLength(ctx, value, min, max) {
    let _body = { code: 1002, data: '', msg: '%s长度必须在%s-%s位之间' }
    _body.msg = this.errorInfo.util.format(_body.msg, value, min, max)
    return this.success(ctx, _body)
  }

  /**
   * 长度最小
   * @param {Context} ctx
   * @param {String} value
   * @param {Number} min
   */
  minLength(ctx, value, min) {
    let _body = { code: 1002, data: '', msg: '%s长度最小为%s' }
    _body.msg = this.errorInfo.util.format(_body.msg, value, min)
    return this.success(ctx, _body)
  }

  /**
   * 长度最大
   * @param {Context} ctx
   * @param {String} value
   * @param {Number} max
   */
  maxLength(ctx, value, max) {
    let _body = { code: 1002, data: '', msg: '%s长度最多为%s' }
    _body.msg = this.errorInfo.util.format(_body.msg, value, max)
    return this.success(ctx, _body)
  }

  /**
   * 值区间
   * @param {Context} ctx
   * @param {String} value
   * @param {Number} min
   * @param {Number} max
   */
  rangeValue(ctx, value, min, max) {
    let _body = { code: 1002, data: '', msg: '%s值必须在%s-%s之间' }
    _body.msg = this.errorInfo.util.format(_body.msg, value, min, max)
    return this.success(ctx, _body)
  }

  /**
   * 最小
   * @param {Context} ctx
   * @param {String} value
   * @param {Number} min
   */
  minValue(ctx, value, min) {
    let _body = { code: 1002, data: '', msg: '%s值不能小于%s' }
    _body.msg = this.errorInfo.util.format(_body.msg, value, min)
    return this.success(ctx, _body)
  }

  /**
   * 最大
   * @param {Context} ctx
   * @param {String} value
   * @param {Number} max
   */
  maxValue(ctx, value, max) {
    let _body = { code: 1002, data: '', msg: '%s值不能大于%s' }
    _body.msg = this.errorInfo.util.format(_body.msg, value, max)
    return this.success(ctx, _body)
  }

  /**
   * 纯数字
   * @param {Context} ctx
   * @param {String} value
   */
  pureNumber(ctx, value) {
    let _body = { code: 1002, data: '', msg: '%s为纯数字' }
    _body.msg = this.errorInfo.util.format(_body.msg, value)
    return this.success(ctx, _body)
  }

  /**
   * 是否为空
   * @param {Context} ctx
   * @param {String} value
   */
  isEmpty(value) {
    return !value || value == 'undefined' || value == 'null'
  }
}

export default Controller