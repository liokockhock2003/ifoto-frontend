// src/features/api/apiSlice.ts (or wherever)
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const photoApi = createApi({
    reducerPath: 'photoApi',
    baseQuery: fetchBaseQuery({
        baseUrl: '/api',  // relative → Vite proxies to backend
    }),
    endpoints: (builder) => ({
        // Calls /api/photos
        getPhotos: builder.query<{
            status: string
            photos: string[]
            count: number
        }, void>({
            query: () => '/photos',          // calls /api/photos
            // Optional: add providesTags later when using real data + mutations
            // providesTags: ['Photos'],
        }),

        // Calls /api/photos/test
        testConnection: builder.query<{ status: string; message: string }, void>({
            query: () => '/photos/test',
        }),

        // treat as plain text, no JSON.parse

        // Later: real get photos
        // getAllPhotos: builder.query<Photo[], void>({ query: () => '/photos' }),
    }),
})

export const {
    useGetPhotosQuery,
    useTestConnectionQuery,
    // useGetAllPhotosQuery,
} = photoApi