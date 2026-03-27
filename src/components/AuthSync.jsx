import { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';

const BASE_URL = 'http://localhost:8000';

export const AuthSync = () => {
    const { isAuthenticated, isLoading, getAccessTokenSilently, getIdTokenClaims } = useAuth0();
    const navigate = useNavigate();

    useEffect(() => {
        if (isLoading) return;
        if (!isAuthenticated) {
            localStorage.removeItem('token');
            sessionStorage.removeItem('pendingAuth');
            sessionStorage.removeItem('pendingSignup');
            return;
        }

        (async () => {
            try {
                const token = await getAccessTokenSilently();
                localStorage.setItem('token', token);

                if (!sessionStorage.getItem('pendingAuth')) return;
                sessionStorage.removeItem('pendingAuth');

                const raw = sessionStorage.getItem('pendingSignup');
                const signupData = raw ? JSON.parse(raw) : null;
                if (raw) sessionStorage.removeItem('pendingSignup');

                const idTokenClaims = await getIdTokenClaims();
                const endpoint = signupData ? '/auth/signup' : '/auth/login';
                const body = signupData
                    ? { email: idTokenClaims?.email, first_name: signupData.first_name, last_name: signupData.last_name, role: signupData.role, profile_picture: idTokenClaims?.picture ?? null }
                    : { email: idTokenClaims?.email };

                let res = await fetch(`${BASE_URL}${endpoint}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify(body),
                });

                if (res.status === 409) {
                    res = await fetch(`${BASE_URL}/auth/login`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                        body: JSON.stringify({ email: idTokenClaims?.email }),
                    });
                }

                if (res.ok) navigate('/client-dashboard');
            } catch (err) {
                console.error('AuthSync error:', err);
            }
        })();
    }, [isAuthenticated, isLoading, getAccessTokenSilently, getIdTokenClaims, navigate]);

    return null;
};
