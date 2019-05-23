'use strict'

import Controller from './index'
import Company from '../services/company'

class CompanyController extends Controller {
  constructor() {
    super()
  }

  /**
   * 新增企业
   * @param {String} name   名称
   * @param {String} legal   法定代表人
   * @param {String} phone_number   手机号
   * @param {String} credit_code   统一社会信用代码(税号)
   * @param {String} reg_no   注册号
   * @param {Number} start_date   成立日期
   * @param {Number} end_date   截止日期
   * @param {String} landline   座机
   * @param {String} address   地址
   * @param {String} region   地区
   * @param {Number} status   经营状态
   * @param {String} type   企业类型
   * @param {String} reg_org   注册机构
   * @param {Number} reg_cap   注册资金(万)
   * @param {String} reg_cur   注册资金币种
   * @param {String} operate_scope   经营范围
   * @param {String} source   来源
   */
  async add(ctx, next) {
    let _body = { code: 200, msg: '新增成功' }
    let _userInfo = await this.checkAuthM(ctx)
    if (_userInfo) {
      let data = ctx.request.body
      let param = {}

      // 名称
      if (!this.isEmpty(data.name) && data.name.length > 38) {
        return this.maxLength(ctx, '名称', 38)
      }

      // 法定代表人
      if (!this.isEmpty(data.legal) && data.legal.length > 10) {
        return this.maxLength(ctx, '法定代表人', 10)
      }

      // 手机号
      if (!this.isEmpty(data.phone_number) && data.phone_number.length > 88) {
        return this.maxLength(ctx, '手机号', 88)
      }

      // 统一社会信用代码(税号)
      if (!this.isEmpty(data.credit_code) && data.credit_code.length > 28) {
        return this.maxLength(ctx, '统一社会信用代码', 28)
      }

      // 注册号
      if (!this.isEmpty(data.reg_no) && data.reg_no.length > 20) {
        return this.maxLength(ctx, '注册号', 20)
      }

      // 成立日期
      if (!this.isEmpty(data.start_date) && isNaN(Number(data.start_date))) {
        return this.success(ctx, this.errorInfo.invalid('成立日期'))
      }

      // 截止日期
      if (!this.isEmpty(data.end_date) && isNaN(Number(data.end_date))) {
        return this.success(ctx, this.errorInfo.invalid('截止日期'))
      }

      // 座机
      if (!this.isEmpty(data.landline) && data.landline.length > 88) {
        return this.maxLength(ctx, '座机', 88)
      }

      // 地址
      if (!this.isEmpty(data.address) && data.address.length > 108) {
        return this.maxLength(ctx, '地址', 108)
      }

      // 地区
      if (!this.isEmpty(data.region) && data.region.length > 80) {
        return this.maxLength(ctx, '地区', 80)
      }

      // 经营状态
      if (!this.isEmpty(data.status) && isNaN(Number(data.status))) {
        return this.success(ctx, this.errorInfo.invalid('经营状态'))
      }

      // 企业类型
      if (!this.isEmpty(data.type) && data.type.length > 38) {
        return this.maxLength(ctx, '企业类型', 38)
      }

      // 注册机构
      if (!this.isEmpty(data.reg_org) && data.reg_org.length > 88) {
        return this.maxLength(ctx, '注册机构', 88)
      }

      // 注册资金(万)
      if (!this.isEmpty(data.reg_cap) && isNaN(Number(data.reg_cap))) {
        return this.success(ctx, this.errorInfo.invalid('注册资金'))
      }

      // 注册资金币种
      if (!this.isEmpty(data.reg_cur) && data.reg_cur.length > 18) {
        return this.maxLength(ctx, '注册资金币种', 18)
      }

      // 经营范围
      if (!this.isEmpty(data.operate_scope) && data.operate_scope.length > 888) {
        return this.maxLength(ctx, '经营范围', 888)
      }

      // 来源
      if (!this.isEmpty(data.source) && data.source.length > 68) {
        return this.maxLength(ctx, '来源', 68)
      }


      // 名称
      !this.isEmpty(data.name) && (param.name = data.name)
      // 法定代表人
      !this.isEmpty(data.legal) && (param.legal = data.legal)
      // 手机号
      !this.isEmpty(data.phone_number) && (param.phone_number = data.phone_number)
      // 统一社会信用代码(税号)
      !this.isEmpty(data.credit_code) && (param.credit_code = data.credit_code)
      // 注册号
      !this.isEmpty(data.reg_no) && (param.reg_no = data.reg_no)
      // 成立日期
      !this.isEmpty(data.start_date) && (param.start_date = data.start_date)
      // 截止日期
      !this.isEmpty(data.end_date) && (param.end_date = data.end_date)
      // 座机
      !this.isEmpty(data.landline) && (param.landline = data.landline)
      // 地址
      !this.isEmpty(data.address) && (param.address = data.address)
      // 地区
      !this.isEmpty(data.region) && (param.region = data.region)
      // 经营状态
      !this.isEmpty(data.status) && (param.status = data.status)
      // 企业类型
      !this.isEmpty(data.type) && (param.type = data.type)
      // 注册机构
      !this.isEmpty(data.reg_org) && (param.reg_org = data.reg_org)
      // 注册资金(万)
      !this.isEmpty(data.reg_cap) && (param.reg_cap = data.reg_cap)
      // 注册资金币种
      !this.isEmpty(data.reg_cur) && (param.reg_cur = data.reg_cur)
      // 经营范围
      !this.isEmpty(data.operate_scope) && (param.operate_scope = data.operate_scope)
      // 来源
      !this.isEmpty(data.source) && (param.source = data.source)

      let result = await Company.addCompany(param)
      if (result && result.code) {
        _body = result
      }
      else {
        _body.data = result
      }
    }
    else {
      _body = this.errorInfo.unauthorized()
    }
    this.success(ctx, _body)
  }

  /**
   * 修改企业
   * @param {Number} id   id
   * @param {String} name   名称
   * @param {String} legal   法定代表人
   * @param {String} phone_number   手机号
   * @param {String} credit_code   统一社会信用代码(税号)
   * @param {String} reg_no   注册号
   * @param {Number} start_date   成立日期
   * @param {Number} end_date   截止日期
   * @param {String} landline   座机
   * @param {String} address   地址
   * @param {String} region   地区
   * @param {Number} status   经营状态
   * @param {String} type   企业类型
   * @param {String} reg_org   注册机构
   * @param {Number} reg_cap   注册资金(万)
   * @param {String} reg_cur   注册资金币种
   * @param {String} operate_scope   经营范围
   * @param {String} source   来源
   */
  async update(ctx, next) {
    let _body = { code: 200, msg: '修改成功' }
    let _userInfo = await this.checkAuthM(ctx)
    if (_userInfo) {
      let { id } = ctx.params
      if (id && isNaN(Number(id))) {
        return this.success(ctx, this.errorInfo.invalid('编号'))
      }
      id = Number(id)

      let data = ctx.request.body
      let param = {}

      // 名称
      if (!this.isEmpty(data.name) && data.name.length > 38) {
        return this.maxLength(ctx, '名称', 38)
      }

      // 法定代表人
      if (!this.isEmpty(data.legal) && data.legal.length > 10) {
        return this.maxLength(ctx, '法定代表人', 10)
      }

      // 手机号
      if (!this.isEmpty(data.phone_number) && data.phone_number.length > 88) {
        return this.maxLength(ctx, '手机号', 88)
      }

      // 统一社会信用代码(税号)
      if (!this.isEmpty(data.credit_code) && data.credit_code.length > 28) {
        return this.maxLength(ctx, '统一社会信用代码', 28)
      }

      // 注册号
      if (!this.isEmpty(data.reg_no) && data.reg_no.length > 20) {
        return this.maxLength(ctx, '注册号', 20)
      }

      // 成立日期
      if (!this.isEmpty(data.start_date) && isNaN(Number(data.start_date))) {
        return this.success(ctx, this.errorInfo.invalid('成立日期'))
      }

      // 截止日期
      if (!this.isEmpty(data.end_date) && isNaN(Number(data.end_date))) {
        return this.success(ctx, this.errorInfo.invalid('截止日期'))
      }

      // 座机
      if (!this.isEmpty(data.landline) && data.landline.length > 88) {
        return this.maxLength(ctx, '座机', 88)
      }

      // 地址
      if (!this.isEmpty(data.address) && data.address.length > 108) {
        return this.maxLength(ctx, '地址', 108)
      }

      // 地区
      if (!this.isEmpty(data.region) && data.region.length > 80) {
        return this.maxLength(ctx, '地区', 80)
      }

      // 经营状态
      if (!this.isEmpty(data.status) && isNaN(Number(data.status))) {
        return this.success(ctx, this.errorInfo.invalid('经营状态'))
      }

      // 企业类型
      if (!this.isEmpty(data.type) && data.type.length > 38) {
        return this.maxLength(ctx, '企业类型', 38)
      }

      // 注册机构
      if (!this.isEmpty(data.reg_org) && data.reg_org.length > 88) {
        return this.maxLength(ctx, '注册机构', 88)
      }

      // 注册资金(万)
      if (!this.isEmpty(data.reg_cap) && isNaN(Number(data.reg_cap))) {
        return this.success(ctx, this.errorInfo.invalid('注册资金'))
      }

      // 注册资金币种
      if (!this.isEmpty(data.reg_cur) && data.reg_cur.length > 18) {
        return this.maxLength(ctx, '注册资金币种', 18)
      }

      // 经营范围
      if (!this.isEmpty(data.operate_scope) && data.operate_scope.length > 888) {
        return this.maxLength(ctx, '经营范围', 888)
      }

      // 来源
      if (!this.isEmpty(data.source) && data.source.length > 68) {
        return this.maxLength(ctx, '来源', 68)
      }


      // 名称
      !this.isEmpty(data.name) && (param.name = data.name)
      // 法定代表人
      !this.isEmpty(data.legal) && (param.legal = data.legal)
      // 手机号
      !this.isEmpty(data.phone_number) && (param.phone_number = data.phone_number)
      // 统一社会信用代码(税号)
      !this.isEmpty(data.credit_code) && (param.credit_code = data.credit_code)
      // 注册号
      !this.isEmpty(data.reg_no) && (param.reg_no = data.reg_no)
      // 成立日期
      !this.isEmpty(data.start_date) && (param.start_date = data.start_date)
      // 截止日期
      !this.isEmpty(data.end_date) && (param.end_date = data.end_date)
      // 座机
      !this.isEmpty(data.landline) && (param.landline = data.landline)
      // 地址
      !this.isEmpty(data.address) && (param.address = data.address)
      // 地区
      !this.isEmpty(data.region) && (param.region = data.region)
      // 经营状态
      !this.isEmpty(data.status) && (param.status = data.status)
      // 企业类型
      !this.isEmpty(data.type) && (param.type = data.type)
      // 注册机构
      !this.isEmpty(data.reg_org) && (param.reg_org = data.reg_org)
      // 注册资金(万)
      !this.isEmpty(data.reg_cap) && (param.reg_cap = data.reg_cap)
      // 注册资金币种
      !this.isEmpty(data.reg_cur) && (param.reg_cur = data.reg_cur)
      // 经营范围
      !this.isEmpty(data.operate_scope) && (param.operate_scope = data.operate_scope)
      // 来源
      !this.isEmpty(data.source) && (param.source = data.source)

      let result = await Company.updateCompany(id, param)
      if (result && result.code) {
        _body = result
      }
    }
    else {
      _body = this.errorInfo.unauthorized()
    }
    this.success(ctx, _body)
  }

  /**
   * 删除企业
   * @param {Number} id   编号
   * @param {Boolean} flag  是否真删
   */
  async delete(ctx, next) {
    let _body = { code: 200, msg: '删除成功' }
    let _userInfo = await this.checkAuthM(ctx)
    if (_userInfo) {
      let { id } = ctx.params
      if (id && isNaN(Number(id))) {
        return this.success(ctx, this.errorInfo.invalid('编号'))
      }
      id = Number(id)

      let { flag } = ctx.request.body
      let result = await Company.deleteCompany(id, flag)
      if (result && result.code) {
        _body = result
      }
    }
    else {
      _body = this.errorInfo.unauthorized()
    }
    this.success(ctx, _body)
  }

  /**
   * 企业详情
   * @param {Number} id   编号
   */
  async detail(ctx, next) {
    let _body = { code: 200, msg: '查询成功' }
    let { id } = ctx.params
    if (id && isNaN(Number(id))) {
      return this.success(ctx, this.errorInfo.invalid('编号'))
    }
    id = Number(id)

    let result = await Company.companyDetail(id)
    if (result && result.code) {
      _body = result
    }
    else {
      _body.data = result
    }
    this.success(ctx, _body)
  }

  /**
   * 企业列表
   * @param {String} name    名称
   * @param {Number} index   页码
   * @param {Number} size    每页显示记录数
   * @param {String} sort    排序方式(name-desc)
   */
  async list(ctx, next) {
    let _body = { code: 200, msg: '查询成功' }
    let data = ctx.query
    let param = {}

    data.name && (param.name = data.name)
    data.index && (param.index = data.index)
    data.size && (param.size = data.size)
    data.sort && (param.sort = data.sort)

    let result = await Company.companyList(param)
    if (result && result.code) {
      _body = result
    }
    else {
      _body.data = result
    }
    this.success(ctx, _body)
  }
  /**
   * 全部企业列表
   */
  async all(ctx, next) {
    let _body = { code: 200, msg: '查询成功' }
    let result = await Company.companyAll()
    if (result && result.code) {
      _body = result
    }
    else {
      _body.data = result
    }
    this.success(ctx, _body)
  }
}

export default new CompanyController()