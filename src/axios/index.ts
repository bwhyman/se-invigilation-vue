import type { ResultVO } from '@/types'
import axios from 'axios'

axios.defaults.baseURL = '/api/'

axios.interceptors.request.use(
  (req) => {
    const auth = sessionStorage.getItem('token')
    // 判断,用于避免header包含authorization属性但数据值为空
    if (auth && req.headers) {
      req.headers.token = auth
    }
    return req
  },
  (error) => {
    return Promise.reject(error.message)
  }
)

// 递归实现反序列化为JS对象
function parseObject(data: unknown): unknown {
  if (typeof data !== 'object' || data === null) {
    return data
  }
  //
  if (Array.isArray(data)) {
    return data.map((item) => parseObject(item))
  }

  const obj = data as Record<string, unknown>
  const result: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(obj)) {
    let parsedValue: unknown = value
    if (Array.isArray(value)) {
      parsedValue = value.map((item) => parseObject(item))
    } else if (value !== null && typeof value === 'object') {
      parsedValue = parseObject(value)
    }
    //
    else if (typeof value === 'string') {
      if (value.startsWith('{"') || value.startsWith('[')) {
        try {
          const jsonParsed = JSON.parse(value)
          parsedValue = parseObject(jsonParsed)
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (_e) {
          parsedValue = value
        }
      }
    }
    result[key] = parsedValue
  }
  return result
}

axios.interceptors.response.use(
  (resp) => {
    if (resp.config.responseType === 'blob') {
      return resp
    }

    const data: ResultVO<any> = resp.data
    if (data.code === 200) {
      resp.data = parseObject(resp.data)
      return resp
    }

    return Promise.reject(data.message)
  },
  // 全局处理异常信息。即，http状态码不是200
  (error) => {
    return Promise.reject(error.message)
  }
)
export const useGet = async <T>(url: string) => {
  const resp = await axios.get<ResultVO<T>>(url)
  return resp.data.data
}

export const usePost = async <T>(url: string, data: unknown) => {
  const resp = await axios.post<ResultVO<T>>(url, data)
  return resp.data.data
}

export const usePut = async <T>(url: string) => {
  const resp = await axios.put<ResultVO<T>>(url)
  return resp.data.data
}

export const usePatch = async <T>(url: string, data: unknown) => {
  const resp = await axios.patch<ResultVO<T>>(url, data)
  return resp.data.data
}

export const useDelete = async <T>(url: string) => {
  const resp = await axios.delete<ResultVO<T>>(url)
  return resp.data.data
}

export default axios
