import { ILogin } from '../store/auth';
import { processRequest } from './processor';

export const login = async (data: ILogin) => {
  const response = await processRequest({
    method: 'POST',
    url: 'auth/login',
    data,
  });
  const token = response.accessToken || '';
  localStorage.setItem('accessToken', token);
  if (response.user) {
    localStorage.setItem('user', JSON.stringify(response.user));
  }
  document.cookie = `accessToken=${token}; path=/; SameSite=Lax; max-age=604800`;
  return response;
};

export const forgotPassword = (email: string) =>
  processRequest({ method: 'POST', url: 'auth/forgot-password', data: { email } });

export const resetPassword = (token: string, newPassword: string) =>
  processRequest({ method: 'POST', url: 'auth/reset-password', data: { token, newPassword } });

export const logout = async () => {
  try {
    await processRequest({
      method: 'POST',
      url: 'auth/logout',
      showErrorToaster: false,
    });
  } catch {
    // clear local state regardless of API response
  }
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  sessionStorage.removeItem('accessToken');
  sessionStorage.removeItem('refreshToken');
  sessionStorage.removeItem('user');
  document.cookie = 'accessToken=; path=/; max-age=0';
};
