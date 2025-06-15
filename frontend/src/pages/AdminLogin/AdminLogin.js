import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/api';
import styles from './AdminLogin.module.css';

function AdminLoginPage() {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState(''); // Nome da função setter está correto aqui

  const [registerPassword, setRegisterPassword] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!loginEmail || !loginPassword) {
      setError('E-mail e senha são obrigatórios.');
      return;
    }
    try {
        // LOG DE DEBUG DO FRONTEND: O que o frontend ESTÁ ENVIANDO no payload
        console.log('Frontend - Enviando payload para login:', { email: loginEmail, senha: loginPassword }); // <<< ESTE LOG É FUNDAMENTAL!
        await login(loginEmail, loginPassword);
        navigate('/admin/presentes');
    } catch (err) {
      // LOG DE DEBUG DO FRONTEND: Erro detalhado no console do navegador
      console.error('Frontend AdminLogin.js - Login failed:', err.response?.data || err.message || err);
      setError('Credenciais inválidas. Verifique e-mail e senha.');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!registerPassword || !registerEmail) {
      setError('E-mail e senha são obrigatórios para o cadastro.');
      return;
    }
    try {
      // LOG DE DEBUG DO FRONTEND: O que está sendo enviado para registro
      console.log('Frontend AdminLogin.js - Enviando para registro:', { email: registerEmail, senha: registerPassword });
      const response = await api.post('/auth/register', {
        senha: registerPassword,
        email: registerEmail
      });
      setMessage(response.data.message);
      setError('');
      setIsRegisterMode(false);
      setLoginEmail(registerEmail); // Preenche o campo de login com o email recém-registrado
      setLoginPassword(''); // Zera a senha de login por segurança
      setRegisterPassword(''); // Zera a senha de registro
      setRegisterEmail(''); // Zera o email de registro
    } catch (err) {
      // LOG DE DEBUG DO FRONTEND: Erro detalhado no console do navegador
      console.error('Frontend AdminLogin.js - Registration failed:', err.response?.data || err.message || err);
      setError('Erro no cadastro: ' + (err.response?.data?.message || 'Erro desconhecido.'));
    }
  };

  return (
    <div className={styles.loginContainer}>
      <h2>{isRegisterMode ? 'Cadastro de Administrador' : 'Login do Administrador'}</h2>
      {message && <p className={styles.successMessage}>{message}</p>}
      {error && <p className={styles.errorMessage}>{error}</p>}

      <form onSubmit={isRegisterMode ? handleRegister : handleLogin}>
        {!isRegisterMode ? ( // Formulário de LOGIN
          <>
            <div className={styles.formGroup}>
              <label htmlFor="loginEmail">E-mail:</label>
              <input
                type="email"
                id="loginEmail"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="loginPassword">Senha:</label>
              <input
                type="password"
                id="loginPassword"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className={`${styles.submitButton} darken-primary-green`}>
              Entrar
            </button>
          </>
        ) : ( // Formulário de REGISTRO
          <>
            <div className={styles.formGroup}>
              <label htmlFor="registerEmail">E-mail:</label>
              <input
                type="email"
                id="registerEmail"
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="registerPassword">Senha:</label>
              <input
                type="password"
                id="registerPassword"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className={`${styles.submitButton} darken-primary-gold`}>
              Cadastrar
            </button>
          </>
        )}
      </form>

      <div className={styles.toggleMode}>
        {isRegisterMode ? (
          <p>Já tem uma conta? <span onClick={() => setIsRegisterMode(false)} className={styles.toggleLink}>Fazer Login</span></p>
        ) : (
          <p>Não tem uma conta de administrador? <span onClick={() => setIsRegisterMode(true)} className={styles.toggleLink}>Cadastre-se</span></p>
        )}
      </div>
    </div>
  );
}

export default AdminLoginPage;