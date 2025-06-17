// backend/src/middleware/authMiddleware.js
require('dotenv').config(); // Certifica-se de que as variáveis de ambiente são carregadas

const protect = (req, res, next) => {
    // A chave secreta pode vir na query string (?key=...) ou em um header personalizado (X-Admin-Key)
    const adminKey = req.query.key || req.headers['x-admin-key'];
    const expectedSecretKey = process.env.ADMIN_SECRET_KEY; // A chave que deveria vir do .env

    console.log('--- Auth Middleware Debug ---');
    console.log('Chave Recebida (adminKey):', adminKey);
    console.log('Chave Esperada (.env):', expectedSecretKey);
    console.log('As chaves são idênticas?', adminKey === expectedSecretKey); // TRUE ou FALSE

    if (!adminKey) {
        console.log('DEBUG: Chave não fornecida.');
        return res.status(401).json({ message: 'Acesso não autorizado: Chave de administrador não fornecida.' });
    }

    // O problema está aqui: adminKey !== process.env.ADMIN_SECRET_KEY
    if (adminKey !== expectedSecretKey) { // Comparação deve ser exata
        console.log('DEBUG: Chave fornecida INVÁLIDA.');
        return res.status(401).json({ message: 'Acesso não autorizado: Chave de administrador inválida.' });
    }

    console.log('DEBUG: Chave VÁLIDA. Acesso concedido.');
    next(); // Se a chave for válida, continua para a próxima função (controller)
};

module.exports = protect;