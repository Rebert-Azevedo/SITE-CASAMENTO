const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const giftsRoutes = require('./routes/giftsRoutes');
const categoriesRoutes = require('./routes/categoriesRoutes');
const errorHandler = require('./middleware/errorHandler');


const app = express();

app.use(cors());
app.use(express.json());

// Definição das Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/gifts', giftsRoutes);
app.use('/api/categories', categoriesRoutes);

// Rota de teste para a raiz da API
app.get('/', (req, res) => {
    res.send('API do site de casamento está funcionando!');
});

// Middleware de tratamento de erros (deve ser o ÚLTIMO)
app.use(errorHandler);

module.exports = app;