import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import process from 'node:process'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')
  const backendUrl = env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'
  const proxyTarget = { target: backendUrl, changeOrigin: true }

  return {
    plugins: [
      react({
        babel: {
          plugins: [['babel-plugin-react-compiler']],
        },
      }),
    ],
    server: {
      proxy: {
        '/auth': proxyTarget,
        '/admin': proxyTarget,
        '/chats': proxyTarget,
        '/clients': proxyTarget,
        '/coaches': proxyTarget,
        '/exercises': proxyTarget,
        '/notifications': proxyTarget,
        '/logs': proxyTarget,
        '/payments': proxyTarget,
        '/reviews': proxyTarget,
        '/uploads': proxyTarget,
        '/users': proxyTarget,
        '/workouts': proxyTarget,
      },
    },
  }
})
