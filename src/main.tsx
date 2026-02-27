import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'   // ← changed from BrowserRouter
import { Provider } from 'react-redux'
import { store } from '@/store/store'
import { router } from '@/router'                    // ← import router
import '../css/globals.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />             {/* ← use RouterProvider */}
    </Provider>
  </StrictMode>
)