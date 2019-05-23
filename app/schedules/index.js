'use strict'

import nodeSchedule from 'node-schedule'

class Schedule {
  constructor(rule = {}) {
    this.nodeSchedule = nodeSchedule
    this.job = null
    this.rule = rule
  }

  start(callback) {

    // 每小时的30分钟执行
    let rule = new nodeSchedule.RecurrenceRule()
    this.rule.second && (rule.second = this.rule.second)
    this.rule.minute && (rule.minute = this.rule.minute)
    this.rule.hour && (rule.hour = this.rule.hour)
    this.rule.date && (rule.date = this.rule.date)
    this.rule.month && (rule.month = this.rule.month)
    this.rule.year && (rule.year = this.rule.year)
    this.rule.dayOfWeek && (rule.dayOfWeek = this.rule.dayOfWeek)

    this.job = nodeSchedule.scheduleJob(rule, () => {
      typeof callback === 'function' && (callback())
    })
  }

  cancel() {
    if (this.job) {
      this.job.cancel()
    }
  }
}

export default Schedule