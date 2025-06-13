import React, { useState, useEffect, useRef } from 'react';
import styles from './ConfirmationModal.module.css';

// O Modal agora não importa 'api', pois não faz a chamada à API diretamente.
function ConfirmationModal({ isOpen, onClose, onConfirm, giftName }) { // onConfirm agora é a função que faz a API call
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' }); // NOVO: Objeto unificado para feedback

  const initialFocusRef = useRef(null);

  // NOVO: useEffect para resetar o formulário e o feedback quando o modal abre/fecha
  useEffect(() => {
    if (isOpen) {
      setNome('');
      setEmail('');
      setMensagem('');
      setIsLoading(false);
      setFeedback({ type: '', message: '' });
      const timeoutId = setTimeout(() => {
          if (initialFocusRef.current) {
              initialFocusRef.current.focus();
          }
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [isOpen]);

  // useEffect para fechar com a tecla ESC
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, isLoading, onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback({ type: '', message: '' });

    if (!nome || !email) {
      setFeedback({ type: 'error', message: 'Por favor, preencha seu nome e e-mail.' });
      return;
    }

    setIsLoading(true);
    try {
      // onConfirm é a prop que o pai (GiftCard) passa, e esta prop agora faz a chamada API
      // e deve retornar sucesso ou lançar um erro.
      const result = await onConfirm(nome, email, mensagem);
      setFeedback({ type: 'success', message: result.message || 'Reserva confirmada com sucesso!' });
      setTimeout(() => {
        onClose(); // Fecha o modal após 2 segundos de mensagem de sucesso
      }, 2000);
    } catch (err) {
      console.error('Erro ao chamar onConfirm:', err);
      setFeedback({ type: 'error', message: err.message || 'Erro ao processar reserva. Tente novamente.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={isLoading ? null : onClose} role="dialog" aria-modal="true" data-testid="confirmation-modal-overlay">
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} data-testid="confirmation-modal-content">
        <h2>Reservar Presente: {giftName}</h2>
        <p>Por favor, preencha seus dados para confirmar a reserva.</p>

        {isLoading && <div className={styles.loadingSpinner} data-testid="loading-spinner"></div>}
        {feedback.message && (
          <p className={feedback.type === 'error' ? styles.errorMessageModal : styles.successMessageModal} data-testid="feedback-message">
            {feedback.message}
          </p>
        )}

        {!isLoading && feedback.type !== 'success' && ( // Só mostra o formulário se não estiver carregando ou já tiver sucesso
          <form onSubmit={handleSubmit} data-testid="reservation-form">
            <div className={styles.formGroup}>
              <label htmlFor="nome">Seu Nome Completo:</label>
              <input
                type="text"
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                ref={initialFocusRef}
                disabled={isLoading}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="email">Seu E-mail:</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="mensagem">Mensagem para os noivos (opcional):</label>
              <textarea
                id="mensagem"
                rows="3"
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                disabled={isLoading}
              ></textarea>
            </div>
            <div className={styles.modalActions}>
              <button type="submit" className={`${styles.confirmButton} darken-primary-gold`} disabled={isLoading}>
                Confirmar Reserva
              </button>
              <button type="button" onClick={onClose} className={`${styles.cancelButton} darken-text-medium`} disabled={isLoading}>
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default ConfirmationModal;