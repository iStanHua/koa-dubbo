
'use strict'

/**
 * 响应处理模块
 */
export default async (ctx, next) => {
  try {
    await next()
    let _status = ctx.response.status
    let _message = ctx.response.message
    _status >= 500 && 'production' == ctx.app.env && (_message = '服务器内部错误')
    ctx.body = ctx.body ? ctx.body : {
      code: ctx.state.code ? ctx.state.code : _status,
      data: '',
      msg: ctx.state.data ? ctx.state.data : _message
    }
  }
  catch (e) {
    // 设置状态码为 200 - 服务端错误
    ctx.status = 200

    // 输出详细的错误信息
    ctx.body = {
      code: 0,
      data: '',
      msg: '未知错误'
    }
  }
}