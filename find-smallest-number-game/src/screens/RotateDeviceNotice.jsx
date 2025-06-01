import React from 'react';
import styles from '../styles/RotateDeviceNotice.module.css';
import { t } from '../utils/languageUtils';

const RotateDeviceNotice = () => {
  return (
    <div className={styles.rotateNotice}>
      <div className={styles.content}>
        <div className={styles.phoneIcon}>
          <div className={styles.phone}></div>
        </div>
        <p>{t('rotateDevice')}</p>
      </div>
    </div>
  );
};

export default RotateDeviceNotice;