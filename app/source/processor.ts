import axios, {
  RawAxiosRequestHeaders,
  AxiosHeaders,
  AxiosRequestConfig,
  AxiosError,
} from 'axios';
import qs from 'qs';
import { toast } from 'sonner';

const extractAxiosErrorMessage = (error: AxiosError | unknown): string => {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data;

    if (
      responseData &&
      Array.isArray(responseData.message) &&
      responseData.message.length > 0
    ) {
      return responseData.message.join('; ');
    }
    if (responseData && typeof responseData.message === 'string') {
      return responseData.message;
    }
    if (responseData && typeof responseData.error === 'string') {
      return responseData.error;
    }
    return error.message || 'An unknown network error occurred.';
  }
  return error instanceof Error
    ? error.message
    : 'An unexpected error occurred.';
};

export const processRequest = async ({
  method = 'GET',
  url = '',
  data = {},
  params = {},
  headers = {},
  showErrorToaster = true,
  customErrorMessage = '',
  customErrorData,
}: {
  method?: string;
  url?: string;
  data?: unknown;
  params?: unknown;
  headers?: RawAxiosRequestHeaders | AxiosHeaders;
  showErrorToaster?: boolean;
  customErrorMessage?: string;
  version?: string;
  customErrorData?: unknown;
}) => {
  const token =
    localStorage.getItem('accessToken') ||
    sessionStorage.getItem('accessToken');
  const requestParams: AxiosRequestConfig = {
    method,
    url: `${process.env.NEXT_PUBLIC_API_URL}/${url}`,
    data,
    params,
    paramsSerializer: (paramObject) =>
      qs.stringify(paramObject, { arrayFormat: 'repeat' }),
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  };

  try {
    const response = await axios(requestParams);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const statusCode = error.response?.status;
      const responseMessage = extractAxiosErrorMessage(error);

      console.error(
        `[Axios Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
      );
      console.error('Status Code:', statusCode);
      console.error('Response Data:', error.response?.data);

      if (responseMessage.includes('Account is not fully set up')) {
        return {
          verified: true,
          userId: error.response?.data.user_id,
        };
      }

      if (
        statusCode === 401 ||
        responseMessage.includes('invalid or inactive token')
      ) {
        const clearTokens = () => {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          sessionStorage.removeItem('accessToken');
          sessionStorage.removeItem('refreshToken');
          document.cookie = 'accessToken=; path=/; max-age=0';
        };

        if (typeof window !== 'undefined') {
          const currentPath = window.location.pathname;
          const authPages = [
            '/login',
            '/auth/login',
            '/account-verification',
            '/create-password',
            '/signup',
            '/forgot-password',
            '/invitation',
            '/temporary-password',
            '/queue-display',
          ];
          const isAuthPage =
            authPages.includes(currentPath) ||
            currentPath.startsWith('/invitation/') ||
            currentPath.startsWith('/forgot-password/');

          if (!isAuthPage) {
            clearTokens();
            window.location.href = '/login';
            throw error;
          }

          clearTokens();
          // Fall through to show the error toast on auth pages
        }
      }

      let finalErrorMessage = customErrorMessage || responseMessage;

      if (responseMessage.includes('Invalid user credentials')) {
        finalErrorMessage = 'Incorrect username or password.';
      } else if (responseMessage.includes('User exists with same email')) {
        finalErrorMessage =
          'A user with this email address already exists. Please use a different email address.';
      }

      if (showErrorToaster && finalErrorMessage) {
        toast.error(finalErrorMessage, {
          description: finalErrorMessage,
          duration: 1500,
          position: 'bottom-right',
        });
      }

      if (customErrorData) {
        return customErrorData;
      }

      throw error; // Throw the original AxiosError for more context
    } else {
      const errorMessage = extractAxiosErrorMessage(error);
      if (showErrorToaster) {
        toast.error(errorMessage, {
          description: errorMessage,
          duration: 1500,
          position: 'bottom-right',
        });
      }
      throw error; // Throw the original error for more context
    }
  }
};
