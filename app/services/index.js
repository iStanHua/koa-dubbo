'use strict'

import config from '../../config'
import Mysql from '../extends/mysql'
import errorInfo from '../extends/errorInfo'

class Service {
  constructor(table) {
    this.table = table
    this.mysql = new Mysql(config.mysql)
  }

  /**
   * 执行sql语句
   * @param {String} sql     sql语句
   * @param {Array} values   值
   * @returns knex对象
   */
  async query(sql, values = []) {
    return await this.knex.raw(sql, values)
  }

  /**
   * 新增
   * @param {Object} values  值
   * @returns knex对象
   */
  async insert(values = {}) {
    let dt = new Date().getTime()

    !values.created_time && (values.created_time = dt)
    !values.updated_time && (values.updated_time = dt)

    return await this.knex(this.table).returning(['id']).insert(values)
  }

  /**
   * 批量新增
   * @param {Array}  records  从中创建实例的对象列表（键/值对）
   * @returns knex对象
   */
  async batchInsert(records = []) {
    return await this.knex(this.table).insert(records)
  }

  /**
   * 新增或修改
   * @param {Object} values  值
   * @param {Object} where   where值
   */
  async insertOrUpdate(values = {}, where = {}) {
    let result = await this.count({ where: where })
    if (result) {
      return await this.update(values, where)
    }
    else {
      let dt = new Date().getTime()

      !values.created_time && (values.created_time = dt)
      !values.updated_time && (values.updated_time = dt)

      return await this.insert(values)
    }
  }

  /**
   * 修改
   * @param {Object} values  值
   * @param {Object} where   where值
   * @returns  记录
   */
  async update(values = {}, where = {}) {
    !values.updated_time && (values.updated_time = new Date().getTime())

    return await this.knex(this.table).update(values).where(where)
  }

  /**
   * 删除
   * @param {Object} where  where值
   * @returns  记录
   */
  async delete(where = {}) {
    return await this.knex(this.table).del({ where: where })
  }

  /**
   * 获取或新增
   * @param {Object} where     查询条件
   * @param {Object} defaults  默认值
   * @param {Array}  columns   显示字段
   * @returns  记录
   */
  async getOrInsert(where = {}, defaults = {}, columns) {
    let result = await this.get({ where: where }, columns)
    if (!result) {
      let dt = new Date().getTime()

      !values.created_time && (values.created_time = dt)
      !values.updated_time && (values.updated_time = dt)

      result = await this.insert(defaults)
    }
    return result
  }

  /**
   * 查询一条记录
   * @param {Object} where    参数(where)
   * @param {Array}  columns  显示字段
   * @returns 一条记录
   */
  get(where = {}, columns) {
    return this.knex(this.table).where(where).first(columns)
  }

  /**
   * 查询记录
   * @param {Object} options        参数
   * @param {Object} options.where  查询条件
   * @param {Array}  options.like   模糊查询
   * @param {Array}  options.order  排序
   * @param {Array}  columns        显示字段
   * @returns 记录列表
   */
  select(options = {}, columns) {
    if (options.index && isNaN(Number(options.index))) {
      return this.success(ctx, errorInfo.invalid('页码'))
    }
    if (options.size && isNaN(Number(options.size))) {
      return this.success(ctx, errorInfo.invalid('每页显示记录数'))
    }
    else if (Number(options.size) > 100) {
      return this.success(ctx, errorInfo.invalid('每页显示记录数不能大于100'))
    }

    options.index = Number(options.index) || 1
    options.size = Number(options.size) || 20

    let kx = this.knex(this.table).where(options.where)

    columns && (kx = kx.column(columns))
    kx = this._like(kx, options.like)
    kx = this._orderBy(kx, options.order)
    kx = kx.limit(options.size).offset((options.index - 1) * options.size)

    return kx
  }

  /**
   * 查询全部记录
   * @param {Object} options        参数
   * @param {Object} options.where  查询条件
   * @param {Array}  options.order  排序
   * @param {Array}  columns        显示字段
   * @returns 全部记录
   */
  findAll(options = {}, columns) {
    let kx = this.knex(this.table).where(options.where)

    columns && (kx = kx.column(columns))
    kx = this._orderBy(kx, options.order)

    return kx
  }

  /**
   * 记录数
   * @param {String} table          模块名
   * @param {Object} options        参数
   * @param {Object} options.where  查询条件
   * @param {Array}  options.order  排序
   * @param {String|Object} field   字段
   * @returns
   */
  count(options = {}, field) {
    let kx = this.knex(this.table)
    if (options.where) {
      kx = kx.where(options.where)
    }
    else {
      kx = kx.where(options)
    }
    kx = this._like(kx, options.like)
    kx = kx.count(field)
    return kx
  }

  /**
   * 总和
   * @param {String} field   字段(column|columns|raw)
   * @returns 总和
   */
  sum(field) {
    return this.knex(this.table).sum(field)
  }

  /**
   * 最大值
   * @param {String|Object} field  字段(column|columns|raw)
   * @returns 最大值
   */
  max(field) {
    return this.knex(this.table).max(field)
  }

  /**
   * 最小值
   * @param {String|Object} field  字段(column|columns|raw)
   * @returns 最小值
   */
  min(field) {
    return this.knex(this.table).min(field)
  }

  /**
   * 平均值
   * @param {String|Object} field  字段(column|columns|raw)
   * @returns 平均值
   */
  avg(field) {
    return this.knex(this.table).avg(field)
  }

  /**
   *
   * @param {Object} kx   knex对象
   * @param {Array} like [{name:'%name%'}]
   * @returns knex对象
   */
  _like(kx, like) {
    if (Array.isArray(like)) {
      like.forEach(o => {
        for (const k in o) {
          kx.andWhere(k, 'like', o[k])
        }
      })
    }
    return kx
  }
  /**
   *
   * @param {Object} kx   knex对象
   * @param {Array} order [['sort', 'ASC']]
   * @returns knex对象
   */
  _orderBy(kx, order) {
    if (Array.isArray(order)) {
      order.forEach(o => {
        kx.orderBy(o[0], o[1].toString().toLowerCase())
      })
    }
    return kx
  }
}

export default Service