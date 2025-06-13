import React, { useState } from 'react';
import api from '../../api/api';
import styles from './RSVP.module.css';
// REMOVIDO: import { InputMask } from '@react-input-mask/web';

function RSVPPage() {
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [participar, setParticipar] = useState(true);
  const [criancas, setCriancas] = useState(0);
  const [observacoes, setObservacoes] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!nome || !telefone) {
      setError('Nome completo e telefone são obrigatórios.');
      return;
    }

    try {
        const response = await api.post('/rsvp', {
            nome_completo: nome,
            telefone: telefone,
            vai_participar: participar,
            quantidade_criancas: participar ? criancas : 0,
            observacoes: observacoes,
        });

        setMessage(response.data.message || 'Sua presença foi confirmada com sucesso!');
        setNome('');
        setTelefone('');
        setParticipar(true);
        setCriancas(0);
        setObservacoes('');
    } catch (err) {
      setError('Erro ao confirmar presença: ' + (err.response?.data?.message || 'Erro desconhecido.'));
      console.error('RSVP failed:', err);
    }
  };

  return (
    <div className={styles.rsvpContainer}>
      <h2>Confirme Sua Presença</h2>
      <p className={styles.subtitle}>Sua presença é muito importante para nós! Por favor, preencha o formulário abaixo.</p>
      <form onSubmit={handleSubmit} className={styles.rsvpForm}>
        <div className={styles.formGroup}>
          <label htmlFor="nome">Seu Nome Completo:</label>
          <input
            type="text"
            id="nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="telefone">Seu Telefone (WhatsApp):</label>
          {/* ALTERADO: Usando input normal novamente */}
          <input
            type="tel"
            id="telefone"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            required
            placeholder="(DD) 9XXXX-XXXX"
            className={styles.inputMaskField} /* Mantenha a classe para estilização */
          />
        </div>
        <div className={styles.formGroup}>
          <label>Você irá participar?</label>
          <div className={styles.radioGroup}>
            <label>
              <input
                type="radio"
                value="true"
                checked={participar === true}
                onChange={() => setParticipar(true)}
              /> Sim
            </label>
            <label>
              <input
                type="radio"
                value="false"
                checked={participar === false}
                onChange={() => setParticipar(false)}
              /> Não
            </label>
          </div>
        </div>

        {participar && (
          <div className={styles.formGroup}>
            <label htmlFor="criancas">Quantas crianças?</label>
            <input
              type="number"
              id="criancas"
              value={criancas}
              onChange={(e) => setCriancas(Math.max(0, parseInt(e.target.value) || 0))}
              min="0"
            />
          </div>
        )}

        <div className={styles.formGroup}>
          <label htmlFor="observacoes">Observações (ex: restrições alimentares):</label>
          <textarea
            id="observacoes"
            rows="4"
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
          ></textarea>
        </div>

        {message && <p className={styles.successMessage}>{message}</p>}
        {error && <p className={styles.errorMessage}>{error}</p>}

        <button type="submit" className={`${styles.submitButton} darken-primary-gold`}>Confirmar Presença</button>
      </form>
    </div>
  );
}

export default RSVPPage;