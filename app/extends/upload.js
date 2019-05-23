'use strict'

import fs from 'fs'
import path from 'path'
import Busboy from 'busboy'
import uuid1 from 'uuid/v1'

class Upload {
  constructor(ctx) {
    this.ctx = ctx
  }
  /**
   * 同步创建文件目录
   * @param  {string} dirname 目录绝对地址
   * @return {boolean}        创建目录结果
   */
  mkdirsSync(dirname) {
    if (fs.existsSync(dirname)) {
      return true
    } else {
      if (this.mkdirsSync(path.dirname(dirname))) {
        fs.mkdirSync(dirname)
        return true
      }
    }
  }

  /**
   * 获取上传文件的后缀名
   * @param  {string} fileName 获取上传文件的后缀名
   * @return {string}          文件后缀名
   */
  getSuffixName(fileName) {
    let nameList = fileName.split('.')
    return nameList[nameList.length - 1]
  }

  /**
   * 上传文件
   * @param  {string} filePath 文件存放路径
   * @param  {string} fileType 文件类型 
   * @return {promise}         
   */
  uploadFile(filePath, fileType = 'images') {
    let req = this.ctx.req
    let res = this.ctx.res
    let busboy = new Busboy({ headers: req.headers })

    filePath = path.join(filePath, fileType)
    let mkdirResult = this.mkdirsSync(filePath)

    return new Promise((resolve, reject) => {
      let result = {
        success: false
      }

      // 解析请求文件事件
      busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
        let fileName = uuid1().toString().replace(/-/g, '') + '.' + this.getSuffixName(filename)
        let _uploadFilePath = path.join(filePath, fileName)
        // 文件保存到制定路径
        file.pipe(fs.createWriteStream(_uploadFilePath))

        // 文件写入事件结束
        file.on('end', () => {
          result.success = true
          result.name = filename
          result.url = '/upload/' + fileType + '/' + fileName
          resolve(result)
        })
      })

      // 解析结束事件
      busboy.on('finish', function () {
        result.msg = '文件上传成功'
        resolve(result)
      })
      // 解析错误事件
      busboy.on('error', function (err) {
        result.msg = '文件上出错'
        reject(result)
      })

      req.pipe(busboy)
    })

  }
}

export default Upload