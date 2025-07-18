import axios from "axios";

const API = `${import.meta.env.VITE_API_URL}/api/patients`;

export const getPatients = (token) =>
  axios.get(API, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getPatient = (id, token) =>
  axios.get(`${API}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const createPatient = (data, token) => {
  axios.post(`${API}/new`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const updatePatient = (id, data, token) =>
  axios.put(`${API}/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

export const deletePatient = (id, token) =>
  axios.delete(`${API}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getCaregivers = (token) =>
  axios.get(`${API}/get-carers`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
