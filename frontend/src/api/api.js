// frontend/src/api/api.js
import axios from 'axios';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        // <<< AQUI ESTÁ O PONTO CRÍTICO >>>
        // Pega a chave secreta armazenada no localStorage
        const adminSecretKey = localStorage.getItem('adminSecretKey');

        if (adminSecretKey) {
            // Adiciona a chave secreta a um cabeçalho personalizado
            // O backend authMiddleware.js espera 'x-admin-key' ou 'key' na query.
            // Cabeçalhos são mais limpos para interceptors.
            config.headers['X-Admin-Key'] = adminSecretKey; // <<< GARANTA QUE ESTÁ EXATAMENTE 'X-Admin-Key'
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;