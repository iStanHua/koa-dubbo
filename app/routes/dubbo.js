'use strict'

import Router from 'koa-router'

const router = Router()

import Dubbo from '../controllers/dubbo'

router.prefix('/dubbo')

router.get('/hello', Dubbo.hello.bind(Dubbo))
router.get('/user', Dubbo.user.bind(Dubbo))
router.get('/echo', Dubbo.echo.bind(Dubbo))
router.get('/type', Dubbo.type.bind(Dubbo))
router.get('/exp', Dubbo.exp.bind(Dubbo))
router.get('/tracer', Dubbo.tracer.bind(Dubbo))

export default router