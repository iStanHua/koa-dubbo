'use strict'

import Service from './index'

class CompanyService extends Service {
  constructor() {
    super('t_company')
    this.columns = ['t_company.id', 't_company.name', 't_company.legal', 't_company.phone_number', 't_company.credit_code', 't_company.reg_no', 't_company.start_date', 't_company.end_date', 't_company.landline', 't_company.address', 't_company.region', 't_company.status', 't_company.type', 't_company.reg_org', 't_company.reg_cap', 't_company.reg_cur', 't_company.operate_scope', 't_company.source', 't_company.created_time']
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
  async addCompany(data) {
    // data.hasOwnProperty('name') && (delete data.name)
    return await this.insert(data)
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
  async updateCompany(id, data) {
    let res = await this.count({ 't_company.id': id })
    if (!res) {
      return this.errorInfo.unexist('该企业')
    }
    return await this.update(data, { 't_company.id': id })
  }

  /**
   * 删除企业
   * @param {Number} id   编号
   * @param {Boolean} flag  是否真删
   */
  async deleteCompany(id, flag = false) {
    let res = await this.count({ 't_company.id': id })
    if (!res) {
      return this.errorInfo.unexist('该编号')
    }
    if (flag) {
      return await this.delete({ 't_company.id': id })
    }
    else {
      return await this.updateCompany(id, { 't_company.active': 0 })
    }
  }

  /**
   * 企业详情
   * @param {Number} id   编号
   */
  async companyDetail(id) {
    let res = await this.count({ 't_company.id': id })
    if (!res) {
      return this.errorInfo.unexist('该编号')
    }
    return await this.get({
      't_company.id': id,
      't_company.active': 1
    }, this.columns)
  }

  /**
   * 企业列表
   * @param {String} data.name    名称
   * @param {Number} data.index   页码
   * @param {Number} data.size    每页显示记录数
   * @param {String} data.sort    排序方式(name-desc)
   */
  async companyList(data) {
    let options = {
      where: {
        't_company.active': 1
      },
      order: []
    }

    // data.id && (options.where['t_company.id'] = data.id)
    data.name && (options.like = [{ 't_company.name': '%' + data.name + '%' }])
    data.index && (options.index = data.index)
    data.size && (options.size = data.size)

    if (data.sort && data.sort.indexOf('-') > -1) {
      options.order.push(data.sort.split('-'))
    }
    else {
      options.order.push(['t_company.created_time', 'DESC'])
    }

    let count = 0
    let rows = []

    count = await this.count(options, 't_company.id as count')
    rows = await this.select(options, this.columns)
    //  .leftJoin('t', 't_company.t_id', 't.id')

    count = count[0].count
    return { count, rows }
  }

  /**
   * 全部企业列表
   */
  async companyAll() {
    let options = {
      where: {
        't_company.active': 1
      },
      order: [['t_company.created_time', 'DESC']]
    }
    // id && (options.where['t_company.id'] = id)
    return await this.findAll(options, this.columns)
  }
}

export default new CompanyService()