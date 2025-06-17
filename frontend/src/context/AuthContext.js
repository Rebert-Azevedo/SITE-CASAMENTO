// frontend/src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/api'; // Certifique-se de que Axios está importado

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // user será { isAuthenticated: true } ou null
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Tenta carregar o estado de autenticação persistente ao carregar a página
    const storedAuth = localStorage.getItem('adminAuth');
    const storedSecretKey = localStorage.getItem('adminSecretKey');

    if (storedAuth && storedSecretKey) {
      // Se houver uma chave salva, tenta revalidar com o backend ao carregar a aplicação
      // Isso evita que o acesso persista se a chave do .env mudar no backend
      const revalidateAuth = async () => {
        try {
          // Faz uma chamada para a rota protegida de validação
          await api.get('/auth/validate-key');
          setUser({ isAuthenticated: true }); // Apenas autentica se a validação passar
        } catch (error) {
          console.error('Revalidação da chave secreta falhou:', error);
          logout(); // Força logout se a chave salva não for mais válida
        } finally {
          setLoading(false);
        }
      };
      revalidateAuth();
    } else {
      setLoading(false); // Se não há chave salva, termina o loading
    }
  }, []);

  // NOVO: Função para "logar" com a chave secreta, AGORA COM VALIDAÇÃO BACKEND
  const loginWithSecretKey = async (secretKey) => { // Tornar async
    try {
      // Armazena a chave TEMPORARIAMENTE para que o interceptor a use na chamada de validação
      localStorage.setItem('adminSecretKey', secretKey);

      // Faz uma chamada ao backend para validar a chave
      const response = await api.get('/auth/validate-key');

      // Se a chamada for bem-sucedida (status 200), então a chave é válida
      localStorage.setItem('adminAuth', 'true'); // Marca como autenticado para persistência
      setUser({ isAuthenticated: true });
      return { success: true, message: response.data.message };
    } catch (error) {
      console.error('Login com chave secreta falhou:', error.response?.data || error);
      logout(); // Garante que qualquer chave inválida seja limpa
      throw new Error(error.response?.data?.message || 'Chave secreta inválida.');
    }
  };

  const logout = () => {
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('adminSecretKey');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithSecretKey, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};