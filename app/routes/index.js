'use strict'

import Router from 'koa-router'

const router = Router()

router.prefix('/api')

import Dubbo from './dubbo'

router.use(Dubbo.routes(), Dubbo.allowedMethods())

export default router