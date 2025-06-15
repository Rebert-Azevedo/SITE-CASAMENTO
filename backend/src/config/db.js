// backend/src/config/db.js
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    trace: true // Manter para depuração
});

async function testDbConnection() {
    console.log('--- Testando Conexão com o Banco de Dados ---');
    console.log('DB_HOST:', process.env.DB_HOST);
    console.log('DB_PORT:', process.env.DB_PORT);
    console.log('DB_USER:', process.env.DB_USER);
    console.log('DB_NAME:', process.env.DB_NAME);
    // CUIDADO: NUNCA LOGUE A SENHA COMPLETA EM PRODUÇÃO! Apenas para depuração.
    console.log('DB_PASSWORD (primeiros 3 caracteres):', (process.env.DB_PASSWORD || '').substring(0, 3) + '...');
    try {
        const connection = await pool.getConnection();
        console.log('>>> SUCESSO: Conexão com o banco de dados MySQL estabelecida com sucesso!');
        connection.release();
    } catch (error) {
        console.error('>>> ERRO CRÍTICO: Falha ao conectar ao banco de dados MySQL!');
        console.error('Detalhes do Erro:', error.message); // MENSAGEM DETALHADA DO ERRO
        console.error('Código do Erro:', error.code);     // CÓDIGO DO ERRO (ex: ER_ACCESS_DENIED_ERROR, ETIMEDOUT)
        console.error('Host/Porta Tentada:', error.address + ':' + error.port);
        process.exit(1); // Encerra a aplicação
    } finally {
        console.log('--- Fim do Teste de Conexão ---');
    }
}

module.exports = {
    pool,
    testDbConnection
};