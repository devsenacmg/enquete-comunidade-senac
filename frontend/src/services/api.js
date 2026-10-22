import axios from 'axios';

// Criação da instância do Axios conectada ao backend em nuvem (Render)
const api = axios.create({
  baseURL: 'https://enquete-comunidade-senac.onrender.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;