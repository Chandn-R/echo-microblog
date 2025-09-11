import axios from 'axios';

// This is our simple, non-React token store
let accessToken: string | null = null;

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  withCredentials: true // Important for sending the httpOnly refresh token cookie
});

// A function to set the token from outside (e.g., from our AuthContext)
export const setApiAccessToken = (token: string | null) => {
    accessToken = token;
}

// A function to get the current token
export const getApiAccessToken = () => accessToken;


let isRefreshing = false;
let failedQueue: Array<{ resolve: (value: unknown) => void, reject: (reason?: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// --- AXIOS INTERCEPTORS ---

// Request Interceptor: Attach the token to every request
api.interceptors.request.use(
    (config) => {
      if (accessToken) {
        config.headers['Authorization'] = `Bearer ${accessToken}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Handle token expiry and refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Check if the error is 401 Unauthorized and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            
            if (isRefreshing) {
                // If a refresh is already in progress, queue the request
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                .then(token => {
                    originalRequest.headers['Authorization'] = 'Bearer ' + token;
                    return axios(originalRequest);
                })
                .catch(err => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const response = await api.post('/auth/refresh');
                // Corrected path based on your AuthContext console.log
                const newAccessToken = response.data.data.accessToken; 
                
                // Update the token in our store
                setApiAccessToken(newAccessToken); 
                
                // Update the header of the original request
                originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

                // Process the queue with the new token
                processQueue(null, newAccessToken);
                
                // Retry the original request
                return api(originalRequest);

            } catch (refreshError) {
                // If refresh fails, reject all queued requests and clear token
                processQueue(refreshError, null);
                setApiAccessToken(null);
                // Optionally, you can redirect to login here
                // window.location.href = '/login'; 
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }
        return Promise.reject(error);
    }
);

export default api;