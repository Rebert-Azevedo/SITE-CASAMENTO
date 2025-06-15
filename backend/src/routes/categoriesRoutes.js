const express = require('express');
const router = express.Router();
const categoriesController = require('../controllers/categoriesController');
// Não precisa de middleware de autenticação se for uma rota pública para o frontend de convidados

router.get('/', categoriesController.getAllCategories);

module.exports = router;