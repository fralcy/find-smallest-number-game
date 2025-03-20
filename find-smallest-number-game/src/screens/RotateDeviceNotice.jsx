import React from 'react';
import styles from '../styles/RotateDeviceNotice.module.css';

const RotateDeviceNotice = () => {
  return (
    <div className={styles.rotateNotice}>
      <div className={styles.content}>
        <div className={styles.phoneIcon}>
          <div className={styles.phone}></div>
        </div>
        <p>Please rotate your device horizontally for the best experience</p>
      </div>
    </div>
  );
};

export default RotateDeviceNotice;