import axios from "axios";

const API = `${import.meta.env.VITE_API_URL}/api/trainings`;

export const getTrainings = (token) =>
  axios.get(API, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getTraining = (id, token) =>
  axios.get(`${API}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const updateTraining = (id, data, token) =>
  axios.put(`${API}/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const createTraining = (data, token) =>
  axios.post(API, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const markTrainingComplete = (recordId, token) =>
  axios.put(
    `${API}/complete/${recordId}`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

export const getHistory = (token) =>
  axios.get(`${API}/history`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const deleteTraining = (id, token) =>
  axios.delete(`${API}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
