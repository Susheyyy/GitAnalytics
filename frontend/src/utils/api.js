import axios from 'axios';

const API = axios.create({ baseURL: 'http://127.0.0.1:5000/api' });

export const fetchAnalysis = async (username) => {
  const response = await API.get(`/analyze/${username}`);
  return response.data;
};