const { pool } = require('../config/db');

// CONVIDADOS - Obter todos os presentes disponíveis/reservados (com ordenação)
exports.getAllGifts = async (req, res, next) => {
    try {
        // `imagem_url` e `url_compra` foram removidas da seleção
        const [rows] = await pool.execute(
            `SELECT id, categoria_id, nome, descricao, valor_estimado, status
             FROM presentes
             WHERE status IN ("disponível", "reservado", "comprado")
             ORDER BY FIELD(status, 'disponível', 'comprado', 'reservado'), nome ASC`
        );
        res.status(200).json(rows);
    } catch (error) {
        next(error);
    }
};

// CONVIDADOS - Reservar um presente
exports.reserveGift = async (req, res, next) => {
    const { id } = req.params;
    // ALTERADO: Recebe `nome_reservou`, `telefone`, e `mensagem` do frontend
    // `email_reservou` é removido aqui, pois não é mais usado no frontend e DB
    const { nome_reservou, telefone, mensagem } = req.body;

    // ALTERADO: Validação para `nome_reservou` e `telefone`
    if (!nome_reservou || !telefone) {
        return res.status(400).json({ message: 'Nome e telefone são obrigatórios para reservar.' });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [giftRows] = await connection.execute(
            'SELECT status FROM presentes WHERE id = ? FOR UPDATE',
            [id]
        );

        if (giftRows.length === 0 || giftRows[0].status !== 'disponível') {
            await connection.rollback();
            return res.status(409).json({ message: 'Presente não está disponível para reserva.' });
        }

        // ALTERADO: Insere `telefone_reservou` no lugar de `email_reservou`
        // IMPORTANTE: Assumimos que a tabela `reservas` já foi ALTERADA no DB
        // para ter a coluna `telefone_reservou` e não mais `email_reservou`.
        await connection.execute(
            'INSERT INTO reservas (presente_id, nome_reservou, telefone_reservou, mensagem) VALUES (?, ?, ?, ?)',
            [id, nome_reservou, telefone, mensagem] // Passa o `telefone` recebido
        );

        await connection.execute(
            'UPDATE presentes SET status = "reservado" WHERE id = ?',
            [id]
        );

        await connection.commit();
        res.status(200).json({ message: 'Presente reservado com sucesso!' });
    } catch (error) {
        await connection.rollback();
        next(error);
    } finally {
        connection.release();
    }
};

// ADMIN - Criar um novo presente
exports.createGift = async (req, res, next) => {
    // `url_compra` e `imagem_url` removidas da desestruturação e da inserção
    const { categoria_id, nome, descricao, valor_estimado } = req.body;
    if (!nome) {
        return res.status(400).json({ message: 'O nome do presente é obrigatório.' });
    }
    try {
        const [result] = await pool.execute(
            'INSERT INTO presentes (categoria_id, nome, descricao, valor_estimado, status) VALUES (?, ?, ?, ?, ?)',
            [categoria_id, nome, descricao, valor_estimado, 'disponível'] // Status inicial padrão
        );
        res.status(201).json({ message: 'Presente criado com sucesso!', giftId: result.insertId });
    } catch (error) {
        next(error);
    }
};

// ADMIN - Atualizar um presente existente
exports.updateGift = async (req, res, next) => {
    const { id } = req.params;
    // `url_compra` e `imagem_url` removidas da desestruturação e da atualização
    const { categoria_id, nome, descricao, valor_estimado, status } = req.body;
    try {
        const [result] = await pool.execute(
            'UPDATE presentes SET categoria_id = ?, nome = ?, descricao = ?, valor_estimado = ?, status = ? WHERE id = ?',
            [categoria_id, nome, descricao, valor_estimado, status, id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Presente não encontrado.' });
        }
        res.status(200).json({ message: 'Presente atualizado com sucesso!' });
    } catch (error) {
        next(error);
    }
};

exports.deleteGift = async (req, res, next) => {
    const { id } = req.params;
    try {
        const [result] = await pool.execute('DELETE FROM presentes WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Presente não encontrado.' });
        }
        res.status(200).json({ message: 'Presente excluído com sucesso!' });
    } catch (error) {
        next(error);
    }
};

// ADMIN - Obter todos os presentes com detalhes de reserva
exports.getAllGiftsAdmin = async (req, res, next) => {
    try {
        // `url_compra` e `imagem_url` removidas da seleção
        // ALTERADO: `email_reservou` na seleção da reserva para `telefone_reservou`
        const [rows] = await pool.execute(
            `SELECT p.id, p.nome, p.descricao, p.valor_estimado, p.status,
                    c.nome AS categoria_nome, r.nome_reservou, r.telefone_reservou, r.data_reserva, r.mensagem AS reserva_mensagem
             FROM presentes p
             LEFT JOIN categorias c ON p.categoria_id = c.id
             LEFT JOIN reservas r ON p.id = r.presente_id
             ORDER BY FIELD(p.status, 'disponível', 'comprado', 'reservado'), p.nome ASC`
        );
        res.status(200).json(rows);
    } catch (error) {
        next(error);
    }
};