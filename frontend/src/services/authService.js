import axios from 'axios';

// ✅ FIXED: Removed extra '/auth/' from URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5050/api';

// Register user
const register = async (userData) => {
  const response = await axios.post(`${API_URL}/auth/register`, userData);

  if (response.data.success) {
    localStorage.setItem('user', JSON.stringify(response.data.user));
    localStorage.setItem('token', response.data.token);
  }

  return response.data;
};

// Login user
const login = async (userData) => {
  const response = await axios.post(`${API_URL}/auth/login`, userData);

  if (response.data.success) {
    localStorage.setItem('user', JSON.stringify(response.data.user));
    localStorage.setItem('token', response.data.token);
  }

  return response.data;
};

// Logout user
const logout = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
};

const authService = {
  register,
  login,
  logout,
};

export default authService;
