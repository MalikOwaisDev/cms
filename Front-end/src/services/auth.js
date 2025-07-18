import axios from "axios";

const API = `${import.meta.env.VITE_API_URL}/api/auth`;

export const login = async (data) =>
  await axios.post(`${API}/login`, data, { withCredentials: true });

export const register = async (data) =>
  await axios.post(`${API}/register`, data, { withCredentials: true });

export const updateUser = async (data, token) =>
  await axios.post(`${API}/update`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getMe = async (token) =>
  await axios.get(`${API}/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const logout = async (token) =>
  await axios.post(
    `${API}/logout`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
