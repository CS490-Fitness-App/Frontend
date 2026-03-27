import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { Auth0Provider } from '@auth0/auth0-react'

const auth0Domain = import.meta.env.VITE_AUTH0_DOMAIN
const auth0ClientId = import.meta.env.VITE_AUTH0_CLIENT_ID
const auth0Audience = import.meta.env.VITE_AUTH0_AUDIENCE

const appTree = (
    <BrowserRouter>
        <App />
    </BrowserRouter>
)

createRoot(document.getElementById('root')).render(
    <StrictMode>
        {auth0Domain && auth0ClientId ? (
            <Auth0Provider
                domain={auth0Domain}
                clientId={auth0ClientId}
                authorizationParams={{
                    redirect_uri: window.location.origin,
                    audience: auth0Audience,
                }}
                cacheLocation="localstorage"
                useRefreshTokens
            >
                {appTree}
            </Auth0Provider>
        ) : (
            appTree
        )}
  </StrictMode>,
)
