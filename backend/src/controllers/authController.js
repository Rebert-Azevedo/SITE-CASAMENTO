// backend/src/controllers/authController.js
// Nenhuma lógica complexa aqui, a validação é feita no middleware.
// Este controller apenas indica sucesso se o middleware permitiu.
exports.validateSecretKey = (req, res) => {
    res.status(200).json({ message: 'Chave secreta validada com sucesso.' });
};