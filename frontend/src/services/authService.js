import axios from 'axios';

const API_URL = 'http://localhost:3000/api/users';

const login = async (userData) => {
  const response = await axios.post(`${API_URL}/login`, userData);
  return response.data;
};

const register = async (userData) => {
  const response = await axios.post(`${API_URL}/register`, userData);
  return response.data;
};

const authService = {
  login,
  register
};

export default authService;
