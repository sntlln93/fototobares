import axios from 'axios';
import { useEffect } from 'react';

const useCsrfAutoRefresh = () => {
    useEffect(() => {
        const handleFocus = async () => {
            try {
                await axios.get('/sanctum/csrf-cookie'); // Refresh CSRF token
            } catch (error) {
                console.error('CSRF token expired. Reloading page...');
                window.location.reload(); // Reload if CSRF token is invalid
            }
        };

        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, []);
};

export default useCsrfAutoRefresh;
