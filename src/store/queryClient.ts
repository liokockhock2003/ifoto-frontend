import { QueryClient } from '@tanstack/react-query'

export const invalidateQuery = <T>(...qk: T[][]) => {
    qk.forEach(async (queryKey) => {
        await queryClient.invalidateQueries({ queryKey })
    })
}

    export const queryClient = new QueryClient({
        defaultOptions: {
        queries: {
        staleTime: 30000,
    retry: import.meta.env.PROD ? 3 : 0,
    },
  },
})
