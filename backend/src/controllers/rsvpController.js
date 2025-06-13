const { pool } = require('../config/db');

exports.submitRsvp = async (req, res, next) => {
    // ALTERADO: Recebe 'telefone' em vez de 'email'
    const { nome_completo, telefone, vai_participar, quantidade_criancas, observacoes } = req.body;

    // ALTERADO: Validação para telefone
    if (!nome_completo || !telefone || vai_participar === undefined) {
        return res.status(400).json({ message: 'Nome, telefone e confirmação de participação são obrigatórios.' });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Tentar encontrar o convidado pelo telefone
        // ALTERADO: Consulta por 'telefone' em vez de 'email'
        let [guests] = await connection.execute('SELECT id FROM convidados WHERE telefone = ?', [telefone]);
        let convidado_id;

        if (guests.length > 0) {
            // Convidado existe: usa o ID e ATUALIZA o nome_completo e confirmado_presenca
            convidado_id = guests[0].id;
            await connection.execute('UPDATE convidados SET nome_completo = ?, confirmado_presenca = ? WHERE id = ?', [nome_completo, vai_participar, convidado_id]);
        } else {
            // Convidado não existe: INSERE um novo registro em 'convidados' com 'telefone'
            // ALTERADO: Insere 'telefone' em vez de 'email'
            const [result] = await connection.execute('INSERT INTO convidados (nome_completo, telefone, confirmado_presenca) VALUES (?, ?, ?)', [nome_completo, telefone, vai_participar]);
            convidado_id = result.insertId;
        }

        // 2. Verificar se já existe um RSVP para este convidado (convidado_id)
        const [existingRsvp] = await connection.execute('SELECT id FROM rsvp WHERE convidado_id = ?', [convidado_id]);

        if (existingRsvp.length > 0) {
            // RSVP existe: ATUALIZA os detalhes do RSVP
            await connection.execute(
                'UPDATE rsvp SET quantidade_criancas = ?, vai_participar = ?, observacoes = ?, data_resposta = CURRENT_TIMESTAMP WHERE convidado_id = ?',
                [quantidade_criancas, vai_participar, observacoes, convidado_id]
            );
        } else {
            // RSVP não existe: INSERE um novo registro em 'rsvp'
            await connection.execute(
                'INSERT INTO rsvp (convidado_id, quantidade_criancas, vai_participar, observacoes) VALUES (?, ?, ?, ?)',
                [convidado_id, quantidade_criancas, vai_participar, observacoes]
            );
        }

        await connection.commit();
        res.status(200).json({ message: 'RSVP registrado com sucesso!' });
    } catch (error) {
        await connection.rollback();
        next(error);
    } finally {
        connection.release();
    }
};

// ADMIN - Obter todos os RSVPs com detalhes do convidado
exports.getAllRsvpsAdmin = async (req, res, next) => {
    try {
        // ALTERADO: Seleciona 'telefone' em vez de 'email'
        const [rows] = await pool.execute(
            `SELECT r.id AS rsvp_id, r.quantidade_criancas, r.vai_participar, r.observacoes, r.data_resposta,
                    c.id AS convidado_id, c.nome_completo, c.telefone, c.confirmado_presenca
             FROM rsvp r
             JOIN convidados c ON r.convidado_id = c.id
             ORDER BY r.data_resposta DESC`
        );
        res.status(200).json(rows);
    } catch (error) {
        next(error);
    }
};

// ADMIN - Atualizar um RSVP (incluindo dados do convidado associado)
exports.updateRsvpAdmin = async (req, res, next) => {
    const { rsvp_id } = req.params;
    // ALTERADO: Aceita 'telefone' em vez de 'email'
    const { nome_completo, telefone, vai_participar, quantidade_criancas, observacoes, confirmado_presenca } = req.body;

    // ALTERADO: Validação para telefone
    if (!nome_completo || !telefone || vai_participar === undefined) {
        return res.status(400).json({ message: 'Nome, telefone e participação são obrigatórios.' });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [rsvpRows] = await connection.execute('SELECT convidado_id FROM rsvp WHERE id = ? FOR UPDATE', [rsvp_id]);
        if (rsvpRows.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'RSVP não encontrado.' });
        }
        const convidado_id = rsvpRows[0].convidado_id;

        // ALTERADO: Atualiza 'telefone' em vez de 'email'
        await connection.execute(
            'UPDATE convidados SET nome_completo = ?, telefone = ?, confirmado_presenca = ? WHERE id = ?',
            [nome_completo, telefone, confirmado_presenca, convidado_id]
        );

        await connection.execute(
            'UPDATE rsvp SET quantidade_criancas = ?, vai_participar = ?, observacoes = ?, data_resposta = CURRENT_TIMESTAMP WHERE id = ?',
            [quantidade_criancas, vai_participar, observacoes, rsvp_id]
        );

        await connection.commit();
        res.status(200).json({ message: 'RSVP e dados do convidado atualizados com sucesso!' });
    } catch (error) {
        await connection.rollback();
        next(error);
    } finally {
        connection.release();
    }
};

// ... (Resto do código permanece o mesmo)

// ADMIN - Deletar um RSVP (e o convidado associado, se for o último RSVP dele)
exports.deleteRsvpAdmin = async (req, res, next) => {
    const { rsvp_id } = req.params;
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [rsvpRows] = await connection.execute('SELECT convidado_id FROM rsvp WHERE id = ?', [rsvp_id]);
        if (rsvpRows.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'RSVP não encontrado.' });
        }
        const convidado_id = rsvpRows[0].convidado_id;

        await connection.execute('DELETE FROM rsvp WHERE id = ?', [rsvp_id]);

        const [remainingRsvps] = await connection.execute('SELECT COUNT(*) AS count FROM rsvp WHERE convidado_id = ?', [convidado_id]);
        if (remainingRsvps[0].count === 0) {
             // Você pode adicionar mais verificações aqui se o convidado puder ter outras informações (ex: reservas de presente)
            await connection.execute('DELETE FROM convidados WHERE id = ?', [convidado_id]);
        }

        await connection.commit();
        res.status(200).json({ message: 'RSVP e convidado associado (se aplicável) excluídos com sucesso!' });
    } catch (error) {
        await connection.rollback();
        next(error);
    } finally {
        connection.release();
    }
};