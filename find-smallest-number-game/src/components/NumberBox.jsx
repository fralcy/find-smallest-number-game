import React, { useState, useEffect } from 'react';
import styles from '../styles/NumberBox.module.css';
import { DIFFICULTY_LEVELS } from '../constants/difficulty';

const NumberBox = ({ 
  number, 
  isTarget, 
  isFound, 
  onClick,
  difficulty = DIFFICULTY_LEVELS.NORMAL // 'easy', 'normal', 'hard'
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [randomOffset, setRandomOffset] = useState({ x: 0, y: 0 });
  const [randomColor, setRandomColor] = useState(null);
  
  // Với level khó, thêm hiệu ứng di chuyển khi hover và màu sắc ngẫu nhiên
  useEffect(() => {
    // Màu sắc ngẫu nhiên cho chế độ hard
    if (difficulty === DIFFICULTY_LEVELS.HARD && !randomColor) {
      const hue = Math.floor(Math.random() * 360);
      setRandomColor(`hsl(${hue}, 70%, 80%)`);
    }
    
    // Hiệu ứng di chuyển cho chế độ hard
    if (difficulty === DIFFICULTY_LEVELS.HARD && isHovered && !isFound) {
      // Tạo vị trí ngẫu nhiên trong phạm vi nhỏ
      const interval = setInterval(() => {
        setRandomOffset({
          x: Math.random() * 5 - 2.5, // -2.5px to 2.5px
          y: Math.random() * 5 - 2.5
        });
      }, 100);
      
      return () => clearInterval(interval);
    } else {
      setRandomOffset({ x: 0, y: 0 });
    }
  }, [isHovered, difficulty, isFound, randomColor]);
  
  const getClassNames = () => {
    let classNames = styles.numberBox;
    
    // Thêm class dựa vào trạng thái
    if (isFound) {
      classNames += ` ${styles.found}`;
    } else if (isTarget) {
      classNames += ` ${styles.target}`;
    }
    
    if (isHovered && !isFound) {
      classNames += ` ${styles.hovered}`;
    }
    
    // Thêm style dựa vào mức độ khó
    classNames += ` ${styles[difficulty]}`;
    
    return classNames;
  };
  
  const handleMouseEnter = () => {
    setIsHovered(true);
  };
  
  const handleMouseLeave = () => {
    setIsHovered(false);
  };
  
  const handleClick = () => {
    if (!isFound) {
      onClick(number);
    }
  };
  
  // Lấy background color dựa vào độ khó
  const getBackgroundStyle = () => {
    // Nếu số đã tìm thấy và ở chế độ normal hoặc hard, ẩn số (background và số cùng màu)
    if (isFound && (difficulty === DIFFICULTY_LEVELS.NORMAL || difficulty === DIFFICULTY_LEVELS.HARD)) {
      return { backgroundColor: '#4CEEAD', color: '#4CEEAD' };
    } 
    
    // Với chế độ hard, mỗi số có màu riêng
    if (difficulty === DIFFICULTY_LEVELS.HARD && !isFound) {
      return { backgroundColor: randomColor };
    }
    
    return {};
  };
  
  return (
    <div
      className={getClassNames()}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `translate(${randomOffset.x}px, ${randomOffset.y}px)`,
        ...getBackgroundStyle()
      }}
    >
      {number}
    </div>
  );
};

export default NumberBox;