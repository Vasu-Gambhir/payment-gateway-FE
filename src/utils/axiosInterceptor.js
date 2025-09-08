import axios from 'axios';
import { toast } from 'react-toastify';

let isSessionExpired = false;

export const setupAxiosInterceptors = (logout, navigate) => {
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 403 || error.response?.status === 401) {
        if (!isSessionExpired) {
          isSessionExpired = true;
          
          const errorMessage = error.response?.data?.error || 'Session expired';
          
          if (errorMessage.toLowerCase().includes('expired') || 
              errorMessage.toLowerCase().includes('unauthorized') ||
              errorMessage.toLowerCase().includes('forbidden')) {
            
            toast.error('Session expired. Please log in again to continue.', {
              position: "top-center",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            });
            
            logout();
            navigate('/signin');
            
            setTimeout(() => {
              isSessionExpired = false;
            }, 3000);
          }
        }
      }
      return Promise.reject(error);
    }
  );
};

export const resetSessionExpiredFlag = () => {
  isSessionExpired = false;
};