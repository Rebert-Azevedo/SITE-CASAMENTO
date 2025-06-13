import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import styles from './Home.module.css';

function HomePage() {
  const [config, setConfig] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = {
          data: {
            // A URL da foto do casal não será mais usada para o background,
            // mas pode ser mantida na config para uso futuro ou em outra seção.
            // foto_casal_url: 'https://via.placeholder.com/1400x700/B8A16C/B8A16C.png',
            nome_noivo: 'Rebert',
            nome_noiva: 'Juliane',
            data_noivado: '2025-10-12',
            mensagem_boas_vindas_site: 'Nosso Noivado Está Chegando!',
            local_evento: 'Salão de Festas Ouro Verde, Salvador - BA',
            link_Maps_evento: 'URL_DO_Maps_DO_EVENTO'
          }
        };
        setConfig(response.data);
      } catch (err) {
        setError('Erro ao carregar configurações.');
        console.error('Failed to fetch config:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  if (loading) return <div className={styles.loading}>Carregando...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  const engagementDate = new Date(config.data_noivado + 'T00:00:00');
  const now = new Date();
  const timeUntilEvent = engagementDate.getTime() - now.getTime();
  const days = Math.floor(timeUntilEvent / (1000 * 60 * 60 * 24));

  return (
    <div className={styles.homeContainer}>
      <div className={styles.heroSection}>
        {/* REMOVIDO: A tag <img> do casal */}
        <div className={styles.overlayText}> {/* Agora este div será o "cartão" central */}
          <h1 className={styles.heroTitle}>{config.mensagem_boas_vindas_site}</h1>
          <p className={styles.names}>
            <span>{config.nome_noivo}</span> & <span>{config.nome_noiva}</span>
          </p>
          <p className={styles.date}>
            Nosso Dia Especial: {new Date(config.data_noivado).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
          </p>
          <p className={styles.countdown}>
            Faltam <span className={styles.countdownNumber}>{days > 0 ? days : 0}</span> dias!
          </p>
        </div>
      </div>

      <div className={styles.eventInfoSection}>
        <div className={styles.eventInfoCard}>
          <h3>Nosso Evento</h3>
          <p>{config.local_evento}</p>
        </div>
      </div>
    </div>
  );
}

export default HomePage;