'use strict'

import request from 'request'

class fetch {
  constructor() {
    this.request = request
  }

  /**
   *     
   * @param {String}  options.url  请求地址
   */
  get(options = {}) {
    return new Promise((resolve, reject) => {
      this.request
        .get(options, (err, res, body) => {
          if (err) {
            reject({ code: 404, data: err })
          }
          else {
            if (res.statusCode == 200) {
              resolve(JSON.parse(body))
            }
            else {
              reject({ code: 404, data: res })
            }
          }
        })
    })
  }

  /**
   * 
   * @param {String}  url    请求地址
   * @param {Object}  data   请求数据
   */
  post(url, data) {
    return new Promise((resolve, reject) => {
      let _options = {
        method: 'POST',
        url: url,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }
      this.request(_options)
        .then((err, res) => {
          let _data = res.data
          if (res.status == 200) {
            resolve(_data)
          }
          else {
            reject({ code: res.status, data: res.message })
          }
        })
        .catch(res => {
          reject({ code: 404, data: res.message })
        })
    })
  }
}

export default new fetch()