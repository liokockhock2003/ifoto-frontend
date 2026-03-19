import { QueryClient, type QueryKey } from '@tanstack/react-query'

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 30000,
            retry: import.meta.env.PROD ? 3 : 0,
        },
    },
})

export const invalidateQuery = (...qk: QueryKey[]) => {
    return Promise.all(qk.map((queryKey) => queryClient.invalidateQueries({ queryKey })))
}
