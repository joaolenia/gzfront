import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:3009',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});