import React, { useState, useEffect } from 'react';
import styles from './GiftCard.module.css';
import ConfirmationModal from '../ConfirmationModal/ConfirmationModal';
import api from '../../api/api'; // Certifique-se de importar a instância do Axios aqui

function GiftCard({ gift, onReserve }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (isModalOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isModalOpen]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // AGORA: Esta função faz a chamada à API e retorna/lança o resultado para o modal.
  const handleConfirmReservation = async (nome, email, mensagem) => {
    try {
      const response = await api.post(`/gifts/${gift.id}/reserve`, { nome_reservou: nome, email_reservou: email, mensagem });
      // Notifica o componente pai (GiftListPage) para atualizar o estado do presente
      onReserve(gift.id);
      return { success: true, message: response.data.message || 'Reserva confirmada!' };
    } catch (err) {
      console.error('Reservation failed:', err.response?.data || err);
      // Lança um erro para que o ConfirmationModal possa capturá-lo e exibi-lo
      throw new Error(err.response?.data?.message || 'Erro ao reservar. Tente novamente.');
    }
  };

  return (
    <div className={styles.giftCard}>
      <img src={gift.imagem_url || 'https://via.placeholder.com/320x220/D2C49A/4A4A4A?text=Presente'} alt={gift.nome} className={styles.giftImage} />
      <h3 className={styles.giftName}>{gift.nome}</h3>
      {gift.descricao && <p className={styles.giftDescription}>{gift.descricao}</p>}
      {gift.valor_estimado !== null && gift.valor_estimado !== undefined && !isNaN(parseFloat(gift.valor_estimado)) && (
        <p className={styles.giftValue}>
          Valor Estimado: R$ {parseFloat(gift.valor_estimado).toFixed(2).replace('.', ',')}
        </p>
      )}
      {gift.url_compra && (
        <a href={gift.url_compra} target="_blank" rel="noopener noreferrer" className={styles.buyLink}>
          Onde Comprar
        </a>
      )}

      {gift.status === 'disponível' ? (
        <button onClick={handleOpenModal} className={`${styles.reserveButton} darken-primary-gold`}>Reservar</button>
      ) : (
        <p className={styles.reservedStatus}>
          {gift.status === 'reservado' ? 'Reservado' : 'Já Comprado'}
        </p>
      )}

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmReservation} // Passa a função que faz a API call
        giftName={gift.nome}
      />
    </div>
  );
}

export default GiftCard;