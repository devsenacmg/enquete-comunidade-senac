import axios from 'axios';

// Criação da instância do Axios com o endereço base da API FastAPI
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000', // Endereço padrão onde o FastAPI executa
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;