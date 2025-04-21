import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from '../styles/LevelHistoryScreen.module.css';
import { useGameContext } from '../contexts/GameContext';
import { t, getCurrentLanguage } from '../utils/languageUtils';
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
  const [sortBy, setSortBy] = useState('timestamp'); // 'timestamp', 'score', 'timeUsed' hoặc 'stars'
  const [sortDirection, setSortDirection] = useState('desc'); // 'asc' hoặc 'desc'
  const [highestScore, setHighestScore] = useState(0);
  const [maxStars, setMaxStars] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  // Lấy ID level đã được chuyển đổi thành số
  const levelIdNumber = parseInt(levelId, 10);
  
  useEffect(() => {
    setIsLoading(true);
    
    // Lấy dữ liệu lịch sử
    const levelHistory = getLevelHistory(type, levelIdNumber);
    setHistory(levelHistory);
    
    // Lấy điểm cao nhất
    setHighestScore(getHighestScoreForLevel(type, levelIdNumber));
    
    // Lấy số sao cao nhất
    setMaxStars(getMaxStarsForLevel(type, levelIdNumber));
    
    setIsLoading(false);
  }, [type, levelIdNumber, getLevelHistory, getHighestScoreForLevel, getMaxStarsForLevel]);
  
  const handleSort = (field) => {
    audioManager.play('button');
    
    if (sortBy === field) {
      // Đổi hướng sắp xếp
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Đổi trường sắp xếp
      setSortBy(field);
      setSortDirection('desc'); // Mặc định giảm dần
    }
  };
  
  // Sử dụng useMemo để tránh tính toán lại khi không cần thiết
  const sortedHistory = useMemo(() => {
    if (!history.length) return [];
    
    return [...history].sort((a, b) => {
      const multiplier = sortDirection === 'asc' ? 1 : -1;
      
      switch (sortBy) {
        case 'timestamp':
          return multiplier * (a.timestamp - b.timestamp);
        case 'score':
          return multiplier * (a.score - b.score);
        case 'timeUsed':
          return multiplier * (a.timeUsed - b.timeUsed);
        case 'stars':
          return multiplier * ((a.stars || 0) - (b.stars || 0));
        default:
          return multiplier * (a.timestamp - b.timestamp);
      }
    });
  }, [history, sortBy, sortDirection]);
  
  const handleBack = () => {
    audioManager.play('button');
    navigate(`/game/${type}/campaign`);
  };
  
  // Hàm định dạng thời gian theo ngôn ngữ của ứng dụng
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    
    // Lấy ngôn ngữ hiện tại của ứng dụng
    const currentLanguage = getCurrentLanguage();
    
    // Định dạng ngày giờ theo ngôn ngữ của ứng dụng
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    };
    
    // Chỉ định rõ locale dựa vào ngôn ngữ của ứng dụng
    let locale;
    switch (currentLanguage) {
      case 'vi':
        locale = 'vi-VN';
        break;
      case 'en':
        locale = 'en-US';
        break;
      default:
        locale = 'vi-VN'; // Mặc định là tiếng Việt
    }
    
    return date.toLocaleDateString(locale, options);
  };
  
  // Tạo tiêu đề trang theo định dạng mới
  const getScreenTitle = () => {
    const modeText = type === 'grid' ? t('gridMode') : t('freeMode');
    return `${modeText} - ${t('level')} ${levelId}`;
  };
  
  // Tạo hoạt ảnh khi chưa có dữ liệu
  const renderEmptyState = () => {
    if (isLoading) {
      return (
        <div className={styles.loadingState}>
          {t('loading')}...
        </div>
      );
    }
    
    return (
      <div className={styles.emptyState}>
        {t('noHistoryYet')}
      </div>
    );
  };
  
  // Hiển thị icon sắp xếp
  const getSortIcon = (field) => {
    if (sortBy === field) {
      return sortDirection === 'asc' ? '↑' : '↓';
    }
    return null;
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
              aria-label={t('sortByDate')}
            >
              {t('date')} {getSortIcon('timestamp')}
            </div>
            <div 
              className={`${styles.headerCell} ${sortBy === 'score' ? styles.sorted : ''}`}
              onClick={() => handleSort('score')}
              aria-label={t('sortByScore')}
            >
              {t('score')} {getSortIcon('score')}
            </div>
            <div 
              className={`${styles.headerCell} ${sortBy === 'timeUsed' ? styles.sorted : ''}`}
              onClick={() => handleSort('timeUsed')}
            >
              {t('time')} {getSortIcon('timeUsed')}
            </div>
            <div 
              className={`${styles.headerCell} ${sortBy === 'stars' ? styles.sorted : ''}`}
              onClick={() => handleSort('stars')}
            >
              {t('rating')} {getSortIcon('stars')}
            </div>
          </div>
          
          <div className={styles.tableBody}>
            {sortedHistory.length > 0 ? (
              sortedHistory.map((item, index) => (
                <div 
                  key={index} 
                  className={`${styles.tableRow} ${item.completed ? styles.completedRow : styles.failedRow}`}
                >
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
              renderEmptyState()
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LevelHistoryScreen;