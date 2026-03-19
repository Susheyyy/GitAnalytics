import axios from 'axios';

// Note: Port 5000 is where your Flask app is running
const API = axios.create({ baseURL: 'http://127.0.0.1:5000/api' });

export const fetchAnalysis = async (username) => {
  const response = await API.get(`/analyze/${username}`);
  return response.data;
};