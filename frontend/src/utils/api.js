import axios from 'axios';

const API_BASE_URL = "https://gitanalytics-backend.onrender.com/api";

const API = axios.create({ 
  baseURL: API_BASE_URL 
});

export const fetchAnalysis = async (username) => {
  try {
    const response = await API.get(`/analyze/${username}`);
    return response.data;
  } catch (error) {
    console.error("Analysis API Error:", error);
    throw error;
  }
};

export const fetchRoadmap = async (username) => {
  try {
    const response = await API.get(`/roadmap/${username}`);
    return response.data;
  } catch (error) {
    console.error("Roadmap API Error:", error);
    return { suggestion: "AI is currently resting. Try again in a bit!" };
  }
};