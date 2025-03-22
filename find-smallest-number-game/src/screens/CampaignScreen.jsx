import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import styles from '../styles/CampaignScreen.module.css';
import RotateDeviceNotice from './RotateDeviceNotice';

// Cấu trúc dữ liệu cho các level trong campaign
const CAMPAIGN_LEVELS = {
  grid: [
    {
      id: 1,
      minNumber: 1,
      maxNumber: 20,
      gridSize: 3,
      timePerNumber: 5,
      unlocked: true
    },
    {
      id: 2,
      minNumber: 1,
      maxNumber: 30,
      gridSize: 4,
      timePerNumber: 4,
      unlocked: false
    },
    {
      id: 3,
      minNumber: 1,
      maxNumber: 50,
      gridSize: 4,
      timePerNumber: 3,
      unlocked: false
    },
    {
      id: 4,
      minNumber: 1,
      maxNumber: 99,
      gridSize: 5,
      timePerNumber: 3,
      unlocked: false
    },
    {
      id: 5,
      minNumber: 10,
      maxNumber: 100,
      gridSize: 5,
      timePerNumber: 2.5,
      unlocked: false
    },
    {
      id: 6,
      minNumber: 50,
      maxNumber: 200,
      gridSize: 5,
      timePerNumber: 2.5,
      unlocked: false
    },
    {
      id: 7,
      minNumber: 100,
      maxNumber: 500,
      gridSize: 6,
      timePerNumber: 2,
      unlocked: false
    },
    {
      id: 8,
      minNumber: 500,
      maxNumber: 999,
      gridSize: 6,
      timePerNumber: 2,
      unlocked: false
    },
    {
      id: 9,
      minNumber: 1000,
      maxNumber: 9999,
      gridSize: 6,
      timePerNumber: 1.5,
      unlocked: false
    },
    {
      id: 10,
      minNumber: 1000,
      maxNumber: 9999,
      gridSize: 7,
      timePerNumber: 1.5,
      unlocked: false
    }
  ],
  free: [
    {
      id: 1,
      minNumber: 1,
      maxNumber: 20,
      maxNumbers: 10,
      timePerNumber: 5,
      unlocked: true
    },
    {
      id: 2,
      minNumber: 1,
      maxNumber: 50,
      maxNumbers: 15,
      timePerNumber: 4,
      unlocked: false
    },
    // Thêm các level khác cho free mode
    {
      id: 3,
      minNumber: 1,
      maxNumber: 99,
      maxNumbers: 15,
      timePerNumber: 3,
      unlocked: false
    },
    {
      id: 4,
      minNumber: 10,
      maxNumber: 100,
      maxNumbers: 20,
      timePerNumber: 3,
      unlocked: false
    },
    {
      id: 5,
      minNumber: 50,
      maxNumber: 200,
      maxNumbers: 20,
      timePerNumber: 2.5,
      unlocked: false
    },
    {
      id: 6,
      minNumber: 100,
      maxNumber: 300,
      maxNumbers: 25,
      timePerNumber: 2.5,
      unlocked: false
    },
    {
      id: 7,
      minNumber: 200,
      maxNumber: 500,
      maxNumbers: 25,
      timePerNumber: 2,
      unlocked: false
    },
    {
      id: 8,
      minNumber: 500,
      maxNumber: 999,
      maxNumbers: 30,
      timePerNumber: 2,
      unlocked: false
    },
    {
      id: 9,
      minNumber: 1000,
      maxNumber: 9999,
      maxNumbers: 30,
      timePerNumber: 1.5,
      unlocked: false
    },
    {
      id: 10,
      minNumber: 1000,
      maxNumber: 9999,
      maxNumbers: 35,
      timePerNumber: 1.5,
      unlocked: false
    }
  ]
};

const CampaignScreen = () => {
  const navigate = useNavigate();
  const { type } = useParams(); // 'grid' or 'free'
  const location = useLocation();
  
  // Lấy level từ location state nếu có (khi quay lại từ result screen)
  const levelFromState = location.state?.level;
  
  // State để lưu trữ trạng thái của các level
  const [levels, setLevels] = useState([]);
  
  // Load levels từ local storage hoặc sử dụng mặc định
  useEffect(() => {
    const loadLevels = () => {
      // Lấy thông tin level đã mở khóa từ localStorage
      const savedLevels = localStorage.getItem(`campaign_levels_${type}`);
      
      if (savedLevels) {
        try {
          const parsedLevels = JSON.parse(savedLevels);
          setLevels(parsedLevels);
        } catch (error) {
          console.error("Error parsing saved levels:", error);
          setDefaultLevels();
        }
      } else {
        setDefaultLevels();
      }
    };
    
    const setDefaultLevels = () => {
      // Sử dụng levels mặc định từ CAMPAIGN_LEVELS
      const defaultLevels = CAMPAIGN_LEVELS[type] || [];
      setLevels(defaultLevels);
      
      // Lưu vào localStorage
      localStorage.setItem(`campaign_levels_${type}`, JSON.stringify(defaultLevels));
    };
    
    loadLevels();
    
    // Nếu trở lại từ result screen với level đã hoàn thành, cập nhật mở khóa level tiếp theo
    if (levelFromState && location.state?.outcome === 'finish') {
      updateLevelProgress(levelFromState);
    }
  }, [type, levelFromState, location.state]);
  
  // Cập nhật tiến trình level sau khi hoàn thành một level
  const updateLevelProgress = (completedLevelId) => {
    const updatedLevels = levels.map(level => {
      // Nếu là level tiếp theo sau level đã hoàn thành, mở khóa nó
      if (level.id === completedLevelId + 1) {
        return { ...level, unlocked: true };
      }
      return level;
    });
    
    setLevels(updatedLevels);
    localStorage.setItem(`campaign_levels_${type}`, JSON.stringify(updatedLevels));
  };

  const handleLevelSelect = (level) => {
    if (!level.unlocked) return;
    
    // Tính toán thời gian tổng cộng dựa trên kích thước grid hoặc số lượng số
    const totalNumbers = type === 'grid' 
      ? level.gridSize * level.gridSize 
      : level.maxNumbers;
      
    const totalTime = Math.round(level.timePerNumber * totalNumbers);
    
    // Tạo gameSettings để truyền vào GameplayScreen
    const gameSettings = {
      minNumber: level.minNumber,
      maxNumber: level.maxNumber,
      timePerNumber: level.timePerNumber,
      totalTime: totalTime,
      level: level.id,
      ...(type === 'grid' 
        ? { gridSize: level.gridSize } 
        : { maxNumbers: level.maxNumbers })
    };
    
    // Điều hướng đến màn chơi và truyền thông tin cấu hình
    navigate(`/game/${type}/campaign`, {
      state: { gameSettings }
    });
  };

  const handleBack = () => {
    navigate(`/game-mode/${type}`);
  };

  return (
    <div className={styles.container}>
      <RotateDeviceNotice />
      <div className={styles.header}>
        <button 
          className={styles.backButton}
          onClick={handleBack}
        >
          ←
        </button>
      </div>

      <div className={styles.titleContainer}>
        <h1 className={styles.title}>Campaign - {type === 'grid' ? 'Grid' : 'Free'} Mode</h1>
      </div>

      <div className={styles.levelGrid}>
        {levels.map((level) => (
          <div 
            key={level.id} 
            className={`${styles.levelCard} ${!level.unlocked ? styles.locked : ''}`}
            onClick={() => handleLevelSelect(level)}
          >
            <span className={styles.levelLabel}>Level {level.id}</span>
            <span className={styles.levelInfo}>
              {type === 'grid' ? `${level.gridSize}x${level.gridSize}` : `${level.maxNumbers} nums`}
            </span>
            {!level.unlocked && <div className={styles.lockIcon}>🔒</div>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CampaignScreen;