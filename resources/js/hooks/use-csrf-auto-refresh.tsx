import axios from 'axios';
import { useEffect } from 'react';

const TOKEN_REFRESH_INTERVAL = 90 * 60 * 1000; // 90 minutes in milliseconds
const STORAGE_KEY = 'lastCsrfRefreshTime';

const useCsrfAutoRefresh = () => {
    useEffect(() => {
        const handleFocus = async () => {
            const lastRefresh = localStorage.getItem(STORAGE_KEY);
            const now = Date.now();

            if (
                !lastRefresh ||
                now - parseInt(lastRefresh, 10) >= TOKEN_REFRESH_INTERVAL
            ) {
                try {
                    await axios.get('/sanctum/csrf-cookie'); // Refresh CSRF token
                    localStorage.setItem(STORAGE_KEY, now.toString()); // Update last refresh time
                } catch (error) {
                    console.error('CSRF token expired. Reloading page...');
                    window.location.reload(); // Reload if CSRF token is invalid
                }
            }
        };

        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, []);
};

export default useCsrfAutoRefresh;
