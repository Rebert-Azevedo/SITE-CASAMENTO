const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController'); // Importa o controller
const protect = require('../middleware/authMiddleware'); // Importa o middleware de proteção

// NOVO: Rota para validar a chave secreta. Protegida pelo middleware `protect`.
router.get('/validate-key', protect, authController.validateSecretKey);

// Você pode manter este arquivo apenas com esta rota.
// Rotas de login/registro por email/senha foram removidas para simplificar a admin.
// Se um dia precisar de login por email/senha, elas seriam adicionadas aqui.

module.exports = router;