import axios from "axios";

const API = `${import.meta.env.VITE_API_URL}/api/visits`;

export const getVisits = (token) =>
  axios.get(API, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getVisitById = (id, token) =>
  axios.get(`${API}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const createVisit = (data, token) =>
  axios.post(API, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getTodaysVisits = (token) =>
  axios.get(`${API}/today`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const updateVisitStatus = (id, data, token) =>
  axios.patch(`${API}/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const updateTaskStatus = (id, taskId, data, token) =>
  axios.patch(`${API}/${id}/tasks/${taskId}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const updateMedicationStatus = (id, medicationId, data, token) =>
  axios.patch(`${API}/${id}/medications/${medicationId}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getCaregivers = (token) =>
  axios.get(`${import.meta.env.VITE_API_URL}/api/caregivers`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getAvailableCaregivers = async (token, date) =>
  axios.post(
    `${import.meta.env.VITE_API_URL}/api/caregivers/available`,
    { date },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

export const getPatients = (token) =>
  axios.get(`${import.meta.env.VITE_API_URL}/api/patients`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const deleteVisit = (id, token) =>
  axios.delete(`${API}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
