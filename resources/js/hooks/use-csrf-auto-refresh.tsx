import axios from 'axios';
import { useEffect } from 'react';

const getCookie = (name: string): string | null => {
    const match = document.cookie.match(`(^|;)\\s*${name}\\s*=\\s*([^;]+)`);
    return match ? decodeURIComponent(match[2]) : null;
};

const isCsrfTokenExpired = (): boolean => {
    const xsrfToken = getCookie('XSRF-TOKEN');
    if (!xsrfToken) {
        return true; // Token doesn't exist, considered expired
    }

    // If the token exists, check its expiration date
    const cookies = document.cookie.split('; ');
    const csrfCookie = cookies.find((cookie) =>
        cookie.startsWith('XSRF-TOKEN='),
    );

    if (csrfCookie) {
        const parts = csrfCookie.split(';');
        const expiresPart = parts.find((part) =>
            part.toLowerCase().startsWith('expires='),
        );

        if (expiresPart) {
            const expirationDate = new Date(expiresPart.split('=')[1]);
            return expirationDate < new Date();
        }
    }

    return false; // No expiration found, assume token is still valid
};

const useCsrfAutoRefresh = () => {
    useEffect(() => {
        const handleFocus = async () => {
            if (isCsrfTokenExpired()) {
                try {
                    await axios.get('/sanctum/csrf-cookie'); // Refresh CSRF token
                } catch (error) {
                    window.location.reload();
                }
            }
        };

        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, []);
};

export default useCsrfAutoRefresh;
