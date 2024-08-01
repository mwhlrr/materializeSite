import axios from 'axios';

// Example service to fetch data from the backend
const getData = async () => {
  const response = await axios.get('http://localhost:3000/api/data');
  return response.data;
};

export default {
  getData
};
