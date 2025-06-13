// backend/test_bcrypt.js
const bcrypt = require('bcryptjs');

const testPassword = '123456*'; // Use a senha que você está tentando logar
const dbHash = '$2b$10$EesdEr8DbG6ZgpYIdJ8tpeoJaQJtb9m6...'; // <-- COLE O HASH EXATO DA SUA CAPTURA DE TELA AQUI!

async function testBcrypt() {
    console.log('--- Teste Isolado bcrypt ---');
    console.log('Senha a ser testada:', testPassword);
    console.log('Hash do DB (copiado):', dbHash);

    try {
        const isMatchDb = await bcrypt.compare(testPassword, dbHash);
        console.log('Comparação com hash do DB (true/false):', isMatchDb); // ESTE É O RESULTADO CHAVE!

    } catch (err) {
        console.error('Erro no teste bcrypt:', err);
    } finally {
        console.log('--- Fim do Teste ---');
    }
}

testBcrypt();