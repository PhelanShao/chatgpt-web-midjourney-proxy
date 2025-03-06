import type { AxiosProgressEvent, AxiosResponse, GenericAbortSignal } from 'axios'
import request from './axios'
import { useAuthStore } from '@/store'

export interface HttpOption {
  url: string
  data?: any
  method?: string
  headers?: any
  onDownloadProgress?: (progressEvent: AxiosProgressEvent) => void
  signal?: GenericAbortSignal
  beforeRequest?: () => void
  afterRequest?: () => void
}

export interface Response<T = any> {
  data: T
  message: string | null
  status: string
}

function http<T = any>(
  { url, data, method, headers, onDownloadProgress, signal, beforeRequest, afterRequest }: HttpOption,
) {
  const successHandler = (res: AxiosResponse<Response<T>>) => {
    const authStore = useAuthStore()

    console.log('API Response:', { url, status: res.status, data: res.data })

    if (res.data.status === 'Success' || typeof res.data === 'string')
      return res.data

    if (res.data.status === 'Unauthorized') {
      authStore.removeToken()
      window.location.reload()
    }

    return Promise.reject(res.data)
  }

  const failHandler = (error: any) => {
    console.error('API Error:', { url, error })
    afterRequest?.()
    
    // 提供更详细的错误信息
    if (error.response) {
      // 服务器返回了错误状态码
      console.error('Error response:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      })
      throw new Error(`请求失败: ${error.response.status} - ${error.response.data?.message || '未知错误'}`)
    } else if (error.request) {
      // 请求已发送但没有收到响应
      console.error('No response received:', error.request)
      throw new Error('服务器没有响应，请检查网络连接')
    } else {
      // 请求配置出错
      console.error('Request error:', error.message)
      throw new Error(`请求错误: ${error.message}`)
    }
  }

  beforeRequest?.()

  method = method || 'GET'
  console.log('API Request:', { url, method, data })

  const params = Object.assign(typeof data === 'function' ? data() : data ?? {}, {})

  return method === 'GET'
    ? request.get(url, { params, signal, onDownloadProgress }).then(successHandler, failHandler)
    : request.post(url, params, { headers, signal, onDownloadProgress }).then(successHandler, failHandler)
}

export function get<T = any>(
  { url, data, method = 'GET', onDownloadProgress, signal, beforeRequest, afterRequest }: HttpOption,
): Promise<Response<T>> {
  return http<T>({
    url,
    method,
    data,
    onDownloadProgress,
    signal,
    beforeRequest,
    afterRequest,
  })
}

export function post<T = any>(
  { url, data, method = 'POST', headers, onDownloadProgress, signal, beforeRequest, afterRequest }: HttpOption,
): Promise<Response<T>> {
  return http<T>({
    url,
    method,
    data,
    headers,
    onDownloadProgress,
    signal,
    beforeRequest,
    afterRequest,
  })
}

export default post
