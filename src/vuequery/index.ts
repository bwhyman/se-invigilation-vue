import { QueryClient } from '@tanstack/vue-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      suspense: true,
      throwOnError: (error) => {
        console.log(error)
        // Return true to throw error, false otherwise
        return true
      },
      staleTime: Infinity,
      retry: false
    },
    mutations: {
      throwOnError: (error) => {
        console.log(error)
        // Return true to throw error, false otherwise
        return true
      }
    }
  }
})

export default queryClient
