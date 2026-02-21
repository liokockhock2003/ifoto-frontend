// src/app/store.ts
import { configureStore } from '@reduxjs/toolkit'
import { photoApi } from '@/features/api/apiSlice'  // ← adjust path if your slice is elsewhere (e.g. '../features/api/apiSlice')

export const store = configureStore({
    reducer: {
        // Add other reducers here later (e.g. auth, ui, etc.)
        // For now, at minimum:
        [photoApi.reducerPath]: photoApi.reducer,  // ← THIS LINE IS REQUIRED
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(photoApi.middleware),  // ← THIS LINE IS REQUIRED
})

// Optional but useful for TypeScript inference
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch