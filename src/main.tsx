import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from '@/store/store'
import { router } from '@/router'
import { ThemeProvider } from '@/components/theme-provider'  // ← add this
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">  {/* ← add this */}
        <RouterProvider router={router} />
      </ThemeProvider>
    </Provider>
  </StrictMode>
)