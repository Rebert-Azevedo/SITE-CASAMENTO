// backend/src/controllers/authController.js

const { pool } = require('../config/db');
const bcrypt = require('bcryptjs'); // Certifique-se que está usando bcryptjs

exports.registerAdmin = async (req, res, next) => {
    const { nome_usuario, senha, email } = req.body;
    if (!senha || !email) {
        return res.status(400).json({ message: 'Senha e e-mail são obrigatórios.' });
    }
    try {
        console.log('--- REGISTRO INÍCIO ---');
        console.log('Email para registro:', email);
        console.log('Senha em texto plano (registro):', senha); // CUIDADO: NUNCA FAÇA ISSO EM PRODUÇÃO! Apenas para depuração.

        const senha_hash = await bcrypt.hash(senha, 10);
        console.log('Hash gerado para registro:', senha_hash);

        const [result] = await pool.execute(
            'INSERT INTO usuarios_admin (nome_usuario, senha_hash, email) VALUES (?, ?, ?)',
            [nome_usuario || null, senha_hash, email]
        );
        console.log('Usuário registrado no DB com ID:', result.insertId);
        console.log('--- REGISTRO FIM ---');
        res.status(201).json({ message: 'Administrador registrado com sucesso! Agora faça login.' });
    } catch (error) {
        console.error('Erro durante o registro:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'E-mail já cadastrado.' });
        }
        next(error);
    }
};
exports.loginAdmin = async (req, res, next) => {
    const { email, senha } = req.body;
    if (!email || !senha) { // <-- Se um desses for nulo ou vazio, o backend retorna 400
        return res.status(400).json({ message: 'E-mail e senha são obrigatórios.' });
    }
    try {
        console.log('\n--- LOGIN INÍCIO ---');
        console.log('Email para login:', email);
        console.log('Senha em texto plano (login):', senha); // CUIDADO: NUNCA FAÇA ISSO EM PRODUÇÃO! Apenas para depuração.

        const [rows] = await pool.execute(
            'SELECT id, senha_hash, nome_usuario FROM usuarios_admin WHERE email = ?',
            [email]
        );

        if (rows.length === 0) {
            console.log('Usuário não encontrado no DB para o e-mail:', email);
            return res.status(401).json({ message: 'Credenciais inválidas.' });
        }

        const user = rows[0];
        console.log('Hash da senha no DB para este usuário:', user.senha_hash);

        const isMatch = await bcrypt.compare(senha, user.senha_hash);
        console.log('Resultado da comparação bcrypt (true/false):', isMatch); // Esta é a linha mais importante!

        if (!isMatch) {
            console.log('Senha não corresponde ao hash do DB.');
            return res.status(401).json({ message: 'Credenciais inválidas.' });
        }

        const token = jwt.sign(
            { id: user.id, nome_usuario: user.nome_usuario },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        await pool.execute(
            'UPDATE usuarios_admin SET ultimo_login = CURRENT_TIMESTAMP WHERE id = ?',
            [user.id]
        );
        console.log('Login bem-sucedido para usuário:', user.nome_usuario);
        console.log('--- LOGIN FIM ---');
        res.status(200).json({ message: 'Login bem-sucedido!', token });
    } catch (error) {
        console.error('Erro durante o login:', error);
        next(error);
    }
console.log('\n--- LOGIN INÍCIO ---');
console.log('Dados recebidos (req.body) para login:', req.body); // <-- ESTE É O LOG MAIS IMPORTANTE AGORA!
console.log('Email para login (variável):', email);
console.log('Senha em texto plano (login, variável):', senha);
};