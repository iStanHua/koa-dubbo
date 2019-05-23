'use strict'

import Router from 'koa-router'

const router = Router()

import Company from '../controllers/company'

router.prefix('/company')

router.get('/all', Company.all.bind(Company))
router.get('/list', Company.list.bind(Company))
router.get('/detail/:id', Company.detail.bind(Company))

router.post('/add', Company.add.bind(Company))
router.post('/update/:id', Company.update.bind(Company))
router.post('/delete/:id', Company.delete.bind(Company))

export default router