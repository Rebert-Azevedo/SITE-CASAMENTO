import React from 'react';
import styles from './Footer.module.css';

function Footer() {
  return (
    <footer className={styles.footer}>
      <p>© {new Date().getFullYear()} Noivado de Rebert & Juliane. Todos os direitos reservados.</p> <p>Com amor, para o nosso dia especial.</p> </footer>
  );
}

export default Footer;