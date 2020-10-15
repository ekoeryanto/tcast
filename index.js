const axios = require('axios')

const statusMap = {
  '0': 'success',
  '-1':'Authentication error',
  '-2':'IP limited access',
  '-3':'SMS contain sensitive characters',
  '-4':'SMS contain is empty',
  '-5':'SMS contain is too long',
  '-6':'Not a template SMS',
  '-7':'Over number',
  '-8':'Number is empty',
  '-9':'Abnormal number',
  '-10':'The channel balance is insufficient to satisfy this transmission',
  '-11':'The timing is wrong',
  '-12':'Because of the platform, batch commit error, please contact the administrator',
  '-13':' User locked',
  '-14': 'Query id abnormal'
}

class TCast {
  constructor(baseURL, credentials, requestConfig) {
    this.api = axios.create({
      baseURL,
      ...requestConfig
    })

    this.api.interceptors.request.use(config => {
      if (config.method === 'get') {
        config.params = {
          ...config.params,
          ...credentials
        }
      }

      if (['post', 'put', 'patch'].includes(config.method)) {
        config.data = {
          ...config.data,
          ...credentials
        }
      }
      return config
    })
  }

  verifyStatus(response) {
    if (response.status !== 0) {
      throw new Error(statusMap[response.status] || 'Unknown error')
    }
  }

  parseTime(dateString) {
    const darr = [
      dateString.slice(0, 4),
      dateString.slice(4, 6),
      dateString.slice(6, 8)
    ]
    const tarr = [
      dateString.slice(8, 10),
      dateString.slice(10, 12),
      dateString.slice(12, 14),
    ]

    return new Date(`${darr.join('-')} ${tarr.join(':')}`)
  }

  formatTime(dateTime) {
    return new Date(dateTime).toISOString().replace(/\D+/g, '').slice(0, 14)
  }

  b64Decode(b64s) {
    return globalThis.atob
      ? globalThis.atob(b64s)
      : Buffer.from(b64s, 'base64').toString()
  }

  async send(numbers, content, schedule) {
    if (Array.isArray(numbers)) {
      numbers = numbers.join(',')
    }

    if (schedule) {
      schedule = this.formatTime(schedule)
    }

    const { data } = await this.api.post('/sendsms', {
      numbers,
      content,
      sendtime: schedule
    })

    const resultMap = data.array.map(result => {
      return {
        id: result[1],
        number: result[0]
      }
    })

    return {
      total: {
        success: data.success,
        fail: data.fail,
      },
      result: resultMap
    }
  }

  async balance() {
    const { data } = await this.api.get('/getbalance')

    this.verifyStatus(data)

    const balance = +data.balance
    const gift = +data.gift

    return {
      balance,
      gift,
      total: balance + gift
    }
  }

  async messages(start_time) {
    const params = {
      start_time,
    }
    const { data } = await this.api.get('/getsms', { params })

    this.verifyStatus(data)

    const messagesMap = data.array.map(msg => {
      const [id, number, time, message] = msg
      return { id, number, time: this.parseTime(time), message: this.b64Decode(message)}
    })

    return  { total: data.cnt, result: messagesMap }
  }

  async reports (ids) {
    if (Array.isArray(ids)) {
      ids = ids.join(',')
    }

    const { data } = await this.api.get('/getreport', {
      params: { ids }
    })

    this.verifyStatus(data)

    const {
      fail,
      success,
      unsent,
      sending,
      nofound,
      array: result
    } = data

    const statusMap = ['sent', 'unsent', 'sending']
    const reportsMap = result.map(row => {
      const [id, number, time, statId] = row
      return {
        id,
        number,
        time: this.parseTime(time),
        status: statusMap[statId] || 'fail'
      }
    })

    return {
      total: {
        sent: success,
        unsent,
        sending,
        notFound: nofound,
        fail,
      },
      result: reportsMap
    }
  }
}

module.exports = TCast
