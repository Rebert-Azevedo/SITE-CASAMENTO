const { pool } = require('../config/db');
const crypto = require('crypto'); // Para MD5

exports.registerAdmin = async (req, res, next) => {
    const { nome_usuario, senha, email } = req.body;
    if (!senha || !email) {
        return res.status(400).json({ message: 'Senha e e-mail são obrigatórios.' });
    }
    try {
        console.log('--- REGISTRO INÍCIO (MD5) ---');
        console.log('Dados recebidos (req.body) para registro:', req.body);
        console.log('Email para registro:', email);
        console.log('Senha em texto plano (registro):', senha); // CUIDADO: APENAS PARA DEBUG!

        const senha_hash = crypto.createHash('md5').update(senha).digest('hex');
        console.log('Hash MD5 gerado para registro:', senha_hash);

        const [result] = await pool.execute(
            'INSERT INTO usuarios_admin (nome_usuario, senha_hash, email) VALUES (?, ?, ?)',
            [nome_usuario || null, senha_hash, email]
        );
        console.log('Usuário registrado no DB com ID:', result.insertId);
        console.log('--- REGISTRO FIM (MD5) ---');
        res.status(201).json({ message: 'Administrador registrado com sucesso! Agora faça login.' });
    } catch (error) {
        console.error('ERRO CRÍTICO DURANTE O REGISTRO (MD5):', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'E-mail já cadastrado.' });
        }
        next(error);
    }
};

exports.loginAdmin = async (req, res, next) => {
    const { email, senha } = req.body;
    if (!email || !senha) {
        console.log('Backend - VALIDAÇÃO INTERNA: email ou senha estão vazios em req.body. Status 400 retornado.');
        return res.status(400).json({ message: 'E-mail e senha são obrigatórios.' });
    }
    try {
        console.log('\n--- LOGIN INÍCIO ---');
        console.log('Backend - req.body COMPLETO na entrada do controller:', req.body);
        console.log('Email para login:', email);
        console.log('Senha em texto plano (login):', senha); // CUIDADO: APENAS PARA DEBUG!

        const [rows] = await pool.execute(
            'SELECT id, senha_hash, nome_usuario FROM usuarios_admin WHERE email = ?',
            [email]
        );

        if (rows.length === 0) {
            console.log('USUÁRIO NÃO ENCONTRADO no DB para o e-mail:', email);
            console.log('--- LOGIN FIM (FALHA: Usuário não encontrado) ---');
            return res.status(401).json({ message: 'Credenciais inválidas.' });
        }

        const user = rows[0];
        console.log('Usuário do DB encontrado:', user);
        console.log('Hash da senha NO DB (user.senha_hash):', user.senha_hash);

        // Comparação direta da senha hashada com MD5
        const hashedLoginPassword = crypto.createHash('md5').update(senha).digest('hex');
        console.log('Hash MD5 da senha de login:', hashedLoginPassword);

        const isMatch = (hashedLoginPassword === user.senha_hash); // Comparação direta do hash
        console.log('RESULTADO DA COMPARAÇÃO MD5 (true/false):', isMatch);

        if (!isMatch) {
            console.log('COMPARAÇÃO DE SENHA FALHOU: Senha em texto plano NÃO CORRESPONDE ao hash MD5 do DB.');
            console.log('--- LOGIN FIM (FALHA: Senha incorreta) ---');
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
        console.log('LOGIN BEM-SUCEDIDO para usuário ID:', user.id, 'Email:', email);
        console.log('--- LOGIN FIM (SUCESSO) ---');
        res.status(200).json({ message: 'Login bem-sucedido!', token });
    } catch (error) {
        console.error('ERRO CRÍTICO DURANTE O LOGIN:', error);
        next(error);
    }
};