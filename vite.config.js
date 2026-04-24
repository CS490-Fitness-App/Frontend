import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
  server: {
    proxy: {
      '/auth': 'http://127.0.0.1:8000',
      '/admin': 'http://127.0.0.1:8000',
      '/chat': 'http://127.0.0.1:8000',
      '/clients': 'http://127.0.0.1:8000',
      '/coaches': 'http://127.0.0.1:8000',
      '/dashboard': 'http://127.0.0.1:8000',
      '/exercises': 'http://127.0.0.1:8000',
      '/notifications': 'http://127.0.0.1:8000',
      '/logs': 'http://127.0.0.1:8000',
      '/payments': 'http://127.0.0.1:8000',
      '/reviews': 'http://127.0.0.1:8000',
      '/uploads': 'http://127.0.0.1:8000',
      '/users': 'http://127.0.0.1:8000',
      '/workouts': 'http://127.0.0.1:8000',
    },
  },
})
