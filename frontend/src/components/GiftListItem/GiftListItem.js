import React, { useState, useEffect } from 'react';
import styles from './GiftListItem.module.css';
// REMOVIDO: import ConfirmationModal from '../ConfirmationModal/ConfirmationModal';
import api from '../../api/api'; // O componente faz a chamada à API

function GiftListItem({ gift, onReserve }) {
  const [showReservationForm, setShowReservationForm] = useState(false); // NOVO: Estado para mostrar/esconder o formulário inline
  const [formNome, setFormNome] = useState('');
  const [formTelefone, setFormTelefone] = useState('');
  const [formMensagem, setFormMensagem] = useState('');
  const [formLoading, setFormLoading] = useState(false); // NOVO: Estado para loading do formulário inline
  const [formError, setFormError] = useState(null); // NOVO: Erros do formulário inline
  const [formSuccess, setFormSuccess] = useState(false); // NOVO: Sucesso do formulário inline

  // NENHUM useEffect para `modal-open` ou `overflow: hidden` aqui, pois o modal foi removido.

  const handleOpenForm = () => {
    setShowReservationForm(true);
    setFormNome(''); // Reseta campos ao abrir
    setFormTelefone('');
    setFormMensagem('');
    setFormError(null);
    setFormSuccess(false);
  };

  const handleCancelReservation = () => {
    setShowReservationForm(false);
    setFormError(null);
    setFormSuccess(false);
  };

  const handleSubmitReservation = async (e) => { // A lógica de submissão está aqui
    e.preventDefault();
    setFormError(null);
    setFormSuccess(false);

    if (!formNome || !formTelefone) {
      setFormError('Por favor, preencha seu nome e telefone.');
      return;
    }

    setFormLoading(true);
    try {
      const response = await api.post(`/gifts/${gift.id}/reserve`, {
        nome_reservou: formNome,
        telefone: formTelefone, // Enviando telefone para o backend
        mensagem: formMensagem,
        email_reservou: 'nao_usado@exemplo.com' // Mantido para compatibilidade com DB se necessário
      });

      setFormSuccess(true);
      setFormError(null); // Limpa erros se houver sucesso
      onReserve(gift.id); // Notifica o pai para atualizar o estado da lista

      setTimeout(() => { // Fecha o formulário após 2 segundos de mensagem de sucesso
        setShowReservationForm(false);
      }, 2000);

    } catch (err) {
      console.error('Erro na reserva:', err.response?.data || err);
      setFormError(err.response?.data?.message || 'Erro ao reservar. Tente novamente.');
      setFormSuccess(false); // Garante que o sucesso seja false em caso de erro
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className={styles.giftListItem}>
      <div className={styles.itemDetails}>
        <h3 className={styles.itemName}>{gift.nome}</h3>
        {gift.descricao && <p className={styles.itemDescription}>{gift.descricao}</p>}
        {gift.valor_estimado !== null && gift.valor_estimado !== undefined && !isNaN(parseFloat(gift.valor_estimado)) && (
          <p className={styles.itemValue}>
            Valor Estimado: R$ {parseFloat(gift.valor_estimado).toFixed(2).replace('.', ',')}
          </p>
        )}
      </div>

      <div className={styles.itemActions}>
        {gift.status === 'disponível' ? (
          <button onClick={handleOpenForm} className={`${styles.reserveButton} darken-primary-gold`}>
            Reservar
          </button>
        ) : (
          <p className={styles.reservedStatus}>
            {gift.status === 'reservado' ? 'Reservado' : 'Já Adquirido'}
          </p>
        )}
      </div>

      {/* NOVO: Formulário de Reserva Inline */}
      {showReservationForm && (
        <div className={styles.reservationFormContainer}>
          {formLoading && <div className={styles.loadingSpinnerInline}></div>}
          {formError && <p className={styles.errorMessageInline}>{formError}</p>}
          {formSuccess && <p className={styles.successMessageInline}>{formSuccess}</p>}

          {!formLoading && !formSuccess && (
            <form onSubmit={handleSubmitReservation} className={styles.reservationForm}>
              <div className={styles.formGroupInline}>
                <label htmlFor={`nome-${gift.id}`}>Seu Nome:</label>
                <input
                  type="text"
                  id={`nome-${gift.id}`}
                  value={formNome}
                  onChange={(e) => setFormNome(e.target.value)}
                  required
                  disabled={formLoading}
                />
              </div>
              <div className={styles.formGroupInline}>
                <label htmlFor={`telefone-${gift.id}`}>Seu Telefone:</label>
                <input
                  type="tel"
                  id={`telefone-${gift.id}`}
                  value={formTelefone}
                  onChange={(e) => setFormTelefone(e.target.value)}
                  required
                  disabled={formLoading}
                />
              </div>
              <div className={styles.formGroupInline}>
                <label htmlFor={`mensagem-${gift.id}`}>Mensagem (opcional):</label>
                <textarea
                  id={`mensagem-${gift.id}`}
                  rows="2"
                  value={formMensagem}
                  onChange={(e) => setFormMensagem(e.target.value)}
                  disabled={formLoading}
                ></textarea>
              </div>
              <div className={styles.formActionsInline}>
                <button type="submit" className={`${styles.confirmButtonInline} darken-primary-gold`} disabled={formLoading}>
                  Confirmar
                </button>
                <button type="button" onClick={handleCancelReservation} className={`${styles.cancelButtonInline} darken-text-medium`} disabled={formLoading}>
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

export default GiftListItem;