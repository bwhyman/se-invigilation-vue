export const createElLoading = (msg: string = 'Loading') => {
  return ElLoading.service({
    lock: true,
    text: msg,
    background: 'rgba(0, 0, 0, 0.7)'
  })
}

// 函数重载 - 声明两种调用方式
export function createElLoadingX<T>(pro: Promise<T>): Promise<T>
export function createElLoadingX(pro?: undefined): ReturnType<typeof ElLoading.service>

// 函数实现
export function createElLoadingX<T>(
  pro?: Promise<T>
): Promise<T> | ReturnType<typeof ElLoading.service> {
  const loading = ElLoading.service({
    lock: true,
    text: 'Loading',
    background: 'rgba(0, 0, 0, 0.7)'
  })
  if (!pro) {
    return loading
  }
  return pro.then(
    (result) => {
      loading && loading.close()
      return result
    },
    (error) => {
      loading && loading.close()
      throw error
    }
  )
}
