import axios from 'axios'
import { Loading, MessageBox } from 'element-ui'
import qs from 'qs'
import { getToken } from '@/utils/auth'

const host = 'http://52.83.114.95:8081'

// 创建axios实例
const service = axios.create({
  timeout: 30000
})

// request拦截器1
service.interceptors.request.use(config => {
  return config
}, error => {
  console.log(error)
  MessageBox({
    title: '提示',
    message: '加载超时',
    type: 'error'
  }).then(() => {
    window.location.reload()
  })
  return Promise.reject(error)
})

// response拦截器
service.interceptors.response.use(data => {
  return data
}, error => {
  console.log(error)
  MessageBox({
    title: '提示',
    message: '加载失败，请检查网络',
    type: 'error'
  }).then(() => {
    window.location.reload()
  })
  return Promise.reject(error)
})

function post(url, data = {}, loading = true) {
  return service.post(`${host}${url}`, qs.stringify(data)).then((res) => {
    if (res.data.code == 200) {
      return Promise.resolve(res.data)
    } else {
      MessageBox({
        title: '提示',
        message: res.data.msg,
        type: 'error'
      })
      return Promise.reject(res.data)
    }
  })
}
function postFile(url, data = {}) {
  return service.post(`${host}${url}`, data).then((res) => {
    if (res.data.code == 200) {
      return Promise.resolve(res.data)
    } else {
      MessageBox({
        title: '提示',
        message: res.data.msg,
        type: 'error'
      })
      return Promise.reject(res.data)
    }
  })
}
function ecoisPost(url, data = {}) {
  return service.post(`${url}`, data, {
    headers: {
      'Authorization': getToken('ecois_token')
    }
  }).then((res) => {
    if (res.data.code == 200) {
      return Promise.resolve(res.data)
    } else {
      MessageBox({
        title: '提示',
        message: res.data.msg,
        type: 'error'
      })
      return Promise.reject(res.data)
    }
  })
}
function get(url, data = {}) {
  return service.get(url, {
    params: data,
    headers: {
      'Authorization': getToken('ecois_token') ? getToken('ecois_token').token : ''
    }
  }).then(res => {
    return Promise.resolve(res.data)
  })
}

export {
  host,
  post,
  get,
  postFile,
  ecoisPost
}