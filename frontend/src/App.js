import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Componentes Reutilizáveis de Layout
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import PrivateRoute from './components/PrivateRoute/PrivateRoute';

// Páginas Públicas (para convidados)
import HomePage from './pages/Home/Home';
import GiftListPage from './pages/GiftList/GiftList';

// Páginas da Área Administrativa
import AdminLoginPage from './pages/AdminLogin/AdminLogin';
import AdminDashboardPage from './pages/AdminDashboard/AdminDashboard';
import GiftManagementPage from './pages/AdminDashboard/GiftManagement/GiftManagement';
import GuestManagementPage from './pages/AdminDashboard/GuestManagement/GuestManagement';

// Página de Erro 404
import NotFoundPage from './pages/NotFound/NotFound'; // <--- Este import também estava fora de ordem

// REMOVIDO: import axios from 'axios';
// REMOVIDO: const api = axios.create(...) // A instância `api` é importada de 'src/api/api.js' onde é usada

function App() {
  return (
    <Router>
      <Header /> {/* Cabeçalho de navegação */}
      <main> {/* Conteúdo principal da página */}
        <Routes>
          {/* Rotas Públicas (acessíveis a todos os convidados) */}
          <Route path="/" element={<HomePage />} /> {/* Página inicial */}
          <Route path="/lista-presentes" element={<GiftListPage />} /> {/* Lista de presentes */}

          {/* Rota de Login para Administradores */}
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* Rotas Protegidas (apenas para administradores logados) */}
          {/* A rota /admin/* serve como um layout para as sub-páginas administrativas */}
          <Route
            path="/admin/*"
            element={
              <PrivateRoute> {/* Protege a rota, redireciona para login se não autenticado */}
                <AdminDashboardPage /> {/* Componente de layout do dashboard admin */}
              </PrivateRoute>
            }
          >
            {/* Sub-rotas aninhadas dentro do AdminDashboard (renderizadas pelo <Outlet /> no AdminDashboardPage) */}
            <Route index element={<GiftManagementPage />} /> {/* Rota padrão para /admin/ (ex: /admin/) */}
            <Route path="presentes" element={<GiftManagementPage />} /> {/* Rota para gerenciar presentes (/admin/presentes) */}
            <Route path="convidados" element={<GuestManagementPage />} /> {/* Rota para gerenciar convidados (/admin/convidados) */}
            {/* Adicione aqui as rotas para outras páginas de gerenciamento do admin */}
          </Route>

          {/* Rota 404: Captura qualquer URL que não corresponda a nenhuma rota acima */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer /> {/* Rodapé da página */}
    </Router>
  );
}

export default App;