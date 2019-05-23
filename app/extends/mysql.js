'use strict'

import mysql from 'mysql'
import util from 'util'

/**
 * mysql
 * @param {Object} options
 * @param {String} options.connectionLimit  连接数限制
 * @param {String} options.queueLimit       队列限制
 * @param {String} options.host             主机
 * @param {String} options.port             端口
 * @param {String} options.user             用户
 * @param {String} options.password         密码
 * @param {String} options.database         数据库名
 */
class Mysql {
  constructor(options = {}) {
    this.options = options
    // 是否是创建pool
    this.isPool = !!(options.connectionLimit || options.queueLimit != undefined)
    // 是否是事务操作
    this.isTransaction = false

    let o = {
      host: options.host,
      user: options.user,
      password: options.password,
    }

    if (options.database) {
      o.database = options.database
    }

    if (this.isPool) {
      o.connectionLimit = options.connectionLimit || 10
      o.queueLimit = options.queueLimit || 0
      this.connection = mysql.createPool(o)
    }
    else {
      this.connection = mysql.createConnection(o)
    }

    o = null
  }

  /**
   * 数据库连接
   */
  connect() {
    return new Promise((resolve, reject) => {
      this.connection[this.isPool ? 'getConnection' : 'connect'](async (err) => {
        if (err) {
          console.log(`connectError:${err}`)
          reject({ code: 500, data: '', msg: err.code })
        }

        if (this.options.database) {
          await this.use(this.options.database)
        }

        resolve({ code: 200, data: this.connection.threadId, msg: '数据库连接成功' })
      })
    })
  }

  /**
   * 数据库断连接
   */
  end() {
    return new Promise((resolve, reject) => {
      this.connection.end(err => {
        if (err) {
          console.log(`endError:${err}`)
          reject({ code: 500, data: '', msg: err.code })
        }
        resolve({ code: 200, data: '', msg: '数据库断连接成功' })
      })
    })
  }

  /**
   * 执行sql语句
   * @param {String} sql   sql语句
   * @param {Array} values 值(?)
   */
  query(sql, values = []) {
    return new Promise(async (resolve, reject) => {
      if (this.options.debug) {
        console.log(sql)
      }
      this.connection.query(sql, values, (err, results, fields) => {
        if (err) {
          console.log(`queryError:${err}`)
          if (this.isTransaction) {
            this.connection.rollback(() => {
              reject({ code: 500, data: '', msg: err.code })
            })
          }
          reject({ code: 500, data: '', msg: err.code })
        }
        // if (this.isPool) {
        //   this.connection.release()
        // }
        resolve({ code: 200, data: results, msg: '执行成功' })
      })
    })
  }

  /**
   * 事务
   * @param {Function} callback  回调函数
   *
   */
  transaction(callback) {
    this.connection.beginTransaction(err => {
      this.isTransaction = true
      if (err) {
        console.log(`beginTransactionError:${err}`)
        return { code: 500, data: '', msg: err.code }
      }
      typeof callback === 'function' && (callback(this))
    })
  }

  /**
   * 事务执行
   */
  commit() {
    return new Promise(async (resolve, reject) => {
      this.connection.commit(err => {
        this.isTransaction = false
        if (err) {
          console.log(`commitError:${err}`)
          this.connection.rollback(() => {
            reject({ code: 500, data: '', msg: err.code })
          })
        }
        resolve({ code: 200, data: '', msg: '' })
      })
    })
  }

  // #region 数据库

  /**
   * 创建数据库
   * @param {String} database_name 数据库名
   */
  async createDatabase(database_name) {
    return await this.query(`CREATE DATABASE IF NOT EXISTS ${database_name} DEFAULT CHARSET utf8 COLLATE utf8_general_ci`)
  }

  /**
   * 删除数据库
   * @param {String} database_name 数据库名
   */
  async dropDatabase(database_name) {
    return await this.query(`DROP DATABASE IF EXISTS ${database_name}`)
  }


  /**
   * 使用数据库
   * @param {String} database_name 数据库名
   */
  async use(database_name) {
    return await this.query(`USE ${database_name}`)
  }

  // #endregion

  // #region 表

  /**
   * 创建表
   * @param {String} table_name                表名
   * @param {String} table_comment             表名备注
   * @param {Array} columns                    列信息
   * @param {String} columns[0].name           列名称*
   * @param {String} columns[0].type           类型*
   * @param {Number|String} columns[0].length  长度
   * @param {String} columns[0].point          小数点
   * @param {Boolean} columns[0].notNull       是否不为空
   * @param {String} columns[0].default        默认值
   * @param {String} columns[0].comment        备注
   * @param {Boolean} columns[0].isKey         是否为主键
   */
  async createTable(table_name, columns = [], table_comment) {
    if (!table_name) return { code: 1001, data: '', msg: '表名不能为空' }

    let columnArray = []
    if (columns.length == 0) {
      columnArray.push('`id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY')
    }
    else {
      for (let i = 0; i < columns.length; i++) {
        const col = columns[i]
        if (!col.name) {
          return { code: 1001, data: '', msg: '名称不能为空' }
        }
        else if (!col.type) {
          return { code: 1001, data: '', msg: '类型不能为空' }
        }

        let sql = ''
        let type = col.type.toLowerCase()
        if (type.indexOf('int') > -1 || type.indexOf('char') > -1 || type.indexOf('binary') > -1 || type == 'bit' || type.indexOf('enum') > -1) {
          type = `${type}(${col.length || 11})`
        }
        else if (type.indexOf('decimal') > -1 || type.indexOf('num') > -1 || type.indexOf('float') > -1 || type.indexOf('double') > -1 || type.indexOf('real') > -1) {
          type = `${type}(${col.length || 10},${col.point || 2})`
        }

        let arr = []
        arr.push(this.connection.escapeId(col.name))
        arr.push(type)
        if (col.isKey) {
          arr.push('NOT NULL')
          arr.push('AUTO_INCREMENT')
          arr.push('PRIMARY KEY')
        }
        else {
          if (col.notNull) {
            arr.push('NOT NULL')
          }
          if (col.default != undefined) {
            if (col.default != 'NULL') {
              arr.push(`DEFAULT '${col.default}'`)
            }
            else {
              arr.push('DEFAULT NULL')
            }
          }

        }
        if (col.comment) {
          arr.push(`COMMENT '${col.comment}'`)
        }

        sql = arr.join(' ')
        arr = []
        columnArray.push(sql)
        sql = ''
      }
    }

    table_comment = table_comment ? ` COMMENT='${table_comment}'` : ''

    return await this.query(`CREATE TABLE IF NOT EXISTS ${table_name}(${columnArray.join(',')}) ENGINE=InnoDB DEFAULT CHARSET=utf8${table_comment}`)
  }

  /**
   * 重命名表
   * @param {String} old_name 表旧名
   * @param {String} new_name 表新名
   */
  async renameTable(old_name, new_name) {
    return await this.query(`RENAME TABLE IF EXISTS ${old_name} TO ${new_name}`)
  }

  /**
   * 删除表
   * @param {String} table_name 表名
   */
  async dropTable(table_name) {
    return await this.query(`DROP TABLE IF EXISTS ${table_name}`)
  }

  /**
   * 创建外键
   * @param {String} src_table     源表名
   * @param {String} constraint    约束
   * @param {String} src_column    源列名
   * @param {String} target_table  目标表名
   * @param {String} target_column 目标列名
   */
  async createForeignKey(src_table, constraint, src_column, target_table, target_column) {
    return await this.query(`ALTER TABLE ${src_table}
     ADD CONSTRAINT ${constraint}
     FOREIGN KEY(${src_column})
     REFERENCES ${target_table}(${target_column})`)
  }

  /**
   * 删除外键
   * @param {String} table_name    表名
   * @param {String} constraint    约束
   */
  async dropForeignKey(table_name, constraint) {
    return await this.query(`ALTER TABLE ${table_name}
    DROP FOREIGN KEY ${constraint}`)
  }

  // #endregion

  // #region  列

  /**
   * 创建列
   * @param {String} table_name   表名
   * @param {String} column_name  列名
   * @param {String} datatype     数据类型
   */
  async createColumn(table_name, column_name, datatype) {
    return await this.query(`DROP TABLE ${table_name}
    ADD ${column_name} ${datatype}`)
  }

  /**
   * 修改列
   * @param {String} table_name   表名
   * @param {String} column_name  列名
   * @param {String} datatype     数据类型
   */
  async updateColumn(table_name, column_name, datatype) {
    if (!table_name) return { code: 1001, data: '', msg: '表名不能为空' }
    if (!column_name) return { code: 1001, data: '', msg: '列名不能为空' }
    if (!datatype) return { code: 1001, data: '', msg: '数据类型不能为空' }

    return await this.query(`DROP TABLE ${table_name}
    ALTER COLUMN ${column_name} ${datatype}`)
  }

  /**
   * 删除列
   * @param {String} table_name   表名
   * @param {String} column_name  列名
   */
  async dropColumn(table_name, column_name) {
    if (!table_name) return { code: 1001, data: '', msg: '表名不能为空' }
    if (!column_name) return { code: 1001, data: '', msg: '列名不能为空' }

    return await this.query(`DROP TABLE ${table_name}
    DROP COLUMN ${column_name}`)
  }
  // #endregion

  /**
   * 插入
   * @param {String} table_name 表名
   * @param {Array} columns     列信息
   */
  async insert(table_name, columns = []) {
    if (!table_name) return { code: 1001, data: '', msg: '表名不能为空' }
    if (columns.length == 0) return { code: 1001, data: '', msg: '列不能为空' }
    return await this.query(`INSERT INTO ${table_name}(${Object.keys(columns[0]).join(',')}) VALUES ${columns.map(col => {
      let cArr = []
      for (const key in col) {
        cArr.push(mysql.escape(col[key]))
      }
      return `(${cArr.join(',')})`
    }).join(',')}`)
  }

  /**
   * 删除
   * @param {String} table_name 表名
   * @param {Object} where      条件
   */
  async delete(table_name, where = {}) {
    if (!table_name) return { code: 1001, data: '', msg: '表名不能为空' }
    let wheres = []
    for (const key in where) {
      wheres.push(`${key} = '${where[key]}'`)
    }
    if (wheres.length) {
      let whereStr = wheres.join(' and ')
      wheres = null
      return await this.query(`DELETE FROM ${table_name} WHERE ${whereStr}`)
    }
    else {
      return await this.query(`DELETE FROM ${table_name}`)
    }
  }

  /**
   * 修改
   * @param {String} table_name 表名
   * @param {Object} data       数据
   * @param {Object} where      条件
   */
  async update(table_name, data = {}, where = {}) {
    if (!table_name) return { code: 1001, data: '', msg: '表名不能为空' }
    let datas = []
    for (const key in data) {
      datas.push(`${key} = '${data[key]}'`)
    }
    if (datas.length == 0) return { code: 1001, data: '', msg: '修改数据不能为空' }
    let dataStr = datas.join(' , ')
    datas = null

    let wheres = []
    for (const key in where) {
      wheres.push(`${key} = '${where[key]}'`)
    }
    if (wheres.length) {
      let whereStr = wheres.join(' and ')
      wheres = null
      return await this.query(`UPDATE ${table_name} SET ${dataStr} WHERE ${whereStr}`)
    }
    else {
      return await this.query(`UPDATE ${table_name} SET ${dataStr}`)
    }
  }

  /**
   * 查询
   * @param {String}        table_name  表名
   * @param {String|Array}  columns     列
   * @param {String|Object} where       where条件
   */
  async select(table_name, columns = '*', where) {
    if (!table_name) return { code: 1001, data: '', msg: '表名不能为空' }
    let sql = 'select '
    if (typeof columns === 'string') {
      sql += columns
    }
    else if (Array.isArray(columns)) {
      sql += columns.join(',')
    }
    sql += ` from ${table_name}`

    if (typeof where === 'string') {
      sql += ` where ${where}`
    }
    else if (Object.prototype.toString.call() === '[object Object]') {
      let wheres = []
      for (const key in where) {
        wheres.push(`${key} = '${where[key]}'`)
      }
      if (wheres.length) {
        sql += ` where ${wheres.join(' and ')}`
      }
    }
    return await this.query(sql)
  }


  // #region 通用查询

  /**
   * 数据库列表
   * @returns
   * CATALOG_NAME:def',
   * SCHEMA_NAME:名称
   * DEFAULT_CHARACTER_SET_NAME:字符集
   * DEFAULT_COLLATION_NAME:字符集校对
   * SQL_PATH: null
   */
  async databases() {
    return await this.query('SELECT * FROM `information_schema`.`SCHEMATA`')
  }

  /**
   * 表列表
   * @param {String} database_name 数据库名
   * @returns
   * TABLE_CATALOG: 'def'
   * TABLE_SCHEMA:数据库名
   * TABLE_NAME: 表名
   * TABLE_TYPE: 'BASE TABLE'
   * ENGINE: 类型
   * VERSION: 10
   * ROW_FORMAT: 行格式
   * TABLE_ROWS: 记录计数
   * AVG_ROW_LENGTH: 0
   * DATA_LENGTH: 数据已用内存
   * MAX_DATA_LENGTH: 0
   * INDEX_LENGTH: 索引已用内存
   * DATA_FREE: 0
   * AUTO_INCREMENT: 自增
   * CREATE_TIME: 创建时间
   * UPDATE_TIME: 最近更新时间
   * CHECK_TIME: null
   * TABLE_COLLATION: 字符集校对
   * CHECKSUM: null
   * CREATE_OPTIONS: ''
   * TABLE_COMMENT: 表名备注
   */
  async tables(database_name) {
    database_name = database_name || this.options.database
    return await this.query('select * from information_schema.tables where table_schema=? and table_type=?', [database_name, 'base table'])
  }

  /**
   * 视图列表
   * @param {String} database_name 数据库名
   * @returns
   * TABLE_CATALOG: 'def'
   * TABLE_SCHEMA: 数据库名
   * TABLE_NAME: 视图名
   * VIEW_DEFINITION: 源代码
   * CHECK_OPTION: 'NONE'
   * IS_UPDATABLE: 'NO'
   * DEFINER: 'root@localhost' 定义
   * SECURITY_TYPE: 'INVOKER'
   * CHARACTER_SET_CLIENT: 'utf8' 字符集
   * COLLATION_CONNECTION: 'utf8_general_ci' 字符集校对
   */
  async views(database_name) {
    database_name = database_name || this.options.database
    return await this.query('select * from information_schema.views where table_schema=? ', [database_name])
  }

  /**
   * 触发器列表
   * @param {String} database_name 数据库名
   * @returns
   * TRIGGER_CATALOG: 'def'
   * TRIGGER_SCHEMA: 数据库名
   * TRIGGER_NAME: 触发器名
   * EVENT_MANIPULATION: 'INSERT'
   * EVENT_OBJECT_CATALOG: 'def'
   * EVENT_OBJECT_SCHEMA: 'sakila'
   * EVENT_OBJECT_TABLE: 'payment'
   * ACTION_ORDER: 1
   * ACTION_CONDITION: null
   * ACTION_STATEMENT: 'SET NEW.payment_date = NOW()'
   * ACTION_ORIENTATION: 'ROW'
   * ACTION_TIMING: 'BEFORE'
   * ACTION_REFERENCE_OLD_TABLE: null
   * ACTION_REFERENCE_NEW_TABLE: null
   * ACTION_REFERENCE_OLD_ROW: 'OLD'
   * ACTION_REFERENCE_NEW_ROW: 'NEW'
   * CREATED: 2018-11-25T02:21:19.820Z
   * SQL_MODE: 源代码
   * DEFINER: 'root@localhost'
   * CHARACTER_SET_CLIENT: 'utf8' 字符集
   * COLLATION_CONNECTION: 'utf8_general_ci' 字符集校对
   * DATABASE_COLLATION: 'utf8_general_ci'
   */
  async triggers(database_name) {
    database_name = database_name || this.options.database
    return await this.query('select * from information_schema.`TRIGGERS`where TRIGGER_SCHEMA=?', [database_name])
  }

  /**
   * 列列表
   * @param {String} table_name    表名
   * @param {String} database_name 数据库名
   * @returns
   * TABLE_CATALOG: 'def'
   * TABLE_SCHEMA: 数据库名
   * TABLE_NAME: 表名
   * COLUMN_NAME: 列名
   * ORDINAL_POSITION: 1
   * COLUMN_DEFAULT: null
   * IS_NULLABLE: 是否为空
   * DATA_TYPE: 类型
   * CHARACTER_MAXIMUM_LENGTH: 最大长度
   * CHARACTER_OCTET_LENGTH: null
   * NUMERIC_PRECISION: 10
   * NUMERIC_SCALE: 0
   * DATETIME_PRECISION: null
   * CHARACTER_SET_NAME: null
   * COLLATION_NAME: null
   * COLUMN_TYPE: 'int(11)'
   * COLUMN_KEY: 'PRI'
   * EXTRA: 'auto_increment'
   * PRIVILEGES: 'select,insert,update,references'
   * COLUMN_COMMENT: 列名备注
   * GENERATION_EXPRESSION: ''
   */
  async columns(table_name, database_name) {
    database_name = database_name || this.options.database
    return await this.query('select * from information_schema.columns where table_schema=? and table_name=?', [database_name, table_name])
  }

  // #endregion

}

export default Mysql