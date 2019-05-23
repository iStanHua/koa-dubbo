'use strict'

import request from 'request'

class Extend {
  constructor() {

  }

  /**
   * ip
   */
  ip(ctx) {
    return ctx.request.headers['x-real-ip'] && ctx.request.headers['x-real-ip'].replace('::ffff:', '') || ctx.request.ip.replace('::ffff:', '')
  }

  /**
   * 延迟
   * @param {Number} time 
   */
  sleep(time) {
    return new Promise(function (resolve, reject) {
      setTimeout(function () {
        resolve()
      }, time)
    })
  }

  /**
   * request
   * @param {Object} options 
   */
  request(options) {
    return new Promise((resolve, reject) => {
      request(options, (err, res) => {
        if (err) reject(err)
        resolve(res)
      })
    })
  }

}

export default new Extend()