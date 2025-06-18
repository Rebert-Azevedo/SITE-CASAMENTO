const express = require('express');
const router = express.Router();
const guestsController = require('../controllers/guestsController');
const protect = require('../middleware/authMiddleware'); // Protege as rotas admin

// Rotas para a área administrativa protegidas.
router.get('/admin', protect, guestsController.getAllGuestsAdmin); // Listar todos
router.post('/', protect, guestsController.createGuest); // Criar
router.put('/:id', protect, guestsController.updateGuest); // Atualizar
router.delete('/:id', protect, guestsController.deleteGuest); // Deletar

module.exports = router;