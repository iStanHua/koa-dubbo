'use strict'

import Koa from 'koa'
import helmet from 'koa-helmet'
import bodyparser from 'koa-bodyparser'
import json from 'koa-json'
import cors from 'koa-cors'
import favicon from 'koa-favicon'
import Static from 'koa-static'
import convert from 'koa-convert'
import session from 'koa-session'
import log4js from 'log4js'

import ErrorInfo from './app/extends/errorInfo'
import Context from './app/extends/context'
import Response from './app/middlewares/response'
import Config from './config'
import Routes from './app/routes'

const app = new Koa()

app.keys = [Config.appKey]
// session
app.use(session({
  key: Config.appKey,
  maxAge: 5184000     //设置session超时时间(30天)
}, app))

// middlewares
// 解析请求体
app.use(bodyparser({
  enableTypes: ['json', 'form', 'text', 'html']
}))
app.use(helmet())
app.use(json())
app.use(convert(cors()))
app.use(convert(favicon(__dirname + '/public/logo.png')))
app.use(convert(Static(__dirname + '/public')))

// router
app.use(Routes.routes(), Routes.allowedMethods())

Context(app)

// 使用响应处理中间件
app.use(Response)

app.use(async (ctx, next) => {
  if (!ctx.method === 'GET' && !ctx.method === 'POST') {
    ctx.status = 200
  }
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.error(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

app.context.onerror = function (e) {
  this.app.emit('error', e, this)
  this.body = ErrorInfo.serverError()
  this.res.end(this.body)
}

log4js.configure({
  appenders: {
    file: {
      type: 'dateFile',
      filename: __dirname + '/logs/error',
      pattern: '-yyyy-MM-dd.log',
      alwaysIncludePattern: true,
      category: 'logger'
    }
  },
  categories: {
    default: {
      appenders: ['file'],
      level: 'debug'
    }
  }
})

const log = log4js.getLogger('logger')

app.on('error', (err, ctx) => {
  if (err) log.error(err)
})

app.listen(Config.server.port, () => {
  console.log(`Listening on http://${Config.server.host}:${Config.server.port}`)
})

export default app