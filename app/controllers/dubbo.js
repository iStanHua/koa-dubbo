'use strict'

import Controller from './index'
import dubbo from '../dubbo'

class DubboController extends Controller {
  constructor() {
    super()
  }

  static async hello(ctx, next) {
    let { name } = ctx.query
    name = name || 'test'
    const { res, err } = await dubbo.service.demoProvider.sayHello(name)

    console.log(err)

    if (err) {
      ctx.body = err.message
    }
    else {
      ctx.body = res
    }
  }

  static async user(ctx, next) {
    const { res, err } = await dubbo.service.demoProvider.getUserInfo()
    if (err) {
      ctx.body = err.message
    }
    else {
      ctx.body = res
    }
  }

  static async echo(ctx, next) {
    this.success(ctx, await dubbo.service.demoProvider.echo())
  }

  static async type(ctx, next) {
    const { res, err } = await dubbo.service.demoProvider.testBasicType()
    if (err) {
      ctx.body = err.message
    }
    else {
      ctx.body = res
    }
  }

  static async exp(ctx, next) {
    const { res, err } = await dubbo.service.demoProvider.errorTest()
    if (err) {
      ctx.body = err.message
    }
    else {
      ctx.body = res
    }
  }

  static async tracer(ctx, next) {
    const { res: hello } = await dubbo.service.demoProvider.sayHello('test')
    const { res: userInfo } = await dubbo.service.demoProvider.getUserInfo()

    setTimeout(async () => {
      await dubbo.service.basicTypeProvider.testBasicType()
      process.nextTick(() => {
        demoProvider.getUserInfo()
      })
    })

    ctx.body = {
      hello,
      userInfo
    }
  }
}

export default DubboController