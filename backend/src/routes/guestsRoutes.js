// backend/src/routes/guestsRoutes.js
const express = require('express');
const router = express.Router();
const guestsController = require('../controllers/guestsController');
const protect = require('../middleware/authMiddleware'); // Protege as rotas admin

// Todas estas rotas são para a área administrativa, então são protegidas.
router.get('/admin', protect, guestsController.getAllGuestsAdmin); // Listar todos
router.post('/', protect, guestsController.createGuest); // Criar
router.put('/:id', protect, guestsController.updateGuest); // Atualizar
router.delete('/:id', protect, guestsController.deleteGuest); // Deletar

module.exports = router;