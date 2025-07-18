import axios from "axios";

const API = `${import.meta.env.VITE_API_URL}/api/wellness`;

export const createCarePlan = (data, token) =>
  axios.post(`${API}/care-plan`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getCarePlans = (token) =>
  axios.get(`${API}/care-plan`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getCarePlan = (id, token) =>
  axios.get(`${API}/care-plan/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const updateGoalStatus = (data, token) =>
  axios.put(`${API}/care-plan/goal`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const updateCarePlan = (id, data, token) =>
  axios.put(`${API}/care-plan/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const deleteCarePlan = (id, token) =>
  axios.delete(`${API}/care-plan/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const createResource = (data, token) =>
  axios.post(`${API}/resources`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getResources = (token) =>
  axios.get(`${API}/resources`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const updateResource = (id, data, token) =>
  axios.put(`${API}/resources/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const deleteResource = (id, token) =>
  axios.delete(`${API}/resources/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
