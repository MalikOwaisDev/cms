import axios from "axios";

const API = `${import.meta.env.VITE_API_URL}/api/caregivers`;

export const getCaregivers = (token) =>
  axios.get(API, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getCaregiverById = (id, token) =>
  axios.get(`${API}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const createCaregiver = (data, token) =>
  axios.post(API, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const updateCaregiver = (id, data, token) =>
  axios.put(`${API}/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const deleteCaregiver = (id, token) =>
  axios.delete(`${API}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
