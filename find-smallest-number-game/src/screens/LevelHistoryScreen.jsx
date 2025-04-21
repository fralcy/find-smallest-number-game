import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from '../styles/LevelHistoryScreen.module.css';
import { useGameContext } from '../contexts/GameContext';
import { t } from '../utils/languageUtils';
import RotateDeviceNotice from './RotateDeviceNotice';

const LevelHistoryScreen = () => {
  const navigate = useNavigate();
  const { type, levelId } = useParams();
  const { 
    audioManager, 
    getLevelHistory, 
    getHighestScoreForLevel, 
    getMaxStarsForLevel 
  } = useGameContext();
  
  const [history, setHistory] = useState([]);
  const [sortBy, setSortBy] = useState('timestamp'); // 'timestamp' hoặc 'score'
  const [sortDirection, setSortDirection] = useState('desc'); // 'asc' hoặc 'desc'
  const [highestScore, setHighestScore] = useState(0);
  const [maxStars, setMaxStars] = useState(0);
  
  useEffect(() => {
    // Chuyển đổi levelId từ string sang number
    const levelIdNumber = parseInt(levelId, 10);
    
    // Lấy dữ liệu lịch sử
    const levelHistory = getLevelHistory(type, levelIdNumber);
    setHistory(levelHistory);
    
    // Lấy điểm cao nhất
    setHighestScore(getHighestScoreForLevel(type, levelIdNumber));
    
    // Lấy số sao cao nhất
    setMaxStars(getMaxStarsForLevel(type, levelIdNumber));
  }, [type, levelId, getLevelHistory, getHighestScoreForLevel, getMaxStarsForLevel]);
  
  const handleSort = (field) => {
    if (sortBy === field) {
      // Đổi hướng sắp xếp
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Đổi trường sắp xếp
      setSortBy(field);
      setSortDirection('desc'); // Mặc định giảm dần
    }
  };
  
  const sortedHistory = [...history].sort((a, b) => {
    const multiplier = sortDirection === 'asc' ? 1 : -1;
    
    if (sortBy === 'timestamp') {
      return multiplier * (a.timestamp - b.timestamp);
    } else if (sortBy === 'score') {
      return multiplier * (a.score - b.score);
    }
    
    return 0;
  });
  
  const handleBack = () => {
    audioManager.play('button');
    navigate(`/game/${type}/campaign`);
  };
  
  // Hàm định dạng thời gian
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };
  
  // Tạo tiêu đề trang theo định dạng mới
  const getScreenTitle = () => {
    const modeText = type === 'grid' ? t('gridMode') : t('freeMode');
    return `${modeText} - ${t('level')} ${levelId}`;
  };
  
  return (
    <div className={styles.container}>
      <RotateDeviceNotice />
      <div className={styles.header}>
        <div className={styles.leftSection}>
          <button 
            className={styles.backButton}
            onClick={handleBack}
          >
            {t('back')}
          </button>
        </div>
        <div className={styles.middleSection}>
          <h1 className={styles.title}>
            {getScreenTitle()}
          </h1>
        </div>
        <div className={styles.rightSection}></div>
      </div>
      
      <div className={styles.contentContainer}>
        <div className={styles.statsSection}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>{t('highestScore')}</span>
            <span className={styles.statValue}>{highestScore}</span>
          </div>
          
          <div className={styles.statItem}>
            <span className={styles.statLabel}>{t('highestStars')}</span>
            <div className={styles.starsContainer}>
              {[...Array(3)].map((_, index) => (
                <div 
                  key={index} 
                  className={`${styles.star} ${index < maxStars ? styles.activeStar : styles.inactiveStar}`}
                >
                  ★
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className={styles.historyTable}>
          <div className={styles.tableHeader}>
            <div 
              className={`${styles.headerCell} ${sortBy === 'timestamp' ? styles.sorted : ''}`}
              onClick={() => handleSort('timestamp')}
            >
              {t('date')} {sortBy === 'timestamp' && (sortDirection === 'asc' ? '↑' : '↓')}
            </div>
            <div 
              className={`${styles.headerCell} ${sortBy === 'score' ? styles.sorted : ''}`}
              onClick={() => handleSort('score')}
            >
              {t('score')} {sortBy === 'score' && (sortDirection === 'asc' ? '↑' : '↓')}
            </div>
            <div className={styles.headerCell}>
              {t('time')}
            </div>
            <div className={styles.headerCell}>
              {t('stars')}
            </div>
          </div>
          
          <div className={styles.tableBody}>
            {sortedHistory.length > 0 ? (
              sortedHistory.map((item, index) => (
                <div key={index} className={styles.tableRow}>
                  <div className={styles.cell}>
                    {formatDate(item.timestamp)}
                  </div>
                  <div className={styles.cell}>
                    {item.score}
                  </div>
                  <div className={styles.cell}>
                    {item.timeUsed}s
                  </div>
                  <div className={styles.cell}>
                    {[...Array(item.stars || 0)].map((_, starIndex) => (
                      <span key={starIndex} className={styles.starIcon}>★</span>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.emptyState}>
                {t('noHistoryYet')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LevelHistoryScreen;