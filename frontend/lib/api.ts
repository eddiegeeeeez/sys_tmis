export const getApiUrl = () => {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5009';
};

export const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
    const baseUrl = getApiUrl();
    const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    console.log(`Fetching: ${url}`);

    // Get token from localStorage if available
    const token = typeof window !== 'undefined' ? localStorage.getItem('tmis_token') : null;

    const defaultHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    // Add authorization header if token exists
    if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    };

    try {
        const response = await fetch(url, config);

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API Request Failed:', error);
        if (error instanceof TypeError && error.message === 'Failed to fetch') {
            console.error('Possible causes: Backend not running, wrong port, CORS issue, or self-signed certificate not trusted.');
        }
        throw error;
    }
};
