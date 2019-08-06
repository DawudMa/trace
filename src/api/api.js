import { post, get, ecoisPost } from './config'

// 登录
export function ajaxLogin(data = {}) {
  return post('/jthk/public/index.php/api/user/login', data)
}

// 获取地块列表
export function land_message(data = {}) {
  return post('/jthk/public/index.php/api/user/land_message', data)
}

// 添加地块
export function add_land(data = {}) {
  return post('/jthk/public/index.php/api/user/add_land', data)
}

// 删除地块
export function del_land(data = {}) {
  return post('/jthk/public/index.php/api/user/del_land', data)
}

// 获取所有地块信息
export function sentinel_info(data = {}) {
  return post('/jthk/public/index.php/api/user/sentinel_info', data)
}

// 获取地块列表
export function sel_land_path(data = {}) {
  return post('/jthk/public/index.php/api/user/sel_land_path', data)
}

// 获取所有地块列表
export function sel_land(data = {}) {
  return post('/jthk/public/index.php/api/user/sel_land', data)
}

// ecois获取授权码
export function getEcoisToken(data = {}) {
  return get('http://openapi.ecois.info/v3/token', data)
}

// ecois获取设备列表
export function getEcoisDevices(data = {}) {
  return get('http://openapi.ecois.info/v3/devices', data)
}